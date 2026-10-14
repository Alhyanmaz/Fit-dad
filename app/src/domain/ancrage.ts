/** Jour tenu pendant l'ancrage (docs/SPEC.md §6.11, scénario 16). */

/** Pas de version courte pendant l'ancrage (décision du 14/10/2026). */
export type MatinFait = 'normale' | 'minimum' | null;
export type SoirFait = 'normal' | 'minimum' | 'boxe' | null;

export interface JourDAncrage {
  /** Matin de la semaine, ou base du week-end. */
  matin: MatinFait;
  soir: SoirFait;
  /** Bonus : sans effet sur le jour tenu. */
  midi?: boolean;
  /** « Au mieux » du week-end, bonus : sans effet sur le jour tenu. */
  au_mieux?: boolean;
}

/**
 * Un jour est tenu quand le matin et le soir sont faits, au moins en version minimum.
 * Le midi et le « au mieux » du week-end sont des bonus : ils n'entrent pas dans le calcul.
 */
export function jourTenu(jour: JourDAncrage): boolean {
  return jour.matin !== null && jour.soir !== null;
}
