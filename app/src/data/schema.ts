import { z } from 'zod';
import { fr } from 'zod/locales';

/**
 * Schéma de data/programme.json (docs/SPEC.md §7.1).
 *
 * Objets stricts : une clé inconnue (faute de frappe, champ oublié lors d'une modification)
 * est une erreur. Les champs `interpretation` et `*_interpretation` sont facultatifs.
 * Les contrôles croisés (identifiants d'exercices, blocs, paliers) sont en fin de fichier.
 */

// Messages d'erreur en français ; seule cette langue est intégrée à l'appli.
z.config(fr());

// ---------- Briques ----------

const texte = z.string().min(1);
const entierPositif = z.number().int().positive();
const entierPositifOuNul = z.number().int().nonnegative();
const drapeau = z.boolean().optional();

const dateIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date attendue au format AAAA-MM-JJ');
const heure = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'heure attendue au format HH:MM (24 h)');
const idExercice = z
  .string()
  .regex(/^[a-z0-9_]+$/, 'identifiant attendu en minuscules, chiffres et _');

/** [min, max], min ≤ max. */
const fourchette = z
  .tuple([entierPositifOuNul, entierPositifOuNul])
  .refine(([min, max]) => min <= max, {
    message: 'fourchette inversée : le minimum dépasse le maximum',
  });

/** Valeur accompagnée de son drapeau d'interprétation. */
const avecInterpretation = <T extends z.ZodType>(valeur: T) =>
  z.strictObject({ valeur, interpretation: drapeau });

const echelon = z.strictObject({
  label: texte,
  charge_kg: z.number().nonnegative().optional(),
});

const BLOCS = [
  'musculation',
  'pied',
  'mobilite',
  'etirement',
  'bloc_cle',
  'equilibre',
  'cardio',
] as const;
const MESURES = ['reps', 'tenue', 'reps_tenue', 'emom', 'duree'] as const;
const ELEMENTS_BAS_DE_JAMBE = ['corde', 'mollets', 'tibialis'] as const;
const LETTRES = ['A', 'B'] as const;

// ---------- Exercices ----------

