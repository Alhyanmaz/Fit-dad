import { useState } from 'react';
import { lireProgramme, programmeBrut } from '../data/programme';
import type { DateIso } from '../domain/dates';
import { journalVide, type JournalDuJour } from '../domain/journal';
import { estEnAncrage, type Niveau } from '../domain/niveau';
import { Aujourdhui } from './Aujourdhui';
import { LeverTot } from './LeverTot';
import { NavBas, type Ecran } from './NavBas';

/** Nombre d'erreurs affichées au plus ; le reste est résumé. */
const ERREURS_AFFICHEES = 5;

/**
 * Début de l'ancrage, choisi par José (décision du 18/10/2026). Il passera dans les réglages
 * enregistrés sur le téléphone, avec le niveau en cours, à l'étape suivante du J3.
 */
const DEBUT_ANCRAGE: DateIso = '2026-10-19';

/** Niveau en cours et jour où il a commencé : son cycle part de là (passages, 18/10/2026). */
interface NiveauEnCours {
  niveau: Niveau;
  depuis: DateIso;
}

const lecture = lireProgramme(programmeBrut);

/** Date du téléphone, au format du domaine (« AAAA-MM-JJ »). */
function aujourdhui(): DateIso {
  const maintenant = new Date();
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`;
}

export function App() {
  const [ecran, setEcran] = useState<Ecran>('aujourdhui');
  const [journal, setJournal] = useState<JournalDuJour>(journalVide);
  const [enCours, setEnCours] = useState<NiveauEnCours>({
    niveau: { ancrage: 'N1' },
    depuis: DEBUT_ANCRAGE,
  });
  if (!lecture.ok) {
    return (
      <main className="ecran">
        <h1>Fit-dad</h1>
        <ProgrammeInvalide erreurs={lecture.erreurs} />
      </main>
    );
  }
  const date = aujourdhui();
  const { niveau, depuis } = enCours;
  // Passage confirmé par José, proposé ou forcé : le nouveau niveau commence aujourd'hui.
  const surPassage = (suivant: Niveau) => setEnCours({ niveau: suivant, depuis: date });
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
