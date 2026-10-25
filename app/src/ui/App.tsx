import { useEffect, useState } from 'react';
import { lireProgramme, programmeBrut } from '../data/programme';
import { jourTenu } from '../domain/ancrage';
import { ajouterJours, type DateIso } from '../domain/dates';
import type { EntreeDuJournal } from '../domain/historique';
import { journalVide, type JournalDuJour } from '../domain/journal';
import { leverTenu } from '../domain/leverTot';
import { estEnAncrage, type Niveau } from '../domain/niveau';
import {
  Base,
  demanderLaPersistance,
  ecrireJour,
  ecrireReglages,
  lireHistorique,
  lireJour,
  lireReglages,
} from '../storage/base';
import { Aujourdhui } from './Aujourdhui';
import { LeverTot } from './LeverTot';
import { NavBas, type Ecran } from './NavBas';

/** Nombre d'erreurs affichées au plus ; le reste est résumé. */
const ERREURS_AFFICHEES = 5;

/** Niveau en cours et jour où il a commencé : son cycle part de là (passages, 18/10/2026). */
interface NiveauEnCours {
  niveau: Niveau;
  depuis: DateIso;
  historique: { niveau: Niveau; depuis: DateIso }[];
}

/** Jours d'historique lus au lancement : la fenêtre des passages, avec de la marge. */
const JOURS_D_HISTORIQUE = 28;

const base = new Base();

/** Ce qui est lu pour une date : le jour, l'historique d'avant, le niveau. */
interface Charge {
  date: DateIso;
  enCours: NiveauEnCours;
  historique: EntreeDuJournal[];
}

const lecture = lireProgramme(programmeBrut);

/**
 * Début de l'ancrage : le cycle N0, de familiarisation (décision du 25/10/2026). C'est le niveau
 * du premier lancement ; ensuite, le niveau en cours est lu dans les réglages enregistrés.
 */
const DEBUT_ANCRAGE: DateIso = lecture.ok
  ? lecture.programme.ancrage.familiarisation.debut
  : '2026-10-26';

/** Date du téléphone, au format du domaine (« AAAA-MM-JJ »). */
function aujourdhui(): DateIso {
  const maintenant = new Date();
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`;
}

export function App() {
  const [ecran, setEcran] = useState<Ecran>('aujourdhui');
  const [date, setDate] = useState<DateIso>(aujourdhui);
  const [charge, setCharge] = useState<Charge | null>(null);
  const [journal, setJournal] = useState<JournalDuJour>(journalVide);
  const [erreur, setErreur] = useState<string | null>(null);

  // La date change quand l'appli revient au premier plan le lendemain.
  useEffect(() => {
    const auRetour = () => {
      if (document.visibilityState === 'visible') setDate(aujourdhui());
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => document.removeEventListener('visibilitychange', auRetour);
  }, []);

  // Lecture du jour, de l'historique et du niveau, à chaque nouvelle date.
  useEffect(() => {
    let annule = false;
    void (async () => {
      try {
        void demanderLaPersistance();
        const reglages = await lireReglages(base);
        const enCours: NiveauEnCours = reglages ?? {
          niveau: { ancrage: 'N0' },
          depuis: DEBUT_ANCRAGE,
          historique: [],
        };
        if (!reglages) await ecrireReglages(base, enCours);
        const [jour, historique] = await Promise.all([
          lireJour(base, date),
          lireHistorique(base, ajouterJours(date, -JOURS_D_HISTORIQUE), ajouterJours(date, -1)),
        ]);
        if (annule) return;
        setJournal(jour);
        setCharge({ date, enCours, historique });
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      annule = true;
    };
  }, [date]);

  // Chaque changement du jour est enregistré, avec le jour tenu, une fois le jour lu.
  const pret = charge?.date === date;
  const niveauLu = charge?.enCours.niveau;
  useEffect(() => {
    if (!pret || !niveauLu || !lecture.ok) return;
    const tenu = jourTenu({
      lever: leverTenu(lecture.programme, niveauLu, journal.lever.leve),
      matin: journal.matin,
      soir: journal.soir,
    });
    ecrireJour(base, date, { ...journal, tenu }).catch((e: unknown) =>
      setErreur(e instanceof Error ? e.message : String(e)),
    );
  }, [journal, pret, niveauLu, date]);

  if (!lecture.ok) {
    return (
      <main className="ecran">
        <h1>Fit-dad</h1>
        <ProgrammeInvalide erreurs={lecture.erreurs} />
      </main>
    );
  }
  if (erreur) {
    return (
      <main className="ecran">
        <h1>Fit-dad</h1>
        <section className="carte erreur" role="alert">
          <p className="titre-carte">Enregistrement impossible</p>
          <p>{erreur}</p>
        </section>
      </main>
    );
  }
  if (!charge || !pret) {
    return (
      <main className="ecran">
        <p className="discret">Chargement…</p>
      </main>
    );
  }
  const { niveau, depuis } = charge.enCours;
  // Passage confirmé par José, proposé ou forcé : le nouveau niveau commence aujourd'hui.
  const surPassage = (suivant: Niveau) => {
    const enCours: NiveauEnCours = {
      niveau: suivant,
      depuis: date,
      historique: [...charge.enCours.historique, { niveau, depuis }],
    };
    setCharge({ ...charge, enCours });
    ecrireReglages(base, enCours).catch((e: unknown) =>
      setErreur(e instanceof Error ? e.message : String(e)),
    );
  };
  return (
    <>
      {ecran === 'lever' ? (
        <LeverTot
          programme={lecture.programme}
          date={date}
          niveau={niveau}
          journal={journal}
          setJournal={setJournal}
        />
      ) : estEnAncrage(niveau) ? (
        <Aujourdhui
          programme={lecture.programme}
          date={date}
          debut={DEBUT_ANCRAGE}
          niveau={niveau}
          depuis={depuis}
          journal={journal}
          setJournal={setJournal}
          historique={charge.historique}
          surPassage={surPassage}
          surLeverTot={() => setEcran('lever')}
        />
      ) : (
        <main className="ecran">
          <h1>Palier {niveau.palier}</h1>
          <p className="discret">L'écran des paliers arrive avec le jalon J5.</p>
        </main>
      )}
      <NavBas ecran={ecran} surEcran={setEcran} />
    </>
  );
}

function ProgrammeInvalide({ erreurs }: { erreurs: string[] }) {
  const reste = erreurs.length - ERREURS_AFFICHEES;
  return (
    <section className="carte erreur" role="alert">
      <p className="titre-carte">Programme illisible</p>
      <ul>
        {erreurs.slice(0, ERREURS_AFFICHEES).map((erreur) => (
          <li key={erreur}>{erreur}</li>
        ))}
      </ul>
      {reste > 0 && <p>… et {reste} autre(s) erreur(s).</p>}
    </section>
  );
}
