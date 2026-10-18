import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Programme } from '../data/schema';
import { lettreDuMatin, lettreDuPied } from '../domain/alternances';
import { jourTenu, soirFait, type BlocCleFait, type MatinFait } from '../domain/ancrage';
import { estWeekEnd, joursEntre, type DateIso } from '../domain/dates';
import { typeDeJour } from '../domain/jour';
import {
  matinDuJour,
  type Etirement,
  type ExerciceDeSeance,
  type Mouvement,
} from '../domain/matin';
import { midiDuJour, type MidiFait } from '../domain/midi';
import { niveauDAncrage } from '../domain/niveau';
import { compteurDeRepetitions } from '../domain/saisie';
import { soirDuJour } from '../domain/soir';
import { weekEndDuJour } from '../domain/weekEnd';
import { Anneau } from './Anneau';
import {
  dateLongue,
  detailEtirement,
  detailExercice,
  detailMouvement,
  heureCourte,
  nomExercice,
  parCote,
} from './libelles';

/** Répétitions saisies, par bloc et par exercice (« matin:rings_row » → une valeur par série). */
type Saisies = Record<string, number[]>;

interface Saisie {
  valeur: (cle: string, serie: number, depart: number) => number;
  changer: (cle: string, serie: number, valeur: number) => void;
}

const SaisieContexte = createContext<Saisie>({
  valeur: (_c, _s, depart) => depart,
  changer: () => {},
});

/**
 * Écran « Aujourd'hui » pendant l'ancrage (jalon J3, première étape) : le contenu du jour vient du
 * moteur. Pas encore d'enregistrement : les cases cochées s'effacent en quittant l'écran, et les
 * alternances partent de A tant que l'historique n'existe pas.
 */
