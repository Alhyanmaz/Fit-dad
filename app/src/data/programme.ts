import programmeJson from '../../../data/programme.json';

/**
 * Lecture du programme (data/programme.json), intégré à l'appli au moment du build :
 * aucune requête réseau à l'ouverture.
 *
 * Jalon J0 : contrôle minimal (version et nombre d'exercices).
 * La validation complète par un schéma zod arrive au jalon J1 (docs/SPEC.md §7.1).
 */
export const programmeBrut: unknown = programmeJson;

export interface ResumeProgramme {
  /** Date de version du programme, au format AAAA-MM-JJ. */
  version: string;
  nombreExercices: number;
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

export function resumerProgramme(donnees: unknown): ResumeProgramme {
  if (!estObjet(donnees)) {
    throw new Error("le fichier n'est pas un objet JSON");
  }
  const { meta, exercices } = donnees;
  if (
    !estObjet(meta) ||
    typeof meta.version !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(meta.version)
  ) {
    throw new Error('version du programme absente ou mal formée (attendu : AAAA-MM-JJ)');
  }
  if (!estObjet(exercices) || Object.keys(exercices).length === 0) {
    throw new Error("liste d'exercices absente ou vide");
  }
  return { version: meta.version, nombreExercices: Object.keys(exercices).length };
}

/** « 2026-10-07 » → « 07/10/2026 », sans passer par un fuseau horaire. */
export function dateFrancaise(dateIso: string): string {
  const [annee, mois, jour] = dateIso.split('-');
  return `${jour}/${mois}/${annee}`;
}
