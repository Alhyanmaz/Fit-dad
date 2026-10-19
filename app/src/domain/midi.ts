import type { Programme } from '../data/schema';
import { jourDeLaSemaine, type DateIso } from './dates';
import type { TypeDeJour } from './jour';

/** Midi en semaine (docs/SPEC.md §6.4 ; pendant l'ancrage, §6.11). */
/** Ce que José valide le midi : corde ou marche (décision du 18/10/2026). */
export type MidiFait = 'corde' | 'marche' | null;

export type Midi =
  | {
      proposition: 'corde' | 'marche';
      /** Ni jour de boxe ni jour de récupération. */
      eligible_corde: boolean;
      cordes_faites: number;
      objectif: number;
    }
  | { proposition: 'bouger'; bonus: true };

export interface ContexteDuMidi {
  date: DateIso;
  type: TypeDeJour;
  cordesFaitesCetteSemaine: number;
  enAncrage: boolean;
}

/** Pas de midi le week-end : renvoie null. */
export function midiDuJour(programme: Programme, ctx: ContexteDuMidi): Midi | null {
  if (!programme.midi.jours.includes(jourDeLaSemaine(ctx.date))) return null;
  if (ctx.enAncrage) return { proposition: 'bouger', bonus: true };
  const { objectif_par_semaine: objectif, jamais } = programme.midi.corde_flow;
  const interdit =
    (ctx.type === 'boxe' && jamais.includes('jour_boxe')) ||
    (ctx.type === 'recuperation' && jamais.includes('jour_recuperation'));
  return {
    proposition: !interdit && ctx.cordesFaitesCetteSemaine < objectif ? 'corde' : 'marche',
    eligible_corde: !interdit,
    cordes_faites: ctx.cordesFaitesCetteSemaine,
    objectif,
  };
}
