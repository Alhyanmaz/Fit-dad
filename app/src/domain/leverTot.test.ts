import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { ciblesDuNiveau, leverTenu, verdictDuMatin } from './leverTot';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

describe('scénario 8 : « Lever tôt », verdict du matin', () => {
  const n2 = { ancrage: 'N2' as const };
  it('cibles du niveau : N1 6h45, N2 6h40, palier 1 6h30', () => {
    expect(ciblesDuNiveau(programme, { ancrage: 'N1' })).toEqual({
      lever: '06:45',
      coucher: '22:45',
      plancherObligatoire: false,
    });
    expect(ciblesDuNiveau(programme, n2).lever).toBe('06:40');
    expect(ciblesDuNiveau(programme, { palier: 1 }).lever).toBe('06:30');
  });

  it('lever tenu, pour le jour tenu : cible + 5 → oui, cible + 6 → non, heure absente → non', () => {
    expect(leverTenu(programme, n2, '06:45')).toBe(true);
    expect(leverTenu(programme, n2, '06:46')).toBe(false);
    expect(leverTenu(programme, { ancrage: 'N1' }, '06:50')).toBe(true);
    expect(leverTenu(programme, { ancrage: 'N1' }, '06:51')).toBe(false);
    expect(leverTenu(programme, n2, null)).toBe(false);
  });

  it('tolérance de 5 min : cible + 5 → tenu, cible + 6 → manqué', () => {
    const matin = { nuit: 'calme', plancherFait: true };
    expect(verdictDuMatin(programme, n2, { ...matin, leve: '06:45' })).toBe('reussi');
    expect(verdictDuMatin(programme, n2, { ...matin, leve: '06:46' })).toBe('manque');
    expect(verdictDuMatin(programme, n2, { ...matin, leve: '06:30' })).toBe('reussi');
  });

  it('plancher : partiel sans la séance ; réussi à N1 ou après une nuit difficile', () => {
    expect(
      verdictDuMatin(programme, n2, { leve: '06:40', nuit: 'calme', plancherFait: false }),
    ).toBe('partiel');
    expect(
      verdictDuMatin(
        programme,
        { ancrage: 'N1' },
        { leve: '06:45', nuit: 'calme', plancherFait: false },
      ),
    ).toBe('reussi');
    expect(
      verdictDuMatin(
        programme,
        { palier: 3 },
        { leve: '06:10', nuit: 'hachee', plancherFait: false },
      ),
    ).toBe('reussi');
    expect(
      verdictDuMatin(programme, n2, { leve: null, nuit: null, plancherFait: true }),
    ).toBeNull();
  });
});
