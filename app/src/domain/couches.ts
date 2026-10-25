import type { Programme } from '../data/schema';
import {
  matinDuJour,
  type ContexteDuMatin,
  type Etirement,
  type ExerciceDeSeance,
  type Matin,
  type Mouvement,
  type Tenue,
} from './matin';
import { estEnAncrage, type Niveau } from './niveau';
import type { Element } from './validation';
import type { WeekEnd } from './weekEnd';

/**
 * Couches d'un bloc (décision de José du 18/10/2026) : le minimum, puis ce que la principale y
 * ajoute, puis ce que le bonus ajoute encore. Elles s'additionnent pour former la séance complète :
 * chaque exercice n'apparaît qu'une fois, dans la première couche qui le demande.
 */
export const COUCHES = ['minimum', 'principale', 'bonus'] as const;
export type Couche = (typeof COUCHES)[number];

/** Séries ajoutées à celles qu'une couche précédente demande déjà (« +1 × 30 s »). */
interface EnPlus {
  en_plus?: true;
}

export interface Contenu {
  respiration_min: number;
  /** Respiration comptée en respirations (ancrage, décision du 25/10/2026). */
  respirations: number;
  cafe_min: number;
  mobilite: Mouvement[];
  /** Jour de récupération des paliers : mobilité au ralenti, puis neck CARs (par sens). */
  mobilite_au_ralenti: boolean;
  neck_cars_par_sens: number | null;
  tenues: Tenue[];
  musculation: (ExerciceDeSeance & EnPlus)[];
  etirements: (Etirement & EnPlus)[];
  boxe_rounds: number[];
}

export type Couches = Record<Couche, Contenu>;

export const contenuVide = (): Contenu => ({
  respiration_min: 0,
  respirations: 0,
  cafe_min: 0,
  mobilite: [],
  mobilite_au_ralenti: false,
  neck_cars_par_sens: null,
  tenues: [],
  musculation: [],
  etirements: [],
  boxe_rounds: [],
});

export const estVide = (c: Contenu): boolean =>
  c.respiration_min === 0 &&
  c.respirations === 0 &&
  c.cafe_min === 0 &&
  c.mobilite.length === 0 &&
  c.neck_cars_par_sens === null &&
  c.tenues.length === 0 &&
  c.musculation.length === 0 &&
  c.etirements.length === 0 &&
  c.boxe_rounds.length === 0;

interface AvecSeries {
  exercice: string;
  series: number;
}

const seriesDe = (liste: readonly AvecSeries[], exercice: string) =>
  liste.find((e) => e.exercice === exercice)?.series ?? 0;

const absents = <T extends { exercice: string }>(liste: readonly T[], deja: readonly T[]): T[] =>
  liste.filter((e) => !deja.some((d) => d.exercice === e.exercice));

/** Ce que `ajout` demande en plus de `deja` : les exercices absents, puis les séries en plus. */
function seriesEnPlus<T extends AvecSeries>(
  deja: readonly T[],
  ajout: readonly T[],
): (T & EnPlus)[] {
  return ajout.flatMap((e) => {
    const avant = seriesDe(deja, e.exercice);
    if (e.series <= avant) return [];
    return [avant === 0 ? { ...e } : { ...e, series: e.series - avant, en_plus: true as const }];
  });
}

/** Chaque exercice une fois, avec le plus grand nombre de séries demandé. */
function unionDesSeries<T extends AvecSeries>(a: readonly T[], b: readonly T[]): T[] {
  return [
    ...a.map((e) => ({ ...e, series: Math.max(e.series, seriesDe(b, e.exercice)) })),
    ...absents(b, a),
  ];
}

/** Ce que `ajout` demande en plus de `deja`. */
export function enPlus(deja: Contenu, ajout: Contenu): Contenu {
  return {
    respiration_min: Math.max(0, ajout.respiration_min - deja.respiration_min),
    respirations: Math.max(0, ajout.respirations - deja.respirations),
    cafe_min: Math.max(0, ajout.cafe_min - deja.cafe_min),
    mobilite: absents(ajout.mobilite, deja.mobilite),
    mobilite_au_ralenti: ajout.mobilite_au_ralenti,
    neck_cars_par_sens: deja.neck_cars_par_sens === null ? ajout.neck_cars_par_sens : null,
    tenues: absents(ajout.tenues, deja.tenues),
    musculation: seriesEnPlus(deja.musculation, ajout.musculation),
    etirements: seriesEnPlus(deja.etirements, ajout.etirements),
    boxe_rounds: ajout.boxe_rounds.filter((r) => !deja.boxe_rounds.includes(r)),
  };
}

