import { createContext, useContext, type ReactNode } from 'react';
import type { Programme } from '../data/schema';
import { COUCHES, type Couche, type Couches } from '../domain/couches';
import { compteurDeRepetitions, reglageDeDuree, regler } from '../domain/saisie';
import {
  coucheAtteinte,
  couchePrecedente,
  couchesPresentes,
  jusqua,
  type Element,
} from '../domain/validation';
import { detailExercice, detailMouvement, dureeTexte, nomExercice, parCote } from './libelles';

/**
 * Briques communes aux écrans (décisions de José du 18/10/2026). Chaque bloc dit d'abord ce qu'il
 * est (mobilité, musculation, étirements, cardio…) ; la couche de chaque mouvement se lit à sa
 * couleur, expliquée par la légende : minimum en vert, principale en orange, bonus en rouge. Chaque
 * mouvement se coche ; les boutons de couche sont des raccourcis.
 */
export const LIBELLES_DE_COUCHE: Record<Couche, string> = {
  minimum: 'Minimum',
  principale: 'Principale',
  bonus: 'Bonus',
};

/** Légende des couleurs, en tête d'écran. */
export function Legende() {
  return (
    <p className="legende" aria-label="Légende des couleurs">
      {COUCHES.map((c) => (
        <span key={c} className={`legende-item couche-${c}`}>
          {LIBELLES_DE_COUCHE[c]}
        </span>
      ))}
    </p>
  );
}

export interface Option<T extends string> {
  valeur: T;
  libelle: string;
  couche?: Couche;
}

/**
 * Boutons à choix unique ; un second appui annule. Le point de couleur rappelle la couche, s'il y
 * en a une ; un bouton rempli est le choix fait.
 */
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
          {...(option.couche ? { 'data-couche': option.couche } : {})}
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

/** Un groupe de type (« Mobilité »…), en bandeau sur toute la largeur de la carte. */
export function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="groupe">
      <h3 className="titre-groupe">{titre}</h3>
      {children}
    </div>
  );
}

/** Saisie du jour : répétitions, durées et mouvements cochés, par clé « bloc:mouvement ». */
export interface Saisie {
  valeur: (cle: string, serie: number, depart: number) => number;
  changer: (cle: string, serie: number, valeur: number) => void;
  duree: (cle: string, serie: number, depart: number) => number;
  changerDuree: (cle: string, serie: number, valeur: number) => void;
  fait: (cle: string) => boolean;
  /** Coche ou décoche plusieurs mouvements d'un coup. */
  marquer: (faits: Record<string, boolean>) => void;
}

export const SaisieContexte = createContext<Saisie>({
  valeur: (_cle, _serie, depart) => depart,
  changer: () => {},
  duree: (_cle, _serie, depart) => depart,
  changerDuree: () => {},
  fait: () => false,
  marquer: () => {},
});

/** Durée réglable d'un pas, en ligne : « − 30 s + ». Les étirements restent à 30 s au plus. */
export function Duree({
  programme,
  cle,
  exercice,
  nom,
  prevu,
  serie = 0,
}: {
  programme: Programme;
  cle: string;
  exercice: string | null;
  nom: string;
  prevu: number;
  serie?: number;
}) {
  const saisie = useContext(SaisieContexte);
  const reglage = reglageDeDuree(programme, exercice, prevu);
  const valeur = saisie.duree(cle, serie, reglage.depart);
  return (
    <span className="duree">
      <button
        type="button"
        aria-label={`${nom}, durée : ${reglage.pas} s de moins`}
        onClick={() => saisie.changerDuree(cle, serie, regler(reglage, valeur, -1))}
      >
        −
      </button>
      <output aria-label={`${nom}, durée`}>{dureeTexte(valeur)}</output>
      <button
        type="button"
        aria-label={`${nom}, durée : ${reglage.pas} s de plus`}
        disabled={reglage.max !== null && valeur >= reglage.max}
        onClick={() => saisie.changerDuree(cle, serie, regler(reglage, valeur, 1))}
      >
        +
      </button>
    </span>
  );
}

