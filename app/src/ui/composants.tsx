import { createContext, useContext, type ReactNode } from 'react';
import type { Programme } from '../data/schema';
import type { Etirement, ExerciceDeSeance, Mouvement } from '../domain/matin';
import { compteurDeRepetitions } from '../domain/saisie';
import {
  detailEtirement,
  detailExercice,
  detailMouvement,
  fourchetteTexte,
  nomExercice,
  parCote,
} from './libelles';

/**
 * Briques communes aux écrans. Code couleur des versions (décision du 18/10/2026) : minimum en
 * vert, normal en orange, « au mieux » en rouge ; chaque couleur porte aussi son libellé.
 */
export type Version = 'normal' | 'minimum' | 'au-mieux';

const LIBELLES_DE_VERSION: Record<Version, string> = {
  normal: 'Normal',
  minimum: 'Minimum',
  'au-mieux': 'Au mieux',
};

export function Etiquette({ version, texte }: { version: Version; texte?: string }) {
  return <span className={`etiquette ${version}`}>{texte ?? LIBELLES_DE_VERSION[version]}</span>;
}

/** Un bloc de contenu dans sa version : bordure et étiquette de la couleur de la version. */
export function BlocDeVersion({
  version,
  etiquette,
  children,
}: {
  version: Version;
  etiquette?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bloc-version ${version}`}>
      <Etiquette version={version} {...(etiquette ? { texte: etiquette } : {})} />
      {children}
    </div>
  );
}

export interface Option<T extends string> {
  valeur: T;
  libelle: string;
  version?: Version;
}

/** Boutons à choix unique ; un second appui annule. La couleur suit la version du bouton. */
export function Choix<T extends string>({
  options,
  valeur,
  surChoix,
  libelle,
}: {
  options: readonly Option<T>[];
  valeur: T | null;
  surChoix: (valeur: T | null) => void;
  libelle?: string;
}) {
  return (
    <div className="choix" role="group" {...(libelle ? { 'aria-label': libelle } : {})}>
      {options.map((option) => (
        <button
          key={option.valeur}
          type="button"
          data-version={option.version ?? 'normal'}
          aria-pressed={valeur === option.valeur}
          onClick={() => surChoix(valeur === option.valeur ? null : option.valeur)}
        >
          {option.libelle}
        </button>
      ))}
    </div>
  );
}

export function Carte({
  titre,
  precision,
  version,
  children,
}: {
  titre: string;
  precision?: string;
  version?: Version;
  children: ReactNode;
}) {
  return (
    <section className={`carte${version ? ` carte-${version}` : ''}`} aria-label={titre}>
      <div className="carte-tete">
        <h2 className="titre-carte">{titre}</h2>
        {precision && <span className="discret">{precision}</span>}
      </div>
      {children}
    </section>
  );
}

export function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="groupe">
      <h3 className="titre-groupe">{titre}</h3>
      {children}
    </div>
  );
}

export function Ligne({
  nom,
  detail,
  children,
}: {
  nom: string;
  detail: string;
  children?: ReactNode;
}) {
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

/** Répétitions saisies : valeur d'une série (ou celle de départ) et modification. */
export interface Saisie {
  valeur: (cle: string, serie: number, depart: number) => number;
  changer: (cle: string, serie: number, valeur: number) => void;
}

export const SaisieContexte = createContext<Saisie>({
  valeur: (_cle, _serie, depart) => depart,
  changer: () => {},
});

/** Un compteur de répétitions par série, pour l'historique (décision du 18/10/2026). */
export function Compteurs({
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

/** Mouvement « à la cible » sans compteur (cossack squat) : la cible s'affiche (décision du 18/10/2026). */
function detailAvecCible(programme: Programme, m: Mouvement): string {
  if (!m.a_la_cible || compteurDeRepetitions(programme, m.exercice, 1)) return detailMouvement(m);
  const fourchette = fourchetteTexte(programme, m.exercice);
  const cote = programme.exercices[m.exercice]?.cote;
  return fourchette
    ? `1 série · cible ${fourchette}${cote ? ` ${parCote(cote)}` : ''}`
    : detailMouvement(m);
}

export function Mouvements({
  programme,
  bloc,
  mouvements,
  compteurs = true,
}: {
  programme: Programme;
  bloc: string;
  mouvements: readonly Mouvement[];
  /** Faux pour un rappel (version minimum) : le compteur reste dans la version normale. */
  compteurs?: boolean;
}) {
  if (mouvements.length === 0) return null;
  return (
    <ul className="liste">
      {mouvements.map((m) => (
        <Ligne
          key={m.exercice}
          nom={nomExercice(programme, m.exercice)}
          detail={detailAvecCible(programme, m)}
        >
          {compteurs && m.a_la_cible && (
            <Compteurs programme={programme} bloc={bloc} exercice={m.exercice} series={1} />
          )}
        </Ligne>
      ))}
    </ul>
  );
}

export function Exercices({
  programme,
  bloc,
  exercices,
}: {
  programme: Programme;
  bloc: string;
  exercices: readonly ExerciceDeSeance[];
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

export function Etirements({
  programme,
  etirements,
}: {
  programme: Programme;
  etirements: readonly Etirement[];
}) {
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
