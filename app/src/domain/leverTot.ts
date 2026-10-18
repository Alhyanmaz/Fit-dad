import type { Programme } from '../data/schema';
import { ajouterJours, estWeekEnd, type DateIso } from './dates';
import { estEnAncrage, niveauDAncrage, type Niveau } from './niveau';

/** « Lever tôt » (docs/SPEC.md §6.7) : cibles du niveau, verdict du matin, critère de passage. */

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
  const cibles = ciblesDuNiveau(programme, niveau);
  if (enMinutes(matin.leve) - enMinutes(cibles.lever) > programme.lever_tot.tolerance_lever_min)
    return 'manque';
  const nuitDifficile =
    programme.lever_tot.qualites_nuit.find((q) => q.id === matin.nuit)?.difficile ?? false;
  return matin.plancherFait || nuitDifficile || !cibles.plancherObligatoire ? 'reussi' : 'partiel';
}

export interface CritereDePassage {
  reussis: number;
  requis: number;
  weekEndReussis: number;
  weekEndRequis: number;
  rempli: boolean;
}

/**
 * Passage au palier suivant (décisions des 17 et 18/10/2026) : sur les 14 jours qui précèdent
 * `jour`, au moins 12 matins réussis, dont les deux samedis et les deux dimanches. Le moment
 * (au plus tôt au début du cycle suivant, un palier par cycle) se décide ailleurs.
 */
export function critereDePassage(
  programme: Programme,
  verdicts: ReadonlyMap<DateIso, Verdict>,
  jour: DateIso,
): CritereDePassage {
  const { fenetre_jours, matins_reussis_requis, dont_matins_week_end } = programme.lever_tot;
  let reussis = 0;
  let weekEndReussis = 0;
  for (let i = 1; i <= fenetre_jours; i++) {
    const date = ajouterJours(jour, -i);
    if (verdicts.get(date) !== 'reussi') continue;
    reussis++;
    if (estWeekEnd(date)) weekEndReussis++;
  }
  return {
    reussis,
    requis: matins_reussis_requis,
    weekEndReussis,
    weekEndRequis: dont_matins_week_end,
    rempli: reussis >= matins_reussis_requis && weekEndReussis >= dont_matins_week_end,
  };
}