export function Aujourdhui({
  programme,
  date,
  debut,
  niveau,
}: {
  programme: Programme;
  date: DateIso;
  debut: DateIso;
  niveau: { ancrage: 'N1' | 'N2' };
}) {
  const [boxe, setBoxe] = useState(false);
  const [matin, setMatin] = useState<MatinFait>(null);
  const [midi, setMidi] = useState<MidiFait>(null);
  const [blocCle, setBlocCle] = useState<BlocCleFait>(null);
  const [pied, setPied] = useState(false);
  const [auMieux, setAuMieux] = useState(false);
  const [equilibre, setEquilibre] = useState({ matin: false, soir: false });
  const [saisies, setSaisies] = useState<Saisies>({});
  const saisie: Saisie = {
    valeur: (cle, serie, depart) => saisies[cle]?.[serie] ?? depart,
    changer: (cle, serie, valeur) =>
      setSaisies((avant) => {
        const valeurs = [...(avant[cle] ?? [])];
        valeurs[serie] = valeur;
        return { ...avant, [cle]: valeurs };
      }),
  };

  const avantLeDebut = joursEntre(debut, date) < 0;
  const jour = avantLeDebut ? debut : date;
  const joursDeBoxe = boxe ? [jour] : [];
  const type = typeDeJour(jour, joursDeBoxe, niveau);
  const lettre = lettreDuMatin(jour, type, null) ?? 'A';
  const infos = niveauDAncrage(programme, niveau.ancrage);
  const semaine = Math.floor(Math.max(0, joursEntre(debut, jour)) / 7) + 1;
  const weekEnd = estWeekEnd(jour);

  const contenuMatin = matinDuJour(programme, { niveau, type, lettre, lettreDeLaVeille: null });
  const matinMinimum = matinDuJour(programme, {
    niveau,
    type,
    lettre,
    lettreDeLaVeille: null,
    version: 'minimum',
  });
  const contenuWeekEnd = weekEnd
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
  const tenu = jourTenu({ matin, soir: soirFait(blocCle, pied) });

  return (
    <SaisieContexte.Provider value={saisie}>
      <main className="ecran">
        <header className="entete">
          <h1>{dateLongue(jour)}</h1>
          <p className="discret">
            Ancrage · {niveau.ancrage} · semaine {semaine} sur{' '}
            {programme.ancrage.semaines_par_cycle}
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
            <Carte
              titre="Week-end · base"
              precision="≈ 20 min"
              choix={matin}
              surChoix={setMatin}
              valeurFait="normale"
              valeurMinimum="minimum"
              minimum={`Minimum : ${nomExercice(programme, matinMinimum.mobilite[0]?.exercice ?? '')}`}
            >
              {contenuWeekEnd.base && (
                <>
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
                </>
              )}
            </Carte>
            {contenuWeekEnd.seance && (
              <Carte
                titre="Week-end · au mieux"
                precision="bonus, ≈ 45 min"
                choix={auMieux ? 'fait' : null}
                surChoix={(valeur) => setAuMieux(valeur === 'fait')}
                valeurFait="fait"
                valeurMinimum={null}
                minimum=""
              >
                <details className="bonus">
                  <summary>Voir la séance</summary>
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
                    <Etirements
                      programme={programme}
                      etirements={contenuWeekEnd.seance.etirements}
                    />
                  </Groupe>
                  {contenuWeekEnd.boxe && (
                    <p className="discret">
                      Boxe : rounds {contenuWeekEnd.boxe.rounds.join(', ')} du bloc.
                    </p>
                  )}
                </details>
              </Carte>
            )}
          </>
        ) : (
          <Carte
            titre={`Matin ${lettre}`}
            precision={`${heureCourte(infos.lever)} · ≈ ${infos.matin.creneau_min} min`}
            choix={matin}
            surChoix={setMatin}
            valeurFait="normale"
            valeurMinimum="minimum"
            minimum={`Minimum : ${nomExercice(programme, matinMinimum.mobilite[0]?.exercice ?? '')} seul`}
          >
            {contenuMatin.respiration_min > 0 && (
              <p className="discret">
                Respiration {contenuMatin.respiration_min} min, puis café {contenuMatin.cafe_min}{' '}
                min.
              </p>
            )}
            <Mouvements programme={programme} bloc="matin" mouvements={contenuMatin.mobilite} />
            <Exercices programme={programme} bloc="matin" exercices={contenuMatin.musculation} />
            <Etirements programme={programme} etirements={contenuMatin.etirements} />
          </Carte>
        )}

        {contenuMidi && (
          <section className="carte" aria-label="Midi">
            <div className="carte-tete">
              <h2 className="titre-carte">Midi</h2>
              <span className="pastille">Bonus</span>
            </div>
            <p className="discret">Bouger, ce que tu peux : marche ou corde, sans durée imposée.</p>
            <div className="choix">
              {(['corde', 'marche'] as const).map((choix) => (
                <button
                  key={choix}
                  type="button"
                  aria-pressed={midi === choix}
                  onClick={() => setMidi(midi === choix ? null : choix)}
                >
                  {choix === 'corde' ? 'Corde' : 'Marche'}
                </button>
              ))}
            </div>
          </section>
        )}

        <Carte
          titre="Soir · bloc clé"
          precision={`≈ ${soirMinimum.duree_min} min`}
          choix={blocCle}
          surChoix={setBlocCle}
          valeurFait={boxe ? 'boxe' : 'normal'}
          valeurMinimum={boxe ? null : 'minimum'}
          minimum={`Minimum : ${(soirMinimum.bloc_cle.suspension_s ?? 60) / 60} min de suspension, 2 min de deep squat`}
          action={
            <button
              type="button"
              className="interrupteur"
              aria-pressed={boxe}
              onClick={() => {
                setBoxe(!boxe);
                setBlocCle(null);
                setPied(false);
              }}
            >
              Boxe ce soir
            </button>
          }
        >
          <ul className="liste">
            <Ligne
              nom={boxe ? 'Suspension seule' : nomExercice(programme, 'suspension')}
              detail={
                contenuSoir.bloc_cle.suspension_s
                  ? `${contenuSoir.bloc_cle.suspension_s / 60} min`
                  : `${contenuSoir.bloc_cle.suspension_series} série à ta cible`
              }
            >
              {contenuSoir.bloc_cle.knee_raises && (
                <Compteurs
                  programme={programme}
                  bloc="bloc_cle"
                  exercice="suspension"
                  series={contenuSoir.bloc_cle.suspension_series}
                />
              )}
            </Ligne>
            <Ligne
              nom={nomExercice(programme, 'deep_squat')}
              detail={`${contenuSoir.bloc_cle.deep_squat_series} × 2 min`}
            />
          </ul>
        </Carte>

        {contenuSoir.pied && (
          <Carte
            titre={`Soir · routine pied ${contenuSoir.pied.lettre}`}
            precision={`≈ ${contenuSoir.duree_min - soirMinimum.duree_min} min`}
            choix={pied ? 'fait' : null}
            surChoix={(valeur) => setPied(valeur === 'fait')}
            valeurFait="fait"
            valeurMinimum={null}
            minimum=""
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
          </Carte>
        )}

        {contenuSoir.etirements_apres_boxe && (
          <Carte
            titre="Après la boxe"
            precision="si possible, en bonus"
            choix={pied ? 'fait' : null}
            surChoix={(valeur) => setPied(valeur === 'fait')}
            valeurFait="fait"
            valeurMinimum={null}
            minimum=""
          >
            <Etirements
              programme={programme}
              etirements={contenuSoir.etirements_apres_boxe.etirements}
            />
          </Carte>
        )}

        <section className="carte" aria-label="Chaque jour">
          <h2 className="titre-carte">Chaque jour</h2>
          <ul className="liste">
            <Ligne nom={nomExercice(programme, 'single_leg_balance')} detail="1 min par jambe" />
          </ul>
          <p className="discret">Pendant le brossage des dents, matin et soir.</p>
          <div className="choix">
            {(['matin', 'soir'] as const).map((moment) => (
              <button
                key={moment}
                type="button"
                aria-pressed={equilibre[moment]}
                onClick={() => setEquilibre({ ...equilibre, [moment]: !equilibre[moment] })}
              >
                {moment === 'matin' ? 'Matin' : 'Soir'}
              </button>
            ))}
          </div>
        </section>

        <p className="discret note">
          Version d'essai : rien n'est encore enregistré. <a href="../">Ouvrir la v1</a>
        </p>
      </main>
      <NavBas />
    </SaisieContexte.Provider>
  );
}

