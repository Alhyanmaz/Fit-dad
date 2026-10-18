import type { Programme } from '../data/schema';
import { ajouterJours, estWeekEnd, type DateIso } from './dates';
import { estEnAncrage, type Niveau } from './niveau';

/**
 * Passages (décision de José du 18/10/2026) : vers N2, vers le palier 1, puis d'un palier au
 * suivant, tous avec le même critère (`passages`). L'appli propose, José confirme ; il peut aussi
 * forcer le passage à tout moment.
 */

/** Le niveau qui suit : N1, N2, puis les paliers 1 à 4 ; null après le dernier palier. */
export function niveauSuivant(programme: Programme, niveau: Niveau): Niveau | null {
  if (estEnAncrage(niveau)) {
    const ids = programme.ancrage.niveaux.map((n) => n.id);
    const suivant = ids[ids.indexOf(niveau.ancrage) + 1];
    return suivant ? { ancrage: suivant } : { palier: 1 };
  }
  return niveau.palier < programme.matin.paliers.length ? { palier: niveau.palier + 1 } : null;
}

/**
 * Un niveau par cycle : passage proposé au plus tôt un cycle après le début du niveau en cours
 * (5 semaines pendant l'ancrage ; aux paliers, les semaines de travail puis la décharge). Après un
 * passage forcé, le cycle part du jour du passage [Interprétation].
 */
export function passageAuPlusTot(programme: Programme, niveau: Niveau, depuis: DateIso): DateIso {
  const semaines = estEnAncrage(niveau)
    ? programme.ancrage.semaines_par_cycle
    : programme.cycle.semaines_travail + 1;
  return ajouterJours(depuis, 7 * semaines);
}

export interface CritereDePassage {
  tenus: number;
  requis: number;
  weekEndTenus: number;
  weekEndRequis: number;
  rempli: boolean;
}

/**
 * Sur les 14 jours qui précèdent `jour` : au moins 12 jours tenus, dont les deux samedis et les
 * deux dimanches. Le moment (au plus tôt un cycle après le début du niveau) se vérifie à part.
 */
export function critereDePassage(
  programme: Programme,
  joursTenus: ReadonlySet<DateIso>,
  jour: DateIso,
): CritereDePassage {
  const { jours_tenus, fenetre_jours, dont_jours_de_week_end } = programme.passages;
  let tenus = 0;
  let weekEndTenus = 0;
  for (let i = 1; i <= fenetre_jours; i++) {
    const date = ajouterJours(jour, -i);
    if (!joursTenus.has(date)) continue;
    tenus++;
    if (estWeekEnd(date)) weekEndTenus++;
  }
  return {
    tenus,
    requis: jours_tenus,
    weekEndTenus,
    weekEndRequis: dont_jours_de_week_end,
    rempli: tenus >= jours_tenus && weekEndTenus >= dont_jours_de_week_end,
  };
}
