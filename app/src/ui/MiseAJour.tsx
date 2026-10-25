import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Hors ligne et mises à jour (docs/SPEC.md §8) : quand une nouvelle version est prête, un bandeau
 * propose de recharger ; rien ne change sans l'appui de José.
 */
export function MiseAJour() {
  const {
    needRefresh: [aRecharger, setARecharger],
    updateServiceWorker,
  } = useRegisterSW();
  if (!aRecharger) return null;
  return (
    <div className="mise-a-jour" role="status">
      <span>Nouvelle version prête.</span>
      <button type="button" onClick={() => void updateServiceWorker(true)}>
        Recharger
      </button>
      <button type="button" onClick={() => setARecharger(false)}>
        Plus tard
      </button>
    </div>
  );
}