const exercice = z
  .strictObject({
    nom: texte,
    bloc: z.enum(BLOCS),
    patron: z.enum(['push', 'pull', 'squat', 'hinge']).optional(),
    cote: z.enum(['chaque bras', 'chaque jambe', 'chaque côté', 'chaque pied']).optional(),
    zone: z.enum(['hanches', 'pied_mollet']).optional(),
    mesure: z.enum(MESURES).optional(),
    fourchette: fourchette.optional(),
    fourchette_s: fourchette.optional(),
    fourchette_tenue_s: fourchette.optional(),
    pas_s: entierPositif.optional(),
    pas_s_interpretation: drapeau,
    series: entierPositif.optional(),
    series_fixes: entierPositif.optional(),
    tenue_s: entierPositif.optional(),
    duree_s: entierPositif.optional(),
    minutes: entierPositif.optional(),
    reps_par_minute: entierPositif.optional(),
    par_sens: entierPositif.optional(),
    echelons: z.array(echelon).min(1).optional(),
    variantes: z.array(texte).min(1).optional(),
    alternance: z.array(texte).min(2).optional(),
    reglage: texte.optional(),
    bas_de_jambe: z.enum(ELEMENTS_BAS_DE_JAMBE).optional(),
    knee_raises: z
      .strictObject({
        fourchette,
        puis: z.strictObject({ nom: texte, fourchette }),
        pas: entierPositif,
      })
      .optional(),
    debloque_quand: texte.optional(),
    critere: texte.optional(),
    tib_bar: z
      .strictObject({ disponible: z.boolean(), regle: texte, preuve: z.enum(['A', 'B', 'C', 'D']) })
      .optional(),
    format: texte.optional(),
    duree_min: entierPositif.optional(),
    duree_min_depart: entierPositif.optional(),
    duree_min_max: entierPositif.optional(),
    pas_min: entierPositif.optional(),
    hausse: texte.optional(),
    note: texte.optional(),
  })
  .superRefine((ex, ctx) => {
    const manque = (champ: string, raison: string) =>
      ctx.addIssue({
        code: 'custom',
        path: [champ],
        message: `champ « ${champ} » obligatoire ${raison}`,
      });
    switch (ex.mesure) {
      case 'reps':
        if (!ex.fourchette) manque('fourchette', 'pour un exercice en répétitions');
        break;
      case 'tenue':
        if (!ex.fourchette_s) manque('fourchette_s', 'pour une tenue');
        if (ex.pas_s === undefined) manque('pas_s', 'pour une tenue');
        break;
      case 'reps_tenue':
        if (!ex.fourchette) manque('fourchette', 'pour un exercice en répétitions tenues');
        if (ex.tenue_s === undefined && !ex.fourchette_tenue_s) {
          manque('tenue_s', 'ou « fourchette_tenue_s » pour un exercice en répétitions tenues');
        }
        break;
      case 'emom':
        if (ex.minutes === undefined) manque('minutes', 'pour un EMOM');
        if (ex.reps_par_minute === undefined) manque('reps_par_minute', 'pour un EMOM');
        break;
      case 'duree':
        if (ex.duree_s === undefined) manque('duree_s', 'pour un exercice en durée');
        break;
    }
    if (ex.bloc === 'etirement' && !ex.zone) manque('zone', 'pour un étirement');
    if (ex.bas_de_jambe === 'corde') {
      if (ex.duree_min_depart === undefined) manque('duree_min_depart', 'pour la corde');
      if (ex.duree_min_max === undefined) manque('duree_min_max', 'pour la corde');
      if (ex.pas_min === undefined) manque('pas_min', 'pour la corde');
      if (
        ex.duree_min_depart !== undefined &&
        ex.duree_min_max !== undefined &&
        ex.duree_min_depart > ex.duree_min_max
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['duree_min_depart'],
          message: 'durée de départ supérieure à la durée maximale',
        });
      }
    }
  });

// ---------- Lever tôt ----------

const lever_tot = z.strictObject({
  tolerance_lever_min: entierPositifOuNul,
  fenetre_jours: entierPositif,
  matins_reussis_requis: entierPositif,
  dont_matins_week_end: z.number().int().min(0).max(2),
  palier_depart: z.strictObject({ num: z.number().int().min(1).max(5), depuis: dateIso }),
  qualites_nuit: z
    .array(z.strictObject({ id: texte, label: texte, difficile: z.boolean() }))
    .min(1),
  lumiere: z.array(z.strictObject({ id: texte, label: texte })).min(1),
  paliers: z
    .array(
      z.strictObject({
        num: z.number().int().min(1).max(5),
        lever: heure,
        coucher: heure,
        plancher_obligatoire: z.boolean(),
        jours_minimum: entierPositif,
      }),
    )
    .length(5),
  verdict: z.strictObject({ manque: texte, reussi: texte, partiel: texte }),
  plancher: texte,
  regles_affichees: z.array(texte),
  changement_de_palier: texte,
  plancher_versions_acceptees: avecInterpretation(
    z.array(z.enum(['complete', 'courte', 'minimum'])).min(1),
  ),
  passage_de_palier: texte,
});

// ---------- Matin ----------

const BLOCS_DU_MATIN = ['respiration', 'cafe', 'mobilite', 'musculation', 'etirements'] as const;

const exerciceDuMatin = z.strictObject({
  exercice: idExercice,
  series: entierPositif,
  reps: entierPositif.optional(),
  note: texte.optional(),
});

const parLettre = <T extends z.ZodType>(valeur: T) => z.strictObject({ A: valeur, B: valeur });

