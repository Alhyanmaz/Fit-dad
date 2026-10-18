import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { compteurDeRepetitions } from './saisie';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

describe('saisie des répétitions', () => {
  it('un compteur par série, parti du bas de la fourchette', () => {
    expect(compteurDeRepetitions(programme, 'rings_row', 1)).toEqual({
      exercice: 'rings_row',
      series: 1,
      depart: 10,
    });
    expect(compteurDeRepetitions(programme, 'goblet_squat', 3)).toEqual({
      exercice: 'goblet_squat',
      series: 3,
      depart: 20,
    });
    expect(compteurDeRepetitions(programme, 'kt_press', 3)).toEqual({
      exercice: 'kt_press',
      series: 3,
      depart: 6,
      cote: 'chaque bras',
    });
    expect(compteurDeRepetitions(programme, 'reverse_table_top', 1)?.depart).toBe(5);
  });

  it('le swing compte ses répétitions par minute, la suspension ses knee raises', () => {
    expect(compteurDeRepetitions(programme, 'swing_emom', 3)).toEqual({
      exercice: 'swing_emom',
      series: 3,
      depart: 10,
    });
    expect(compteurDeRepetitions(programme, 'suspension', 1)).toEqual({
      exercice: 'suspension',
      series: 1,
      depart: 5,
      quoi: 'knee raises',
    });
  });

  it('cossack squat : pas de compteur, la cible suffit (décision du 18/10/2026)', () => {
    expect(compteurDeRepetitions(programme, 'cossack_squat', 1)).toBeNull();
  });

  it('pas de compteur pour un mouvement au temps, une tenue ou une durée', () => {
    expect(compteurDeRepetitions(programme, 'bear_walk', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'horse_stance', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'deep_squat', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'kiza', 1)).toBeNull();
  });
});
