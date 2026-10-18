import type { Dispatch, SetStateAction } from 'react';
import type { Programme } from '../data/schema';
import { lettreDuMatin, lettreDuPied } from '../domain/alternances';
import { jourTenu, soirFait } from '../domain/ancrage';
import {
  COUCHES,
  couchesDuMatin,
  couchesDuWeekEnd,
  estVide,
  type Couche,
  type Couches,
} from '../domain/couches';
import { estWeekEnd, joursEntre, type DateIso } from '../domain/dates';
import { typeDeJour } from '../domain/jour';
import type { JournalDuJour } from '../domain/journal';
import { ciblesDuNiveau, leverTenu } from '../domain/leverTot';
import { midiDuJour } from '../domain/midi';
import { niveauDAncrage, type Niveau } from '../domain/niveau';
import { soirDuJour } from '../domain/soir';
import { weekEndDuJour } from '../domain/weekEnd';
import { Anneau } from './Anneau';
import {
  Carte,
  Choix,
  ChoixDeCouche,
  Compteurs,
  GroupeDeLignes,
  Legende,
  ParType,
  type LigneDeCouche,
} from './composants';
import {
  dateLongue,
  detailEtirement,
  dureeTexte,
  heureCourte,
  heureLimite,
  nomExercice,
} from './libelles';
import { Passage } from './Passage';

/** Couches qui ont un contenu : ce sont elles qui se valident. */
const presentes = (couches: Couches): Couche[] => COUCHES.filter((c) => !estVide(couches[c]));