const palierDuMatin = z.strictObject({
  palier: z.number().int().min(1).max(5),
  minutes: z.strictObject({
    respiration: entierPositifOuNul,
    cafe: entierPositifOuNul,
    mobilite: entierPositifOuNul,
    musculation: entierPositifOuNul,
    etirements: entierPositifOuNul,
  }),
  mobilite: z.strictObject({
    type: z.enum(['echauffement_general', 'routine_du_jour']),
    mouvements: z.array(idExercice).min(1).optional(),
    duree_mouvement_s: entierPositif,
    serie_courte: z.array(idExercice).min(1).optional(),
    interpretation: drapeau,
  }),
  musculation: z
    .strictObject({
      contenu: z.enum(['seance_sans_ajouts', 'seance_complete']).optional(),
      series: entierPositif.optional(),
      exercices: parLettre(z.array(exerciceDuMatin).min(1)).optional(),
      duree_min: parLettre(entierPositif).optional(),
      duree_interpretation: drapeau,
      note: texte.optional(),
    })
    .refine((m) => (m.contenu === undefined) !== (m.exercices === undefined), {
      message:
        'indiquer soit « contenu » (séance du jour), soit « exercices » (liste du matin), pas les deux',
    }),
  etirements: z
    .strictObject({ hanches: entierPositif, pied_mollet: entierPositif.optional() })
    .optional(),
});

const matin = z.strictObject({
  ordre: z.array(z.enum(BLOCS_DU_MATIN)).length(BLOCS_DU_MATIN.length),
  fin: texte,
  paliers: z.array(palierDuMatin).length(5),
  cafe_marge: texte,
  version_courte: z.strictObject({
    declencheur: texte,
    musculation_series: entierPositif,
    etirements: z.boolean(),
  }),
  version_minimum: z.strictObject({ declencheur: texte, contenu: texte }),
  jour_recuperation: z.strictObject({
    regle: texte,
    paliers_1_2: z.strictObject({ palier_1: texte, palier_2: texte, interpretation: drapeau }),
  }),
});

// ---------- Cycles d'ancrage (décision du 13/10/2026) ----------

const seanceAncrage = z.strictObject({
  mobilite: z.array(idExercice).min(1),
  musculation: z.array(exerciceDuMatin).min(1),
});

const ancrage = z.strictObject({
  decision: dateIso,
  objet: texte,
  cycles_minimum: entierPositif,
  semaines_par_cycle: entierPositif,
  decharge: z.boolean(),
  decharge_interpretation: drapeau,
  compte_dans_les_cycles: z.boolean(),
  compte_dans_les_cycles_interpretation: drapeau,
  jour_tenu: z.strictObject({
    regle: texte,
    moments: z.array(z.enum(['matin', 'soir'])).min(1),
    bonus: z.array(z.enum(['midi', 'week_end_au_mieux'])),
  }),
  sortie: z.strictObject({
    semaines_minimum: entierPositif,
    jours_tenus: entierPositif,
    fenetre_jours: entierPositif,
    samedi_et_dimanche: z.boolean(),
    validation: texte,
    sinon: texte,
  }),
  lever_tot: z.strictObject({ regle: texte, plancher: texte, palier_1: texte }),
  progression: texte,
  matin: z.strictObject({
    ordre: z.array(z.enum(BLOCS_DU_MATIN)).length(BLOCS_DU_MATIN.length),
    respiration_min: entierPositif,
    duree_min: entierPositif,
    duree_interpretation: drapeau,
    cafe: texte,
    mobilite_duree_mouvement_s: entierPositif,
    mobilite_interpretation: drapeau,
    seances: parLettre(seanceAncrage),
    etirement: z.strictObject({
      rotation: z.array(idExercice).min(1),
      series: entierPositif,
      regle: texte,
    }),
    version_minimum: z.strictObject({ declencheur: texte, contenu: texte }),
    jour_recuperation: texte,
    note: texte.optional(),
  }),
  midi: z.strictObject({ contenu: texte, bonus: z.boolean() }),
  soir: z.strictObject({
    suspension_series: entierPositif,
    deep_squat_series: entierPositif,
    pied: z.strictObject({
      tours: entierPositif,
      series_exercices: entierPositif,
      series_etirements: entierPositif,
      alternance: texte,
    }),
    duree_min: entierPositif,
    duree_interpretation: drapeau,
    version_minimum: z.strictObject({
      exercices: z.array(idExercice).min(1),
      duree_min: entierPositif,
    }),
    boxe: texte,
    jour_recuperation: texte,
  }),
  chaque_jour: z.strictObject({ exercice: idExercice, moment: texte }),
  week_end: z.strictObject({
    minimum: z.strictObject({ contenu: texte, duree_min: entierPositif }),
    au_mieux: z.strictObject({
      mobilite: texte,
      musculation: z.strictObject({
        series: entierPositif,
        sans_palier_4: z.boolean(),
        swing: z.strictObject({ series: entierPositif, reps: entierPositif }),
        regle: texte,
      }),
      etirements_hanches_series: entierPositif,
      boxe_rounds: z.array(entierPositif).min(1),
      boxe_interpretation: drapeau,
      duree_min: entierPositif,
      note: texte.optional(),
    }),
  }),
});

