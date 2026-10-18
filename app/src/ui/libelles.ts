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

const COTES: Record<string, string> = {
  'chaque côté': 'side',
  'chaque bras': 'arm',
  'chaque jambe': 'leg',
};

/**
 * Cible d'un mouvement de mobilité, sans compteur, au format demandé par José le 18/10/2026 :
 * « 8-14 rep / side » ; la tenue du reverse table top suit (« 5-10 rep + tenue 10-30 s »).
 */
export function legendeALaCible(programme: Programme, id: string): string {
  const ex = programme.exercices[id];
  if (!ex?.fourchette) return 'à ta cible';
  // Trait d'union et espaces insécables : la légende ne se coupe qu'autour du « + ».
  const plage = ([bas, haut]: readonly [number, number]) => `${bas}\u2011${haut}`;
  const cote = ex.cote ? `\u00a0/\u00a0${COTES[ex.cote] ?? ex.cote}` : '';
  const tenue = ex.fourchette_tenue_s ? ` + tenue\u00a0${plage(ex.fourchette_tenue_s)}\u00a0s` : '';
  return `${plage(ex.fourchette)}\u00a0rep${cote}${tenue}`;
}

export function detailMouvement(programme: Programme, mouvement: Mouvement): string {
  if (mouvement.a_la_cible) return legendeALaCible(programme, mouvement.exercice);
  return mouvement.duree_s === undefined ? '' : `${mouvement.duree_s} s`;
}

/** « 2 min », « 1 min 30 s », « 45 s ». */
export function dureeTexte(secondes: number): string {
  const min = Math.floor(secondes / 60);
  const s = secondes % 60;
  if (min === 0) return `${s} s`;
  return s === 0 ? `${min} min` : `${min} min ${s} s`;
}

const seriesTexte = (n: number) => (n === 1 ? '1 série' : `${n} séries`);

/** `en_plus` : séries ajoutées à celles d'une couche précédente (« +1 série »). */
export function detailExercice(
  programme: Programme,
  e: ExerciceDeSeance & { en_plus?: true },
): string {
  if (e.en_plus) return `+${seriesTexte(e.series)}`;
  if (e.reps !== undefined) return `${e.series} × ${e.reps}`;
  const fourchette = fourchetteTexte(programme, e.exercice);
  return fourchette ? `${seriesTexte(e.series)} · ${fourchette}` : seriesTexte(e.series);
}

export const detailEtirement = (programme: Programme, e: Etirement & { en_plus?: true }): string =>
  `${e.en_plus ? '+' : ''}${e.series} × ${programme.regles_generales.etirements.tenue_s} s`;

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

/** « chaque côté » → « par côté », « chaque bras » → « par bras ». */
export const parCote = (cote: string): string => cote.replace(/^chaque /, 'par ');
