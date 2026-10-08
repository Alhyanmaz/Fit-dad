import {
  dateFrancaise,
  programmeBrut,
  resumerProgramme,
  type ResumeProgramme,
} from '../data/programme';

type Lecture = { ok: true; resume: ResumeProgramme } | { ok: false; erreur: string };

function lireProgramme(): Lecture {
  try {
    return { ok: true, resume: resumerProgramme(programmeBrut) };
  } catch (e) {
    return { ok: false, erreur: e instanceof Error ? e.message : String(e) };
  }
}

const lecture = lireProgramme();

export function App() {
  return (
    <main>
      <h1>Fit-dad v2</h1>
      {lecture.ok ? (
        <section className="carte" aria-label="Programme">
          <p className="principal">Programme chargé : {lecture.resume.nombreExercices} exercices</p>
          <p className="discret">Version du programme : {dateFrancaise(lecture.resume.version)}</p>
        </section>
      ) : (
        <section className="carte erreur" role="alert">
          <p className="principal">Programme illisible</p>
          <p>{lecture.erreur}</p>
        </section>
      )}
      <p className="discret">Version en construction. Ton appli du quotidien reste la v1.</p>
      <a href="../">Ouvrir la v1</a>
    </main>
  );
}