// ---------- Séances de musculation ----------

const elementDeSeance = z.strictObject({
  exercice: idExercice,
  des_palier: z.number().int().min(1).max(5).optional(),
});

const seance = z.strictObject({
  binomes: z.array(z.array(elementDeSeance).length(2)).min(1),
  ajouts: z.array(elementDeSeance),
  fin: elementDeSeance.nullable(),
});

const seances = z.strictObject({
  A: seance,
  B: seance,
  format: z.strictObject({
    repos_entre_tours_s: entierPositif,
    arret_avant_echec: texte,
    seance_sans_ajouts: texte,
    seance_complete: texte,
    week_end_paliers_1_3: z.strictObject({
      series: entierPositif,
      avec_ajouts: z.boolean(),
      duree_min: entierPositif,
    }),
    contenus: z.record(z.string(), texte),
  }),
  pousser_plus_loin: z.strictObject({
    quand: texte,
    facultatif: z.boolean(),
    regle: texte,
    exercices: z.array(idExercice).min(1),
    jamais: z.array(idExercice),
  }),
  swing_un_bras: z.strictObject({
    active_par: texte,
    emom: z.array(z.enum(['deux_mains', 'bras_droit', 'bras_gauche'])).min(1),
    charges: z.strictObject({ deux_mains: texte, un_bras_depart_kg: z.number().positive() }),
  }),
  charges_de_depart: texte,
});

// ---------- Mobilité, étirements, soir ----------

const mobilite = z.strictObject({
  routines: parLettre(z.array(idExercice).min(1)),
  routine_du_jour: texte,
  jour_recuperation: z.strictObject({
    routine: texte,
    rythme: texte,
    puis: idExercice,
    interpretation: drapeau,
  }),
});

const seriesParCycle = z
  .strictObject({
    cycle: entierPositif.optional(),
    cycle_minimum: entierPositif.optional(),
    series: z.array(entierPositif).min(1),
    alternance: drapeau,
  })
  .refine((s) => (s.cycle === undefined) !== (s.cycle_minimum === undefined), {
    message: 'indiquer soit « cycle », soit « cycle_minimum »',
  });

const etirements = z.strictObject({
  matin: texte,
  zones: z.strictObject({
    hanches: z.array(idExercice).min(1),
    pied_mollet: z.array(idExercice).min(1),
  }),
  week_end_paliers_1_2: z.strictObject({
    zone: z.enum(['hanches', 'pied_mollet']),
    series: entierPositif,
    moment: texte,
    note: texte,
  }),
  routine_pied: z.strictObject({
    liste: z.array(idExercice).min(1),
    quand: texte,
    series_par_cycle: z.array(seriesParCycle).min(1),
  }),
  soir_boxe: z.strictObject({
    liste: z.array(idExercice).min(1),
    series: entierPositif,
    facultatif: z.boolean(),
    moment: texte,
  }),
});

