import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import {
  dateLongue,
  detailEtirement,
  detailExercice,
  detailMouvement,
  dureeTexte,
  fourchetteTexte,
  heureCourte,
  legendeALaCible,
  parCote,
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
    expect(detailMouvement(programme, { exercice: 'bear_walk', duree_s: 30 })).toBe('30 s');
    expect(detailExercice(programme, { exercice: 'rings_row', series: 1 })).toBe(
      '1 série · 10 à 16 rép.',
    );
    expect(detailExercice(programme, { exercice: 'swing_emom', series: 6, reps: 10 })).toBe(
      '6 × 10',
    );
    expect(detailEtirement(programme, { exercice: 'kiza', series: 1 })).toBe('1 × 30 s');
    expect(
      detailEtirement(programme, { exercice: 'couch_stretch', series: 1, en_plus: true }),
    ).toBe('+1 × 30 s');
    expect(detailExercice(programme, { exercice: 'kt_press', series: 1, en_plus: true })).toBe(
      '+1 série',
    );
    expect([dureeTexte(120), dureeTexte(60), dureeTexte(90), dureeTexte(30)]).toEqual([
      '2 min',
      '1 min',
      '1 min 30 s',
      '30 s',
    ]);
    expect(parCote('chaque côté')).toBe('par côté');
    expect(parCote('chaque bras')).toBe('par bras');
  });
});

describe('légende des mouvements à la cible, sans compteur (José, 18/10/2026)', () => {
  it('« 8-12 rep / side » pour le cossack squat, la tenue en plus pour le reverse table top', () => {
    expect(legendeALaCible(programme, 'cossack_squat')).toBe('8\u201112\u00a0rep\u00a0/\u00a0side');
    expect(legendeALaCible(programme, 'reverse_table_top')).toBe(
      '5\u201110\u00a0rep + tenue\u00a010\u201130\u00a0s',
    );
    expect(detailMouvement(programme, { exercice: 'cossack_squat', a_la_cible: true })).toBe(
      legendeALaCible(programme, 'cossack_squat'),
    );
  });
});
