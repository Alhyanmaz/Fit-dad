import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { lettreDuMatin, lettreDuPied, suivantDansLaRotation, type Lettre } from './alternances';
import { jourTenu } from './ancrage';
import { ajouterJours, jourDeLaSemaine, joursEntre, type DateIso } from './dates';
import { aUnBlocBoxe, techniqueDuClubEnPriorite, typeDeJour } from './jour';
import { matinDuJour } from './matin';
import { midiDuJour } from './midi';
import type { Niveau } from './niveau';
import { seriesEtirementsPied, soirDuJour } from './soir';
import { weekEndDuJour } from './weekEnd';

/** Scénarios de recette du jalon J2 (docs/SPEC.md §9). Semaine du lundi 19/10/2026. */

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

const LUNDI: DateIso = '2026-10-19';
const MARDI = ajouterJours(LUNDI, 1);
const VENDREDI = ajouterJours(LUNDI, 4);
const SAMEDI = ajouterJours(LUNDI, 5);
const DIMANCHE = ajouterJours(LUNDI, 6);

/** Déroule une semaine en faisant tout ce qui est proposé : les pointeurs avancent chaque jour. */
function simulerSemaine(joursDeBoxe: DateIso[], enAncrage = false) {
  let derniereSeance: Lettre | null = null;
  let dernierPied: Lettre | null = null;
  let cordes = 0;
  return Array.from({ length: 7 }, (_, i) => {
    const date = ajouterJours(LUNDI, i);
    const type = typeDeJour(date, joursDeBoxe);
    const lettre = lettreDuMatin(date, type, derniereSeance);
    if (lettre) derniereSeance = lettre;
    const midi = midiDuJour(programme, { date, type, cordesFaitesCetteSemaine: cordes, enAncrage });
    if (midi?.proposition === 'corde') cordes++;
    const pied = lettreDuPied(type, dernierPied);
    if (pied) dernierPied = pied;
    return {
      type,
      lettre,
      midi: midi?.proposition ?? null,
      pied,
      blocBoxe: aUnBlocBoxe(date, joursDeBoxe),
    };
  });
}

describe('dates et rotations', () => {
  it('lit le jour de la semaine et franchit mois, années et heure d’été', () => {
    expect(jourDeLaSemaine(LUNDI)).toBe('lundi');
    expect(jourDeLaSemaine('2026-10-25')).toBe('dimanche');
    expect(ajouterJours('2026-10-24', 2)).toBe('2026-10-26');
    expect(ajouterJours('2026-12-31', 1)).toBe('2027-01-01');
    expect(joursEntre(LUNDI, '2026-11-23')).toBe(35);
  });

  it('fait tourner une rotation à tour de rôle', () => {
    const rotation = ['couch_stretch', 'pancake'];
    expect(suivantDansLaRotation(rotation, null)).toBe('couch_stretch');
    expect(suivantDansLaRotation(rotation, 'couch_stretch')).toBe('pancake');
    expect(suivantDansLaRotation(rotation, 'pancake')).toBe('couch_stretch');
  });
});

describe('scénario 1 : semaine type, boxe le mardi, palier 2', () => {
  const semaine = simulerSemaine([MARDI]);

  it('types de jour et séances A/B', () => {
    expect(semaine.map((j) => j.type)).toEqual([
      'normal',
      'boxe',
      'recuperation',
      'normal',
      'normal',
      'normal',
      'normal',
    ]);
    expect(semaine.map((j) => j.lettre)).toEqual(['A', 'B', null, 'A', 'B', 'A', 'B']);
  });

  it('midis : corde lundi, jeudi, vendredi ; marche mardi et mercredi', () => {
    expect(semaine.map((j) => j.midi)).toEqual([
      'corde',
      'marche',
      'marche',
      'corde',
      'corde',
      null,
      null,
    ]);
  });

  it('soirs : pied A lundi, aucun pied mardi, puis B, A, B, A, B', () => {
    expect(semaine.map((j) => j.pied)).toEqual(['A', null, 'B', 'A', 'B', 'A', 'B']);
  });
});

