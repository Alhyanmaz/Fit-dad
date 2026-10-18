import type { Programme } from '../data/schema';
import { versUtc, type DateIso } from '../domain/dates';
import type { Etirement, ExerciceDeSeance, Mouvement } from '../domain/matin';

/** Libellés affichés à l'écran, tirés du programme (sans règle métier). */

export const nomExercice = (programme: Programme, id: string): string =>
  programme.exercices[id]?.nom ?? id;

/** « 10 à 16 rép. », « 50 à 80 s », « 20 rép. », ou rien si l'exercice n'a pas de fourchette. */
export function fourchetteTexte(programme: Programme, id: string): string | null {
  const ex = programme.exercices[id];
  if (ex?.fourchette) {
    const [bas, haut] = ex.fourchette;
    return bas === haut ? `${bas} rép.` : `${bas} à ${haut} rép.`;
  }
  if (ex?.fourchette_s) return `${ex.fourchette_s[0]} à ${ex.fourchette_s[1]} s`;
  return null;
}

export function detailMouvement(mouvement: Mouvement): string {
  if (mouvement.a_la_cible) return '1 série à ta cible';
  return mouvement.duree_s === undefined ? '' : `${mouvement.duree_s} s`;
}

export function detailExercice(programme: Programme, e: ExerciceDeSeance): string {
  if (e.reps !== undefined) return `${e.series} × ${e.reps}`;
  const series = e.series === 1 ? '1 série' : `${e.series} séries`;
  const fourchette = fourchetteTexte(programme, e.exercice);
  return fourchette ? `${series} · ${fourchette}` : series;
}

export const detailEtirement = (programme: Programme, e: Etirement): string =>
  `${e.series} × ${programme.regles_generales.etirements.tenue_s} s`;

/** « Lundi 19 octobre », lu en UTC comme le reste du domaine. */
export function dateLongue(date: DateIso): string {
  const texte = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(versUtc(date)));
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** « 6h50 » à partir de « 06:50 ». */
export const heureCourte = (heure: string): string =>
  `${Number(heure.slice(0, 2))}h${heure.slice(3, 5)}`;
