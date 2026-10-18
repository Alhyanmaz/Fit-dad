import { useState } from 'react';
import { lireProgramme, programmeBrut } from '../data/programme';
import type { DateIso } from '../domain/dates';
import { journalVide, type JournalDuJour } from '../domain/journal';
import { Aujourdhui } from './Aujourdhui';
import { SaisieContexte, type Saisie } from './composants';
import { LeverTot } from './LeverTot';
import { NavBas, type Ecran } from './NavBas';

/** Nombre d'erreurs affichées au plus ; le reste est résumé. */
const ERREURS_AFFICHEES = 5;

/**
 * Début de l'ancrage, choisi par José (décision du 18/10/2026). Il passera dans les réglages
 * enregistrés sur le téléphone, avec le niveau en cours, à l'étape suivante du J3.
 */
const DEBUT_ANCRAGE: DateIso = '2026-10-19';
const NIVEAU = { ancrage: 'N1' } as const;

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
  if (!lecture.ok) {
    return (
      <main className="ecran">
        <h1>Fit-dad</h1>
        <ProgrammeInvalide erreurs={lecture.erreurs} />
      </main>
    );
  }
  const date = aujourdhui();
  const saisie: Saisie = {
    valeur: (cle, serie, depart) => journal.repetitions[cle]?.[serie] ?? depart,
    changer: (cle, serie, valeur) =>
      setJournal((j) => {
        const valeurs = [...(j.repetitions[cle] ?? [])];
        valeurs[serie] = valeur;
        return { ...j, repetitions: { ...j.repetitions, [cle]: valeurs } };
      }),
  };
  return (
    <SaisieContexte.Provider value={saisie}>
      {ecran === 'aujourdhui' ? (
        <Aujourdhui
          programme={lecture.programme}
          date={date}
          debut={DEBUT_ANCRAGE}
          niveau={NIVEAU}
          journal={journal}
          setJournal={setJournal}
        />
      ) : (
        <LeverTot
          programme={lecture.programme}
          date={date}
          niveau={NIVEAU}
          journal={journal}
          setJournal={setJournal}
        />
      )}
      <NavBas ecran={ecran} surEcran={setEcran} />
    </SaisieContexte.Provider>
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