/** Un bloc du jour, avec « Fait » et, s'il existe, « Minimum » (un second appui annule). */
function Carte<T extends string>({
  titre,
  precision,
  choix,
  surChoix,
  valeurFait,
  valeurMinimum,
  minimum,
  action,
  children,
}: {
  titre: string;
  precision: string;
  choix: T | null;
  surChoix: (valeur: T | null) => void;
  valeurFait: T;
  valeurMinimum: T | null;
  minimum: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const basculer = (valeur: T) => surChoix(choix === valeur ? null : valeur);
  return (
    <section className="carte" aria-label={titre}>
      <div className="carte-tete">
        <h2 className="titre-carte">{titre}</h2>
        <span className="discret">{precision}</span>
      </div>
      {action}
      {children}
      <div className="choix">
        <button
          type="button"
          aria-pressed={choix === valeurFait}
          onClick={() => basculer(valeurFait)}
        >
          Fait
        </button>
        {valeurMinimum && (
          <button
            type="button"
            aria-pressed={choix === valeurMinimum}
            onClick={() => basculer(valeurMinimum)}
          >
            Minimum
          </button>
        )}
      </div>
      {valeurMinimum && <p className="discret petit">{minimum}</p>}
    </section>
  );
}

function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="groupe">
      <h3 className="titre-groupe">{titre}</h3>
      {children}
    </div>
  );
}

function Ligne({ nom, detail, children }: { nom: string; detail: string; children?: ReactNode }) {
  return (
    <li className="ligne">
      <div className="ligne-tete">
        <span>{nom}</span>
        {detail && <span className="detail">{detail}</span>}
      </div>
      {children}
    </li>
  );
}

