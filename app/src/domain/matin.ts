import type { Programme } from '../data/schema';
import { autreLettre, type Lettre } from './alternances';
import type { TypeDeJour } from './jour';
import {
  estEnAncrage,
  niveauDAncrage,
  palierDuMatin,
  type IdDAncrage,
  type Niveau,
} from './niveau';

/** Contenu du matin (docs/SPEC.md §6.2 pour les paliers, §6.11 pour l'ancrage). */

export type VersionDuMatin = 'normale' | 'courte' | 'minimum';

/** Versions que José peut choisir : pas de version courte pendant l'ancrage (décision du 14/10/2026). */
export const versionsDuMatin = (niveau: Niveau): VersionDuMatin[] =>
  estEnAncrage(niveau) ? ['normale', 'minimum'] : ['normale', 'courte', 'minimum'];

export interface Mouvement {
  exercice: string;
  /** Durée par mouvement ; absente pour un mouvement fait en série. */
  duree_s?: number;
  /** Une série à la cible du moment : cossack squat et reverse table top, à tous les niveaux. */
  a_la_cible?: true;
}

export interface ExerciceDeSeance {
  exercice: string;
  series: number;
  reps?: number | undefined;
  note?: string | undefined;
}

export interface Etirement {
  exercice: string;
  series: number;
}

/** Position tenue au temps : les 2 min de deep squat du minimum (décision du 18/10/2026). */
export interface Tenue {
  exercice: string;
  duree_s: number;
}

export interface Matin {
  /** Séance du jour ; null le jour de récupération. */
  lettre: Lettre | null;
  respiration_min: number;
  /** Respiration comptée en respirations pendant l'ancrage : 10, dès N1 (décision du 25/10/2026). */
  respirations: number;
  /** Le café, une marge, pris après la séance (décision du 25/10/2026). */
  cafe_min: number;
  mobilite: Mouvement[];
  mobilite_au_ralenti: boolean;
  /** Neck CARs du jour de récupération, par sens ; null les autres jours. */
  neck_cars_par_sens: number | null;
  musculation: ExerciceDeSeance[];
  etirements: Etirement[];
  /** Tenues du minimum, dans toutes les versions : le minimum fait partie de la séance complète. */
  tenues: Tenue[];
  /**
   * Minutes de travail prévues, hors respiration et café : créneau du niveau d'ancrage,
   * travail du palier. Null quand le programme ne les fixe pas (versions courte et minimum).
   */
  travail_min: number | null;
  /** Minutes de travail encore à définir par José (palier 4). */
  a_definir_min: number;
}

export interface ContexteDuMatin {
  niveau: Niveau;
  type: TypeDeJour;
  /** Lettre donnée par `lettreDuMatin`. */
  lettre: Lettre | null;
  /** Séance de la veille : le jour de récupération prend l'autre routine. */
  lettreDeLaVeille: Lettre | null;
  version?: VersionDuMatin;
  /** Un des étirements du dernier matin, pour la rotation de l'ancrage. */
  dernierEtirement?: string | null;
}

export function matinDuJour(programme: Programme, ctx: ContexteDuMatin): Matin {
  const version = ctx.version ?? 'normale';
  return estEnAncrage(ctx.niveau)
    ? matinDAncrage(programme, ctx.niveau.ancrage, ctx, version)
    : matinDuPalier(programme, ctx.niveau.palier, ctx, version);
}

/** Lettre des mouvements de mobilité des paliers : l'autre que la veille le jour de récupération. */
function lettreDeMobilite(ctx: ContexteDuMatin): Lettre {
  if (ctx.type === 'recuperation')
    return ctx.lettreDeLaVeille ? autreLettre(ctx.lettreDeLaVeille) : 'A';
  return ctx.lettre ?? 'A';
}

