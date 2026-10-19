import type { Couche } from './couches';

/**
 * Jour tenu (docs/SPEC.md §6.11, scénario 16), pendant l'ancrage puis aux paliers (décisions du
 * 18/10/2026) : le lever à l'heure, puis le matin et le soir, chacun au moins jusqu'au minimum.
 * Le soir compte dès que le minimum du bloc clé est fait ; la routine pied seule ne suffit pas.
 */

export interface JourDAncrage {
  /** Levé à l'heure, à 5 min près (`leverTenu`). */
  lever: boolean;
  /** Couches atteintes, déduites des mouvements cochés (`coucheAtteinte`). */
  matin: Couche | null;
  soir: Couche | null;
  /** Bonus : sans effet sur le jour tenu. */
  midi?: boolean;
}

/**
 * Un jour est tenu quand José s'est levé à l'heure et que le matin et le soir sont faits, au moins
 * en minimum. Le midi et le bonus du week-end n'entrent pas dans le calcul.
 */
export function jourTenu(jour: JourDAncrage): boolean {
  return jour.lever && jour.matin !== null && jour.soir !== null;
}