/**
 * Écran « Aujourd'hui » pendant l'ancrage (jalon J3). Chaque bloc dit d'abord ce qu'il est
 * (mobilité, musculation…) ; la couche de chaque exercice se lit à sa couleur (décisions du
 * 18/10/2026). Les validations vont dans le journal du jour. Pas encore d'enregistrement : les
 * alternances partent de A.
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
  niveau: { ancrage: 'N1' | 'N2' };
  /** Début du niveau en cours. */
  depuis: DateIso;
  journal: JournalDuJour;
  setJournal: Dispatch<SetStateAction<JournalDuJour>>;
  surPassage: (suivant: Niveau) => void;
  /** Ouvre l'onglet « Lever tôt », où se saisit le lever. */
  surLeverTot: () => void;
}) {
  const changer = (modif: Partial<JournalDuJour>) => setJournal((j) => ({ ...j, ...modif }));
  const { boxe } = journal;

  const avantLeDebut = joursEntre(debut, date) < 0;
  const jour = avantLeDebut ? debut : date;
  const joursDeBoxe = boxe ? [jour] : [];
  const type = typeDeJour(jour, joursDeBoxe, niveau);
  const lettre = lettreDuMatin(jour, type, null) ?? 'A';
  const cibles = ciblesDuNiveau(programme, niveau);
  const creneau = niveauDAncrage(programme, niveau.ancrage).matin.creneau_min;
  const semaine = Math.floor(Math.max(0, joursEntre(depuis, jour)) / 7) + 1;
  const { passages } = programme;

  const couchesMatin = couchesDuMatin(programme, { niveau, type, lettre, lettreDeLaVeille: null });
  const contenuWeekEnd = estWeekEnd(jour)
    ? weekEndDuJour(programme, { niveau, date: jour, lettre, joursDeBoxe })
    : null;
  const couchesWeekEnd = contenuWeekEnd
    ? couchesDuWeekEnd(programme, niveau, contenuWeekEnd)
    : null;
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

  // Jour tenu : lever à l'heure, puis matin et soir faits (décisions du 18/10/2026).
  const leve = journal.lever.leve;
  const lever = leverTenu(programme, niveau, leve);
  const tenu = jourTenu({
    lever,
    matin: journal.matin,
    soir: soirFait(journal.blocCle, journal.pied),
  });
  const limite = heureLimite(cibles.lever, programme.lever_tot.tolerance_lever_min);

  const blocCle: LigneDeCouche[] = [
    {
      cle: 'suspension_seule',
      couche: 'minimum',
      nom: 'Suspension seule',
      detail: dureeTexte(soirMinimum.bloc_cle.suspension_s ?? 60),
    },
    {
      cle: 'deep_squat',
      couche: 'minimum',
      nom: nomExercice(programme, 'deep_squat'),
      detail: dureeTexte(programme.exercices['deep_squat']?.duree_s ?? 120),
    },
    ...(!boxe && contenuSoir.bloc_cle.knee_raises
      ? [
          {
            cle: 'knee_raises',
            couche: 'principale' as const,
            nom: 'Knee raises',
            detail: 'pendant la suspension, à ta cible',
            enfant: (
              <Compteurs
                programme={programme}
                bloc="bloc_cle"
                exercice="suspension"
                series={contenuSoir.bloc_cle.suspension_series}
              />
            ),
          },
        ]
      : []),
  ];
  const pied = contenuSoir.pied;
  const etirementsApresBoxe = contenuSoir.etirements_apres_boxe;

  return (
    <main className="ecran">
      <header className="entete">
        <h1>{dateLongue(jour)}</h1>
        <p className="discret">
          Ancrage · {niveau.ancrage} · semaine {semaine} sur {programme.ancrage.semaines_par_cycle}
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
            Objectif : {passages.jours_tenus} sur {passages.fenetre_jours}, dont les deux week-ends.
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

      {couchesWeekEnd ? (
        <Carte
          titre="Week-end"
          precision={`≈ ${programme.ancrage.week_end.base.duree_min} min, plus le bonus`}
        >
          <ParType programme={programme} bloc="week_end" couches={couchesWeekEnd} />
          <ChoixDeCouche
            libelle="Week-end"
            couches={presentes(couchesWeekEnd)}
            valeur={journal.matin}
            surChoix={(matin) => changer({ matin })}
          />
        </Carte>
      ) : (
        <Carte
          titre={`Matin ${lettre}`}
          precision={`${heureCourte(cibles.lever)} · ≈ ${creneau} min`}
        >
          <ParType programme={programme} bloc="matin" couches={couchesMatin} />
          <ChoixDeCouche
            libelle="Matin"
            couches={presentes(couchesMatin)}
            valeur={journal.matin}
            surChoix={(matin) => changer({ matin })}
          />
        </Carte>
      )}

      {contenuMidi && (
        <Carte titre="Midi">
          <GroupeDeLignes
            titre="Cardio"
            lignes={[
              {
                cle: 'bouger',
                couche: 'bonus',
                nom: 'Marche ou corde',
                detail: 'sans durée imposée',
              },
            ]}
          />
          <p className="discret">Bouger, ce que tu peux.</p>
          <Choix
            libelle="Midi"
            valeur={journal.midi}
            surChoix={(midi) => changer({ midi })}
            options={[
              { valeur: 'corde', libelle: 'Corde', couche: 'bonus' },
              { valeur: 'marche', libelle: 'Marche', couche: 'bonus' },
            ]}
          />
        </Carte>
      )}

      <Carte titre="Soir · bloc clé" precision={`≈ ${soirMinimum.duree_min} min`}>
        <button
          type="button"
          className="interrupteur"
          aria-pressed={boxe}
          onClick={() => changer({ boxe: !boxe, blocCle: null, pied: false })}
        >
          Boxe ce soir
        </button>
        <GroupeDeLignes titre="Mobilité" lignes={blocCle} />
        {boxe && <p className="discret">Soir de boxe : le minimum.</p>}
        <Choix
          libelle="Bloc clé"
          valeur={journal.blocCle}
          surChoix={(blocCle) => changer({ blocCle })}
          options={
            boxe
              ? [{ valeur: 'boxe', libelle: 'Fait', couche: 'minimum' }]
              : [
                  { valeur: 'minimum', libelle: 'Minimum', couche: 'minimum' },
                  { valeur: 'principale', libelle: 'Principale', couche: 'principale' },
                ]
          }
        />
      </Carte>

      {pied && (
        <Carte
          titre={`Soir · routine pied ${pied.lettre}`}
          precision={`≈ ${contenuSoir.duree_min - soirMinimum.duree_min} min`}
        >
          <p className="discret">{programme.pied.routines[pied.lettre].nom}</p>
          <GroupeDeLignes
            titre="Renforcement du pied"
            lignes={pied.exercices.map((exercice) => ({
              cle: exercice,
              couche: 'principale',
              nom: nomExercice(programme, exercice),
              detail:
                pied.series_par_exercice === 1 ? '1 série' : `${pied.series_par_exercice} séries`,
              enfant: (
                <Compteurs
                  programme={programme}
                  bloc="pied"
                  exercice={exercice}
                  series={pied.series_par_exercice}
                />
              ),
            }))}
          />
          <GroupeDeLignes
            titre="Étirements du pied"
            lignes={pied.etirements.map((e) => ({
              cle: e.exercice,
              couche: 'principale',
              nom: nomExercice(programme, e.exercice),
              detail: detailEtirement(programme, e),
            }))}
          />
          <Choix
            libelle="Routine pied"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait', couche: 'principale' }]}
          />
        </Carte>
      )}

      {etirementsApresBoxe && (
        <Carte titre="Après la boxe" precision="si possible">
          <GroupeDeLignes
            titre="Étirements du pied"
            lignes={etirementsApresBoxe.etirements.map((e) => ({
              cle: e.exercice,
              couche: 'bonus',
              nom: nomExercice(programme, e.exercice),
              detail: detailEtirement(programme, e),
            }))}
          />
          <Choix
            libelle="Après la boxe"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait', couche: 'bonus' }]}
          />
        </Carte>
      )}

      <Carte titre="Chaque jour">
        <GroupeDeLignes
          titre="Équilibre"
          lignes={[
            {
              cle: 'single_leg_balance',
              couche: 'principale',
              nom: nomExercice(programme, 'single_leg_balance'),
              detail: '1 min par jambe',
            },
          ]}
        />
        <p className="discret">Pendant le brossage des dents, matin et soir.</p>
        <div className="choix" role="group" aria-label="Single leg balance">
          {(['matin', 'soir'] as const).map((moment) => (
            <button
              key={moment}
              type="button"
              data-couche="principale"
              aria-pressed={journal.equilibre[moment]}
              onClick={() =>
                changer({
                  equilibre: { ...journal.equilibre, [moment]: !journal.equilibre[moment] },
                })
              }
            >
              {moment === 'matin' ? 'Matin' : 'Soir'}
            </button>
          ))}
        </div>
      </Carte>

      <p className="discret note">
        Version d'essai : rien n'est encore enregistré. <a href="../">Ouvrir la v1</a>
      </p>
    </main>
  );
}
