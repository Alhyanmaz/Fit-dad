import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import {
  dateLongue,
  detailEtirement,
  detailExercice,
  detailMouvement,
  fourchetteTexte,
  heureCourte,
} from './libelles';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

describe('libellés de l’écran Aujourd’hui', () => {
  it('écrit la date et les heures à la française', () => {
    expect(dateLongue('2026-10-19')).toBe('Lundi 19 octobre');
    expect(dateLongue('2026-10-25')).toBe('Dimanche 25 octobre');
    expect(heureCourte('06:50')).toBe('6h50');
    expect(heureCourte('22:50')).toBe('22h50');
  });

  it('donne la fourchette en répétitions ou en secondes', () => {
    expect(fourchetteTexte(programme, 'rings_row')).toBe('10 à 16 rép.');
    expect(fourchetteTexte(programme, 'goblet_squat')).toBe('20 rép.');
    expect(fourchetteTexte(programme, 'suspension')).toBe('50 à 80 s');
    expect(fourchetteTexte(programme, 'deep_squat')).toBeNull();
  });

  it('détaille mouvements, exercices et étirements', () => {
    expect(detailMouvement({ exercice: 'cossack_squat', a_la_cible: true })).toBe(
      '1 série à ta cible',
    );
    expect(detailMouvement({ exercice: 'bear_walk', duree_s: 30 })).toBe('30 s');
    expect(detailExercice(programme, { exercice: 'rings_row', series: 1 })).toBe(
      '1 série · 10 à 16 rép.',
    );
    expect(detailExercice(programme, { exercice: 'swing_emom', series: 6, reps: 10 })).toBe(
      '6 × 10',
    );
    expect(detailEtirement(programme, { exercice: 'kiza', series: 1 })).toBe('1 × 30 s');
  });
});
