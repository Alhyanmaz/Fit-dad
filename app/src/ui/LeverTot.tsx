import type { Dispatch, SetStateAction } from 'react';
import type { Programme } from '../data/schema';
import type { DateIso } from '../domain/dates';
import type { JournalDuJour } from '../domain/journal';
import { ciblesDuNiveau, verdictDuMatin } from '../domain/leverTot';
import type { Niveau } from '../domain/niveau';
import { Carte, Choix, Groupe } from './composants';
import { dateLongue, heureCourte, heureLimite } from './libelles';

/** Heure du téléphone, « HH:MM ». */
function maintenant(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Onglet « Lever tôt » (docs/SPEC.md §5.3 et §6.7) : la saisie du matin se fait ici (décision du
 * 18/10/2026), avec le réveil (premier réveil ou snooze) ; le verdict tient compte de la séance du
 * matin, validée sur l'écran Aujourd'hui.
 */
export function LeverTot({
  programme,
  date,
  niveau,
  journal,
  setJournal,
}: {
  programme: Programme;
  date: DateIso;
  niveau: Niveau;
  journal: JournalDuJour;
  setJournal: Dispatch<SetStateAction<JournalDuJour>>;
}) {
  const regles = programme.lever_tot;
  const cibles = ciblesDuNiveau(programme, niveau);
  const lever = journal.lever;
  const changer = (modif: Partial<JournalDuJour['lever']>) =>
    setJournal((j) => ({ ...j, lever: { ...j.lever, ...modif } }));
  const plancherFait = journal.matin !== null;
  const verdict = verdictDuMatin(programme, niveau, {
    leve: lever.leve,
    nuit: lever.nuit,
    plancherFait,
  });
  const nuitDifficile = regles.qualites_nuit.find((q) => q.id === lever.nuit)?.difficile ?? false;
  const limite = heureLimite(cibles.lever, regles.tolerance_lever_min);
  const explication =
    verdict === 'manque'
      ? `Lever après ${limite}.`
      : verdict === 'partiel'
        ? "Lever tenu ; la séance du matin n'est pas encore validée (écran Aujourd'hui)."
        : verdict === 'reussi'
          ? plancherFait
            ? 'Lever tenu, séance du matin faite.'
            : nuitDifficile
              ? 'Lever tenu ; nuit difficile, la séance devient facultative.'
              : 'Lever tenu : à ce niveau, le lever suffit.'
          : 'Saisis ton heure de lever.';
  const titreVerdict =
    verdict === 'reussi'
      ? 'Réussi'
      : verdict === 'partiel'
        ? 'Partiel'
        : verdict === 'manque'
          ? 'Manqué'
          : 'En attente';
  const niveauTexte =
    'ancrage' in niveau ? `Ancrage · ${niveau.ancrage}` : `Palier ${niveau.palier}`;

  return (
    <main className="ecran">
      <header className="entete">
        <h1>Lever tôt</h1>
        <p className="discret">
          {dateLongue(date)} · {niveauTexte}
        </p>
      </header>

      <Carte titre="Cibles du niveau">
        <p className="horaires">
          Lever <strong>{heureCourte(cibles.lever)}</strong>, à {regles.tolerance_lever_min} min
          près
          <br />
          Coucher <strong>{heureCourte(cibles.coucher)}</strong>
        </p>
      </Carte>

      <Carte titre="Ce matin">
        <Groupe titre="Couché hier à">
          <input
            className="champ-heure"
            type="time"
            aria-label="Couché hier à"
            value={lever.couche ?? ''}
            onChange={(e) => changer({ couche: e.target.value || null })}
          />
        </Groupe>
        <Groupe titre="Levé à">
          <div className="champ-ligne">
            <input
              className="champ-heure"
              type="time"
              aria-label="Levé à"
              value={lever.leve ?? ''}
              onChange={(e) => changer({ leve: e.target.value || null })}
            />
            <button
              type="button"
              className="interrupteur"
              onClick={() => changer({ leve: maintenant() })}
            >
              Maintenant
            </button>
          </div>
        </Groupe>
        <Groupe titre="Réveil">
          <Choix
            libelle="Réveil"
            valeur={lever.reveil}
            surChoix={(reveil) => changer({ reveil })}
            options={regles.reveils.map((r) => ({ valeur: r.id, libelle: r.label }))}
          />
        </Groupe>
        <Groupe titre="Nuit">
          <Choix
            libelle="Nuit"
            valeur={lever.nuit}
            surChoix={(nuit) => changer({ nuit })}
            options={regles.qualites_nuit.map((q) => ({ valeur: q.id, libelle: q.label }))}
          />
        </Groupe>
        <Groupe titre="Lumière au lever">
          <Choix
            libelle="Lumière au lever"
            valeur={lever.lumiere}
            surChoix={(lumiere) => changer({ lumiere })}
            options={regles.lumiere.map((l) => ({ valeur: l.id, libelle: l.label }))}
          />
        </Groupe>
        <Groupe titre="Note">
          <textarea
            className="champ-note"
            aria-label="Note"
            rows={2}
            value={lever.note}
            onChange={(e) => changer({ note: e.target.value })}
          />
        </Groupe>
      </Carte>

      <Carte titre="Verdict du matin">
        <p className="verdict" aria-live="polite">
          {titreVerdict}
        </p>
        <p className="discret">{explication}</p>
      </Carte>

      <Carte titre="Règles">
        <ul className="regles">
          {regles.regles_affichees.map((regle) => (
            <li key={regle}>{regle}</li>
          ))}
        </ul>
      </Carte>

      <p className="discret note">Enregistré sur ce téléphone, rien ne sort.</p>
    </main>
  );
}
