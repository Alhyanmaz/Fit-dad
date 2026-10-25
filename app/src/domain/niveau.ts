import type { Programme } from '../data/schema';

/**
 * Niveau du matin : N0, N1 ou N2 pendant l'ancrage, puis un palier de 1 à 4 (décision du
 * 14/10/2026). N0 est le cycle de familiarisation, identique à N1 (décision du 25/10/2026).
 */
export type IdDAncrage = 'N0' | 'N1' | 'N2';
export type Niveau = { ancrage: IdDAncrage } | { palier: number };

export const estEnAncrage = (niveau: Niveau): niveau is { ancrage: IdDAncrage } =>
  'ancrage' in niveau;

export const estEnFamiliarisation = (niveau: Niveau): boolean =>
  estEnAncrage(niveau) && niveau.ancrage === 'N0';

/** Les règles d'un niveau d'ancrage ; celles de N1 pour N0. */
export function niveauDAncrage(programme: Programme, id: IdDAncrage) {
  const cherche = id === 'N0' ? programme.ancrage.familiarisation.comme : id;
  const niveau = programme.ancrage.niveaux.find((n) => n.id === cherche);
  if (!niveau) throw new Error(`niveau d'ancrage absent du programme : ${id}`);
  return niveau;
}

export function palierDuMatin(programme: Programme, num: number) {
  const palier = programme.matin.paliers.find((p) => p.palier === num);
  if (!palier) throw new Error(`palier absent du programme : ${num}`);
  return palier;
}
