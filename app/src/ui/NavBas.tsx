import type { ReactNode } from 'react';

export type Ecran = 'aujourdhui' | 'lever';

/** Barre du bas : navigation par état, sans dépendre du chemin de l'URL (docs/SPEC.md §5.1). */
export function NavBas({ ecran, surEcran }: { ecran: Ecran; surEcran: (ecran: Ecran) => void }) {
  const bouton = (cible: Ecran, libelle: string, icone: ReactNode) => (
    <button
      type="button"
      className={`nav-item${ecran === cible ? ' actif' : ''}`}
      aria-current={ecran === cible ? 'page' : undefined}
      onClick={() => surEcran(cible)}
    >
      {icone}
      {libelle}
    </button>
  );
  return (
    <nav className="nav-bas" aria-label="Écrans">
      {bouton(
        'aujourdhui',
        "Aujourd'hui",
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="3" />
          <path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4" />
        </svg>,
      )}
      {bouton(
        'lever',
        'Lever tôt',
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="13" r="4" />
          <path d="M12 3v2M4.9 6.4l1.4 1.4M19.1 6.4l-1.4 1.4M3 13h2M19 13h2M5 20h14" />
        </svg>,
      )}
      <span className="nav-item" aria-disabled="true">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 20V12M10 20V7M15 20v-5M20 20V4" />
        </svg>
        Progrès
      </span>
    </nav>
  );
}
