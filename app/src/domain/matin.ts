import type { Programme } from '../data/schema';
import { autreLettre, suivantDansLaRotation, type Lettre } from './alternances';
import type { TypeDeJour } from './jour';
import { estEnAncrage, niveauDAncrage, palierDuMatin, type Niveau } from './niveau';

/** Contenu du matin (docs/SPEC.md §6.2 pour les paliers, §6.11 pour l'ancrage). */

export type VersionDuMatin = 'normale' | 'courte' | 'minimum';

/** Versions que José peut choisir : pas de version courte pendant l'ancrage (décision du 14/10/2026). */
export const versionsDuMatin = (niveau: Niveau): VersionDuMatin[] =>
  estEnAncrage(niveau) ? ['normale', 'minimum'] : ['normale', 'courte', 'minimum'];

export interface Mouvement {
  exercice: string;
  /** Durée par mouvement ; absente pour un mouvement fait en série. */
  duree_s?: number;
  /** Une série à la cible du moment (cossack, reverse table top pendant l'ancrage). */
  a_la_cible?: true;
  /** « Série courte » des paliers 1 et 2 (question Q2 du J1, encore ouverte). */
  serie_courte?: true;
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

export interface Matin {
  /** Séance du jour ; null le jour de récupération. */
  lettre: Lettre | null;
  respiration_min: number;
  cafe_min: number;
  mobilite: Mouvement[];
  mobilite_au_ralenti: boolean;
  /** Neck CARs du jour de récupération, par sens ; null les autres jours. */
  neck_cars_par_sens: number | null;
  musculation: ExerciceDeSeance[];
  etirements: Etirement[];
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
  /** Dernier étirement fait, pour la rotation de l'ancrage. */
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

function neckCars(programme: Programme): number {
  return programme.exercices[programme.mobilite.jour_recuperation.puis]?.par_sens ?? 3;
}

const matinMinimum = (lettre: Lettre | null, mouvement: Mouvement | undefined): Matin => ({
  lettre,
  respiration_min: 0,
  cafe_min: 0,
  mobilite: mouvement ? [mouvement] : [],
  mobilite_au_ralenti: false,
  neck_cars_par_sens: null,
  musculation: [],
  etirements: [],
  travail_min: null,
  a_definir_min: 0,
});

function matinDAncrage(
  programme: Programme,
  id: 'N1' | 'N2',
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
  const mobilite: Mouvement[] = seance.mobilite.map((exercice) =>
    regles.mobilite_a_la_cible.includes(exercice)
      ? { exercice, a_la_cible: true }
      : { exercice, duree_s: regles.mobilite_duree_mouvement_s },
  );
  if (version === 'minimum') return matinMinimum(lettre, mobilite[0]);
  const etirements: Etirement[] = niveau.matin.etirement
    ? [
        {
          exercice: suivantDansLaRotation(regles.etirement.rotation, ctx.dernierEtirement ?? null),
          series: regles.etirement.series,
        },
      ]
    : [];
  const respiration = niveau.matin.respiration_min;
  return {
    lettre,
    respiration_min: respiration,
    cafe_min: Math.max(0, niveau.matin.marge_min - respiration),
    mobilite,
    mobilite_au_ralenti: false,
    neck_cars_par_sens: null,
    musculation: seance.musculation.map((e) => ({ ...e })),
    etirements,
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

/** Mouvements de la routine de mobilité du jour, au temps du palier, avec la « série courte ». */
export function mobiliteDeLaRoutine(
  programme: Programme,
  lettre: Lettre,
  dureeMouvement_s: number,
  serieCourte: readonly string[],
): Mouvement[] {
  return programme.mobilite.routines[lettre].map((exercice) =>
    serieCourte.includes(exercice)
      ? { exercice, serie_courte: true }
      : { exercice, duree_s: dureeMouvement_s },
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
    palier.mobilite.serie_courte ?? [],
  );
  const lettre = recuperation ? null : ctx.lettre;
  if (version === 'minimum') return matinMinimum(lettre, mobilite[0]);
  const series = version === 'courte' ? 1 : (palier.musculation.series ?? 1);
  const musculation =
    recuperation || !lettre
      ? []
      : exercicesDeLaSeance(
          programme,
          lettre,
          num,
          palier.musculation.contenu ?? 'seance_sans_ajouts',
        ).map((exercice) => ({ exercice, series }));
  const e = palier.etirements;
  const etirements: Etirement[] =
    version === 'courte' || !e
      ? []
      : [
          ...programme.etirements.zones.hanches.map((exercice) => ({
            exercice,
            series: e.hanches,
          })),
          ...(e.pied_mollet
            ? programme.etirements.zones.pied_mollet.map((exercice) => ({
                exercice,
                series: e.pied_mollet ?? 1,
              }))
            : []),
        ];
  return {
    lettre,
    respiration_min: palier.minutes.respiration,
    cafe_min: palier.minutes.cafe,
    mobilite,
    mobilite_au_ralenti: recuperation,
    neck_cars_par_sens: recuperation ? neckCars(programme) : null,
    musculation,
    etirements,
    travail_min: version === 'normale' ? palier.travail_min : null,
    a_definir_min: palier.minutes.a_definir ?? 0,
  };
}
