import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { ajouterJours, jourDeLaSemaine, type DateIso } from './dates';
import { ciblesDuNiveau } from './leverTot';
import { matinDuJour } from './matin';
import { critereDePassage, niveauSuivant, passageAuPlusTot, passageSansCritere } from './passage';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

/** Les 14 jours qui précèdent `jour`, tous tenus sauf ceux que `manque` désigne. */
function quinzaine(jour: DateIso, manque: (date: DateIso) => boolean): Set<DateIso> {
  const tenus = new Set<DateIso>();
  for (let i = 1; i <= 14; i++) {
    const date = ajouterJours(jour, -i);
    if (!manque(date)) tenus.add(date);
  }
  return tenus;
}

const lesMardis = (date: DateIso) => jourDeLaSemaine(date) === 'mardi';

describe('scénario 17 : passages, 12 jours tenus sur 14 dont les deux week-ends', () => {
  it('niveaux dans l’ordre : N1, N2, puis les paliers 1 à 4', () => {
    expect(niveauSuivant(programme, { ancrage: 'N1' })).toEqual({ ancrage: 'N2' });
    expect(niveauSuivant(programme, { ancrage: 'N2' })).toEqual({ palier: 1 });
    expect(niveauSuivant(programme, { palier: 3 })).toEqual({ palier: 4 });
    expect(niveauSuivant(programme, { palier: 4 })).toBeNull();
  });

  it('un niveau par cycle : N2 au plus tôt le 23/11, le palier 1 le 28/12, le palier 2 le 01/02/2027', () => {
    expect(passageAuPlusTot(programme, { ancrage: 'N1' }, '2026-10-19')).toBe('2026-11-23');
    expect(passageAuPlusTot(programme, { ancrage: 'N2' }, '2026-11-23')).toBe('2026-12-28');
    expect(passageAuPlusTot(programme, { palier: 1 }, '2026-12-28')).toBe('2027-02-01');
  });

  it('passage forcé le mercredi 04/11 : le cycle de N2 part de ce jour, palier 1 au plus tôt le 09/12', () => {
    expect(passageAuPlusTot(programme, { ancrage: 'N2' }, '2026-11-04')).toBe('2026-12-09');
  });

  it('lundi 23/11 : deux mardis manqués, les deux week-ends tenus → passage à N2 proposé', () => {
    expect(critereDePassage(programme, quinzaine('2026-11-23', lesMardis), '2026-11-23')).toEqual({
      tenus: 12,
      requis: 12,
      weekEndTenus: 4,
      weekEndRequis: 4,
      rempli: true,
    });
  });

  it('dimanche 27/12 manqué : rien le 28/12 ni le 04/01 (il reste dans la fenêtre), passage le 11/01', () => {
    const dimanche27 = (date: DateIso) => date === '2026-12-27';
    const le28 = critereDePassage(programme, quinzaine('2026-12-28', dimanche27), '2026-12-28');
    expect([le28.tenus, le28.weekEndTenus, le28.rempli]).toEqual([13, 3, false]);
    expect(
      critereDePassage(programme, quinzaine('2027-01-04', dimanche27), '2027-01-04').rempli,
    ).toBe(false);
    expect(
      critereDePassage(programme, quinzaine('2027-01-11', dimanche27), '2027-01-11').rempli,
    ).toBe(true);
  });

  it('11 jours tenus, les week-ends tenus → pas de passage', () => {
    const troisJours = (date: DateIso) => ['2026-11-10', '2026-11-11', '2026-11-12'].includes(date);
    const critere = critereDePassage(programme, quinzaine('2026-11-23', troisJours), '2026-11-23');
    expect([critere.tenus, critere.weekEndTenus, critere.rempli]).toEqual([11, 4, false]);
  });
});

describe('scénario 8 : passage au palier 2, même critère', () => {
  it('lundi 01/02/2027 : deux mardis manqués → rempli ; le dimanche 31/01 manqué → pas rempli', () => {
    expect(
      critereDePassage(programme, quinzaine('2027-02-01', lesMardis), '2027-02-01').rempli,
    ).toBe(true);
    const unDimanche = (date: DateIso) => date === '2027-01-31';
    const critere = critereDePassage(programme, quinzaine('2027-02-01', unDimanche), '2027-02-01');
    expect([critere.tenus, critere.weekEndTenus, critere.rempli]).toEqual([13, 3, false]);
  });
});

describe('cycle N0 de familiarisation (décision du 25/10/2026)', () => {
  const n0 = { ancrage: 'N0' as const };
  it('identique à N1 : mêmes heures, même matin', () => {
    expect(ciblesDuNiveau(programme, n0)).toEqual(ciblesDuNiveau(programme, { ancrage: 'N1' }));
    const contexte = { type: 'normal' as const, lettre: 'B' as const, lettreDeLaVeille: null };
    expect(matinDuJour(programme, { ...contexte, niveau: n0 })).toEqual(
      matinDuJour(programme, { ...contexte, niveau: { ancrage: 'N1' } }),
    );
  });

  it('du lundi 26/10 au dimanche 08/11 ; N1 proposé le lundi 09/11, sans critère', () => {
    expect(programme.ancrage.familiarisation.debut).toBe('2026-10-26');
    expect(niveauSuivant(programme, n0)).toEqual({ ancrage: 'N1' });
    expect(passageAuPlusTot(programme, n0, '2026-10-26')).toBe('2026-11-09');
    expect(passageSansCritere(n0)).toBe(true);
    expect(passageSansCritere({ ancrage: 'N1' })).toBe(false);
  });
});
