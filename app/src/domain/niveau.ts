import type { Programme } from '../data/schema';

/** Niveau du matin : N1 ou N2 pendant l'ancrage, puis un palier de 1 à 4 (décision du 14/10/2026). */
export type Niveau = { ancrage: 'N1' | 'N2' } | { palier: number };

export const estEnAncrage = (niveau: Niveau): niveau is { ancrage: 'N1' | 'N2' } =>
  'ancrage' in niveau;

export function niveauDAncrage(programme: Programme, id: 'N1' | 'N2') {
  const niveau = programme.ancrage.niveaux.find((n) => n.id === id);
  if (!niveau) throw new Error(`niveau d'ancrage absent du programme : ${id}`);
  return niveau;
}

export function palierDuMatin(programme: Programme, num: number) {
  const palier = programme.matin.paliers.find((p) => p.palier === num);
  if (!palier) throw new Error(`palier absent du programme : ${num}`);
  return palier;
}
