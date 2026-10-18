import { describe, expect, it } from 'vitest';
import { lireProgramme, programmeBrut } from '../data/programme';
import { ciblesDuNiveau, verdictDuMatin } from './leverTot';

const lecture = lireProgramme(programmeBrut);
if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
const programme = lecture.programme;

describe('scénario 8 : « Lever tôt », verdict du matin', () => {
  const n2 = { ancrage: 'N2' as const };
  it('cibles du niveau : N1 6h50, N2 6h40, palier 1 6h30', () => {
    expect(ciblesDuNiveau(programme, { ancrage: 'N1' })).toEqual({
      lever: '06:50',
      coucher: '22:50',
      plancherObligatoire: false,
    });
    expect(ciblesDuNiveau(programme, n2).lever).toBe('06:40');
    expect(ciblesDuNiveau(programme, { palier: 1 }).lever).toBe('06:30');
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
        { leve: '06:50', nuit: 'calme', plancherFait: false },
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
