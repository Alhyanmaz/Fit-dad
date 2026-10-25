import type { Lettre } from './alternances';
import { ajouterJours, jourDeLaSemaine, joursEntre, type DateIso } from './dates';
import type { JournalDuJour } from './journal';

/**
 * Ce que l'historique enregistré apporte au jour (jalon J3) : les alternances « la suivante »
 * (docs/SPEC.md §6.3), les cordes de la semaine et les jours tenus des passages.
 */
export interface EntreeDuJournal extends JournalDuJour {
  date: DateIso;
}

/** Les entrées d'avant `jour`, de la plus récente à la plus ancienne. */
const avant = (historique: readonly EntreeDuJournal[], jour: DateIso) =>
  historique.filter((e) => e.date < jour).sort((a, b) => (a.date < b.date ? 1 : -1));

/** Le dernier fait avant `jour` (lettre du matin, routine pied, étirement), ou null. */
export function dernierFait<K extends 'lettreFaite' | 'piedFait' | 'etirementFait'>(
  historique: readonly EntreeDuJournal[],
  jour: DateIso,
  quoi: K,
): EntreeDuJournal[K] {
  return avant(historique, jour).find((e) => e[quoi] !== null)?.[quoi] ?? null;
}

export const derniereLettre = (h: readonly EntreeDuJournal[], jour: DateIso): Lettre | null =>
  dernierFait(h, jour, 'lettreFaite');

/** Cordes faites cette semaine (du lundi à la veille). */
export function cordesDeLaSemaine(historique: readonly EntreeDuJournal[], jour: DateIso): number {
  const decalage = [
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
    'dimanche',
  ].indexOf(jourDeLaSemaine(jour));
  const lundi = ajouterJours(jour, -decalage);
  return avant(historique, jour).filter((e) => e.date >= lundi && e.midi === 'corde').length;
}

/** Les jours tenus enregistrés. */
export const joursTenus = (historique: readonly EntreeDuJournal[]): Set<DateIso> =>
  new Set(historique.filter((e) => e.tenu).map((e) => e.date));

/** Jours tenus sur les `fenetre` derniers jours, aujourd'hui compris (la jauge du résumé). */
export function tenusSurLaFenetre(
  tenus: ReadonlySet<DateIso>,
  jour: DateIso,
  fenetre: number,
): number {
  let n = 0;
  for (const date of tenus) {
    const ecart = joursEntre(date, jour);
    if (ecart >= 0 && ecart < fenetre) n++;
  }
  return n;
}
