import type { BlocCleFait, MatinFait } from './ancrage';
import type { MidiFait } from './midi';

/**
 * Ce que José saisit pour une journée, sur les écrans Aujourd'hui et « Lever tôt » (décisions du
 * 18/10/2026). C'est la forme qui sera enregistrée sur le téléphone, une entrée par date.
 */
export interface JournalDuJour {
  boxe: boolean;
  matin: MatinFait;
  auMieux: boolean;
  midi: MidiFait;
  blocCle: BlocCleFait;
  pied: boolean;
  equilibre: { matin: boolean; soir: boolean };
  /** Répétitions par série, par bloc et par exercice (« matin:rings_row » → une valeur par série). */
  repetitions: Record<string, number[]>;
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
  auMieux: false,
  midi: null,
  blocCle: null,
  pied: false,
  equilibre: { matin: false, soir: false },
  repetitions: {},
  lever: { couche: null, leve: null, reveil: null, nuit: null, lumiere: null, note: '' },
});
