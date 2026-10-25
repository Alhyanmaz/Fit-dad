/**
 * Jauge circulaire : une valeur sur un total (jours tenus sur 7). La piste est un orange sombre,
 * le remplissage l'orange de l'appli ; le chiffre, au centre, reste dans la couleur du texte.
 */
export function Anneau({
  valeur,
  total,
  libelle,
}: {
  valeur: number;
  total: number;
  libelle: string;
}) {
  const rayon = 52;
  const epaisseur = 10;
  const circonference = 2 * Math.PI * rayon;
  const part = total > 0 ? Math.min(1, Math.max(0, valeur / total)) : 0;
  return (
    <div className="anneau" role="img" aria-label={`${libelle} : ${valeur} sur ${total}`}>
      <svg viewBox="0 0 128 128" width="128" height="128" aria-hidden="true">
        <circle
          cx="64"
          cy="64"
          r={rayon}
          fill="none"
          stroke="var(--orange-piste)"
          strokeWidth={epaisseur}
        />
        {part > 0 && (
          <circle
            cx="64"
            cy="64"
            r={rayon}
            fill="none"
            stroke="var(--orange)"
            strokeWidth={epaisseur}
            strokeLinecap="round"
            strokeDasharray={`${part * circonference} ${circonference}`}
            transform="rotate(-90 64 64)"
          />
        )}
      </svg>
      <div className="anneau-centre" aria-hidden="true">
        <span className="anneau-valeur">{valeur}</span>
        <span className="anneau-total">sur {total}</span>
      </div>
    </div>
  );
}