function reunir(a: Contenu, b: Contenu): Contenu {
  return {
    respiration_min: Math.max(a.respiration_min, b.respiration_min),
    respirations: Math.max(a.respirations, b.respirations),
    cafe_min: Math.max(a.cafe_min, b.cafe_min),
    mobilite: [...a.mobilite, ...absents(b.mobilite, a.mobilite)],
    mobilite_au_ralenti: a.mobilite_au_ralenti || b.mobilite_au_ralenti,
    neck_cars_par_sens: a.neck_cars_par_sens ?? b.neck_cars_par_sens,
    tenues: [...a.tenues, ...absents(b.tenues, a.tenues)],
    musculation: unionDesSeries(a.musculation, b.musculation),
    etirements: unionDesSeries(a.etirements, b.etirements),
    boxe_rounds: [...a.boxe_rounds, ...b.boxe_rounds.filter((r) => !a.boxe_rounds.includes(r))],
  };
}

/** Les couches, à partir de ce que demande chaque niveau en entier : minimum, principale, bonus. */
export function empiler(minimum: Contenu, principale: Contenu, bonus: Contenu): Couches {
  return {
    minimum,
    principale: enPlus(minimum, principale),
    bonus: enPlus(reunir(minimum, principale), bonus),
  };
}

const depuisMatin = (m: Matin): Contenu => ({
  respiration_min: m.respiration_min,
  respirations: m.respirations,
  cafe_min: m.cafe_min,
  mobilite: m.mobilite,
  mobilite_au_ralenti: m.mobilite_au_ralenti,
  neck_cars_par_sens: m.neck_cars_par_sens,
  tenues: m.tenues,
  musculation: m.musculation,
  etirements: m.etirements,
  boxe_rounds: [],
});

/** Matin de la semaine : le minimum, puis ce que la version normale y ajoute ; pas de bonus. */
export function couchesDuMatin(programme: Programme, ctx: ContexteDuMatin): Couches {
  const minimum = matinDuJour(programme, { ...ctx, version: 'minimum' });
  const normale = matinDuJour(programme, { ...ctx, version: 'normale' });
  return empiler(depuisMatin(minimum), depuisMatin(normale), contenuVide());
}

/**
 * Week-end (décisions du 18 et du 25/10/2026) : le minimum (deux paires échauffement et exercice,
 * le deep squat, deux étirements), la principale (les 2 autres paires et les 2 autres étirements ;
 * aux paliers, la séance du palier) et le bonus (le « au mieux » de l'ancrage, réduit à ce qu'il
 * ajoute : le reste de la mobilité et la boxe).
 */
export function couchesDuWeekEnd(programme: Programme, niveau: Niveau, we: WeekEnd): Couches {
  const base: Contenu = we.base
    ? {
        ...contenuVide(),
        mobilite: we.base.echauffement,
        musculation: we.base.exercices,
        etirements: we.base.etirements,
      }
    : contenuVide();
  const seance: Contenu = {
    ...contenuVide(),
    mobilite: we.seance?.mobilite ?? [],
    musculation: we.seance?.musculation ?? [],
    etirements: we.seance?.etirements ?? [],
    boxe_rounds: we.boxe?.rounds ?? [],
  };
  const matin = we.matin_du_palier ? depuisMatin(we.matin_du_palier) : contenuVide();
  const principale = we.bonus ? reunir(base, matin) : reunir(reunir(base, seance), matin);
  const regles = estEnAncrage(niveau)
    ? programme.ancrage.matin.version_minimum
    : programme.matin.version_minimum;
  // Le minimum : celui de la base (ancrage et palier 1), sinon les premiers mouvements de la séance ;
  // puis le deep squat, comme chaque matin.
  const deBase = we.base?.minimum;
  const minimum: Contenu = {
    ...contenuVide(),
    mobilite: deBase
      ? deBase.echauffement
      : principale.mobilite.slice(0, regles.mobilite_mouvements),
    musculation: deBase?.exercices ?? [],
    etirements: deBase?.etirements ?? [],
    tenues: [{ ...regles.tenue }],
  };
  return empiler(minimum, principale, we.bonus ? seance : contenuVide());
}

/**
 * Les éléments à cocher d'un bloc en couches, avec leur clé : l'exercice, « exercice+ » pour des
 * séries en plus, « respiration », « neck_cars », « boxe ». Le café, une marge, ne se coche pas
 * [Interprétation].
 */
export function elementsDesCouches(couches: Couches): Element[] {
  const elements: Element[] = [];
  for (const couche of COUCHES) {
    const c = couches[couche];
    if (c.respiration_min > 0 || c.respirations > 0) elements.push({ cle: 'respiration', couche });
    for (const m of c.mobilite) elements.push({ cle: m.exercice, couche });
    for (const t of c.tenues) elements.push({ cle: t.exercice, couche });
    if (c.neck_cars_par_sens !== null) elements.push({ cle: 'neck_cars', couche });
    for (const e of [...c.musculation, ...c.etirements])
      elements.push({ cle: e.en_plus ? `${e.exercice}+` : e.exercice, couche });
    if (c.boxe_rounds.length > 0) elements.push({ cle: 'boxe', couche });
  }
  return elements;
}
