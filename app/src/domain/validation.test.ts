import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { couchesDuMatin, elementsDesCouches } from './couches';
import {
  coucheAtteinte,
  couchePrecedente,
  couchesPresentes,
  jusqua,
  type Element,
} from './validation';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

const bloc: Element[] = [
  { cle: 'reverse_table_top', couche: 'minimum' },
  { cle: 'deep_squat', couche: 'minimum' },
  { cle: 'rings_row', couche: 'principale' },
];

describe('validation mouvement par mouvement (décision du 18/10/2026)', () => {
  it('la couche atteinte : tout le minimum, puis toute la principale', () => {
    expect(coucheAtteinte(bloc, {})).toBeNull();
    expect(coucheAtteinte(bloc, { reverse_table_top: true })).toBeNull();
    expect(coucheAtteinte(bloc, { reverse_table_top: true, deep_squat: true })).toBe('minimum');
    expect(
      coucheAtteinte(bloc, { reverse_table_top: true, deep_squat: true, rings_row: true }),
    ).toBe('principale');
    // La principale sans le minimum ne compte pas.
    expect(coucheAtteinte(bloc, { rings_row: true })).toBeNull();
  });

  it('une couche vide ne bloque rien : bonus atteint quand il n’y a pas de principale', () => {
    const boxe: Element[] = [
      { cle: 'suspension_seule', couche: 'minimum' },
      { cle: 'kiza', couche: 'bonus' },
    ];
    expect(coucheAtteinte(boxe, { suspension_seule: true, kiza: true })).toBe('bonus');
  });

  it('les boutons sont des raccourcis : tout jusqu’à une couche, retour à la précédente', () => {
    expect(jusqua(bloc, 'minimum')).toEqual({
      reverse_table_top: true,
      deep_squat: true,
      rings_row: false,
    });
    expect(jusqua(bloc, null)).toEqual({
      reverse_table_top: false,
      deep_squat: false,
      rings_row: false,
    });
    expect(couchesPresentes(bloc)).toEqual(['minimum', 'principale']);
    expect(couchePrecedente(bloc, 'principale')).toBe('minimum');
    expect(couchePrecedente(bloc, 'minimum')).toBeNull();
  });

  it('N1, matin A : reverse table top et deep squat en minimum, rings row en principale', () => {
    const couches = couchesDuMatin(programme, {
      niveau: { ancrage: 'N1' },
      type: 'normal',
      lettre: 'A',
      lettreDeLaVeille: null,
    });
    expect(elementsDesCouches(couches)).toEqual(bloc);
  });
});