/** Cossack squat et reverse table top : 1 série à la cible, jamais au temps (décision du 17/10/2026). */
export function mouvementDeMobilite(
  programme: Programme,
  exercice: string,
  dureeMouvement_s: number,
): Mouvement {
  return programme.mobilite.a_la_cible.includes(exercice)
    ? { exercice, a_la_cible: true }
    : { exercice, duree_s: dureeMouvement_s };
}

/**
 * Un exercice de séance avec ses séries : celles du palier ou du week-end, sauf pour les exercices à
 * séries fixes (horse stance, carry, Copenhagen, tuck hang L-sit), qui n'en font jamais plus. Le swing
 * en EMOM se compte en minutes : une série de `reps_par_minute` par minute. Décisions du 17/10/2026.
 */
export function exerciceDeSeance(
  programme: Programme,
  exercice: string,
  series: number,
  swingMinutes?: number,
): ExerciceDeSeance {
  const ex = programme.exercices[exercice];
  if (ex?.mesure === 'emom')
    return { exercice, series: swingMinutes ?? ex.minutes ?? series, reps: ex.reps_par_minute };
  const fixes = ex?.series_fixes;
  return { exercice, series: fixes === undefined ? series : Math.min(fixes, series) };
}

function neckCars(programme: Programme): number {
  return programme.exercices[programme.mobilite.jour_recuperation.puis]?.par_sens ?? 3;
}

/**
 * Version minimum, après une nuit très hachée : les premiers mouvements de mobilité (un aux paliers,
 * deux pendant l'ancrage), puis la tenue (deep squat).
 */
const matinMinimum = (lettre: Lettre | null, mouvements: Mouvement[], tenues: Tenue[]): Matin => ({
  lettre,
  respiration_min: 0,
  respirations: 0,
  cafe_min: 0,
  mobilite: mouvements,
  mobilite_au_ralenti: false,
  neck_cars_par_sens: null,
  musculation: [],
  etirements: [],
  tenues,
  travail_min: null,
  a_definir_min: 0,
});

/** Les 2 min de deep squat ajoutées au minimum de tous les matins (décision du 18/10/2026). */
const tenuesDuMinimum = (minimum: { tenue: Tenue }): Tenue[] => [{ ...minimum.tenue }];

/** « À tour de rôle » par groupes : le groupe qui suit celui du dernier étirement fait. */
export function groupeSuivant(
  rotation: readonly (readonly string[])[],
  dernierFait: string | null,
): readonly string[] {
  const i = dernierFait === null ? -1 : rotation.findIndex((g) => g.includes(dernierFait));
  const groupe = rotation[(i + 1) % rotation.length] ?? rotation[0];
  if (!groupe) throw new Error('rotation vide');
  return groupe;
}

function matinDAncrage(
  programme: Programme,
  id: IdDAncrage,
  ctx: ContexteDuMatin,
  version: VersionDuMatin,
): Matin {
  // Ni jour de récupération ni version courte pendant l'ancrage (décision du 14/10/2026).
  if (ctx.type === 'recuperation') throw new Error("pas de jour de récupération pendant l'ancrage");
  if (version === 'courte') throw new Error("pas de version courte pendant l'ancrage");
  const niveau = niveauDAncrage(programme, id);
  const regles = programme.ancrage.matin;
  const lettre = ctx.lettre ?? 'A';
  const seance = niveau.matin.seances[lettre];
  const mobilite = seance.mobilite.map((exercice) =>
    mouvementDeMobilite(programme, exercice, regles.mobilite_duree_mouvement_s),
  );
  const tenues = tenuesDuMinimum(regles.version_minimum);
  if (version === 'minimum')
    return matinMinimum(
      lettre,
      mobilite.slice(0, regles.version_minimum.mobilite_mouvements),
      tenues,
    );
  const { rotation, series } = niveau.matin.etirements;
  const etirements: Etirement[] = groupeSuivant(rotation, ctx.dernierEtirement ?? null).map(
    (exercice) => ({ exercice, series }),
  );
  return {
    lettre,
    respiration_min: 0,
    respirations: niveau.matin.respirations,
    cafe_min: niveau.matin.marge_min,
    mobilite,
    mobilite_au_ralenti: false,
    neck_cars_par_sens: null,
    musculation: seance.musculation.map((e) => ({ ...e })),
    etirements,
    tenues,
    travail_min: niveau.matin.creneau_min,
    a_definir_min: 0,
  };
}

