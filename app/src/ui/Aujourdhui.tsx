import type { Dispatch, SetStateAction } from 'react';
import type { Programme } from '../data/schema';
import { lettreDuMatin, lettreDuPied } from '../domain/alternances';
import { jourTenu, soirFait } from '../domain/ancrage';
import { estWeekEnd, joursEntre, type DateIso } from '../domain/dates';
import { typeDeJour } from '../domain/jour';
import type { JournalDuJour } from '../domain/journal';
import { matinDuJour } from '../domain/matin';
import { midiDuJour } from '../domain/midi';
import { niveauDAncrage } from '../domain/niveau';
import { soirDuJour } from '../domain/soir';
import { weekEndDuJour } from '../domain/weekEnd';
import { Anneau } from './Anneau';
import {
  BlocDeVersion,
  Carte,
  Choix,
  Compteurs,
  Etirements,
  Exercices,
  Groupe,
  Ligne,
  Mouvements,
} from './composants';
import { dateLongue, heureCourte, nomExercice } from './libelles';

/**
 * Écran « Aujourd'hui » pendant l'ancrage (jalon J3) : le contenu du jour vient du moteur, les
 * validations vont dans le journal du jour. Code couleur des versions, rien de masqué (décision
 * du 18/10/2026). Pas encore d'enregistrement : les alternances partent de A.
 */
