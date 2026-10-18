import type { Programme } from '../data/schema';

/**
 * Saisie des répétitions (décision de José du 18/10/2026) : chaque exercice qui se compte en
 * répétitions reçoit un compteur par série, dont la valeur servira à l'historique.
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

/** Le compteur d'un exercice, ou null s'il ne se compte pas en répétitions (tenue, durée, mouvement au temps). */
export function compteurDeRepetitions(
  programme: Programme,
  exercice: string,
  series: number,
): CompteurDeRepetitions | null {
  const ex = programme.exercices[exercice];
  if (!ex || series < 1 || ex.compter === false) return null;
  const cote = ex.cote ? { cote: ex.cote } : {};
  if (ex.mesure === 'emom' && ex.reps_par_minute)
    return { exercice, series, depart: ex.reps_par_minute };
  if ((ex.mesure === 'reps' || ex.mesure === 'reps_tenue') && ex.fourchette)
    return { exercice, series, depart: ex.fourchette[0], ...cote };
  if (ex.knee_raises)
    return { exercice, series, depart: ex.knee_raises.fourchette[0], quoi: 'knee raises' };
  return null;
}
