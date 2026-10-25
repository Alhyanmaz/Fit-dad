import { describe, expect, it } from 'vitest';
import {
  cordesDeLaSemaine,
  derniereLettre,
  dernierFait,
  joursTenus,
  tenusSurLaFenetre,
  type EntreeDuJournal,
} from './historique';
import { journalVide } from './journal';

const entree = (date: string, modif: Partial<EntreeDuJournal> = {}): EntreeDuJournal => ({
  ...journalVide(),
  date,
  ...modif,
});

describe('historique : alternances, cordes et jours tenus (jalon J3)', () => {
  const historique = [
    entree('2026-10-26', {
      lettreFaite: 'A',
      piedFait: 'A',
      etirementFait: 'couch_stretch',
      midi: 'corde',
      tenu: true,
    }),
    entree('2026-10-27', { lettreFaite: 'B', midi: 'marche', tenu: true }),
    // Mercredi : rien de fait ; « la suivante » ne compte pas les jours.
    entree('2026-10-28'),
    entree('2026-10-29', { midi: 'corde' }),
  ];

  it('la dernière lettre faite, en sautant les jours sans matin', () => {
    expect(derniereLettre(historique, '2026-10-30')).toBe('B');
    expect(derniereLettre(historique, '2026-10-27')).toBe('A');
    expect(derniereLettre(historique, '2026-10-26')).toBeNull();
    expect(dernierFait(historique, '2026-10-30', 'piedFait')).toBe('A');
    expect(dernierFait(historique, '2026-10-30', 'etirementFait')).toBe('couch_stretch');
  });

  it('les cordes de la semaine, du lundi à la veille', () => {
    expect(cordesDeLaSemaine(historique, '2026-10-30')).toBe(2);
    expect(cordesDeLaSemaine(historique, '2026-10-27')).toBe(1);
    // Lundi suivant : nouvelle semaine.
    expect(cordesDeLaSemaine(historique, '2026-11-02')).toBe(0);
  });

  it('les jours tenus, et la jauge sur 14 jours, aujourd’hui compris', () => {
    const tenus = joursTenus(historique);
    expect([...tenus]).toEqual(['2026-10-26', '2026-10-27']);
    expect(tenusSurLaFenetre(tenus, '2026-10-27', 14)).toBe(2);
    expect(tenusSurLaFenetre(tenus, '2026-11-09', 14)).toBe(1);
    expect(tenusSurLaFenetre(tenus, '2026-10-25', 14)).toBe(0);
  });
});
