import type { Programme } from '../data/schema';
import { estEnAncrage, niveauDAncrage, type Niveau } from './niveau';

/**
 * « Lever tôt » (docs/SPEC.md §6.7) : cibles du niveau et verdict du matin. Les passages suivent les
 * jours tenus (`passage.ts`, décision du 18/10/2026).
 */

export type Verdict = 'reussi' | 'partiel' | 'manque';

export interface Cibles {
  lever: string;
  coucher: string;
  /** Faux à N1 : le lever seul valide le matin. */
  plancherObligatoire: boolean;
}

export function ciblesDuNiveau(programme: Programme, niveau: Niveau): Cibles {
  if (estEnAncrage(niveau)) {
    const n = niveauDAncrage(programme, niveau.ancrage);
    return { lever: n.lever, coucher: n.coucher, plancherObligatoire: n.plancher_obligatoire };
  }
  const palier = programme.lever_tot.paliers.find((p) => p.num === niveau.palier);
  if (!palier) throw new Error(`palier absent de « Lever tôt » : ${niveau.palier}`);
  return {
    lever: palier.lever,
    coucher: palier.coucher,
    plancherObligatoire: palier.plancher_obligatoire,
  };
}

const enMinutes = (heure: string) => Number(heure.slice(0, 2)) * 60 + Number(heure.slice(3, 5));

export interface MatinDeLeverTot {
  /** Heure du lever, « HH:MM » ; null tant qu'elle n'est pas saisie. */
  leve: string | null;
  /** Qualité de la nuit (`lever_tot.qualites_nuit`). */
  nuit: string | null;
  /** Séance du matin faite, normale ou minimum : c'est le plancher. */
  plancherFait: boolean;
}

/**
 * Lever tenu : au plus tard à la cible plus la tolérance (5 min, décision du 18/10/2026). Faux tant
 * que l'heure n'est pas saisie. C'est la première condition du jour tenu (décision du 18/10/2026).
 */
export function leverTenu(programme: Programme, niveau: Niveau, leve: string | null): boolean {
  if (!leve) return false;
  const cible = ciblesDuNiveau(programme, niveau).lever;
  return enMinutes(leve) - enMinutes(cible) <= programme.lever_tot.tolerance_lever_min;
}

/**
 * Manqué si le lever dépasse la cible de plus de la tolérance (5 min, décision du 18/10/2026) ;
 * réussi si le lever est tenu et que le plancher est fait, ou que la nuit est difficile, ou que le
 * niveau ne l'exige pas ; partiel sinon. Le snooze est noté sans changer le verdict [Interprétation].
 */
export function verdictDuMatin(
  programme: Programme,
  niveau: Niveau,
  matin: MatinDeLeverTot,
): Verdict | null {
  if (!matin.leve) return null;
  if (!leverTenu(programme, niveau, matin.leve)) return 'manque';
  const cibles = ciblesDuNiveau(programme, niveau);
  const nuitDifficile =
    programme.lever_tot.qualites_nuit.find((q) => q.id === matin.nuit)?.difficile ?? false;
  return matin.plancherFait || nuitDifficile || !cibles.plancherObligatoire ? 'reussi' : 'partiel';
}
