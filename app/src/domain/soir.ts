import type { Programme } from '../data/schema';
import type { Lettre } from './alternances';
import type { TypeDeJour } from './jour';
import type { Etirement } from './matin';
import { estEnAncrage, type Niveau } from './niveau';
import type { Element } from './validation';

/** Soir (docs/SPEC.md §6.5 ; pendant l'ancrage, §6.11). */

export interface BlocCle {
  version: 'standard' | 'recuperation' | 'boxe' | 'minimum';
  suspension_series: number;
  /** Durée fixe de la suspension ; null : à la cible du moment. */
  suspension_s: number | null;
  knee_raises: boolean;
  /** One arm hang inclus une fois ajouté par José (suspension à 80 s). */
  one_arm_hang_si_ajoute: boolean;
  deep_squat_series: number;
}

export interface Soir {
  duree_min: number;
  bloc_cle: BlocCle;
  /** Routine pied du soir ; null le soir de boxe et en version minimum. */
  pied: {
    lettre: Lettre;
    exercices: string[];
    series_par_exercice: number;
    etirements: Etirement[];
  } | null;
  /** Soir de boxe : les 4 étirements du pied, facultatifs. */
  etirements_apres_boxe: { etirements: Etirement[]; facultatif: boolean } | null;
}

export interface ContexteDuSoir {
  niveau: Niveau;
  type: TypeDeJour;
  /** Lettre donnée par `lettreDuPied` ; null le soir de boxe. */
  lettrePied: Lettre | null;
  /** Numéro du cycle du programme ; 1 pendant l'ancrage. */
  cycle: number;
  /** Routines pied déjà faites dans le cycle, pour l'alternance des séries du cycle 2. */
  piedsFaitsDansLeCycle: number;
  /**
   * Version minimum (suspension seule et deep squat) : prévue pendant l'ancrage seulement. Aux paliers,
   * le programme n'en définit pas et le soir reste le soir du palier.
   */
  version?: 'normale' | 'minimum';
}

/** Séries des 4 étirements du pied selon le cycle (scénario 12) : 1, puis 1 et 2 en alternance, puis 2. */
export function seriesEtirementsPied(
  programme: Programme,
  cycle: number,
  piedsFaitsDansLeCycle: number,
): number {
  const regles = programme.etirements.routine_pied.series_par_cycle;
  const regle =
    regles.find((r) => r.cycle === cycle) ??
    regles.find((r) => r.cycle_minimum !== undefined && cycle >= r.cycle_minimum);
  if (!regle) return 1;
  const { series } = regle;
  return (regle.alternance ? series[piedsFaitsDansLeCycle % series.length] : series[0]) ?? 1;
}

export function soirDuJour(programme: Programme, ctx: ContexteDuSoir): Soir {
  const { niveau } = ctx;
  const etirementsPied = (series: number): Etirement[] =>
    programme.etirements.routine_pied.liste.map((exercice) => ({ exercice, series }));

  if (ctx.type === 'boxe') {
    const boxe = programme.bloc_cle.versions.boxe;
    const apres = programme.etirements.soir_boxe;
    return {
      duree_min: boxe.duree_min,
      // 1 min de suspension seule, sans knee raises ; one arm hang une fois ajouté (14 et 17/10/2026).
      bloc_cle: {
        version: 'boxe',
        suspension_series: boxe.suspension_series,
        suspension_s: boxe.suspension_s,
        knee_raises: false,
        one_arm_hang_si_ajoute: true,
        deep_squat_series: boxe.deep_squat_series,
      },
      pied: null,
      etirements_apres_boxe: {
        etirements: apres.liste.map((exercice) => ({ exercice, series: apres.series })),
        facultatif: apres.facultatif,
      },
    };
  }

  const recuperation = ctx.type === 'recuperation';
  const lettre = ctx.lettrePied ?? 'A';
  const exercices = programme.pied.routines[lettre].exercices;

  if (estEnAncrage(niveau)) {
    // Pas de jour de récupération pendant l'ancrage (décision du 14/10/2026).
    if (recuperation) throw new Error("pas de jour de récupération pendant l'ancrage");
    const soir = programme.ancrage.soir;
    const minimum = ctx.version === 'minimum';
    return {
      duree_min: minimum ? soir.version_minimum.duree_min : soir.duree_min,
      // Version minimum, qui est aussi le soir de boxe : 1 min de suspension seule, 2 min de deep squat ;
      // one arm hang une fois ajouté (décisions des 14 et 17/10/2026).
      bloc_cle: {
        version: minimum ? 'minimum' : 'standard',
        suspension_series: soir.suspension_series,
        suspension_s: minimum ? soir.version_minimum.suspension_s : null,
        knee_raises: !minimum,
        one_arm_hang_si_ajoute: true,
        deep_squat_series: soir.deep_squat_series,
      },
      pied: minimum
        ? null
        : {
            lettre,
            exercices,
            series_par_exercice: soir.pied.series_exercices,
            etirements: etirementsPied(soir.pied.series_etirements),
          },
      etirements_apres_boxe: null,
    };
  }

  const palier = niveau.palier;
  const soirDuPalier = programme.soir_par_palier.find((s) => s.paliers.includes(palier));
  const suspension = programme.exercices['suspension']?.series ?? 2;
  const deepSquat = programme.exercices['deep_squat']?.series ?? 2;
  return {
    duree_min: soirDuPalier?.duree_min ?? programme.bloc_cle.versions.standard.duree_min,
    bloc_cle: {
      version: recuperation ? 'recuperation' : 'standard',
      suspension_series: suspension,
      suspension_s: null,
      knee_raises: !recuperation,
      one_arm_hang_si_ajoute: !recuperation,
      deep_squat_series: deepSquat,
    },
    pied: {
      lettre,
      exercices,
      series_par_exercice: soirDuPalier?.pied_series_exercices ?? programme.pied.series_exercices,
      etirements: etirementsPied(
        seriesEtirementsPied(programme, ctx.cycle, ctx.piedsFaitsDansLeCycle),
      ),
    },
    etirements_apres_boxe: null,
  };
}

/**
 * Les éléments du soir à cocher (décisions du 18/10/2026) : le bloc clé (minimum, la suspension
 * seule et le deep squat ; principale, les knee raises), la routine pied (principale), les
 * étirements après la boxe (bonus).
 */
export function elementsDuSoir(soir: Soir): Element[] {
  const elements: Element[] = [
    { cle: 'suspension_seule', couche: 'minimum' },
    { cle: 'deep_squat', couche: 'minimum' },
  ];
  if (soir.bloc_cle.knee_raises) elements.push({ cle: 'knee_raises', couche: 'principale' });
  if (soir.pied) {
    for (const exercice of soir.pied.exercices)
      elements.push({ cle: exercice, couche: 'principale' });
    for (const e of soir.pied.etirements) elements.push({ cle: e.exercice, couche: 'principale' });
  }
  for (const e of soir.etirements_apres_boxe?.etirements ?? [])
    elements.push({ cle: e.exercice, couche: 'bonus' });
  return elements;
}
