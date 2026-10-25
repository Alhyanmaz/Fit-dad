import Dexie, { type Table } from 'dexie';
import type { DateIso } from '../domain/dates';
import type { EntreeDuJournal } from '../domain/historique';
import { journalVide, type JournalDuJour } from '../domain/journal';
import type { Niveau } from '../domain/niveau';

/**
 * Enregistrement sur le téléphone (docs/SPEC.md §7.2) : IndexedDB par Dexie, base `fit-dad-v2`.
 * Les données de la v1 (`localStorage`, clés `suivi_app_`) ne sont ni lues, ni écrites, ni effacées.
 */

/** Niveau en cours, jour où il a commencé, et les niveaux d'avant (pour y revenir plus tard). */
export interface Reglages {
  cle: 'reglages';
  niveau: Niveau;
  depuis: DateIso;
  historique: { niveau: Niveau; depuis: DateIso }[];
}

export const VERSION_DU_FORMAT = 1;

export class Base extends Dexie {
  journal!: Table<EntreeDuJournal, DateIso>;
  reglages!: Table<Reglages, string>;

  constructor(nom = 'fit-dad-v2') {
    super(nom);
    this.version(VERSION_DU_FORMAT).stores({ journal: 'date', reglages: 'cle' });
  }
}

/** Une entrée lue, complétée par les champs ajoutés depuis son enregistrement. */
const complet = (entree: Partial<EntreeDuJournal> & { date: DateIso }): EntreeDuJournal => {
  const vide = journalVide();
  return { ...vide, ...entree, lever: { ...vide.lever, ...entree.lever } };
};

export async function lireReglages(base: Base): Promise<Reglages | null> {
  return (await base.reglages.get('reglages')) ?? null;
}

export async function ecrireReglages(base: Base, reglages: Omit<Reglages, 'cle'>): Promise<void> {
  await base.reglages.put({ cle: 'reglages', ...reglages });
}

export async function lireJour(base: Base, date: DateIso): Promise<JournalDuJour> {
  const entree = await base.journal.get(date);
  if (!entree) return journalVide();
  const journal: Partial<EntreeDuJournal> = complet(entree);
  delete journal.date;
  return journal as JournalDuJour;
}

export async function ecrireJour(base: Base, date: DateIso, journal: JournalDuJour): Promise<void> {
  await base.journal.put({ ...journal, date });
}

/** Les entrées du `du` au `au` compris. */
export async function lireHistorique(
  base: Base,
  du: DateIso,
  au: DateIso,
): Promise<EntreeDuJournal[]> {
  const entrees = await base.journal.where('date').between(du, au, true, true).toArray();
  return entrees.map(complet);
}

/** Demande au navigateur de ne pas effacer la base quand la place manque (§7.2). */
export async function demanderLaPersistance(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