const bloc_cle = z.strictObject({
  ordre: z.array(idExercice).min(1),
  versions: z.strictObject({
    standard: z.strictObject({ quand: texte, duree_min: entierPositif }),
    recuperation: z.strictObject({
      quand: texte,
      suspension: texte,
      deep_squat: texte,
      duree_min: entierPositif,
    }),
    boxe: z.strictObject({
      quand: texte,
      suspension_series: entierPositif,
      deep_squat_series: entierPositif,
      duree_min: entierPositif,
      etirements_pied_facultatifs: z.boolean(),
      duree_min_avec_etirements: entierPositif,
    }),
  }),
  levier_si_le_soir_deborde: texte,
  interpretation_levier: drapeau,
});

const pied = z.strictObject({
  routines: parLettre(z.strictObject({ nom: texte, exercices: z.array(idExercice).min(1) })),
  series_exercices: entierPositif,
  etirements: texte,
  alternance: texte,
  duree_min: fourchette,
});

const equilibre = z.strictObject({ exercice: idExercice, moment: texte });

// ---------- Midi, boxe, semaine ----------

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
const regle = z.strictObject({ regle: texte });

const midi = z.strictObject({
  jours: z.array(z.enum(JOURS)).min(1),
  corde_flow: z.strictObject({
    objectif_par_semaine: entierPositif,
    regle: texte,
    jamais: z.array(z.enum(['jour_boxe', 'jour_recuperation'])),
  }),
  marche_active: z.strictObject({ quand: texte }),
  boxe_le_vendredi: regle,
  semaine_sans_boxe: regle,
  echange: texte,
});

const boxe = z.strictObject({
  club: z.strictObject({ seances_par_semaine: entierPositif, jour: texte, sparring: z.boolean() }),
  maison: z.strictObject({
    jours: z.array(z.enum(JOURS)).min(1),
    rounds: entierPositif,
    round_s: entierPositif,
    repos_s: entierPositif,
    duree_min: entierPositif,
    contenu_rounds: z.array(z.strictObject({ round: entierPositif, contenu: texte })).min(1),
    choix_du_theme: z.strictObject({ samedi: texte, dimanche: texte, boxe_le_vendredi: texte }),
    rotation: z
      .array(z.strictObject({ ordre: entierPositif, theme: texte, attaque: texte, defense: texte }))
      .min(1),
    coups_de_pied: texte,
    video: texte,
    sac: z.strictObject({ installe: z.boolean(), introduction: texte }),
    round_corde_fixe: texte,
  }),
});

const semaine = z.strictObject({
  boxe_club: texte,
  alternance_musculation: texte,
  alternance_pied: texte,
  week_end: z
    .array(
      z.strictObject({
        paliers: z.array(z.number().int().min(1).max(5)).min(1),
        contenu: texte,
        duree_min: entierPositif,
      }),
    )
    .min(1),
  bloc_boxe_placement: texte,
  boxe_le_vendredi: texte,
});

const jour_recuperation = z.strictObject({
  declencheur: texte,
  matin: texte,
  midi: texte,
  soir: texte,
  bloc_boxe: texte,
});

// ---------- Cycle, tests, progression ----------

const cycle = z.strictObject({
  semaines_travail: entierPositif,
  decharge: z.strictObject({
    frequence: texte,
    musculation_series: entierPositif,
    pied_series: entierPositif,
    memes_charges: z.boolean(),
    corde: texte,
    sac: texte,
    inchanges: z.array(texte),
    tests: z.boolean(),
  }),
  ajustement_apres_tests: texte,
  tests_semaine_1: z.boolean(),
});

const test = z.strictObject({
  id: idExercice,
  nom: texte,
  mesure: texte,
  unite: z.enum(['reps', 'cm', 's', 'bpm']),
  champ_libre: texte.optional(),
  cotes: drapeau,
});

const decision = z.strictObject({
  id: z.enum(['monter', 'maintenir', 'redescendre', 'alleger']),
  critere: texte,
  proposition: z.union([texte, avecInterpretation(texte)]).optional(),
  application: avecInterpretation(texte).optional(),
});

