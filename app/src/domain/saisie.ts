import type { Programme } from '../data/schema';

/**
 * Saisie des répétitions et des durées (décisions de José du 18/10/2026) : chaque mouvement qui se
 * compte en répétitions reçoit un compteur par série, échauffements compris ; chaque mouvement au
 * temps, une durée réglable. Les valeurs serviront à l'historique.
 */
export interface CompteurDeRepetitions {
  exercice: string;
  series: number;
  /** Valeur de départ du compteur : le bas de la fourchette, en attendant l'historique [Interprétation]. */
  depart: number;
  /** « chaque côté », « chaque bras »… : le compteur vaut pour un côté. */
  cote?: string;
  /** Ce qui se compte quand ce n'est pas l'exercice lui-même (les knee raises de la suspension). */
  quoi?: string;
}

/** Le compteur d'un exercice, ou null s'il ne se compte pas en répétitions (tenue, durée, temps). */
export function compteurDeRepetitions(
  programme: Programme,
  exercice: string,
  series: number,
): CompteurDeRepetitions | null {
  const ex = programme.exercices[exercice];
  if (!ex || series < 1) return null;
  const cote = ex.cote ? { cote: ex.cote } : {};
  if (ex.mesure === 'emom' && ex.reps_par_minute)
    return { exercice, series, depart: ex.reps_par_minute };
  if ((ex.mesure === 'reps' || ex.mesure === 'reps_tenue') && ex.fourchette)
    return { exercice, series, depart: ex.fourchette[0], ...cote };
  if (ex.knee_raises)
    return { exercice, series, depart: ex.knee_raises.fourchette[0], quoi: 'knee raises' };
  return null;
}

export interface ReglageDeDuree {
  /** Valeur de départ : la durée prévue, ramenée au plafond s'il y en a un. */
  depart: number;
  pas: number;
  /** Plafond : 30 s pour un étirement (règle n° 2 du programme) ; null sinon. */
  max: number | null;
}

/**
 * Réglage d'une durée, en secondes : pas de 5 s, de 15 s à partir de 2 min, de 1 min à partir de
 * 5 min [Interprétation]. Un étirement ne dépasse jamais 30 s : on ajoute des séries (règle n° 2).
 */
export function reglageDeDuree(
  programme: Programme,
  exercice: string | null,
  prevu: number,
): ReglageDeDuree {
  const pas = prevu >= 300 ? 60 : prevu >= 120 ? 15 : 5;
  const ex = exercice ? programme.exercices[exercice] : undefined;
  const max = ex?.bloc === 'etirement' ? programme.regles_generales.etirements.tenue_max_s : null;
  return { depart: max === null ? prevu : Math.min(prevu, max), pas, max };
}

/** Une durée réglée d'un pas, sans descendre sous un pas ni passer le plafond. */
export function regler(reglage: ReglageDeDuree, valeur: number, sens: 1 | -1): number {
  const suivante = valeur + sens * reglage.pas;
  const plancher = Math.max(reglage.pas, suivante);
  return reglage.max === null ? plancher : Math.min(reglage.max, plancher);
}
