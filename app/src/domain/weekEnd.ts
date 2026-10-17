import type { Programme } from '../data/schema';
import { suivantDansLaRotation, type Lettre } from './alternances';
import type { DateIso } from './dates';
import { aUnBlocBoxe, techniqueDuClubEnPriorite } from './jour';
import {
  exerciceDeSeance,
  exercicesDeLaSeance,
  matinDuJour,
  mobiliteDeLaRoutine,
  mouvementDeMobilite,
  type Etirement,
  type ExerciceDeSeance,
  type Matin,
  type Mouvement,
} from './matin';
import { estEnAncrage, niveauDAncrage, type Niveau } from './niveau';

/**
 * Séance du week-end, qui remplace le matin de la semaine (docs/SPEC.md §6.2 et §6.11 ;
 * contenus des paliers provisoires, décision du 14/10/2026). Le soir suit `soirDuJour`.
 */

export interface BaseDAncrage {
  echauffement: Mouvement[];
  exercices: ExerciceDeSeance[];
  etirements: Etirement[];
}

export interface SeanceDuWeekEnd {
  mobilite: Mouvement[];
  musculation: ExerciceDeSeance[];
  etirements: Etirement[];
}

export interface BlocBoxe {
  rounds: number[];
  technique_du_club_en_priorite: boolean;
}

export interface WeekEnd {
  /** Base de l'ancrage (ancrage et palier 1). */
  base: BaseDAncrage | null;
  /** Séance complète du jour (paliers 2 et 3), ou « au mieux » de l'ancrage. */
  seance: SeanceDuWeekEnd | null;
  /** Palier 4 : la journée type, avec le matin du palier. */
  matin_du_palier: Matin | null;
  /** Bloc boxe ; null le samedi qui suit une boxe le vendredi. */
  boxe: BlocBoxe | null;
  /** Pendant l'ancrage, la séance et la boxe sont le « au mieux » : un bonus. */
  bonus: boolean;
}

export interface ContexteDuWeekEnd {
  niveau: Niveau;
  date: DateIso;
  /** A le samedi, B le dimanche (`lettreDuMatin`). */
  lettre: Lettre;
  joursDeBoxe: readonly DateIso[];
  dernierEtirement?: string | null;
}

function baseDAncrage(programme: Programme, ctx: ContexteDuWeekEnd): BaseDAncrage {
  const { minimum, au_mieux } = programme.ancrage.week_end;
  const regles = programme.ancrage.matin;
  const n2 = niveauDAncrage(programme, 'N2');
  return {
    echauffement: n2.matin.seances[ctx.lettre].mobilite.map((exercice) =>
      mouvementDeMobilite(programme, exercice, regles.mobilite_duree_mouvement_s),
    ),
    exercices: minimum.exercices.map((exercice) =>
      exercice === 'swing_emom'
        ? { exercice, series: minimum.series, reps: au_mieux.musculation.swing.reps }
        : { exercice, series: minimum.series },
    ),
    etirements: [
      {
        exercice: suivantDansLaRotation(regles.etirement.rotation, ctx.dernierEtirement ?? null),
        series: regles.etirement.series,
      },
    ],
  };
}

function boxeDuJour(rounds: number[], ctx: ContexteDuWeekEnd): BlocBoxe | null {
  if (!aUnBlocBoxe(ctx.date, ctx.joursDeBoxe)) return null;
  return {
    rounds,
    technique_du_club_en_priorite: techniqueDuClubEnPriorite(ctx.date, ctx.joursDeBoxe),
  };
}

export function weekEndDuJour(programme: Programme, ctx: ContexteDuWeekEnd): WeekEnd {
  if (estEnAncrage(ctx.niveau)) {
    const { au_mieux } = programme.ancrage.week_end;
    const regles = programme.ancrage.matin;
    const series = au_mieux.musculation.series;
    return {
      base: baseDAncrage(programme, ctx),
      seance: {
        mobilite: mobiliteDeLaRoutine(programme, ctx.lettre, regles.mobilite_duree_mouvement_s),
        // Sans les exercices du palier 2 : la séance telle qu'au palier 1.
        musculation: exercicesDeLaSeance(programme, ctx.lettre, 1, 'seance_sans_ajouts').map(
          (exercice) =>
            exercice === 'swing_emom'
              ? {
                  exercice,
                  series: au_mieux.musculation.swing.series,
                  reps: au_mieux.musculation.swing.reps,
                }
              : { exercice, series },
        ),
        // Les 3 étirements de hanche, pigeon compris (décision du 17/10/2026).
        etirements: programme.etirements.zones.hanches.map((exercice) => ({
          exercice,
          series: au_mieux.etirements_hanches_series,
        })),
      },
      matin_du_palier: null,
      boxe: boxeDuJour(au_mieux.boxe_rounds, ctx),
      bonus: true,
    };
  }

  const palier = ctx.niveau.palier;
  const regle = programme.semaine.week_end.find((w) => w.paliers.includes(palier));
  if (!regle) throw new Error(`week-end absent du programme pour le palier ${palier}`);
  const s = regle.structure;
  const palierDuMatin = programme.matin.paliers.find((p) => p.palier === palier);
  const seance: SeanceDuWeekEnd | null = s.seance
    ? {
        mobilite: s.mobilite_complete
          ? mobiliteDeLaRoutine(
              programme,
              ctx.lettre,
              palierDuMatin?.mobilite.duree_mouvement_s ?? 30,
            )
          : [],
        musculation: exercicesDeLaSeance(
          programme,
          ctx.lettre,
          palier,
          s.seance.avec_ajouts ? 'seance_complete' : 'seance_sans_ajouts',
        ).map((exercice) => exerciceDeSeance(programme, exercice, s.seance?.series ?? 3)),
        etirements: programme.etirements.zones.hanches.map((exercice) => ({
          exercice,
          series: s.etirements_hanches_series ?? 2,
        })),
      }
    : null;
  return {
    base: s.base_ancrage ? baseDAncrage(programme, ctx) : null,
    seance,
    matin_du_palier: s.journee_type
      ? matinDuJour(programme, {
          niveau: ctx.niveau,
          type: 'normal',
          lettre: ctx.lettre,
          lettreDeLaVeille: null,
        })
      : null,
    boxe: boxeDuJour(s.boxe_rounds, ctx),
    bonus: false,
  };
}
