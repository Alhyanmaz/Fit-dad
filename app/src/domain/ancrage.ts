/**
 * Jour tenu (docs/SPEC.md §6.11, scénario 16), pendant l'ancrage puis aux paliers (décisions du
 * 18/10/2026) : le lever à l'heure, puis le matin et le soir validés par la couche atteinte
 * (minimum, principale, bonus).
 */

/** Matin de la semaine, ou séance du week-end : jusqu'où José est allé. */
export type MatinFait = 'minimum' | 'principale' | 'bonus' | null;
export type SoirFait = 'principale' | 'minimum' | 'boxe' | null;

export interface JourDAncrage {
  /** Levé à l'heure, à 5 min près (`leverTenu`). */
  lever: boolean;
  matin: MatinFait;
  soir: SoirFait;
  /** Bonus : sans effet sur le jour tenu. */
  midi?: boolean;
}

/** Bloc clé du soir : principale (knee raises), minimum (1 min de suspension, 2 min de deep squat) ou boxe. */
export type BlocCleFait = 'principale' | 'minimum' | 'boxe' | null;

/**
 * Soir validé en deux parts, bloc clé et routine pied (décision du 18/10/2026). Le soir compte dès
 * que le bloc clé est fait : seul, c'est la version minimum. La routine pied seule ne suffit pas
 * [Interprétation].
 */
export function soirFait(blocCle: BlocCleFait, piedFait: boolean): SoirFait {
  if (blocCle === null) return null;
  if (blocCle === 'boxe') return 'boxe';
  return blocCle === 'principale' && piedFait ? 'principale' : 'minimum';
}

/**
 * Un jour est tenu quand José s'est levé à l'heure et que le matin et le soir sont faits, au moins
 * en minimum. Le midi et le bonus du week-end n'entrent pas dans le calcul.
 */
export function jourTenu(jour: JourDAncrage): boolean {
  return jour.lever && jour.matin !== null && jour.soir !== null;
}