/** Un compteur de répétitions par série, pour l'historique (décision du 18/10/2026). */
export function Compteurs({
  programme,
  cle,
  exercice,
  series,
  debut = 0,
}: {
  programme: Programme;
  cle: string;
  exercice: string;
  series: number;
  /** Séries déjà faites dans une couche d'avant : la numérotation continue (« Série 2 »). */
  debut?: number;
}) {
  const saisie = useContext(SaisieContexte);
  const compteur = compteurDeRepetitions(programme, exercice, series);
  if (!compteur) return null;
  const nom = nomExercice(programme, exercice);
  const unite =
    compteur.quoi ?? (compteur.cote ? `répétitions ${parCote(compteur.cote)}` : 'répétitions');
  return (
    <div className="compteurs">
      {Array.from({ length: compteur.series }, (_, serie) => {
        const valeur = saisie.valeur(cle, debut + serie, compteur.depart);
        const libelle = compteur.series > 1 || debut > 0 ? `Série ${debut + serie + 1}` : unite;
        return (
          <div className="compteur" key={serie}>
            <span className="compteur-nom">
              {libelle.charAt(0).toUpperCase() + libelle.slice(1)}
            </span>
            <div className="compteur-boutons">
              <button
                type="button"
                aria-label={`${nom}, ${libelle} : une de moins`}
                onClick={() => saisie.changer(cle, debut + serie, Math.max(0, valeur - 1))}
              >
                −
              </button>
              <output aria-label={`${nom}, ${libelle}`}>{valeur}</output>
              <button
                type="button"
                aria-label={`${nom}, ${libelle} : une de plus`}
                onClick={() => saisie.changer(cle, debut + serie, valeur + 1)}
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

/** Une ligne à afficher, et ce qui se saisit dessus. */
export interface LigneDeCouche {
  /** Clé du mouvement dans son bloc (`Element.cle`). */
  cle: string;
  couche: Couche;
  nom: string;
  /** Texte à droite (cible) ; à côté de la durée réglable s'il y en a une. */
  detail?: string;
  /** Durée réglable, en secondes, par série. */
  duree?: { exercice: string | null; prevu: number };
  /**
   * Compteurs de répétitions, une ligne par série, gardés sous « bloc:exercice » ; `debut` : séries
   * déjà comptées dans une couche d'avant.
   */
  repetitions?: { exercice: string; series: number; debut?: number };
  /** Tenue réglable sous les répétitions (reverse table top). */
  tenue?: { exercice: string; prevu: number };
  /** Ligne à lire seulement, sans case à cocher (le café, une marge). */
  sansCase?: boolean;
}

/** Une ligne : case à cocher, nom dans la couleur de sa couche, cible ou durée, compteurs. */
export function Ligne({
  programme,
  bloc,
  ligne,
  changement = false,
}: {
  programme: Programme;
  bloc: string;
  ligne: LigneDeCouche;
  changement?: boolean;
}) {
  const saisie = useContext(SaisieContexte);
  const cle = `${bloc}:${ligne.cle}`;
  const fait = saisie.fait(cle);
  const classes = [
    'ligne',
    `couche-${ligne.couche}`,
    changement ? 'changement' : '',
    fait ? 'faite' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <li className={classes} data-couche={ligne.couche}>
      <div className="ligne-tete">
        {ligne.sansCase ? (
          <span className="case-vide" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="case"
            aria-pressed={fait}
            aria-label={`${ligne.nom} : fait`}
            onClick={() => saisie.marquer({ [cle]: !fait })}
          />
        )}
        <span className="nom">{ligne.nom}</span>
        {ligne.detail && <span className="detail">{ligne.detail}</span>}
        {ligne.duree && (
          <Duree
            programme={programme}
            cle={cle}
            exercice={ligne.duree.exercice}
            nom={ligne.nom}
            prevu={ligne.duree.prevu}
          />
        )}
      </div>
      {ligne.repetitions && (
        <Compteurs
          programme={programme}
          cle={`${bloc}:${ligne.repetitions.exercice}`}
          exercice={ligne.repetitions.exercice}
          series={ligne.repetitions.series}
          debut={ligne.repetitions.debut ?? 0}
        />
      )}
      {ligne.tenue && (
        <div className="compteur">
          <span className="compteur-nom">Tenue</span>
          <Duree
            programme={programme}
            cle={`${cle}:tenue`}
            exercice={ligne.tenue.exercice}
            nom={`${ligne.nom}, tenue`}
            prevu={ligne.tenue.prevu}
          />
        </div>
      )}
    </li>
  );
}

/** Un groupe de type et ses lignes, rangées par couche (minimum d'abord). */
export function GroupeDeLignes({
  programme,
  bloc,
  titre,
  lignes,
}: {
  programme: Programme;
  bloc: string;
  titre: string;
  lignes: readonly LigneDeCouche[];
}) {
  if (lignes.length === 0) return null;
  return (
    <Groupe titre={titre}>
      <ul className="liste">
        {lignes.map((l, i) => (
          <Ligne
            key={l.cle}
            programme={programme}
            bloc={bloc}
            ligne={l}
            changement={i > 0 && lignes[i - 1]?.couche !== l.couche}
          />
        ))}
      </ul>
    </Groupe>
  );
}

/**
 * Les lignes d'un bloc en couches, par type : respiration, mobilité, musculation, étirements,
 * boxe, puis le café. Les clés sont celles de `elementsDesCouches`.
 */
export function lignesParType(
  programme: Programme,
  couches: Couches,
): { titre: string; lignes: LigneDeCouche[] }[] {
  const respiration: LigneDeCouche[] = [];
  const mobilite: LigneDeCouche[] = [];
  const musculation: LigneDeCouche[] = [];
  const etirements: LigneDeCouche[] = [];
  const boxe: LigneDeCouche[] = [];
  const cafe: LigneDeCouche[] = [];
  const tenueDesEtirements = programme.regles_generales.etirements.tenue_s;
  // Séries déjà demandées par les couches d'avant, pour numéroter les séries en plus.
  const seriesVues = new Map<string, number>();
  for (const couche of COUCHES) {
    const c = couches[couche];
    if (c.respirations > 0)
      respiration.push({
        cle: 'respiration',
        couche,
        nom: 'Respiration',
        detail: `${c.respirations} respirations`,
      });
    else if (c.respiration_min > 0)
      respiration.push({
        cle: 'respiration',
        couche,
        nom: 'Respiration',
        duree: { exercice: null, prevu: c.respiration_min * 60 },
      });
    if (c.cafe_min > 0)
      cafe.push({
        cle: 'cafe',
        couche,
        nom: 'Café',
        detail: `${c.cafe_min} min, la marge`,
        sansCase: true,
      });
    for (const m of c.mobilite) {
      const nom = nomExercice(programme, m.exercice);
      const tenue = programme.exercices[m.exercice]?.fourchette_tenue_s;
      mobilite.push(
        m.a_la_cible
          ? {
              cle: m.exercice,
              couche,
              nom,
              detail: detailMouvement(programme, m),
              repetitions: { exercice: m.exercice, series: 1 },
              ...(tenue ? { tenue: { exercice: m.exercice, prevu: tenue[0] } } : {}),
            }
          : {
              cle: m.exercice,
              couche,
              nom: c.mobilite_au_ralenti ? `${nom}, au ralenti` : nom,
              duree: { exercice: m.exercice, prevu: m.duree_s ?? 30 },
            },
      );
    }
    for (const t of c.tenues)
      mobilite.push({
        cle: t.exercice,
        couche,
        nom: nomExercice(programme, t.exercice),
        duree: { exercice: t.exercice, prevu: t.duree_s },
      });
    if (c.neck_cars_par_sens !== null)
      mobilite.push({
        cle: 'neck_cars',
        couche,
        nom: 'Neck CARs',
        detail: `${c.neck_cars_par_sens} par sens`,
      });
    for (const e of c.musculation) {
      const debut = seriesVues.get(e.exercice) ?? 0;
      seriesVues.set(e.exercice, debut + e.series);
      musculation.push({
        cle: e.en_plus ? `${e.exercice}+` : e.exercice,
        couche,
        nom: e.en_plus
          ? `${nomExercice(programme, e.exercice)}, en plus`
          : nomExercice(programme, e.exercice),
        detail: detailExercice(programme, e),
        repetitions: { exercice: e.exercice, series: e.series, debut },
      });
    }
    for (const e of c.etirements)
      etirements.push({
        cle: e.en_plus ? `${e.exercice}+` : e.exercice,
        couche,
        nom: e.en_plus
          ? `${nomExercice(programme, e.exercice)}, en plus`
          : nomExercice(programme, e.exercice),
        detail: `${e.en_plus ? '+' : ''}${e.series} ×`,
        duree: { exercice: e.exercice, prevu: tenueDesEtirements },
      });
    if (c.boxe_rounds.length > 0)
      boxe.push({
        cle: 'boxe',
        couche,
        nom: 'Bloc boxe',
        detail: `rounds ${c.boxe_rounds.join(', ')}`,
      });
  }
  return [
    { titre: 'Respiration', lignes: respiration },
    { titre: 'Mobilité', lignes: mobilite },
    { titre: 'Musculation', lignes: musculation },
    { titre: 'Étirements', lignes: etirements },
    { titre: 'Boxe', lignes: boxe },
    // Le café, une marge, se prend après la séance (décision du 25/10/2026).
    { titre: 'Café', lignes: cafe },
  ];
}

/** Un bloc en couches, par type. */
export function ParType({
  programme,
  bloc,
  couches,
}: {
  programme: Programme;
  bloc: string;
  couches: Couches;
}) {
  return (
    <>
      {lignesParType(programme, couches).map((g) => (
        <GroupeDeLignes
          key={g.titre}
          programme={programme}
          bloc={bloc}
          titre={g.titre}
          lignes={g.lignes}
        />
      ))}
    </>
  );
}

/** Ne garde que les mouvements d'un bloc, sans le préfixe « bloc: ». */
export function faitsDuBloc(faits: Readonly<Record<string, boolean>>, bloc: string) {
  const prefixe = `${bloc}:`;
  return Object.fromEntries(
    Object.entries(faits)
      .filter(([cle]) => cle.startsWith(prefixe))
      .map(([cle, fait]) => [cle.slice(prefixe.length), fait]),
  );
}

/**
 * Raccourcis d'un bloc : un bouton par couche. Rempli : la couche atteinte, déduite des mouvements
 * cochés. Un appui coche tout jusqu'à cette couche ; un second appui revient à la couche d'avant.
 */
export function BoutonsDeCouche({
  bloc,
  elements,
  libelle,
}: {
  bloc: string;
  elements: readonly Element[];
  libelle: string;
}) {
  const saisie = useContext(SaisieContexte);
  const faits = Object.fromEntries(elements.map((e) => [e.cle, saisie.fait(`${bloc}:${e.cle}`)]));
  const atteinte = coucheAtteinte(elements, faits);
  const choisir = (couche: Couche | null) => {
    const cible = couche === atteinte && couche ? couchePrecedente(elements, couche) : couche;
    const changements = jusqua(elements, cible);
    saisie.marquer(
      Object.fromEntries(
        Object.entries(changements).map(([cle, fait]) => [`${bloc}:${cle}`, fait]),
      ),
    );
  };
  return (
    <div className="choix" role="group" aria-label={libelle}>
      {couchesPresentes(elements).map((c) => (
        <button
          key={c}
          type="button"
          data-couche={c}
          aria-pressed={atteinte === c}
          onClick={() => choisir(c)}
        >
          {LIBELLES_DE_COUCHE[c]}
        </button>
      ))}
    </div>
  );
}
