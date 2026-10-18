import { useState } from 'react';
import type { Programme } from '../data/schema';
import { joursEntre, type DateIso } from '../domain/dates';
import { ciblesDuNiveau } from '../domain/leverTot';
import { estEnAncrage, type Niveau } from '../domain/niveau';
import { critereDePassage, niveauSuivant, passageAuPlusTot } from '../domain/passage';
import { Carte } from './composants';
import { dateLongue, heureCourte } from './libelles';

const nomDuNiveau = (niveau: Niveau) =>
  estEnAncrage(niveau) ? niveau.ancrage : `palier ${niveau.palier}`;

/**
 * Passage au niveau suivant (décisions du 18/10/2026) : proposé au plus tôt un cycle après le début
 * du niveau, si le critère commun est rempli ; José peut aussi le forcer à tout moment. Toujours
 * après confirmation. Les jours tenus des jours passés viendront avec l'enregistrement.
 */
export function Passage({
  programme,
  niveau,
  depuis,
  jour,
  joursTenus,
  surPassage,
}: {
  programme: Programme;
  niveau: Niveau;
  depuis: DateIso;
  jour: DateIso;
  joursTenus: ReadonlySet<DateIso>;
  surPassage: (suivant: Niveau) => void;
}) {
  const [confirmer, setConfirmer] = useState(false);
  const suivant = niveauSuivant(programme, niveau);
  if (!suivant) return null;
  const nom = nomDuNiveau(suivant);
  const auPlusTot = passageAuPlusTot(programme, niveau, depuis);
  const { requis, rempli } = critereDePassage(programme, joursTenus, jour);
  const propose = rempli && joursEntre(auPlusTot, jour) >= 0;
  const cibles = ciblesDuNiveau(programme, suivant);
  // L'écran des paliers arrive avec le jalon J5 : pas de passage au palier 1 d'ici là.
  const ecranPret = estEnAncrage(suivant);
  return (
    <Carte titre={`Passage à ${nom}`}>
      <p className="discret">
        Au plus tôt {dateLongue(auPlusTot).toLowerCase()}, si {requis} jours sont tenus sur les{' '}
        {programme.passages.fenetre_jours} derniers, dont les deux week-ends.
      </p>
      {!ecranPret ? (
        <p className="discret">L'écran du {nom} arrive avec le jalon J5.</p>
      ) : confirmer ? (
        <div className="confirmation" role="group" aria-label="Confirmer le passage">
          <p>
            {propose ? `Passer à ${nom} ?` : `Forcer le passage à ${nom} dès aujourd'hui ?`} Lever{' '}
            {heureCourte(cibles.lever)}, coucher {heureCourte(cibles.coucher)}.
          </p>
          <div className="choix">
            <button
              type="button"
              className="confirmer"
              onClick={() => {
                setConfirmer(false);
                surPassage(suivant);
              }}
            >
              Confirmer
            </button>
            <button type="button" onClick={() => setConfirmer(false)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="interrupteur" onClick={() => setConfirmer(true)}>
          {propose ? `Passer à ${nom}` : 'Forcer le passage'}
        </button>
      )}
    </Carte>
  );
}
