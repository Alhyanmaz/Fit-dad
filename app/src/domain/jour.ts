import { ajouterJours, jourDeLaSemaine, type DateIso } from './dates';
import { estEnAncrage, type Niveau } from './niveau';

/** Type de jour (docs/SPEC.md §6.1). La semaine de décharge se superpose, elle n'est pas un type. */
export type TypeDeJour = 'normal' | 'boxe' | 'recuperation';

/**
 * Jour de boxe : boxe en club déclarée ce soir-là. Jour de récupération : le lendemain d'un jour
 * de boxe, sauf quand la boxe tombe le vendredi, et jamais pendant l'ancrage (décision du
 * 14/10/2026 : le lendemain de boxe suit le schéma des autres jours).
 */
export function typeDeJour(
  date: DateIso,
  joursDeBoxe: readonly DateIso[],
  niveau: Niveau,
): TypeDeJour {
  if (joursDeBoxe.includes(date)) return 'boxe';
  if (estEnAncrage(niveau)) return 'normal';
  const veille = ajouterJours(date, -1);
  if (joursDeBoxe.includes(veille) && jourDeLaSemaine(veille) !== 'vendredi') return 'recuperation';
  return 'normal';
}

/** Le week-end porte un bloc boxe, sauf le samedi qui suit une boxe le vendredi (§6.1, §6.6). */
export function aUnBlocBoxe(date: DateIso, joursDeBoxe: readonly DateIso[]): boolean {
  const jour = jourDeLaSemaine(date);
  if (jour === 'dimanche') return true;
  if (jour === 'samedi') return !joursDeBoxe.includes(ajouterJours(date, -1));
  return false;
}

/** Boxe le vendredi : le seul bloc du week-end, le dimanche, prend la technique du club en priorité. */
export function techniqueDuClubEnPriorite(date: DateIso, joursDeBoxe: readonly DateIso[]): boolean {
  return jourDeLaSemaine(date) === 'dimanche' && joursDeBoxe.includes(ajouterJours(date, -2));
}