export function Aujourdhui({
  programme,
  date,
  debut,
  niveau,
  journal,
  setJournal,
}: {
  programme: Programme;
  date: DateIso;
  debut: DateIso;
  niveau: { ancrage: 'N1' | 'N2' };
  journal: JournalDuJour;
  setJournal: Dispatch<SetStateAction<JournalDuJour>>;
}) {
  const changer = (modif: Partial<JournalDuJour>) => setJournal((j) => ({ ...j, ...modif }));
  const { boxe } = journal;

  const avantLeDebut = joursEntre(debut, date) < 0;
  const jour = avantLeDebut ? debut : date;
  const joursDeBoxe = boxe ? [jour] : [];
  const type = typeDeJour(jour, joursDeBoxe, niveau);
  const lettre = lettreDuMatin(jour, type, null) ?? 'A';
  const infos = niveauDAncrage(programme, niveau.ancrage);
  const semaine = Math.floor(Math.max(0, joursEntre(debut, jour)) / 7) + 1;

  const contexteMatin = { niveau, type, lettre, lettreDeLaVeille: null };
  const contenuMatin = matinDuJour(programme, contexteMatin);
  const matinMinimum = matinDuJour(programme, { ...contexteMatin, version: 'minimum' });
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

  const minimumDuMatin = (
    <BlocDeVersion version="minimum">
      <Mouvements
        programme={programme}
        bloc="matin"
        mouvements={matinMinimum.mobilite}
        compteurs={false}
      />
      <p className="discret petit">Seul, après une nuit très hachée.</p>
    </BlocDeVersion>
  );
  const choixDuMatin = (
    <Choix
      libelle="Matin"
      valeur={journal.matin}
      surChoix={(matin) => changer({ matin })}
      options={[
        { valeur: 'normale', libelle: 'Fait', version: 'normal' },
        { valeur: 'minimum', libelle: 'Minimum', version: 'minimum' },
      ]}
    />
  );
  const suspensionSeule = `${(soirMinimum.bloc_cle.suspension_s ?? 60) / 60} min`;

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
        <Anneau valeur={tenu ? 1 : 0} total={7} libelle="Jours tenus sur les 7 derniers" />
        <div className="resume-texte">
          <p className="titre-carte">Jours tenus</p>
          <p className="discret">Objectif : 5 sur 7, samedi et dimanche compris.</p>
          <p className="horaires">
            Lever <strong>{heureCourte(infos.lever)}</strong>
            <br />
            Coucher <strong>{heureCourte(infos.coucher)}</strong>
          </p>
        </div>
      </section>

      {contenuWeekEnd ? (
        <>
          <Carte titre="Week-end · base" precision="≈ 20 min">
            {contenuWeekEnd.base && (
              <BlocDeVersion version="normal">
                <Groupe titre="Échauffement">
                  <Mouvements
                    programme={programme}
                    bloc="base"
                    mouvements={contenuWeekEnd.base.echauffement}
                  />
                </Groupe>
                <Groupe titre="3 séries des 4 exercices">
                  <Exercices
                    programme={programme}
                    bloc="base"
                    exercices={contenuWeekEnd.base.exercices}
                  />
                </Groupe>
                <Groupe titre="Étirement">
                  <Etirements programme={programme} etirements={contenuWeekEnd.base.etirements} />
                </Groupe>
              </BlocDeVersion>
            )}
            {minimumDuMatin}
            {choixDuMatin}
          </Carte>
          {contenuWeekEnd.seance && (
            <Carte titre="Week-end · au mieux" precision="bonus, ≈ 45 min" version="au-mieux">
              <BlocDeVersion version="au-mieux">
                <Groupe titre="Mobilité">
                  <Mouvements
                    programme={programme}
                    bloc="au_mieux"
                    mouvements={contenuWeekEnd.seance.mobilite}
                  />
                </Groupe>
                <Groupe titre="Séance">
                  <Exercices
                    programme={programme}
                    bloc="au_mieux"
                    exercices={contenuWeekEnd.seance.musculation}
                  />
                </Groupe>
                <Groupe titre="Étirements de hanche">
                  <Etirements programme={programme} etirements={contenuWeekEnd.seance.etirements} />
                </Groupe>
                {contenuWeekEnd.boxe && (
                  <p className="discret">
                    Boxe : rounds {contenuWeekEnd.boxe.rounds.join(', ')} du bloc.
                  </p>
                )}
              </BlocDeVersion>
              <Choix
                libelle="Au mieux"
                valeur={journal.auMieux ? 'fait' : null}
                surChoix={(v) => changer({ auMieux: v === 'fait' })}
                options={[{ valeur: 'fait', libelle: 'Fait', version: 'au-mieux' }]}
              />
            </Carte>
          )}
        </>
      ) : (
        <Carte
          titre={`Matin ${lettre}`}
          precision={`${heureCourte(infos.lever)} · ≈ ${infos.matin.creneau_min} min`}
        >
          <BlocDeVersion version="normal">
            {contenuMatin.respiration_min > 0 && (
              <p className="discret">
                Respiration {contenuMatin.respiration_min} min, puis café {contenuMatin.cafe_min}{' '}
                min.
              </p>
            )}
            <Mouvements programme={programme} bloc="matin" mouvements={contenuMatin.mobilite} />
            <Exercices programme={programme} bloc="matin" exercices={contenuMatin.musculation} />
            <Etirements programme={programme} etirements={contenuMatin.etirements} />
          </BlocDeVersion>
          {minimumDuMatin}
          {choixDuMatin}
        </Carte>
      )}

      {contenuMidi && (
        <Carte titre="Midi" precision="bonus">
          <p className="discret">Bouger, ce que tu peux : marche ou corde, sans durée imposée.</p>
          <Choix
            libelle="Midi"
            valeur={journal.midi}
            surChoix={(midi) => changer({ midi })}
            options={[
              { valeur: 'corde', libelle: 'Corde' },
              { valeur: 'marche', libelle: 'Marche' },
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
        {boxe ? (
          <BlocDeVersion version="minimum" etiquette="Minimum · soir de boxe">
            <ul className="liste">
              <Ligne nom="Suspension seule" detail={suspensionSeule} />
              <Ligne nom={nomExercice(programme, 'deep_squat')} detail="2 min" />
            </ul>
          </BlocDeVersion>
        ) : (
          <>
            <BlocDeVersion version="normal">
              <ul className="liste">
                <Ligne
                  nom={nomExercice(programme, 'suspension')}
                  detail={`${contenuSoir.bloc_cle.suspension_series} série à ta cible`}
                >
                  <Compteurs
                    programme={programme}
                    bloc="bloc_cle"
                    exercice="suspension"
                    series={contenuSoir.bloc_cle.suspension_series}
                  />
                </Ligne>
                <Ligne
                  nom={nomExercice(programme, 'deep_squat')}
                  detail={`${contenuSoir.bloc_cle.deep_squat_series} × 2 min`}
                />
              </ul>
            </BlocDeVersion>
            <BlocDeVersion version="minimum">
              <ul className="liste">
                <Ligne nom="Suspension seule" detail={suspensionSeule} />
                <Ligne nom={nomExercice(programme, 'deep_squat')} detail="2 min" />
              </ul>
            </BlocDeVersion>
          </>
        )}
        <Choix
          libelle="Bloc clé"
          valeur={journal.blocCle}
          surChoix={(blocCle) => changer({ blocCle })}
          options={
            boxe
              ? [{ valeur: 'boxe', libelle: 'Fait', version: 'minimum' }]
              : [
                  { valeur: 'normal', libelle: 'Fait', version: 'normal' },
                  { valeur: 'minimum', libelle: 'Minimum', version: 'minimum' },
                ]
          }
        />
      </Carte>

      {contenuSoir.pied && (
        <Carte
          titre={`Soir · routine pied ${contenuSoir.pied.lettre}`}
          precision={`≈ ${contenuSoir.duree_min - soirMinimum.duree_min} min`}
        >
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
          <Choix
            libelle="Routine pied"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait' }]}
          />
        </Carte>
      )}

      {contenuSoir.etirements_apres_boxe && (
        <Carte titre="Après la boxe" precision="si possible, en bonus">
          <Etirements
            programme={programme}
            etirements={contenuSoir.etirements_apres_boxe.etirements}
          />
          <Choix
            libelle="Après la boxe"
            valeur={journal.pied ? 'fait' : null}
            surChoix={(v) => changer({ pied: v === 'fait' })}
            options={[{ valeur: 'fait', libelle: 'Fait' }]}
          />
        </Carte>
      )}

      <Carte titre="Chaque jour">
        <ul className="liste">
          <Ligne nom={nomExercice(programme, 'single_leg_balance')} detail="1 min par jambe" />
        </ul>
        <p className="discret">Pendant le brossage des dents, matin et soir.</p>
        <div className="choix" role="group" aria-label="Single leg balance">
          {(['matin', 'soir'] as const).map((moment) => (
            <button
              key={moment}
              type="button"
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
