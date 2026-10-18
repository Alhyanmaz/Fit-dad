import { createContext, useContext, type ReactNode } from 'react';
import type { Programme } from '../data/schema';
import { COUCHES, estVide, type Contenu, type Couche, type Couches } from '../domain/couches';
import type { Etirement, ExerciceDeSeance, Mouvement, Tenue } from '../domain/matin';
import { compteurDeRepetitions } from '../domain/saisie';
import {
  detailEtirement,
  detailExercice,
  detailMouvement,
  dureeTexte,
  nomExercice,
  parCote,
} from './libelles';

/**
 * Briques communes aux écrans. Couches (décisions de José du 18/10/2026) : minimum en vert,
 * principale en orange, bonus en rouge. Elles s'additionnent, rien n'est masqué, et chaque couleur
 * porte aussi son libellé.
 */
export const LIBELLES_DE_COUCHE: Record<Couche, string> = {
  minimum: 'Minimum',
  principale: 'Principale',
  bonus: 'Bonus',
};

export function Etiquette({ couche, texte }: { couche: Couche; texte?: string }) {
  return <span className={`etiquette ${couche}`}>{texte ?? LIBELLES_DE_COUCHE[couche]}</span>;
}

/** Une couche : bordure et étiquette de sa couleur. */
export function BlocDeCouche({
  couche,
  etiquette,
  children,
}: {
  couche: Couche;
  etiquette?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bloc-couche ${couche}`}>
      <Etiquette couche={couche} {...(etiquette ? { texte: etiquette } : {})} />
      {children}
    </div>
  );
}

export interface Option<T extends string> {
  valeur: T;
  libelle: string;
  couche?: Couche;
}

/** Boutons à choix unique ; un second appui annule. La couleur suit la couche du bouton. */
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
          data-couche={option.couche ?? 'principale'}
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
  children,
}: {
  titre: string;
  precision?: string;
  children: ReactNode;
}) {
  return (
    <section className="carte" aria-label={titre}>
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

/**
 * Mouvements de mobilité, puis les tenues du minimum (deep squat) : aucun compteur dans les
 * échauffements, la cible s'affiche (« 8-14 rep / side », décision du 18/10/2026).
 */
export function Mouvements({
  programme,
  mouvements,
  tenues = [],
}: {
  programme: Programme;
  mouvements: readonly Mouvement[];
  tenues?: readonly Tenue[];
}) {
  if (mouvements.length === 0 && tenues.length === 0) return null;
  return (
    <ul className="liste">
      {mouvements.map((m) => (
        <Ligne
          key={m.exercice}
          nom={nomExercice(programme, m.exercice)}
          detail={detailMouvement(programme, m)}
        />
      ))}
      {tenues.map((t) => (
        <Ligne
          key={t.exercice}
          nom={nomExercice(programme, t.exercice)}
          detail={dureeTexte(t.duree_s)}
        />
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
  exercices: readonly (ExerciceDeSeance & { en_plus?: true })[];
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
          {!e.en_plus && (
            <Compteurs programme={programme} bloc={bloc} exercice={e.exercice} series={e.series} />
          )}
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
  etirements: readonly (Etirement & { en_plus?: true })[];
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

/** Le contenu d'une couche, dans l'ordre de la séance ; titres de groupe au besoin (week-end). */
export function ContenuDeCouche({
  programme,
  bloc,
  contenu,
  titres = false,
}: {
  programme: Programme;
  bloc: string;
  contenu: Contenu;
  titres?: boolean;
}) {
  const groupe = (titre: string, enfant: ReactNode) =>
    titres ? <Groupe titre={titre}>{enfant}</Groupe> : enfant;
  const marge = [
    contenu.respiration_min > 0 ? `Respiration ${contenu.respiration_min} min` : null,
    contenu.cafe_min > 0 ? `café ${contenu.cafe_min} min` : null,
  ].filter((t) => t !== null);
  return (
    <>
      {marge.length > 0 && <p className="discret">{marge.join(', puis ')}.</p>}
      {(contenu.mobilite.length > 0 || contenu.tenues.length > 0) &&
        groupe(
          contenu.mobilite_au_ralenti ? 'Mobilité, au ralenti' : 'Mobilité',
          <Mouvements
            programme={programme}
            mouvements={contenu.mobilite}
            tenues={contenu.tenues}
          />,
        )}
      {contenu.neck_cars_par_sens !== null && (
        <p className="discret">Neck CARs : {contenu.neck_cars_par_sens} par sens.</p>
      )}
      {contenu.musculation.length > 0 &&
        groupe(
          'Séance',
          <Exercices programme={programme} bloc={bloc} exercices={contenu.musculation} />,
        )}
      {contenu.etirements.length > 0 &&
        groupe('Étirements', <Etirements programme={programme} etirements={contenu.etirements} />)}
      {contenu.boxe_rounds.length > 0 && (
        <p className="discret">Boxe : rounds {contenu.boxe_rounds.join(', ')} du bloc.</p>
      )}
    </>
  );
}

/**
 * Un bloc en couches, puis sa validation : la couche atteinte. Seules les couches qui ont un
 * contenu s'affichent et se valident.
 */
export function BlocEnCouches({
  programme,
  bloc,
  couches,
  titres = false,
  libelle,
  valeur,
  surChoix,
}: {
  programme: Programme;
  bloc: string;
  couches: Couches;
  titres?: boolean;
  libelle: string;
  valeur: Couche | null;
  surChoix: (valeur: Couche | null) => void;
}) {
  const presentes = COUCHES.filter((c) => !estVide(couches[c]));
  return (
    <>
      {presentes.map((c) => (
        <BlocDeCouche key={c} couche={c}>
          <ContenuDeCouche programme={programme} bloc={bloc} contenu={couches[c]} titres={titres} />
        </BlocDeCouche>
      ))}
      <Choix
        libelle={libelle}
        valeur={valeur}
        surChoix={surChoix}
        options={presentes.map((c) => ({ valeur: c, libelle: LIBELLES_DE_COUCHE[c], couche: c }))}
      />
    </>
  );
}
