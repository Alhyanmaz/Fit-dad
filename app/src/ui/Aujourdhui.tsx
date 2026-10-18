import type { Dispatch, SetStateAction } from 'react';
import type { Programme } from '../data/schema';
import { lettreDuMatin, lettreDuPied } from '../domain/alternances';
import { jourTenu, soirFait } from '../domain/ancrage';
import { couchesDuMatin, couchesDuWeekEnd } from '../domain/couches';
import { estWeekEnd, joursEntre, type DateIso } from '../domain/dates';
import { typeDeJour } from '../domain/jour';
import type { JournalDuJour } from '../domain/journal';
import { midiDuJour } from '../domain/midi';
import { niveauDAncrage, type Niveau } from '../domain/niveau';
import { soirDuJour } from '../domain/soir';
import { weekEndDuJour } from '../domain/weekEnd';
import { Anneau } from './Anneau';
import {
  BlocDeCouche,
  BlocEnCouches,
  Carte,
  Choix,
  Compteurs,
  Etirements,
  Groupe,
  Ligne,
} from './composants';
import { dateLongue, dureeTexte, heureCourte, nomExercice } from './libelles';
import { Passage } from './Passage';

/**
 * Écran « Aujourd'hui » pendant l'ancrage (jalon J3) : le contenu du jour vient du moteur, en
 * couches qui s'additionnent (minimum, principale, bonus ; décision du 18/10/2026) ; les validations
 * vont dans le journal du jour. Pas encore d'enregistrement : les alternances partent de A.
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
}) {
  const changer = (modif: Partial<JournalDuJour>) => setJournal((j) => ({ ...j, ...modif }));
  const { boxe } = journal;

  const avantLeDebut = joursEntre(debut, date) < 0;
  const jour = avantLeDebut ? debut : date;
  const joursDeBoxe = boxe ? [jour] : [];
  const type = typeDeJour(jour, joursDeBoxe, niveau);
  const lettre = lettreDuMatin(jour, type, null) ?? 'A';
  const infos = niveauDAncrage(programme, niveau.ancrage);
  const semaine = Math.floor(Math.max(0, joursEntre(depuis, jour)) / 7) + 1;
  const { passages } = programme;

  const couchesMatin = couchesDuMatin(programme, { niveau, type, lettre, lettreDeLaVeille: null });
  const contenuWeekEnd = estWeekEnd(jour)
    ? weekEndDuJour(programme, { niveau, date: jour, lettre, joursDeBoxe })
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
  const tenu = jourTenu({ matin: journal.matin, soir: soirFait(journal.blocCle, journal.pied) });
  const deepSquat = dureeTexte(programme.exercices['deep_squat']?.duree_s ?? 120);

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
              ? `C'est demain. Ce soir, coucher à ${heureCourte(infos.coucher)} pour te lever à ${heureCourte(infos.lever)}.`
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
            Lever <strong>{heureCourte(infos.lever)}</strong>
            <br />
            Coucher <strong>{heureCourte(infos.coucher)}</strong>
          </p>
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

      {contenuWeekEnd ? (
        <Carte
          titre="Week-end"
          precision={`≈ ${programme.ancrage.week_end.base.duree_min} min, plus le bonus`}
        >
          <BlocEnCouches
            programme={programme}
            bloc="week_end"
            couches={couchesDuWeekEnd(programme, niveau, contenuWeekEnd)}
            titres
            libelle="Week-end"
            valeur={journal.matin}
            surChoix={(matin) => changer({ matin })}
          />
        </Carte>
      ) : (
        <Carte
          titre={`Matin ${lettre}`}
          precision={`${heureCourte(infos.lever)} · ≈ ${infos.matin.creneau_min} min`}
        >
          <BlocEnCouches
            programme={programme}
            bloc="matin"
            couches={couchesMatin}
            libelle="Matin"
            valeur={journal.matin}
            surChoix={(matin) => changer({ matin })}
          />
        </Carte>
      )}

      {contenuMidi && (
        <Carte titre="Midi">
          <BlocDeCouche couche="bonus">
            <p className="discret">Bouger, ce que tu peux : marche ou corde, sans durée imposée.</p>
          </BlocDeCouche>
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
        <BlocDeCouche couche="minimum" {...(boxe ? { etiquette: 'Minimum · soir de boxe' } : {})}>
          <ul className="liste">
            <Ligne
              nom="Suspension seule"
              detail={dureeTexte(soirMinimum.bloc_cle.suspension_s ?? 60)}
            />
            <Ligne nom={nomExercice(programme, 'deep_squat')} detail={deepSquat} />
          </ul>
        </BlocDeCouche>
        {!boxe && contenuSoir.bloc_cle.knee_raises && (
          <BlocDeCouche couche="principale">
            <ul className="liste">
              <Ligne nom="Knee raises" detail="pendant la suspension, à ta cible">
                <Compteurs
                  programme={programme}
                  bloc="bloc_cle"
                  exercice="suspension"
                  series={contenuSoir.bloc_cle.suspension_series}
                />
              </Ligne>
            </ul>
          </BlocDeCouche>
        )}
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

      {contenuSoir.pied && (
        <Carte
          titre={`Soir · routine pied ${contenuSoir.pied.lettre}`}
          precision={`≈ ${contenuSoir.duree_min - soirMinimum.duree_min} min`}
        >
          <BlocDeCouche couche="principale">
            <p className="discret">{programme.pied.routines[contenuSoir.pied.lettre].nom}</p>
            <ul className="liste">
              {contenuSoir.pied.exercices.map((exercice) => (
                <Ligne
                  key={exercice}
                  nom={nomExercice(programme, exercice)}
                  detail={contenuSoir.pied?.series_par_exercice === 1 ? '1 série' : '2 séries'}
                >
                  <Compteurs
                    programme={programme}
                    bloc="pied"
                    exercice={exercice}
                    series={contenuSoir.pied?.series_par_exercice ?? 1}
                  />
                </Ligne>
              ))}
            </ul>
            <Groupe titre="Étirements du pied">
              <Etirements programme={programme} etirements={contenuSoir.pied.etirements} />
            </Groupe>
          </BlocDeCouche>
          <Choix
            libelle="Routine pied"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait', couche: 'principale' }]}
          />
        </Carte>
      )}

      {contenuSoir.etirements_apres_boxe && (
        <Carte titre="Après la boxe" precision="si possible">
          <BlocDeCouche couche="bonus">
            <Etirements
              programme={programme}
              etirements={contenuSoir.etirements_apres_boxe.etirements}
            />
          </BlocDeCouche>
          <Choix
            libelle="Après la boxe"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait', couche: 'bonus' }]}
          />
        </Carte>
      )}

      <Carte titre="Chaque jour">
        <BlocDeCouche couche="principale">
          <ul className="liste">
            <Ligne nom={nomExercice(programme, 'single_leg_balance')} detail="1 min par jambe" />
          </ul>
          <p className="discret">Pendant le brossage des dents, matin et soir.</p>
        </BlocDeCouche>
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
