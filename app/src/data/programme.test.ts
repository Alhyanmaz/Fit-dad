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
  it('valide data/programme.json : 44 exercices, version du 25/10/2026', () => {
    const lecture = lireProgramme(programmeBrut);
    if (!lecture.ok) throw new Error(lecture.erreurs.join('\n'));
    expect(resumerProgramme(lecture.programme)).toEqual({
      version: '2026-10-25',
      nombreExercices: 44,
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
      /lever_tot › paliers › 0 › num : paliers attendus dans l'ordre 1 à 4/,
    );
  });

  it('palier du matin qui mélange « contenu » et « exercices »', () => {
    const p = copie();
    p.matin.paliers[0].musculation.exercices = {
      A: [{ exercice: 'kt_press', series: 1 }],
      B: [{ exercice: 'rings_row', series: 1 }],
    };
    expect(erreursDe(p).join('\n')).toMatch(
      /matin › paliers › 0 › musculation : indiquer soit « contenu »/,
    );
  });

  it('minutes de travail qui ne tombent pas juste', () => {
    const p = copie();
    p.matin.paliers[0].travail_min = 25;
    expect(erreursDe(p).join('\n')).toMatch(
      /matin › paliers › 0 › travail_min : 20 min de blocs pour 25 min de travail/,
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
  it('niveau qui commence à la mauvaise semaine', () => {
    const p = copie();
    p.ancrage.niveaux[1].des_semaine = 5;
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › niveaux › 1 › des_semaine : N2 attendu à partir de la semaine 6 \(cycles de 5 semaines\)/,
    );
  });

  it('passage au palier 1 à la mauvaise semaine', () => {
    const p = copie();
    p.ancrage.passage.vers_palier_1_des_semaine = 10;
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › passage › vers_palier_1_des_semaine : passage au palier 1 attendu à partir de la semaine 11/,
    );
  });

  it('exercice de l’ancrage rangé dans le mauvais bloc', () => {
    const p = copie();
    p.ancrage.niveaux[0].matin.seances.A.mobilite[0] = 'kt_press';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › niveaux › 0 › matin › seances › A › mobilite › 0 : « kt_press » est du bloc « musculation »/,
    );
  });

  it('lever qui ne recule pas d’un niveau à l’autre', () => {
    const p = copie();
    p.ancrage.niveaux[1].lever = '06:55';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › niveaux › 1 › lever : lever de N2 \(06:55\) pas plus tôt que celui de N1 \(06:45\)/,
    );
  });

  it('étirement du matin qui n’est pas un étirement', () => {
    const p = copie();
    p.ancrage.niveaux[1].matin.etirements.rotation[0][1] = 'rings_row';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › niveaux › 1 › matin › etirements › rotation › 0 › 1 : « rings_row » est du bloc « musculation », attendu : « etirement »/,
    );
  });

  it('week-end : minimum hors des paires du jour, étirement du minimum hors de ceux du jour', () => {
    const p = copie();
    p.ancrage.week_end.base.seances.A.minimum[0] = 'pompes';
    p.ancrage.week_end.base.seances.B.etirements_minimum[0] = 'seiza';
    const erreurs = erreursDe(p).join('\n');
    expect(erreurs).toMatch(
      /ancrage › week_end › base › seances › A › minimum › 0 : « pompes » n'est pas un exercice des paires du jour/,
    );
    expect(erreurs).toMatch(
      /ancrage › week_end › base › seances › B › etirements_minimum › 0 : « seiza » n'est pas un des étirements du jour/,
    );
  });

  it('round de boxe inexistant', () => {
    const p = copie();
    p.ancrage.week_end.au_mieux.boxe_rounds = [1, 3, 6];
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › week_end › au_mieux › boxe_rounds › 2 : round 6 inexistant \(le bloc boxe en compte 5\)/,
    );
  });

  it('passages : plus de jours de week-end exigés que la fenêtre n’en compte', () => {
    const p = copie();
    p.passages.dont_jours_de_week_end = 5;
    expect(erreursDe(p).join('\n')).toMatch(
      /passages › dont_jours_de_week_end : plus de jours de week-end exigés que la fenêtre n'en compte \(4\)/,
    );
  });

  it('passages : plus de jours tenus exigés que de jours dans la fenêtre', () => {
    const p = copie();
    p.passages.jours_tenus = 15;
    expect(erreursDe(p).join('\n')).toMatch(
      /passages › jours_tenus : plus de jours tenus exigés que de jours dans la fenêtre/,
    );
  });

  it('tenue du minimum du matin : un exercice du bloc clé', () => {
    const p = copie();
    p.ancrage.matin.version_minimum.tenue.exercice = 'bear_walk';
    expect(erreursDe(p).join('\n')).toMatch(
      /ancrage › matin › version_minimum › tenue › exercice : « bear_walk » est du bloc « mobilite », attendu : « bloc_cle »/,
    );
  });

  it('mouvement « à la cible » absent des routines Mob. matin', () => {
    const p = copie();
    p.mobilite.a_la_cible.push('neck_cars');
    expect(erreursDe(p).join('\n')).toMatch(
      /mobilite › a_la_cible › 2 : « neck_cars » n'est dans aucune routine Mob\. matin/,
    );
  });

  it('swing de la version courte plus long que l’EMOM', () => {
    const p = copie();
    p.matin.version_courte.swing_minutes = 8;
    expect(erreursDe(p).join('\n')).toMatch(
      /matin › version_courte › swing_minutes : plus long que l'EMOM de « swing_emom » \(6 min\)/,
    );
  });

  it('rounds du week-end d’un palier dans le désordre', () => {
    const p = copie();
    p.semaine.week_end[1].structure.boxe_rounds = [1, 5, 3];
    expect(erreursDe(p).join('\n')).toMatch(
      /semaine › week_end › 1 › structure › boxe_rounds › 2 : rounds attendus dans l'ordre, sans doublon/,
    );
  });
});