describe('scénario 2 : boxe le vendredi', () => {
  const semaine = simulerSemaine([VENDREDI]);

  it('pas de jour de récupération ; A le samedi, B le dimanche', () => {
    expect(semaine.map((j) => j.type)).not.toContain('recuperation');
    expect(semaine[5]?.lettre).toBe('A');
    expect(semaine[6]?.lettre).toBe('B');
  });

  it('samedi : séance complète A, sans bloc boxe', () => {
    const samedi = weekEndDuJour(programme, {
      niveau: { palier: 2 },
      date: SAMEDI,
      lettre: 'A',
      joursDeBoxe: [VENDREDI],
    });
    expect(samedi.seance?.musculation.map((e) => e.exercice)).toContain('kt_press');
    expect(samedi.boxe).toBeNull();
  });

  it('dimanche : séance complète B et un seul bloc boxe, technique du club en priorité', () => {
    const dimanche = weekEndDuJour(programme, {
      niveau: { palier: 2 },
      date: DIMANCHE,
      lettre: 'B',
      joursDeBoxe: [VENDREDI],
    });
    expect(dimanche.seance?.musculation.map((e) => e.exercice)).toContain('pompes');
    expect(dimanche.boxe?.technique_du_club_en_priorite).toBe(true);
    expect(techniqueDuClubEnPriorite(DIMANCHE, [VENDREDI])).toBe(true);
  });

  it('4 midis éligibles, corde proposée tant que moins de 3 séances sont faites', () => {
    expect(semaine.map((j) => j.midi)).toEqual([
      'corde',
      'corde',
      'corde',
      'marche',
      'marche',
      null,
      null,
    ]);
    const jeudi = midiDuJour(programme, {
      date: ajouterJours(LUNDI, 3),
      type: 'normal',
      cordesFaitesCetteSemaine: 2,
      enAncrage: false,
    });
    expect(jeudi).toMatchObject({ proposition: 'corde', eligible_corde: true });
  });
});

describe('scénario 3 : semaine sans boxe', () => {
  const semaine = simulerSemaine([]);

  it('aucun jour de récupération ; corde 3 midis, marche 2 ; pied tous les soirs', () => {
    expect(semaine.every((j) => j.type === 'normal')).toBe(true);
    expect(semaine.map((j) => j.midi)).toEqual([
      'corde',
      'corde',
      'corde',
      'marche',
      'marche',
      null,
      null,
    ]);
    expect(semaine.map((j) => j.pied)).toEqual(['A', 'B', 'A', 'B', 'A', 'B', 'A']);
  });

  it('un bloc boxe le samedi et le dimanche', () => {
    expect(semaine.map((j) => j.blocBoxe)).toEqual([false, false, false, false, false, true, true]);
  });
});

describe('scénarios 4 et 5 : matins de l’ancrage', () => {
  const matin = (niveau: Niveau, lettre: Lettre, dernierEtirement: string | null = null) =>
    matinDuJour(programme, {
      niveau,
      type: 'normal',
      lettre,
      lettreDeLaVeille: null,
      dernierEtirement,
    });

  it('4 : N1, matin A (environ 3 min, sans étirement) puis matin B', () => {
    const a = matin({ ancrage: 'N1' }, 'A');
    expect(a.mobilite).toEqual([{ exercice: 'reverse_table_top', a_la_cible: true }]);
    expect(a.musculation).toEqual([{ exercice: 'rings_row', series: 1 }]);
    expect(a.etirements).toEqual([]);
    expect([a.respiration_min, a.cafe_min, a.travail_min]).toEqual([0, 0, 3]);
    const b = matin({ ancrage: 'N1' }, 'B');
    expect(b.mobilite).toEqual([{ exercice: 'cossack_squat', a_la_cible: true }]);
    expect(b.musculation).toEqual([{ exercice: 'goblet_squat', series: 1 }]);
  });

  it('5 : N2, matin B puis matin A', () => {
    const b = matin({ ancrage: 'N2' }, 'B');
    expect([b.respiration_min, b.cafe_min, b.travail_min]).toEqual([5, 5, 10]);
    expect(b.mobilite.map((m) => m.exercice)).toEqual(['reverse_table_top', 'cossack_squat']);
    expect(b.musculation.map((e) => [e.exercice, e.series])).toEqual([
      ['rings_row', 1],
      ['goblet_squat', 1],
    ]);
    expect(b.etirements).toEqual([{ exercice: 'couch_stretch', series: 1 }]);
    const a = matin({ ancrage: 'N2' }, 'A', 'couch_stretch');
    expect(a.mobilite).toEqual([
      { exercice: 'bear_walk', duree_s: 30 },
      { exercice: 'hip_hinge_baton', duree_s: 30 },
    ]);
    expect(a.musculation).toMatchObject([
      { exercice: 'kt_press', series: 1 },
      { exercice: 'swing_emom', series: 1, reps: 10 },
    ]);
    expect(a.etirements).toEqual([{ exercice: 'pancake', series: 1 }]);
  });
});

