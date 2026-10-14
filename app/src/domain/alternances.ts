import { jourDeLaSemaine, type DateIso } from './dates';
import type { TypeDeJour } from './jour';

export type Lettre = 'A' | 'B';

export const autreLettre = (lettre: Lettre): Lettre => (lettre === 'A' ? 'B' : 'A');

/** « La suivante » : la séance qui suit la dernière faite ; A pour commencer (§6.3). */
export const suivante = (derniereFaite: Lettre | null): Lettre =>
  derniereFaite === null ? 'A' : autreLettre(derniereFaite);

/**
 * Lettre de la séance du matin : A le samedi, B le dimanche, la suivante les autres jours ;
 * pas de séance le jour de récupération. Le pointeur avance quand la séance est faite.
 */
export function lettreDuMatin(
  date: DateIso,
  type: TypeDeJour,
  derniereFaite: Lettre | null,
): Lettre | null {
  if (type === 'recuperation') return null;
  const jour = jourDeLaSemaine(date);
  if (jour === 'samedi') return 'A';
  if (jour === 'dimanche') return 'B';
  return suivante(derniereFaite);
}

/** Routine pied : la suivante, chaque soir sans boxe, jour de récupération compris. */
export const lettreDuPied = (type: TypeDeJour, derniereFaite: Lettre | null): Lettre | null =>
  type === 'boxe' ? null : suivante(derniereFaite);

/** « À tour de rôle » : l'élément qui suit le dernier fait ; le premier pour commencer. */
export function suivantDansLaRotation<T>(rotation: readonly T[], dernierFait: T | null): T {
  const premier = rotation[0];
  if (premier === undefined) throw new Error('rotation vide');
  if (dernierFait === null) return premier;
  const i = rotation.indexOf(dernierFait);
  return rotation[(i + 1) % rotation.length] ?? premier;
}
