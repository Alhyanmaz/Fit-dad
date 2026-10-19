import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { compteurDeRepetitions, reglageDeDuree, regler } from './saisie';

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

  it('échauffements compris : cossack squat (par côté) et reverse table top ont leur compteur', () => {
    expect(compteurDeRepetitions(programme, 'cossack_squat', 1)).toEqual({
      exercice: 'cossack_squat',
      series: 1,
      depart: 8,
      cote: 'chaque côté',
    });
    expect(compteurDeRepetitions(programme, 'reverse_table_top', 1)?.depart).toBe(5);
  });

  it('pas de compteur pour un mouvement au temps, une tenue ou une durée', () => {
    expect(compteurDeRepetitions(programme, 'bear_walk', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'horse_stance', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'deep_squat', 1)).toBeNull();
    expect(compteurDeRepetitions(programme, 'kiza', 1)).toBeNull();
  });
});

describe('durées réglables (décision du 18/10/2026)', () => {
  it('pas de 5 s, de 15 s dès 2 min, de 1 min dès 5 min', () => {
    expect(reglageDeDuree(programme, 'bear_walk', 30)).toEqual({ depart: 30, pas: 5, max: null });
    expect(reglageDeDuree(programme, 'deep_squat', 120).pas).toBe(15);
    expect(reglageDeDuree(programme, null, 300).pas).toBe(60);
  });

  it('un étirement ne passe jamais 30 s (règle n° 2) ; une durée ne descend pas sous un pas', () => {
    const couch = reglageDeDuree(programme, 'couch_stretch', 30);
    expect(couch.max).toBe(30);
    expect(regler(couch, 30, 1)).toBe(30);
    expect(regler(couch, 30, -1)).toBe(25);
    expect(regler(couch, 5, -1)).toBe(5);
    const deepSquat = reglageDeDuree(programme, 'deep_squat', 120);
    expect(regler(deepSquat, 120, 1)).toBe(135);
  });
});
