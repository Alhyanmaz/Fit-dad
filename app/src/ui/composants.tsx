import { createContext, useContext, type ReactNode } from 'react';
import type { Programme } from '../data/schema';
import { COUCHES, type Couche, type Couches } from '../domain/couches';
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
 * Briques communes aux écrans (décisions de José du 18/10/2026). Chaque bloc dit d'abord ce qu'il
 * est (mobilité, musculation, étirements, cardio…) ; la couche de chaque exercice se lit à sa
 * couleur, expliquée par la légende : minimum en vert, principale en orange, bonus en rouge.
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

/** Boutons à choix unique ; un second appui annule. Le point de couleur rappelle la couche, s'il y en a une. */
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

export function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="groupe">
      <h3 className="titre-groupe">{titre}</h3>
      {children}
    </div>
  );
}

/** Une ligne d'exercice ; `couche` colore son nom, `changement` marque le début d'une autre couche. */
export function Ligne({
  nom,
  detail,
  couche,
  changement = false,
  children,
}: {
  nom: string;
  detail: ReactNode;
  couche?: Couche;
  changement?: boolean;
  children?: ReactNode;
}) {
  const classes = ['ligne', couche ? `couche-${couche}` : '', changement ? 'changement' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <li className={classes} {...(couche ? { 'data-couche': couche } : {})}>
      <div className="ligne-tete">
        <span className="nom">{nom}</span>
        {detail !== '' && <span className="detail">{detail}</span>}
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

/** Une ligne à afficher : sa couche, et les séries qu'une couche suivante y ajoute. */
export interface LigneDeCouche {
  cle: string;
  couche: Couche;
  nom: string;
  detail: string;
  /** Séries en plus, dans une couche suivante (« +1 × 30 s » en rouge). */
  enPlus?: { couche: Couche; detail: string }[];
  enfant?: ReactNode;
}

/** Un groupe de type (« Mobilité »…) : ses lignes rangées par couche, minimum d'abord. */
export function GroupeDeLignes({ titre, lignes }: { titre: string; lignes: LigneDeCouche[] }) {
  if (lignes.length === 0) return null;
  return (
    <Groupe titre={titre}>
      <ul className="liste">
        {lignes.map((l, i) => (
          <Ligne
            key={l.cle}
            nom={l.nom}
            couche={l.couche}
            changement={i > 0 && lignes[i - 1]?.couche !== l.couche}
            detail={
              l.enPlus && l.enPlus.length > 0 ? (
                <>
                  {l.detail}
                  {l.enPlus.map((p) => (
                    <span key={p.couche} className={`en-plus couche-${p.couche}`}>
                      {' '}
                      {p.detail}
                    </span>
                  ))}
                </>
              ) : (
                l.detail
              )
            }
          >
            {l.enfant}
          </Ligne>
        ))}
      </ul>
    </Groupe>
  );
}

/** Ajoute une ligne, ou fusionne des séries en plus dans la ligne du même exercice. */
function ajouter(lignes: LigneDeCouche[], ligne: LigneDeCouche, enPlus: boolean) {
  const existante = enPlus ? lignes.find((l) => l.cle === ligne.cle) : undefined;
  if (existante) {
    existante.enPlus = [
      ...(existante.enPlus ?? []),
      { couche: ligne.couche, detail: ligne.detail },
    ];
  } else {
    lignes.push(ligne);
  }
}

/**
 * Un bloc en couches, présenté par type : respiration et café, mobilité, musculation, étirements,
 * boxe. Dans chaque type, le minimum d'abord, puis la principale, puis le bonus.
 */
export function ParType({
  programme,
  bloc,
  couches,
}: {
  programme: Programme;
  bloc: string;
  couches: Couches;
}) {
  const respiration: LigneDeCouche[] = [];
  const mobilite: LigneDeCouche[] = [];
  const musculation: LigneDeCouche[] = [];
  const etirements: LigneDeCouche[] = [];
  const boxe: LigneDeCouche[] = [];
  for (const couche of COUCHES) {
    const c = couches[couche];
    if (c.respiration_min > 0)
      respiration.push({
        cle: 'respiration',
        couche,
        nom: 'Respiration',
        detail: `${c.respiration_min} min`,
      });
    if (c.cafe_min > 0)
      respiration.push({ cle: 'cafe', couche, nom: 'Café', detail: `${c.cafe_min} min, la marge` });
    for (const m of c.mobilite)
      mobilite.push({
        cle: m.exercice,
        couche,
        nom: nomExercice(programme, m.exercice),
        detail: c.mobilite_au_ralenti
          ? `${detailMouvement(programme, m)}, au ralenti`
          : detailMouvement(programme, m),
      });
    for (const t of c.tenues)
      mobilite.push({
        cle: t.exercice,
        couche,
        nom: nomExercice(programme, t.exercice),
        detail: dureeTexte(t.duree_s),
      });
    if (c.neck_cars_par_sens !== null)
      mobilite.push({
        cle: 'neck_cars',
        couche,
        nom: 'Neck CARs',
        detail: `${c.neck_cars_par_sens} par sens`,
      });
    for (const e of c.musculation)
      ajouter(
        musculation,
        {
          cle: e.exercice,
          couche,
          nom: nomExercice(programme, e.exercice),
          detail: detailExercice(programme, e),
          ...(e.en_plus
            ? {}
            : {
                enfant: (
                  <Compteurs
                    programme={programme}
                    bloc={bloc}
                    exercice={e.exercice}
                    series={e.series}
                  />
                ),
              }),
        },
        e.en_plus === true,
      );
    for (const e of c.etirements)
      ajouter(
        etirements,
        {
          cle: e.exercice,
          couche,
          nom: nomExercice(programme, e.exercice),
          detail: detailEtirement(programme, e),
        },
        e.en_plus === true,
      );
    if (c.boxe_rounds.length > 0)
      boxe.push({
        cle: 'boxe',
        couche,
        nom: 'Bloc boxe',
        detail: `rounds ${c.boxe_rounds.join(', ')}`,
      });
  }
  return (
    <>
      <GroupeDeLignes titre="Respiration et café" lignes={respiration} />
      <GroupeDeLignes titre="Mobilité" lignes={mobilite} />
      <GroupeDeLignes titre="Musculation" lignes={musculation} />
      <GroupeDeLignes titre="Étirements" lignes={etirements} />
      <GroupeDeLignes titre="Boxe" lignes={boxe} />
    </>
  );
}

/** Validation d'un bloc en couches : la couche atteinte, parmi celles qui ont un contenu. */
export function ChoixDeCouche({
  couches,
  libelle,
  valeur,
  surChoix,
}: {
  couches: readonly Couche[];
  libelle: string;
  valeur: Couche | null;
  surChoix: (valeur: Couche | null) => void;
}) {
  return (
    <Choix
      libelle={libelle}
      valeur={valeur}
      surChoix={surChoix}
      options={couches.map((c) => ({ valeur: c, libelle: LIBELLES_DE_COUCHE[c], couche: c }))}
    />
  );
}