describe('scénario 6 : palier 2, samedi (provisoire)', () => {
  const samedi = weekEndDuJour(programme, {
    niveau: { palier: 2 },
    date: SAMEDI,
    lettre: 'A',
    joursDeBoxe: [],
  });

  it('routine de mobilité A complète, séance complète A en 3 séries avec les ajouts', () => {
    expect(samedi.seance?.mobilite.map((m) => m.exercice)).toEqual(programme.mobilite.routines.A);
    expect(samedi.seance?.musculation).toEqual(
      ['kt_press', 'pistol_box', 'rings_row', 'kt_sldl', 'horse_stance', 'carry'].map(
        (exercice) => ({ exercice, series: 3 }),
      ),
    );
  });

  it('étirements de hanche 2 × 30 s, boxe en 3 rounds', () => {
    expect(samedi.seance?.etirements).toEqual(
      ['couch_stretch', 'pigeon', 'pancake'].map((exercice) => ({ exercice, series: 2 })),
    );
    expect(samedi.boxe?.rounds).toEqual([1, 3, 5]);
  });

  it('le soir du palier 2 : environ 15 min, routine pied à 1 série', () => {
    const soir = soirDuJour(programme, {
      niveau: { palier: 2 },
      type: 'normal',
      lettrePied: 'A',
      cycle: 1,
      piedsFaitsDansLeCycle: 0,
    });
    expect(soir.duree_min).toBe(15);
    expect(soir.pied?.series_par_exercice).toBe(1);
  });
});

describe('scénario 7 : jour de récupération après un mardi B, palier 2', () => {
  const mercredi = ajouterJours(LUNDI, 2);
  const type = typeDeJour(mercredi, [MARDI]);

  it('mobilité A au ralenti puis neck CARs, pas de musculation', () => {
    expect(type).toBe('recuperation');
    const matin = matinDuJour(programme, {
      niveau: { palier: 2 },
      type,
      lettre: lettreDuMatin(mercredi, type, 'B'),
      lettreDeLaVeille: 'B',
    });
    expect(matin.lettre).toBeNull();
    expect(matin.mobilite.map((m) => m.exercice)).toEqual(programme.mobilite.routines.A);
    expect(matin.mobilite_au_ralenti).toBe(true);
    expect(matin.neck_cars_par_sens).toBe(3);
    expect(matin.musculation).toEqual([]);
  });

  it('marche le midi ; bloc clé version récupération et routine pied', () => {
    const midi = midiDuJour(programme, {
      date: mercredi,
      type,
      cordesFaitesCetteSemaine: 1,
      enAncrage: false,
    });
    expect(midi?.proposition).toBe('marche');
    const soir = soirDuJour(programme, {
      niveau: { palier: 2 },
      type,
      lettrePied: lettreDuPied(type, 'A'),
      cycle: 1,
      piedsFaitsDansLeCycle: 1,
    });
    expect(soir.bloc_cle).toMatchObject({ version: 'recuperation', knee_raises: false });
    expect(soir.pied?.lettre).toBe('B');
  });
});

describe('scénario 12 : étirements du pied selon le cycle', () => {
  it('cycle 1 → 1 série ; cycle 2 → 1 et 2 en alternance ; cycle 3 → 2 séries', () => {
    expect(seriesEtirementsPied(programme, 1, 0)).toBe(1);
    expect([0, 1, 2, 3].map((n) => seriesEtirementsPied(programme, 2, n))).toEqual([1, 2, 1, 2]);
    expect(seriesEtirementsPied(programme, 3, 0)).toBe(2);
    expect(seriesEtirementsPied(programme, 5, 7)).toBe(2);
  });
});

