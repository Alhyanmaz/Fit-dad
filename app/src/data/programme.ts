import programmeJson from '../../../data/programme.json';
import { programmeSchema, type Programme } from './schema';

/**
 * Lecture du programme (data/programme.json), intégré à l'appli au moment du build :
 * aucune requête réseau à l'ouverture. Le fichier est validé au chargement (docs/SPEC.md §7.1).
 */
export const programmeBrut: unknown = programmeJson;

export type LectureProgramme =
  { ok: true; programme: Programme } | { ok: false; erreurs: string[] };

/** Valide des données de programme ; en cas d'échec, une erreur lisible par ligne. */
export function lireProgramme(donnees: unknown): LectureProgramme {
  const resultat = programmeSchema.safeParse(donnees);
  if (resultat.success) return { ok: true, programme: resultat.data };
  return {
    ok: false,
    erreurs: resultat.error.issues.map((issue) => {
      const chemin = issue.path.map(String).join(' › ');
      return chemin ? `${chemin} : ${issue.message}` : issue.message;
    }),
  };
}

export interface ResumeProgramme {
  /** Date de version du programme, au format AAAA-MM-JJ. */
  version: string;
  nombreExercices: number;
}

export function resumerProgramme(programme: Programme): ResumeProgramme {
  return {
    version: programme.meta.version,
    nombreExercices: Object.keys(programme.exercices).length,
  };
}

/** « 2026-10-07 » → « 07/10/2026 », sans passer par un fuseau horaire. */
export function dateFrancaise(dateIso: string): string {
  const [annee, mois, jour] = dateIso.split('-');
  return `${jour}/${mois}/${annee}`;
}
