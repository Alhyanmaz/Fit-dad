import { describe, expect, it } from 'vitest';
import { dateFrancaise, programmeBrut, resumerProgramme } from './programme';

describe('programme', () => {
  it('lit data/programme.json : 41 exercices, version du 07/10/2026', () => {
    expect(resumerProgramme(programmeBrut)).toEqual({ version: '2026-10-07', nombreExercices: 41 });
  });

  it('refuse un fichier sans version ou sans exercices', () => {
    expect(() => resumerProgramme([])).toThrow(/objet/);
    expect(() => resumerProgramme({ exercices: { a: {} } })).toThrow(/version/);
    expect(() =>
      resumerProgramme({ meta: { version: '07/10/2026' }, exercices: { a: {} } }),
    ).toThrow(/version/);
    expect(() => resumerProgramme({ meta: { version: '2026-10-07' }, exercices: {} })).toThrow(
      /exercices/,
    );
  });

  it('écrit les dates à la française', () => {
    expect(dateFrancaise('2026-10-07')).toBe('07/10/2026');
  });
});