/** Un compteur de répétitions par série, pour l'historique (décision du 18/10/2026). */
function Compteurs({
  programme,
  bloc,
  exercice,
  series,
}: {
  programme: Programme;
  bloc: string;
  exercice: string;
  series: number;
}) {
  const saisie = useContext(SaisieContexte);
  const compteur = compteurDeRepetitions(programme, exercice, series);
  if (!compteur) return null;
  const cle = `${bloc}:${exercice}`;
  const nom = nomExercice(programme, exercice);
  const unite =
    compteur.quoi ?? (compteur.cote ? `répétitions ${parCote(compteur.cote)}` : 'répétitions');
  return (
    <div className="compteurs">
      {Array.from({ length: compteur.series }, (_, serie) => {
        const valeur = saisie.valeur(cle, serie, compteur.depart);
        const libelle = compteur.series > 1 ? `Série ${serie + 1}` : unite;
        return (
          <div className="compteur" key={serie}>
            <span className="compteur-nom">
              {libelle.charAt(0).toUpperCase() + libelle.slice(1)}
            </span>
            <div className="compteur-boutons">
              <button
                type="button"
                aria-label={`${nom}, ${libelle} : une de moins`}
                onClick={() => saisie.changer(cle, serie, Math.max(0, valeur - 1))}
              >
                −
              </button>
              <output aria-label={`${nom}, ${libelle}`}>{valeur}</output>
              <button
                type="button"
                aria-label={`${nom}, ${libelle} : une de plus`}
                onClick={() => saisie.changer(cle, serie, valeur + 1)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
      {compteur.series > 1 && compteur.cote && <p className="discret petit">En {unite}.</p>}
    </div>
  );
}

function Mouvements({
  programme,
  bloc,
  mouvements,
}: {
  programme: Programme;
  bloc: string;
  mouvements: Mouvement[];
}) {
  if (mouvements.length === 0) return null;
  return (
    <ul className="liste">
      {mouvements.map((m) => (
        <Ligne
          key={m.exercice}
          nom={nomExercice(programme, m.exercice)}
          detail={detailMouvement(m)}
        >
          {m.a_la_cible && (
            <Compteurs programme={programme} bloc={bloc} exercice={m.exercice} series={1} />
          )}
        </Ligne>
      ))}
    </ul>
  );
}

function Exercices({
  programme,
  bloc,
  exercices,
}: {
  programme: Programme;
  bloc: string;
  exercices: ExerciceDeSeance[];
}) {
  if (exercices.length === 0) return null;
  return (
    <ul className="liste">
      {exercices.map((e) => (
        <Ligne
          key={e.exercice}
          nom={nomExercice(programme, e.exercice)}
          detail={detailExercice(programme, e)}
        >
          <Compteurs programme={programme} bloc={bloc} exercice={e.exercice} series={e.series} />
        </Ligne>
      ))}
    </ul>
  );
}

function Etirements({ programme, etirements }: { programme: Programme; etirements: Etirement[] }) {
  if (etirements.length === 0) return null;
  return (
    <ul className="liste">
      {etirements.map((e) => (
        <Ligne
          key={e.exercice}
          nom={nomExercice(programme, e.exercice)}
          detail={detailEtirement(programme, e)}
        />
      ))}
    </ul>
  );
}

/** Barre du bas : seul « Aujourd'hui » existe pour l'instant. */
function NavBas() {
  return (
    <nav className="nav-bas" aria-label="Écrans">
      <span className="nav-item actif" aria-current="page">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4" />
        </svg>
        Aujourd'hui
      </span>
      <span className="nav-item" aria-disabled="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="4" />
          <path d="M12 3v2M4.9 6.4l1.4 1.4M19.1 6.4l-1.4 1.4M3 13h2M19 13h2M5 20h14" />
        </svg>
        Lever tôt
      </span>
      <span className="nav-item" aria-disabled="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 20V12M10 20V7M15 20v-5M20 20V4" />
        </svg>
        Progrès
      </span>
    </nav>
  );
}
