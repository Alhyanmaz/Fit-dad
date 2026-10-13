import { describe, expect, it } from 'vitest';
import { dateFrancaise, lireProgramme, programmeBrut, resumerProgramme } from './programme';

/** Copie modifiable du vrai programme, pour fabriquer des fichiers fautifs. */
function copie(): Record<string, any> {
  return structuredClone(programmeBrut) as Record<string, any>;
}

function erreursDe(donnees: unknown): string[] {
  const lecture = lireProgramme(donnees);
  if (lecture.ok) throw new Error('lecture réussie alors qu’un échec était attendu');
  return lecture.erreurs;
}

describe('lecture du programme', () => {
  it('valide data/programme.json : 41 exercices, version du 13/10/2026', () => {
    const lecture = lireProgramme(programmeBrut);
    if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
    expect(resumerProgramme(lecture.programme)).toEqual({
      version: '2026-10-13',
      nombreExercices: 41,
    });
  });

  it('écrit les dates à la française', () => {
    expect(dateFrancaise('2026-10-07')).toBe('07/10/2026');
  });
});

describe('le schéma refuse un programme fautif, avec un message en français', () => {
  it('fichier qui n’est pas un objet', () => {
    expect(erreursDe([]).join()).toMatch(/objet/i);
  });

  it('clé inconnue (faute de frappe)', () => {
    const p = copie();
    p.exercices.kt_press.fourchete = [6, 14];
    expect(erreursDe(p).join('\n')).toMatch(/exercices › kt_press.*fourchete/);
  });

  it('fourchette inversée', () => {
    const p = copie();
    p.exercices.pompes.fourchette = [16, 10];
    expect(erreursDe(p).join('\n')).toMatch(
      /exercices › pompes › fourchette : fourchette inversée/,
    );
  });

  it('heure de lever mal écrite', () => {
    const p = copie();
    p.lever_tot.paliers[0].lever = '7h00';
    expect(erreursDe(p).join('\n')).toMatch(
      /lever_tot › paliers › 0 › lever : heure attendue au format HH:MM/,
    );
  });

  it('tenue sans pas de progression', () => {
    const p = copie();
    delete p.exercices.horse_stance.pas_s;
    expect(erreursDe(p).join('\n')).toMatch(
      /horse_stance › pas_s : champ « pas_s » obligatoire pour une tenue/,
    );
  });

  it('séance qui cite un exercice inconnu', () => {
    const p = copie();
    p.seances.A.binomes[0][1].exercice = 'pistol_complet';
    expect(erreursDe(p).join('\n')).toMatch(
      /seances › A › binomes › 0 › 1 › exercice : exercice inconnu : « pistol_complet »/,
    );
  });

  it('exercice rangé dans le mauvais bloc', () => {
    const p = copie();
    p.mobilite.routines.B[0] = 'kt_press';
    expect(erreursDe(p).join('\n')).toMatch(
      /mobilite › routines › B › 0 : « kt_press » est du bloc « musculation »/,
    );
  });

  it('étirement de la mauvaise zone dans la routine pied', () => {
    const p = copie();
    p.etirements.routine_pied.liste[0] = 'pigeon';
    expect(erreursDe(p).join('\n')).toMatch(
      /« pigeon » est de la zone « hanches », attendu : « pied_mollet »/,
    );
  });

  it('paliers dans le désordre', () => {
    const p = copie();
    [p.lever_tot.paliers[0], p.lever_tot.paliers[1]] = [
      p.lever_tot.paliers[1],
      p.lever_tot.paliers[0],
    ];
    expect(erreursDe(p).join('\n')).toMatch(
      /lever_tot › paliers › 0 › num : paliers attendus dans l'ordre 1 à 5/,
    );
  });

  it('palier du matin qui mélange « contenu » et « exercices »', () => {
    const p = copie();
    p.matin.paliers[1].musculation.contenu = 'seance_complete';
    expect(erreursDe(p).join('\n')).toMatch(
      /matin › paliers › 1 › musculation : indiquer soit « contenu »/,
    );
  });

  it('élément « bas de jambe » sans exercice correspondant', () => {
    const p = copie();
    delete p.exercices.tibialis_posterior.bas_de_jambe;
    delete p.exercices.tibialis_raise.bas_de_jambe;
    expect(erreursDe(p).join('\n')).toMatch(/aucun exercice ne porte l'élément « tibialis »/);
  });

  it('type de valeur faux : message de zod en français', () => {
    const p = copie();
    p.exercices.kt_press.fourchette = ['six', 14];
    expect(erreursDe(p).join('\n')).toMatch(
      /exercices › kt_press › fourchette › 0 : Entrée invalide : nombre attendu/,
    );
  });
});

describe('le schéma vérifie les cycles d’ancrage', () => {
  it('mouvement de mobilité pris dans l’autre routine', () => {
    const p = copie();
    p.ancrage.matin.seances.A.mobilite[1] = 'duck_walk';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › matin › seances › A › mobilite › 1 : « duck_walk » n'est pas dans la routine de mobilité A/,
    );
  });

  it('durée minimale qui ne correspond pas aux cycles', () => {
    const p = copie();
    p.ancrage.sortie.semaines_minimum = 8;
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › sortie › semaines_minimum : 8 semaines minimum pour 2 cycles de 5 semaines \(attendu : 10\)/,
    );
  });

  it('étirement du matin hors de la zone des hanches', () => {
    const p = copie();
    p.ancrage.matin.etirement.rotation[0] = 'seiza';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › matin › etirement › rotation › 0 : « seiza » est de la zone « pied_mollet », attendu : « hanches »/,
    );
  });

  it('round de boxe inexistant', () => {
    const p = copie();
    p.ancrage.week_end.au_mieux.boxe_rounds = [1, 3, 6];
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › week_end › au_mieux › boxe_rounds › 2 : round 6 inexistant \(le bloc boxe en compte 5\)/,
    );
  });
});