/** Exercices de la séance A ou B au palier donné (§6.2) : binômes, ajouts si séance complète, swing en fin de B. */
export function exercicesDeLaSeance(
  programme: Programme,
  lettre: Lettre,
  palier: number,
  contenu: 'seance_sans_ajouts' | 'seance_complete',
): string[] {
  const seance = programme.seances[lettre];
  const present = (e: { des_palier?: number | undefined }) => (e.des_palier ?? 1) <= palier;
  const binomes = seance.binomes.flat().filter(present);
  const ajouts = contenu === 'seance_complete' ? seance.ajouts.filter(present) : [];
  const fin = seance.fin && present(seance.fin) ? [seance.fin] : [];
  return [...binomes, ...ajouts, ...fin].map((e) => e.exercice);
}

/** Mouvements de la routine de mobilité du jour, au temps du palier. */
export function mobiliteDeLaRoutine(
  programme: Programme,
  lettre: Lettre,
  dureeMouvement_s: number,
): Mouvement[] {
  return programme.mobilite.routines[lettre].map((exercice) =>
    mouvementDeMobilite(programme, exercice, dureeMouvement_s),
  );
}

function matinDuPalier(
  programme: Programme,
  num: number,
  ctx: ContexteDuMatin,
  version: VersionDuMatin,
): Matin {
  const palier = palierDuMatin(programme, num);
  const recuperation = ctx.type === 'recuperation';
  const mobilite = mobiliteDeLaRoutine(
    programme,
    lettreDeMobilite(ctx),
    palier.mobilite.duree_mouvement_s,
  );
  const lettre = recuperation ? null : ctx.lettre;
  const tenues = tenuesDuMinimum(programme.matin.version_minimum);
  if (version === 'minimum')
    return matinMinimum(
      lettre,
      mobilite.slice(0, programme.matin.version_minimum.mobilite_mouvements),
      tenues,
    );
  // Version courte : 1 série par exercice, swing réduit, étirements à 1 série (décision du 17/10/2026).
  const courte = version === 'courte' ? programme.matin.version_courte : null;
  const series = courte ? courte.musculation_series : (palier.musculation.series ?? 1);
  const musculation =
    recuperation || !lettre
      ? []
      : exercicesDeLaSeance(
          programme,
          lettre,
          num,
          palier.musculation.contenu ?? 'seance_sans_ajouts',
        ).map((exercice) => exerciceDeSeance(programme, exercice, series, courte?.swing_minutes));
  const e = palier.etirements;
  const seriesDEtirement = (s: number) => (courte ? courte.etirements_series : s);
  const etirements: Etirement[] = !e
    ? []
    : [
        ...programme.etirements.zones.hanches.map((exercice) => ({
          exercice,
          series: seriesDEtirement(e.hanches),
        })),
        ...(e.pied_mollet
          ? programme.etirements.zones.pied_mollet.map((exercice) => ({
              exercice,
              series: seriesDEtirement(e.pied_mollet ?? 1),
            }))
          : []),
      ];
  return {
    lettre,
    respiration_min: palier.minutes.respiration,
    respirations: 0,
    cafe_min: palier.minutes.cafe,
    mobilite,
    mobilite_au_ralenti: recuperation,
    neck_cars_par_sens: recuperation ? neckCars(programme) : null,
    musculation,
    etirements,
    tenues,
    travail_min: version === 'normale' ? palier.travail_min : null,
    a_definir_min: palier.minutes.a_definir ?? 0,
  };
}
