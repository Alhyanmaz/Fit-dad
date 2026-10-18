/**
 * Dates du domaine : chaînes « AAAA-MM-JJ », calculées en UTC pour éviter les décalages
 * d'heure d'été. Le jour de la semaine se lit sans dépendre du fuseau du téléphone.
 */

export type DateIso = string;

export const JOURS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;
export type Jour = (typeof JOURS)[number];

const UN_JOUR_MS = 86_400_000;

export function versUtc(date: DateIso): number {
  return Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
  );
}

export function jourDeLaSemaine(date: DateIso): Jour {
  const lundiZero = (new Date(versUtc(date)).getUTCDay() + 6) % 7;
  return JOURS[lundiZero] ?? 'lundi';
}

export function ajouterJours(date: DateIso, jours: number): DateIso {
  return new Date(versUtc(date) + jours * UN_JOUR_MS).toISOString().slice(0, 10);
}

export function estWeekEnd(date: DateIso): boolean {
  const jour = jourDeLaSemaine(date);
  return jour === 'samedi' || jour === 'dimanche';
}

/** Nombre de jours de `debut` à `fin` (0 si c'est le même jour). */
export function joursEntre(debut: DateIso, fin: DateIso): number {
  return Math.round((versUtc(fin) - versUtc(debut)) / UN_JOUR_MS);
}
