import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import type { Lettre } from './alternances';
import { COUCHES, couchesDuMatin, couchesDuWeekEnd, type Couches } from './couches';
import { weekEndDuJour } from './weekEnd';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

const n1 = { ancrage: 'N1' as const };
const matin = (niveau: { ancrage: 'N1' | 'N2' }, lettre: Lettre) =>
  couchesDuMatin(programme, { niveau, type: 'normal', lettre, lettreDeLaVeille: null });
const weekEnd = (date: string, lettre: Lettre) =>
  couchesDuWeekEnd(
    programme,
    n1,
    weekEndDuJour(programme, { niveau: n1, date, lettre, joursDeBoxe: [] }),
  );

/** Chaque exercice dans une seule couche, sauf des séries en plus (« +1 × 30 s »). */
function exercicesEnDouble(couches: Couches): string[] {
  const vus = new Set<string>();
  const doubles: string[] = [];
  for (const couche of COUCHES) {
    const c = couches[couche];
    const ids = [
      ...c.mobilite.map((m) => m.exercice),
      ...c.tenues.map((t) => t.exercice),
      ...c.musculation.filter((e) => !e.en_plus).map((e) => e.exercice),
      ...c.etirements.filter((e) => !e.en_plus).map((e) => e.exercice),
    ];
    for (const id of ids) {
      if (vus.has(id)) doubles.push(id);
      vus.add(id);
    }
  }
  return doubles;
}

describe('couches : le minimum, puis la principale, puis le bonus (décisions du 18 et du 25/10/2026)', () => {
  it('N1, matin A : minimum = 2 mouvements et 2 min de deep squat ; principale = respiration, rings row, étirement', () => {
    const a = matin(n1, 'A');
    expect(a.minimum.mobilite.map((m) => m.exercice)).toEqual([
      'downward_dog_cobra',
      'shoulder_dislocate',
    ]);
    expect(a.minimum.tenues).toEqual([{ exercice: 'deep_squat', duree_s: 120 }]);
    expect(a.minimum.musculation).toEqual([]);
    expect(a.principale.respirations).toBe(10);
    expect(a.principale.mobilite).toEqual([]);
    expect(a.principale.musculation).toEqual([{ exercice: 'rings_row', series: 1 }]);
    expect(a.principale.etirements).toEqual([{ exercice: 'couch_stretch', series: 1 }]);
    expect(a.bonus.musculation).toEqual([]);
  });

  it('N2, matin A : la principale ajoute respiration, café, hip hinge, rings row, swing et les étirements', () => {
    const a = matin({ ancrage: 'N2' }, 'A');
    expect(a.minimum.mobilite.map((m) => m.exercice)).toEqual([
      'downward_dog_cobra',
      'shoulder_dislocate',
    ]);
    expect([a.principale.respirations, a.principale.cafe_min]).toEqual([10, 8]);
    expect(a.principale.mobilite.map((m) => m.exercice)).toEqual(['hip_hinge_baton']);
    expect(a.principale.musculation.map((e) => e.exercice)).toEqual(['rings_row', 'swing_emom']);
    expect(a.principale.etirements.map((e) => e.exercice)).toEqual([
      'couch_stretch',
      'prayer_stretch',
    ]);
  });

  it('samedi 07/11, séance A : minimum, 2 paires en 3 séries et 2 étirements ; principale, les 2 autres', () => {
    const samedi = weekEnd('2026-11-07', 'A');
    expect(samedi.minimum.mobilite.map((m) => m.exercice)).toEqual([
      'cossack_squat',
      'scapula_pull_up',
    ]);
    expect(samedi.minimum.musculation).toEqual([
      { exercice: 'pistol_box', series: 3 },
      { exercice: 'rings_row', series: 3 },
    ]);
    expect(samedi.minimum.tenues).toEqual([{ exercice: 'deep_squat', duree_s: 120 }]);
    expect(samedi.minimum.etirements).toEqual([
      { exercice: 'pigeon', series: 2 },
      { exercice: 'stick_shoulder_extension', series: 2 },
    ]);
    expect(samedi.principale.mobilite.map((m) => m.exercice)).toEqual([
      'shoulder_dislocate',
      'hip_hinge_baton',
    ]);
    expect(samedi.principale.musculation).toEqual([
      { exercice: 'kt_press', series: 3 },
      { exercice: 'kt_sldl', series: 3 },
    ]);
    expect(samedi.principale.etirements).toEqual([
      { exercice: 'pancake', series: 2 },
      { exercice: 'couch_stretch', series: 2 },
    ]);
    // Bonus : le reste de la routine A et la boxe ; ni musculation ni étirements.
    expect(samedi.bonus.mobilite.map((m) => m.exercice)).toEqual([
      'downward_dog_cobra',
      'spinal_wave',
      'bear_walk',
      'hanche_90_90',
    ]);
    expect(samedi.bonus.musculation).toEqual([]);
    expect(samedi.bonus.etirements).toEqual([]);
    expect(samedi.bonus.boxe_rounds).toEqual([1, 3, 5]);
  });

  it('dimanche 08/11, séance B : minimum, pompes et swing ; 4 exercices en tout ; bonus de 4 mouvements', () => {
    const dimanche = weekEnd('2026-11-08', 'B');
    expect(dimanche.minimum.mobilite.map((m) => m.exercice)).toEqual([
      'shoulder_dislocate',
      'reverse_table_top',
    ]);
    expect(dimanche.minimum.musculation).toEqual([
      { exercice: 'pompes', series: 3 },
      { exercice: 'swing_emom', series: 3, reps: 10 },
    ]);
    expect(dimanche.principale.mobilite.map((m) => m.exercice)).toEqual([
      'duck_walk',
      'scapula_pull_up',
    ]);
    const exercices = new Set(
      [...dimanche.minimum.musculation, ...dimanche.principale.musculation].map((e) => e.exercice),
    );
    expect([...exercices]).toEqual(['pompes', 'swing_emom', 'goblet_squat', 'traction_assistee']);
    expect(dimanche.bonus.musculation).toEqual([]);
    expect(dimanche.bonus.mobilite.map((m) => m.exercice)).toEqual([
      'downward_dog_cobra',
      'spinal_rotation',
      'hip_hinge_baton',
      'spiderman_lunge',
    ]);
  });

  it('chaque exercice n’apparaît qu’une fois, semaine et week-end, N1 et N2', () => {
    for (const lettre of ['A', 'B'] as const) {
      expect(exercicesEnDouble(matin(n1, lettre))).toEqual([]);
      expect(exercicesEnDouble(matin({ ancrage: 'N2' }, lettre))).toEqual([]);
    }
    expect(exercicesEnDouble(weekEnd('2026-11-07', 'A'))).toEqual([]);
    expect(exercicesEnDouble(weekEnd('2026-11-08', 'B'))).toEqual([]);
  });
});
