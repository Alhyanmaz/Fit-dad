import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Programme } from '../data/schema';
import { lettreDuMatin, lettreDuPied } from '../domain/alternances';
import { jourTenu } from '../domain/ancrage';
import { couchesDuMatin, couchesDuWeekEnd, elementsDesCouches } from '../domain/couches';
import { estWeekEnd, joursEntre, type DateIso } from '../domain/dates';
import { typeDeJour } from '../domain/jour';
import type { JournalDuJour } from '../domain/journal';
import { ciblesDuNiveau, leverTenu } from '../domain/leverTot';
import { midiDuJour } from '../domain/midi';
import {
  estEnFamiliarisation,
  niveauDAncrage,
  type IdDAncrage,
  type Niveau,
} from '../domain/niveau';
import { elementsDuSoir, soirDuJour } from '../domain/soir';
import { coucheAtteinte, type Element } from '../domain/validation';
import { weekEndDuJour } from '../domain/weekEnd';
import { Anneau } from './Anneau';
import {
  BoutonsDeCouche,
  Carte,
  Choix,
  faitsDuBloc,
  GroupeDeLignes,
  Legende,
  ParType,
  SaisieContexte,
  type LigneDeCouche,
  type Saisie,
} from './composants';
import { dateLongue, heureCourte, heureLimite, nomExercice } from './libelles';
import { Passage } from './Passage';

const parBloc = (elements: readonly Element[], cles: readonly string[]) =>
  elements.filter((e) => cles.includes(e.cle));

/**
 * Un moment de la journée, choisi en haut de l'écran (décisions du 25/10/2026) : matin, midi et
 * soir en semaine ; routine, boxe et soir le week-end (« matin » est alors la routine).
 */
type Moment = 'matin' | 'midi' | 'boxe' | 'soir';
const BOXE = 'Boxe';

/**
 * Le moment ouvert au démarrage : le matin avant 12h, le midi jusqu'à 17h, le soir ensuite
 * [Interprétation]. Le week-end, la séance se fait dans la journée : pas de midi.
 */
function momentDeLHeure(heure: number, weekEnd: boolean): Moment {
  if (heure < 12) return 'matin';
  if (heure < 17) return weekEnd ? 'matin' : 'midi';
  return 'soir';
}

/**
 * Écran « Aujourd'hui » pendant l'ancrage (jalon J3). Chaque bloc dit d'abord ce qu'il est
 * (mobilité, musculation…), la couleur de chaque mouvement donne sa couche, et chaque mouvement se
 * coche (décisions du 18/10/2026). La couche atteinte de chaque bloc s'en déduit. Pas encore
 * d'enregistrement : les alternances partent de A.
 */