const progression = z.strictObject({
  decisions: z.array(decision).min(1),
  par_mesure: z.record(z.string(), texte),
  pas_de_repetitions: z.strictObject({
    valeur: entierPositif,
    plafonne_au_haut_de_la_fourchette: z.boolean(),
  }),
  validation: texte,
  seances_courtes: avecInterpretation(texte),
  absence: texte,
  ajuster: texte,
});

// ---------- Racine ----------

const programmeBrutSchema = z.strictObject({
  version_schema: z.literal(1),
  meta: z.strictObject({
    titre: texte,
    version: dateIso,
    source: texte,
    statut: texte,
    conventions: z.record(z.string(), texte),
  }),
  regles_generales: z.strictObject({
    progression: texte,
    douleur_et_arret: texte,
    etirements: z.strictObject({
      tenue_s: entierPositif,
      tenue_max_s: entierPositif,
      progression: texte,
    }),
    bas_de_jambe: z.strictObject({
      hausses_max_par_semaine: entierPositif,
      rotation: z.array(z.enum(ELEMENTS_BAS_DE_JAMBE)).min(1),
      note: texte,
      definition_hausse: avecInterpretation(texte),
      attribution: avecInterpretation(texte),
    }),
  }),
  ancrage,
  lever_tot,
  matin,
  seances,
  exercices: z.record(idExercice, exercice),
  mobilite,
  etirements,
  bloc_cle,
  pied,
  equilibre,
  midi,
  boxe,
  semaine,
  jour_recuperation,
  cycle,
  tests: z.array(test).min(1),
  mesure_hebdo: z.strictObject({ quoi: texte, regle: texte }),
  progression,
  intentions_si_alors: z.array(texte),
  materiel: z.strictObject({ disponible: z.array(texte).min(1), prevu: z.array(texte) }),
});

type ProgrammeBrut = z.infer<typeof programmeBrutSchema>;

// ---------- Contrôles croisés ----------

