import { dateFrancaise, lireProgramme, programmeBrut, resumerProgramme } from '../data/programme';

/** Nombre d'erreurs affichées au plus ; le reste est résumé. */
const ERREURS_AFFICHEES = 5;

const lecture = lireProgramme(programmeBrut);

export function App() {
  return (
    <main>
      <h1>Fit-dad v2</h1>
      {lecture.ok ? <ProgrammeValide /> : <ProgrammeInvalide erreurs={lecture.erreurs} />}
      <p className="discret">Version en construction. Ton appli du quotidien reste la v1.</p>
      <a href="../">Ouvrir la v1</a>
    </main>
  );
}

function ProgrammeValide() {
  if (!lecture.ok) return null;
  const resume = resumerProgramme(lecture.programme);
  return (
    <section className="carte" aria-label="Programme">
      <p className="principal">Programme chargé : {resume.nombreExercices} exercices</p>
      <p className="discret">Version du programme : {dateFrancaise(resume.version)}</p>
      <p className="discret">
        Vérifié au chargement : structure, valeurs et renvois entre sections.
      </p>
    </section>
  );
}

function ProgrammeInvalide({ erreurs }: { erreurs: string[] }) {
  const reste = erreurs.length - ERREURS_AFFICHEES;
  return (
    <section className="carte erreur" role="alert">
      <p className="principal">Programme illisible</p>
      <ul>
        {erreurs.slice(0, ERREURS_AFFICHEES).map((erreur) => (
          <li key={erreur}>{erreur}</li>
        ))}
      </ul>
      {reste > 0 && <p>… et {reste} autre(s) erreur(s).</p>}
    </section>
  );
}