export function Aujourdhui({
  programme,
  date,
  debut,
  niveau,
  depuis,
  journal,
  setJournal,
  surPassage,
  surLeverTot,
}: {
  programme: Programme;
  date: DateIso;
  /** Début de l'ancrage. */
  debut: DateIso;
  niveau: { ancrage: IdDAncrage };
  /** Début du niveau en cours. */
  depuis: DateIso;
  journal: JournalDuJour;
  setJournal: Dispatch<SetStateAction<JournalDuJour>>;
  surPassage: (suivant: Niveau) => void;
  /** Ouvre l'onglet « Lever tôt », où se saisit le lever. */
  surLeverTot: () => void;
}) {
  const { boxe } = journal;
  const avantLeDebut = joursEntre(debut, date) < 0;
  const jour = avantLeDebut ? debut : date;
  const joursDeBoxe = boxe ? [jour] : [];
  const type = typeDeJour(jour, joursDeBoxe, niveau);
  const lettre = lettreDuMatin(jour, type, null) ?? 'A';
  const cibles = ciblesDuNiveau(programme, niveau);
  const creneau = niveauDAncrage(programme, niveau.ancrage).matin.creneau_min;
  const semaine = Math.floor(Math.max(0, joursEntre(depuis, jour)) / 7) + 1;
  const familiarisation = estEnFamiliarisation(niveau);
  const { familiarisation: n0 } = programme.ancrage;
  const semainesDuNiveau = familiarisation
    ? Math.ceil(joursEntre(n0.debut, n0.passage_le) / 7)
    : programme.ancrage.semaines_par_cycle;
  const weekEnd = estWeekEnd(jour);
  const [moment, setMoment] = useState<Moment>(() =>
    avantLeDebut ? 'matin' : momentDeLHeure(new Date().getHours(), weekEnd),
  );
  const { passages } = programme;

  // Le matin, ou la séance du week-end, en couches.
  const contenuWeekEnd = estWeekEnd(jour)
    ? weekEndDuJour(programme, { niveau, date: jour, lettre, joursDeBoxe })
    : null;
  const couchesMatin = contenuWeekEnd
    ? couchesDuWeekEnd(programme, niveau, contenuWeekEnd)
    : couchesDuMatin(programme, { niveau, type, lettre, lettreDeLaVeille: null });
  const blocMatin = contenuWeekEnd ? 'week_end' : 'matin';
  const elementsMatin = elementsDesCouches(couchesMatin);
  // Le week-end, la boxe a son onglet ; la routine garde le reste.
  const elementsRoutine = elementsMatin.filter((e) => e.cle !== 'boxe');
  const aUneBoxe = elementsMatin.length !== elementsRoutine.length;

  const contenuMidi = midiDuJour(programme, {
    date: jour,
    type,
    cordesFaitesCetteSemaine: 0,
    enAncrage: true,
  });
  const contexteSoir = {
    niveau,
    type,
    lettrePied: lettreDuPied(type, null),
    cycle: 1,
    piedsFaitsDansLeCycle: 0,
  };
  const contenuSoir = soirDuJour(programme, contexteSoir);
  const soirMinimum = soirDuJour(programme, { ...contexteSoir, version: 'minimum' });
  const elementsSoir = elementsDuSoir(contenuSoir);

  // Couches atteintes, déduites des mouvements cochés ; jour tenu avec le lever à l'heure.
  const matin = coucheAtteinte(elementsMatin, faitsDuBloc(journal.faits, blocMatin));
  const soir = coucheAtteinte(elementsSoir, faitsDuBloc(journal.faits, 'soir'));
  const leve = journal.lever.leve;
  const lever = leverTenu(programme, niveau, leve);
  const tenu = jourTenu({ lever, matin, soir });
  const limite = heureLimite(cibles.lever, programme.lever_tot.tolerance_lever_min);

  const saisie: Saisie = {
    valeur: (cle, serie, depart) => journal.repetitions[cle]?.[serie] ?? depart,
    changer: (cle, serie, valeur) =>
      setJournal((j) => {
        const valeurs = [...(j.repetitions[cle] ?? [])];
        valeurs[serie] = valeur;
        return { ...j, repetitions: { ...j.repetitions, [cle]: valeurs } };
      }),
    duree: (cle, serie, depart) => journal.durees[cle]?.[serie] ?? depart,
    changerDuree: (cle, serie, valeur) =>
      setJournal((j) => {
        const valeurs = [...(j.durees[cle] ?? [])];
        valeurs[serie] = valeur;
        return { ...j, durees: { ...j.durees, [cle]: valeurs } };
      }),
    fait: (cle) => journal.faits[cle] === true,
    // Les couches atteintes sont gardées dans le journal : « Lever tôt » lit celle du matin.
    marquer: (changements) =>
      setJournal((j) => {
        const faits = { ...j.faits, ...changements };
        return {
          ...j,
          faits,
          matin: coucheAtteinte(elementsMatin, faitsDuBloc(faits, blocMatin)),
          soir: coucheAtteinte(elementsSoir, faitsDuBloc(faits, 'soir')),
        };
      }),
  };
  const basculerBoxe = () =>
    setJournal((j) => ({
      ...j,
      boxe: !j.boxe,
      faits: Object.fromEntries(
        Object.entries(j.faits).filter(([cle]) => !cle.startsWith('soir:')),
      ),
      soir: null,
    }));

  const deepSquat = programme.exercices['deep_squat']?.duree_s ?? 120;
  const lignesBlocCle: LigneDeCouche[] = [
    {
      cle: 'suspension_seule',
      couche: 'minimum',
      nom: 'Suspension seule',
      duree: { exercice: 'suspension', prevu: soirMinimum.bloc_cle.suspension_s ?? 60 },
    },
    {
      cle: 'deep_squat',
      couche: 'minimum',
      nom: nomExercice(programme, 'deep_squat'),
      duree: { exercice: 'deep_squat', prevu: deepSquat },
    },
    ...(contenuSoir.bloc_cle.knee_raises
      ? [
          {
            cle: 'knee_raises',
            couche: 'principale' as const,
            nom: 'Knee raises',
            detail: 'pendant la suspension',
            repetitions: { exercice: 'suspension', series: contenuSoir.bloc_cle.suspension_series },
          },
        ]
      : []),
  ];
  const pied = contenuSoir.pied;
  const lignesPied: LigneDeCouche[] = (pied?.exercices ?? []).map((exercice) => ({
    cle: exercice,
    couche: 'principale',
    nom: nomExercice(programme, exercice),
    detail: pied?.series_par_exercice === 1 ? '1 série' : `${pied?.series_par_exercice} séries`,
    repetitions: { exercice, series: pied?.series_par_exercice ?? 1 },
  }));
  const tenueEtirement = programme.regles_generales.etirements.tenue_s;
  const lignesEtirements = (
    etirements: readonly { exercice: string; series: number }[],
    couche: 'principale' | 'bonus',
  ): LigneDeCouche[] =>
    etirements.map((e) => ({
      cle: e.exercice,
      couche,
      nom: nomExercice(programme, e.exercice),
      detail: `${e.series} ×`,
      duree: { exercice: e.exercice, prevu: tenueEtirement },
    }));
  const apresBoxe = contenuSoir.etirements_apres_boxe;
  const equilibre = programme.exercices['single_leg_balance']?.duree_s ?? 60;

  return (
    <SaisieContexte.Provider value={saisie}>
      <main className="ecran">
        <header className="entete">
          <h1>{dateLongue(jour)}</h1>
          <p className="discret">
            {familiarisation ? 'Familiarisation' : 'Ancrage'} · {niveau.ancrage} · semaine {semaine}{' '}
            sur {semainesDuNiveau}
          </p>
          {avantLeDebut && (
            <p className="bandeau">
              {joursEntre(date, debut) === 1
                ? `C'est demain. Ce soir, coucher à ${heureCourte(cibles.coucher)} pour te lever à ${heureCourte(cibles.lever)}.`
                : `L'ancrage commence ${dateLongue(debut).toLowerCase()}.`}
            </p>
          )}
        </header>

        <section className="carte resume" aria-label="Résumé du jour">
          <Anneau
            valeur={tenu ? 1 : 0}
            total={passages.fenetre_jours}
            libelle={`Jours tenus sur les ${passages.fenetre_jours} derniers`}
          />
          <div className="resume-texte">
            <p className="titre-carte">Jours tenus</p>
            <p className="discret">
              Objectif : {passages.jours_tenus} sur {passages.fenetre_jours}, dont les deux
              week-ends.
            </p>
            <p className="horaires">
              Lever <strong>{heureCourte(cibles.lever)}</strong>
              <br />
              Coucher <strong>{heureCourte(cibles.coucher)}</strong>
            </p>
            {leve ? (
              <p className="discret" aria-label="Lever du jour">
                {lever
                  ? `Levé à ${heureCourte(leve)} : à l'heure.`
                  : `Levé à ${heureCourte(leve)}, après ${limite} : jour non tenu.`}
              </p>
            ) : (
              <button type="button" className="lien" onClick={surLeverTot}>
                Saisir le lever
              </button>
            )}
          </div>
        </section>

        <Passage
          programme={programme}
          niveau={niveau}
          depuis={depuis}
          jour={jour}
          joursTenus={new Set(tenu ? [jour] : [])}
          surPassage={surPassage}
        />

        <Legende />

        <Choix
          libelle="Moment de la journée"
          valeur={moment}
          surChoix={(m) => m && setMoment(m)}
          options={[
            {
              valeur: 'matin',
              libelle: contenuWeekEnd ? 'Routine' : 'Matin',
              etat:
                coucheAtteinte(elementsRoutine, faitsDuBloc(journal.faits, blocMatin)) ?? 'rien',
            },
            ...(contenuWeekEnd && aUneBoxe
              ? [
                  {
                    valeur: 'boxe' as const,
                    libelle: BOXE,
                    etat: journal.faits[`${blocMatin}:boxe`]
                      ? ('bonus' as const)
                      : ('rien' as const),
                  },
                ]
              : []),
            ...(contenuMidi
              ? [
                  {
                    valeur: 'midi' as const,
                    libelle: 'Midi',
                    etat: journal.midi ? ('bonus' as const) : ('rien' as const),
                  },
                ]
              : []),
            { valeur: 'soir', libelle: 'Soir', etat: soir ?? 'rien' },
          ]}
          onglets
        />

        {moment === 'matin' && (
          <Carte
            titre={contenuWeekEnd ? 'Week-end · routine' : `Matin ${lettre}`}
            precision={
              contenuWeekEnd
                ? `≈ ${programme.ancrage.week_end.base.duree_min} min, plus le bonus`
                : `${heureCourte(cibles.lever)} · ≈ ${creneau} min`
            }
          >
            <ParType
              programme={programme}
              bloc={blocMatin}
              couches={couchesMatin}
              types={(titre) => titre !== BOXE}
            />
            <BoutonsDeCouche
              bloc={blocMatin}
              elements={elementsRoutine}
              libelle={contenuWeekEnd ? 'Routine' : 'Matin'}
            />
          </Carte>
        )}

        {moment === 'boxe' && contenuWeekEnd && (
          <Carte titre="Week-end · boxe" precision="bonus">
            <ParType
              programme={programme}
              bloc={blocMatin}
              couches={couchesMatin}
              types={(titre) => titre === BOXE}
            />
            {contenuWeekEnd.boxe?.technique_du_club_en_priorite && (
              <p className="discret">Technique du club en priorité.</p>
            )}
          </Carte>
        )}

        {moment === 'matin' && (
          <Carte titre="Chaque matin">
            <GroupeDeLignes
              programme={programme}
              bloc="equilibre"
              titre="Équilibre"
              lignes={[
                {
                  cle: 'matin',
                  couche: 'principale',
                  nom: nomExercice(programme, 'single_leg_balance'),
                  duree: { exercice: 'single_leg_balance', prevu: equilibre },
                },
              ]}
            />
            <p className="discret">Par jambe, pendant le brossage des dents.</p>
          </Carte>
        )}

        {moment === 'midi' && contenuMidi && (
          <Carte titre="Midi">
            <GroupeDeLignes
              programme={programme}
              bloc="midi"
              titre="Cardio"
              lignes={[
                {
                  cle: 'bouger',
                  couche: 'bonus',
                  nom: 'Marche ou corde',
                  detail: 'sans durée imposée',
                  sansCase: true,
                },
              ]}
            />
            <Choix
              libelle="Midi"
              valeur={journal.midi}
              surChoix={(midi) => setJournal((j) => ({ ...j, midi }))}
              options={[
                { valeur: 'corde', libelle: 'Corde', couche: 'bonus' },
                { valeur: 'marche', libelle: 'Marche', couche: 'bonus' },
              ]}
            />
          </Carte>
        )}

        {moment === 'soir' && (
          <>
            <Carte titre="Soir · bloc clé" precision={`≈ ${soirMinimum.duree_min} min`}>
              <button
                type="button"
                className="interrupteur"
                aria-pressed={boxe}
                onClick={basculerBoxe}
              >
                Boxe ce soir
              </button>
              <GroupeDeLignes
                programme={programme}
                bloc="soir"
                titre="Mobilité"
                lignes={lignesBlocCle}
              />
              {boxe && <p className="discret">Soir de boxe : le minimum.</p>}
              <BoutonsDeCouche
                bloc="soir"
                elements={parBloc(elementsSoir, ['suspension_seule', 'deep_squat', 'knee_raises'])}
                libelle="Bloc clé"
              />
            </Carte>

            {pied && (
              <Carte
                titre={`Soir · routine pied ${pied.lettre}`}
                precision={`≈ ${contenuSoir.duree_min - soirMinimum.duree_min} min`}
              >
                <p className="discret">{programme.pied.routines[pied.lettre].nom}</p>
                <GroupeDeLignes
                  programme={programme}
                  bloc="soir"
                  titre="Renforcement du pied"
                  lignes={lignesPied}
                />
                <GroupeDeLignes
                  programme={programme}
                  bloc="soir"
                  titre="Étirements du pied"
                  lignes={lignesEtirements(pied.etirements, 'principale')}
                />
                <BoutonsDeCouche
                  bloc="soir"
                  elements={parBloc(elementsSoir, [
                    ...pied.exercices,
                    ...pied.etirements.map((e) => e.exercice),
                  ])}
                  libelle="Routine pied"
                />
              </Carte>
            )}

            {apresBoxe && (
              <Carte titre="Après la boxe" precision="si possible">
                <GroupeDeLignes
                  programme={programme}
                  bloc="soir"
                  titre="Étirements du pied"
                  lignes={lignesEtirements(apresBoxe.etirements, 'bonus')}
                />
                <BoutonsDeCouche
                  bloc="soir"
                  elements={parBloc(
                    elementsSoir,
                    apresBoxe.etirements.map((e) => e.exercice),
                  )}
                  libelle="Après la boxe"
                />
              </Carte>
            )}

            <Carte titre="Chaque soir">
              <GroupeDeLignes
                programme={programme}
                bloc="equilibre"
                titre="Équilibre"
                lignes={[
                  {
                    cle: 'soir',
                    couche: 'bonus',
                    nom: nomExercice(programme, 'single_leg_balance'),
                    duree: { exercice: 'single_leg_balance', prevu: equilibre },
                  },
                ]}
              />
              <p className="discret">Par jambe, pendant le brossage des dents.</p>
            </Carte>
          </>
        )}

        <p className="discret note">
          Version d'essai : rien n'est encore enregistré. <a href="../">Ouvrir la v1</a>
        </p>
      </main>
    </SaisieContexte.Provider>
  );
}