describe('scénario 15 : ancrage, contenu du jour', () => {
  it('N2, matin A puis B ; N1, matin A sans étirement', () => {
    const contexte = { type: 'normal' as const, lettreDeLaVeille: null };
    const a = matinDuJour(programme, { ...contexte, niveau: { ancrage: 'N2' }, lettre: 'A' });
    expect(a.respiration_min).toBe(5);
    expect(a.etirements[0]?.exercice).toBe('couch_stretch');
    const b = matinDuJour(programme, {
      ...contexte,
      niveau: { ancrage: 'N2' },
      lettre: 'B',
      dernierEtirement: 'couch_stretch',
    });
    expect(b.mobilite.every((m) => m.a_la_cible)).toBe(true);
    expect(b.etirements[0]?.exercice).toBe('pancake');
    const n1 = matinDuJour(programme, { ...contexte, niveau: { ancrage: 'N1' }, lettre: 'A' });
    expect(n1.mobilite.map((m) => m.exercice)).toEqual(['reverse_table_top']);
    expect(n1.etirements).toEqual([]);
  });

  it('soir sans boxe : suspension 1 série, deep squat 1 × 2 min, routine pied en 1 tour', () => {
    const soir = soirDuJour(programme, {
      niveau: { ancrage: 'N1' },
      type: 'normal',
      lettrePied: 'A',
      cycle: 1,
      piedsFaitsDansLeCycle: 0,
    });
    expect(soir.bloc_cle).toMatchObject({ suspension_series: 1, deep_squat_series: 1 });
    expect(soir.pied?.series_par_exercice).toBe(1);
    expect(soir.pied?.etirements.every((e) => e.series === 1)).toBe(true);
  });

  it('soir de boxe : suspension et deep squat seulement', () => {
    const soir = soirDuJour(programme, {
      niveau: { ancrage: 'N2' },
      type: 'boxe',
      lettrePied: null,
      cycle: 1,
      piedsFaitsDansLeCycle: 0,
    });
    expect(soir.bloc_cle).toMatchObject({
      version: 'boxe',
      suspension_series: 1,
      deep_squat_series: 1,
    });
    expect(soir.pied).toBeNull();
    expect(soir.etirements_apres_boxe?.facultatif).toBe(true);
  });

  it('week-end : la base, et le « au mieux » en bonus', () => {
    const samedi = weekEndDuJour(programme, {
      niveau: { ancrage: 'N1' },
      date: SAMEDI,
      lettre: 'A',
      joursDeBoxe: [],
    });
    expect(samedi.base?.echauffement.map((m) => m.exercice)).toEqual([
      'bear_walk',
      'hip_hinge_baton',
    ]);
    expect(samedi.base?.exercices).toEqual([
      { exercice: 'kt_press', series: 3 },
      { exercice: 'swing_emom', series: 3, reps: 10 },
      { exercice: 'rings_row', series: 3 },
      { exercice: 'goblet_squat', series: 3 },
    ]);
    expect(samedi.bonus).toBe(true);
    expect(samedi.seance?.mobilite.find((m) => m.exercice === 'cossack_squat')).toEqual({
      exercice: 'cossack_squat',
      a_la_cible: true,
    });
    expect(samedi.boxe?.rounds).toEqual([1, 3, 5]);
    // Dimanche : séance B en 3 séries sans les exercices du palier 2 (Copenhagen, tuck hang L-sit).
    const dimanche = weekEndDuJour(programme, {
      niveau: { ancrage: 'N2' },
      date: DIMANCHE,
      lettre: 'B',
      joursDeBoxe: [],
    });
    expect(dimanche.seance?.musculation).toEqual([
      { exercice: 'pompes', series: 3 },
      { exercice: 'goblet_squat', series: 3 },
      { exercice: 'traction_assistee', series: 3 },
      { exercice: 'swing_emom', series: 3, reps: 10 },
    ]);
    expect(dimanche.seance?.etirements).toEqual(
      ['couch_stretch', 'pancake'].map((exercice) => ({ exercice, series: 2 })),
    );
  });

  it('midi : « bouger », un bonus', () => {
    expect(
      midiDuJour(programme, {
        date: LUNDI,
        type: 'normal',
        cordesFaitesCetteSemaine: 0,
        enAncrage: true,
      }),
    ).toEqual({ proposition: 'bouger', bonus: true });
  });
});

