import { COUCHES, type Couche } from './couches';

/**
 * Validation mouvement par mouvement (décision de José du 18/10/2026) : chaque élément d'un bloc se
 * coche, et la couche atteinte s'en déduit. Les boutons de couche ne sont que des raccourcis.
 */
export interface Element {
  cle: string;
  couche: Couche;
}

export type Faits = Readonly<Record<string, boolean>>;

/**
 * La plus haute couche dont tous les éléments sont faits, ainsi que ceux des couches d'avant. Une
 * couche sans élément ne bloque rien et ne compte pas.
 */
export function coucheAtteinte(elements: readonly Element[], faits: Faits): Couche | null {
  let atteinte: Couche | null = null;
  for (const couche of COUCHES) {
    const lesSiens = elements.filter((e) => e.couche === couche);
    if (lesSiens.length === 0) continue;
    if (!lesSiens.every((e) => faits[e.cle] === true)) break;
    atteinte = couche;
  }
  return atteinte;
}

/** Raccourci : tout fait jusqu'à `couche` comprise, rien au-delà ; null : rien de fait. */
export function jusqua(
  elements: readonly Element[],
  couche: Couche | null,
): Record<string, boolean> {
  const rang = couche === null ? -1 : COUCHES.indexOf(couche);
  return Object.fromEntries(elements.map((e) => [e.cle, COUCHES.indexOf(e.couche) <= rang]));
}

/** Les couches qui ont des éléments, dans l'ordre : ce sont elles qui ont un bouton. */
export const couchesPresentes = (elements: readonly Element[]): Couche[] =>
  COUCHES.filter((c) => elements.some((e) => e.couche === c));

/** Second appui sur le bouton de la couche atteinte : on revient à la couche d'avant. */
export function couchePrecedente(elements: readonly Element[], couche: Couche): Couche | null {
  const avant = couchesPresentes(elements).filter(
    (c) => COUCHES.indexOf(c) < COUCHES.indexOf(couche),
  );
  return avant.at(-1) ?? null;
}
