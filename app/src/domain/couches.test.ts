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

describe('couches : le minimum, puis la principale, puis le bonus (décision du 18/10/2026)', () => {
  it('N1, matin A : minimum = reverse table top et 2 min de deep squat ; principale = rings row', () => {
    const a = matin(n1, 'A');
    expect(a.minimum.mobilite).toEqual([{ exercice: 'reverse_table_top', a_la_cible: true }]);
    expect(a.minimum.tenues).toEqual([{ exercice: 'deep_squat', duree_s: 120 }]);
    expect(a.minimum.musculation).toEqual([]);
    expect(a.principale.mobilite).toEqual([]);
    expect(a.principale.musculation).toEqual([{ exercice: 'rings_row', series: 1 }]);
    expect(a.principale.tenues).toEqual([]);
    expect(a.bonus.musculation).toEqual([]);
  });

  it('N2, matin A : la principale ajoute respiration, café, hip hinge, KT press, swing et l’étirement', () => {
    const a = matin({ ancrage: 'N2' }, 'A');
    expect(a.minimum.mobilite.map((m) => m.exercice)).toEqual(['bear_walk']);
    expect([a.principale.respiration_min, a.principale.cafe_min]).toEqual([5, 5]);
    expect(a.principale.mobilite.map((m) => m.exercice)).toEqual(['hip_hinge_baton']);
    expect(a.principale.musculation.map((e) => e.exercice)).toEqual(['kt_press', 'swing_emom']);
    expect(a.principale.etirements).toEqual([{ exercice: 'couch_stretch', series: 1 }]);
  });

  it('samedi 24/10 : la base en principale, puis ce que le « au mieux » y ajoute en bonus', () => {
    const samedi = weekEnd('2026-10-24', 'A');
    expect(samedi.minimum.mobilite.map((m) => m.exercice)).toEqual(['bear_walk']);
    expect(samedi.minimum.tenues).toEqual([{ exercice: 'deep_squat', duree_s: 120 }]);
    expect(samedi.principale.mobilite.map((m) => m.exercice)).toEqual(['hip_hinge_baton']);
    expect(samedi.principale.musculation.map((e) => [e.exercice, e.series])).toEqual([
      ['kt_press', 3],
      ['swing_emom', 3],
      ['rings_row', 3],
      ['goblet_squat', 3],
    ]);
    expect(samedi.principale.etirements).toEqual([{ exercice: 'couch_stretch', series: 1 }]);
    expect(samedi.bonus.mobilite.map((m) => m.exercice)).toEqual([
      'spinal_wave',
      'hanche_90_90',
      'shoulder_dislocate',
      'scapula_pull_up',
      'cossack_squat',
    ]);
    expect(samedi.bonus.musculation.map((e) => [e.exercice, e.series])).toEqual([
      ['pistol_box', 3],
      ['kt_sldl', 3],
    ]);
    expect(samedi.bonus.etirements).toEqual([
      { exercice: 'couch_stretch', series: 1, en_plus: true },
      { exercice: 'pigeon', series: 2 },
      { exercice: 'pancake', series: 2 },
    ]);
    expect(samedi.bonus.boxe_rounds).toEqual([1, 3, 5]);
  });

  it('dimanche 25/10 : minimum = reverse table top ; bonus = pompes et traction assistée', () => {
    const dimanche = weekEnd('2026-10-25', 'B');
    expect(dimanche.minimum.mobilite.map((m) => m.exercice)).toEqual(['reverse_table_top']);
    expect(dimanche.principale.mobilite.map((m) => m.exercice)).toEqual(['cossack_squat']);
    expect(dimanche.bonus.musculation.map((e) => e.exercice)).toEqual([
      'pompes',
      'traction_assistee',
    ]);
  });

  it('chaque exercice n’apparaît qu’une fois, semaine et week-end, N1 et N2', () => {
    for (const lettre of ['A', 'B'] as const) {
      expect(exercicesEnDouble(matin(n1, lettre))).toEqual([]);
      expect(exercicesEnDouble(matin({ ancrage: 'N2' }, lettre))).toEqual([]);
    }
    expect(exercicesEnDouble(weekEnd('2026-10-24', 'A'))).toEqual([]);
    expect(exercicesEnDouble(weekEnd('2026-10-25', 'B'))).toEqual([]);
  });
});