describe('scénario 16 : ancrage, jour tenu', () => {
  it('matin et soir faits, au moins en version minimum ; midi et « au mieux » sans effet', () => {
    expect(jourTenu({ matin: 'minimum', soir: 'minimum' })).toBe(true);
    expect(jourTenu({ matin: 'normale', soir: null })).toBe(false);
    expect(jourTenu({ matin: null, soir: 'boxe' })).toBe(false);
    expect(jourTenu({ matin: 'normale', soir: 'normal', midi: false })).toBe(true);
    expect(jourTenu({ matin: null, soir: 'normal', midi: true })).toBe(false);
    // Samedi : la base et le soir faits, sans le « au mieux ».
    expect(jourTenu({ matin: 'normale', soir: 'normal', au_mieux: false })).toBe(true);
  });

  it('versions minimum : un mouvement de mobilité le matin ; suspension et deep squat le soir', () => {
    const matin = matinDuJour(programme, {
      niveau: { ancrage: 'N2' },
      type: 'normal',
      lettre: 'A',
      lettreDeLaVeille: null,
      version: 'minimum',
    });
    expect(matin.mobilite).toEqual([{ exercice: 'bear_walk', duree_s: 30 }]);
    expect([matin.musculation, matin.etirements, matin.travail_min]).toEqual([[], [], null]);
    const soir = soirDuJour(programme, {
      niveau: { ancrage: 'N1' },
      type: 'normal',
      lettrePied: 'A',
      cycle: 1,
      piedsFaitsDansLeCycle: 0,
      version: 'minimum',
    });
    expect(soir.duree_min).toBe(4);
    expect(soir.bloc_cle).toMatchObject({ suspension_series: 1, deep_squat_series: 1 });
    expect(soir.pied).toBeNull();
  });

  it('soir du jour de récupération : suspension passive, routine pied conservée', () => {
    const soir = soirDuJour(programme, {
      niveau: { ancrage: 'N1' },
      type: 'recuperation',
      lettrePied: 'B',
      cycle: 1,
      piedsFaitsDansLeCycle: 1,
    });
    expect(soir.bloc_cle).toMatchObject({ version: 'recuperation', knee_raises: false });
    expect(soir.pied?.lettre).toBe('B');
  });
});

describe('paliers : contenus provisoires du matin', () => {
  it('palier 1, matin B : séance sans les éléments du palier 2, swing en fin de séance', () => {
    const b = matinDuJour(programme, {
      niveau: { palier: 1 },
      type: 'normal',
      lettre: 'B',
      lettreDeLaVeille: 'A',
    });
    expect(b.musculation.map((e) => e.exercice)).toEqual([
      'pompes',
      'goblet_squat',
      'traction_assistee',
      'swing_emom',
    ]);
    expect(b.etirements.map((e) => e.series)).toEqual([2, 2, 2]);
  });

  it('palier 4 : 10 min encore à définir ; version courte sans étirements ; version minimum', () => {
    const contexte = {
      niveau: { palier: 4 },
      type: 'normal' as const,
      lettre: 'A' as const,
      lettreDeLaVeille: null,
    };
    const normale = matinDuJour(programme, contexte);
    expect([normale.travail_min, normale.a_definir_min]).toEqual([50, 10]);
    const courte = matinDuJour(programme, { ...contexte, version: 'courte' });
    expect([courte.etirements, courte.travail_min]).toEqual([[], null]);
    expect(courte.musculation.every((e) => e.series === 1)).toBe(true);
    const minimum = matinDuJour(programme, { ...contexte, version: 'minimum' });
    expect(minimum.mobilite).toHaveLength(1);
    expect(minimum.musculation).toEqual([]);
  });
});
