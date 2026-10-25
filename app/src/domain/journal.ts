import type { Lettre } from './alternances';
import type { Couche } from './couches';
import type { MidiFait } from './midi';

/**
 * Ce que José saisit pour une journée, sur les écrans Aujourd'hui et « Lever tôt » (décisions du
 * 18/10/2026). C'est la forme qui sera enregistrée sur le téléphone, une entrée par date.
 */
export interface JournalDuJour {
  boxe: boolean;
  /** Couches atteintes le matin (ou au week-end) et le soir, déduites de `faits`. */
  matin: Couche | null;
  soir: Couche | null;
  midi: MidiFait;
  /** Mouvements cochés, par bloc : « matin:rings_row », « soir:knee_raises », « equilibre:soir ». */
  faits: Record<string, boolean>;
  /** Répétitions par série, par bloc et par exercice (« matin:rings_row » → une valeur par série). */
  repetitions: Record<string, number[]>;
  /** Durées faites, en secondes, par série (« matin:bear_walk » → [30]). */
  durees: Record<string, number[]>;
  /**
   * Ce qui a été fait, pour les alternances des jours suivants (« la suivante ») : la lettre du
   * matin fait, celle de la routine pied faite, un étirement du matin fait. Null si rien.
   */
  lettreFaite: Lettre | null;
  piedFait: Lettre | null;
  etirementFait: string | null;
  /** Jour tenu : lever à l'heure, matin et soir au moins en minimum. */
  tenu: boolean;
  lever: {
    /** Heure du coucher de la veille, « HH:MM ». */
    couche: string | null;
    leve: string | null;
    /** `lever_tot.reveils` : premier réveil ou snooze. */
    reveil: string | null;
    nuit: string | null;
    lumiere: string | null;
    note: string;
  };
}

export const journalVide = (): JournalDuJour => ({
  boxe: false,
  matin: null,
  soir: null,
  midi: null,
  faits: {},
  repetitions: {},
  durees: {},
  lettreFaite: null,
  piedFait: null,
  etirementFait: null,
  tenu: false,
  lever: { couche: null, leve: null, reveil: null, nuit: null, lumiere: null, note: '' },
});