function controlesCroises(p: ProgrammeBrut, ctx: z.RefinementCtx): void {
  const signaler = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: 'custom', path, message });

  /** L'exercice existe-t-il, et appartient-il au bon bloc (et à la bonne zone, pour un étirement) ? */
  const verifier = (
    path: (string | number)[],
    id: string,
    bloc?: (typeof BLOCS)[number],
    zone?: string,
  ) => {
    const ex = p.exercices[id];
    if (!ex) {
      signaler(path, `exercice inconnu : « ${id} » (absent de « exercices »)`);
      return;
    }
    if (bloc && ex.bloc !== bloc)
      signaler(path, `« ${id} » est du bloc « ${ex.bloc} », attendu : « ${bloc} »`);
    if (zone && ex.zone !== zone)
      signaler(path, `« ${id} » est de la zone « ${ex.zone ?? 'aucune'} », attendu : « ${zone} »`);
  };

  // Lever tôt
  p.lever_tot.paliers.forEach((pal, i) => {
    if (pal.num !== i + 1)
      signaler(
        ['lever_tot', 'paliers', i, 'num'],
        `paliers attendus dans l'ordre 1 à 5 (trouvé ${pal.num} en position ${i + 1})`,
      );
  });
  if (p.lever_tot.dont_matins_week_end > p.lever_tot.matins_reussis_requis) {
    signaler(
      ['lever_tot', 'dont_matins_week_end'],
      'plus de matins de week-end exigés que de matins réussis',
    );
  }
  if (p.lever_tot.matins_reussis_requis > p.lever_tot.fenetre_jours) {
    signaler(
      ['lever_tot', 'matins_reussis_requis'],
      'plus de matins réussis exigés que de jours dans la fenêtre',
    );
  }

  // Matin
  p.matin.paliers.forEach((pal, i) => {
    const ici = ['matin', 'paliers', i];
    if (pal.palier !== i + 1)
      signaler(
        [...ici, 'palier'],
        `paliers attendus dans l'ordre 1 à 5 (trouvé ${pal.palier} en position ${i + 1})`,
      );
    pal.mobilite.mouvements?.forEach((id, j) =>
      verifier([...ici, 'mobilite', 'mouvements', j], id, 'mobilite'),
    );
    pal.mobilite.serie_courte?.forEach((id, j) =>
      verifier([...ici, 'mobilite', 'serie_courte', j], id, 'mobilite'),
    );
    for (const lettre of LETTRES) {
      pal.musculation.exercices?.[lettre].forEach((e, j) =>
        verifier(
          [...ici, 'musculation', 'exercices', lettre, j, 'exercice'],
          e.exercice,
          'musculation',
        ),
      );
    }
  });

  // Séances
  for (const lettre of LETTRES) {
    const s = p.seances[lettre];
    s.binomes.forEach((binome, b) =>
      binome.forEach((e, j) =>
        verifier(['seances', lettre, 'binomes', b, j, 'exercice'], e.exercice, 'musculation'),
      ),
    );
    s.ajouts.forEach((e, j) =>
      verifier(['seances', lettre, 'ajouts', j, 'exercice'], e.exercice, 'musculation'),
    );
    if (s.fin) verifier(['seances', lettre, 'fin', 'exercice'], s.fin.exercice, 'musculation');
  }
  const { exercices: pousser, jamais } = p.seances.pousser_plus_loin;
  pousser.forEach((id, j) =>
    verifier(['seances', 'pousser_plus_loin', 'exercices', j], id, 'musculation'),
  );
  jamais.forEach((id, j) => {
    verifier(['seances', 'pousser_plus_loin', 'jamais', j], id, 'musculation');
    if (pousser.includes(id))
      signaler(
        ['seances', 'pousser_plus_loin', 'jamais', j],
        `« ${id} » est à la fois permis et interdit`,
      );
  });

  // Mobilité
  for (const lettre of LETTRES) {
    p.mobilite.routines[lettre].forEach((id, j) =>
      verifier(['mobilite', 'routines', lettre, j], id, 'mobilite'),
    );
  }
  verifier(
    ['mobilite', 'jour_recuperation', 'puis'],
    p.mobilite.jour_recuperation.puis,
    'mobilite',
  );

  // Étirements
  p.etirements.zones.hanches.forEach((id, j) =>
    verifier(['etirements', 'zones', 'hanches', j], id, 'etirement', 'hanches'),
  );
  p.etirements.zones.pied_mollet.forEach((id, j) =>
    verifier(['etirements', 'zones', 'pied_mollet', j], id, 'etirement', 'pied_mollet'),
  );
  p.etirements.routine_pied.liste.forEach((id, j) =>
    verifier(['etirements', 'routine_pied', 'liste', j], id, 'etirement', 'pied_mollet'),
  );
  p.etirements.soir_boxe.liste.forEach((id, j) =>
    verifier(['etirements', 'soir_boxe', 'liste', j], id, 'etirement', 'pied_mollet'),
  );

  // Soir
  p.bloc_cle.ordre.forEach((id, j) => verifier(['bloc_cle', 'ordre', j], id, 'bloc_cle'));
  for (const lettre of LETTRES) {
    p.pied.routines[lettre].exercices.forEach((id, j) =>
      verifier(['pied', 'routines', lettre, 'exercices', j], id, 'pied'),
    );
  }
  verifier(['equilibre', 'exercice'], p.equilibre.exercice, 'equilibre');

  // Bas de jambe : chaque élément de la rotation correspond à au moins un exercice
  for (const element of p.regles_generales.bas_de_jambe.rotation) {
    if (!Object.values(p.exercices).some((ex) => ex.bas_de_jambe === element)) {
      signaler(
        ['regles_generales', 'bas_de_jambe', 'rotation'],
        `aucun exercice ne porte l'élément « ${element} »`,
      );
    }
  }

  // Semaine : chaque palier a exactement un contenu de week-end
  for (let palier = 1; palier <= 5; palier++) {
    const n = p.semaine.week_end.filter((w) => w.paliers.includes(palier)).length;
    if (n !== 1)
      signaler(
        ['semaine', 'week_end'],
        `le palier ${palier} apparaît ${n} fois dans les contenus du week-end (attendu : 1)`,
      );
  }

  // Tests : identifiants uniques
  const ids = p.tests.map((t) => t.id);
  ids.forEach((id, i) => {
    if (ids.indexOf(id) !== i)
      signaler(['tests', i, 'id'], `identifiant de test en double : « ${id} »`);
  });

  // Boxe : rotation numérotée de 1 à n, rounds numérotés de 1 à n
  p.boxe.maison.rotation.forEach((t, i) => {
    if (t.ordre !== i + 1)
      signaler(
        ['boxe', 'maison', 'rotation', i, 'ordre'],
        `rotation attendue dans l'ordre 1 à ${p.boxe.maison.rotation.length}`,
      );
  });
  if (p.boxe.maison.contenu_rounds.length !== p.boxe.maison.rounds) {
    signaler(
      ['boxe', 'maison', 'contenu_rounds'],
      `${p.boxe.maison.contenu_rounds.length} contenus pour ${p.boxe.maison.rounds} rounds`,
    );
  }

  // Ancrage : durée cohérente avec les cycles, exercices existants et à leur place
  const an = p.ancrage;
  const semainesAttendues = an.cycles_minimum * an.semaines_par_cycle;
  if (an.sortie.semaines_minimum !== semainesAttendues) {
    signaler(
      ['ancrage', 'sortie', 'semaines_minimum'],
      `${an.sortie.semaines_minimum} semaines minimum pour ${an.cycles_minimum} cycles de ${an.semaines_par_cycle} semaines (attendu : ${semainesAttendues})`,
    );
  }
  if (an.sortie.jours_tenus > an.sortie.fenetre_jours) {
    signaler(
      ['ancrage', 'sortie', 'jours_tenus'],
      'plus de jours tenus exigés que de jours dans la fenêtre',
    );
  }
  for (const lettre of LETTRES) {
    const s = an.matin.seances[lettre];
    s.mobilite.forEach((id, j) => {
      const ici = ['ancrage', 'matin', 'seances', lettre, 'mobilite', j];
      verifier(ici, id, 'mobilite');
      if (p.exercices[id] && !p.mobilite.routines[lettre].includes(id))
        signaler(ici, `« ${id} » n'est pas dans la routine de mobilité ${lettre}`);
    });
    s.musculation.forEach((e, j) =>
      verifier(
        ['ancrage', 'matin', 'seances', lettre, 'musculation', j, 'exercice'],
        e.exercice,
        'musculation',
      ),
    );
  }
  an.matin.etirement.rotation.forEach((id, j) =>
    verifier(['ancrage', 'matin', 'etirement', 'rotation', j], id, 'etirement', 'hanches'),
  );
  an.soir.version_minimum.exercices.forEach((id, j) =>
    verifier(['ancrage', 'soir', 'version_minimum', 'exercices', j], id, 'bloc_cle'),
  );
  verifier(['ancrage', 'chaque_jour', 'exercice'], an.chaque_jour.exercice, 'equilibre');
  const rounds = an.week_end.au_mieux.boxe_rounds;
  rounds.forEach((r, j) => {
    const ici = ['ancrage', 'week_end', 'au_mieux', 'boxe_rounds', j];
    if (r > p.boxe.maison.rounds)
      signaler(ici, `round ${r} inexistant (le bloc boxe en compte ${p.boxe.maison.rounds})`);
    if (j > 0 && r <= (rounds[j - 1] ?? 0))
      signaler(ici, "rounds attendus dans l'ordre, sans doublon");
  });
}

export const programmeSchema = programmeBrutSchema.superRefine(controlesCroises);

export type Programme = z.infer<typeof programmeSchema>;
export type Exercice = Programme['exercices'][string];
