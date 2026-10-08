# Reprise de la session (08/10/2026)

## État

- **J0 terminé** sur la branche `kit-v2` : socle de la v2 dans `app/` (Vite 8, React 19, TypeScript 6.0 strict, ESLint, Prettier, Vitest ; versions figées), build commité dans `v2/`. La page d'accueil lit `data/programme.json` et affiche « Programme chargé : 41 exercices ».
- PR `kit-v2` → `main` ouverte : elle contient le kit, les décisions du 07/10 et le socle. **À fusionner par José**, puis vérifier sur le téléphone :
  - `https://alhyanmaz.github.io/Fit-dad/` : la v1, inchangée ;
  - `https://alhyanmaz.github.io/Fit-dad/v2/` : la page d'accueil de la v2.
- Vérifié dans la session : 7 tests verts, types, lint et mise en forme OK ; build reproductible ; rendu à 360, 412 et 430 px dans Chromium ; aucune requête réseau extérieure dans la v2 ; fichiers de la v1 identiques à `main` ; installation automatique des dépendances (`scripts/install_pkgs.sh`) testée.
- Revue du kit faite avec José le 07/10 : décisions dans `docs/decisions.md` (entrée du 07/10).
- `data/programme.json` reste un brouillon : il sera relu contre `docs/PROGRAMME.md` au jalon J1.

## Prochaine étape : jalon J1, le programme

Après la fusion de la PR du J0, nouvelle session, partir de `main` à jour :

```
Pars de la branche main à jour. Lis CLAUDE.md et docs/reprise.md. On attaque le jalon J1 de docs/SPEC.md §10. Propose le plan avant de coder.
```

Contenu du J1 (`docs/SPEC.md` §10) : schéma zod de `data/programme.json`, relecture ligne à ligne contre `docs/PROGRAMME.md`, écarts signalés à José et tranchés avec lui.

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Questions ouvertes

- **Branche par défaut** : `Mainold`, figée sur l'ancienne version. Le 08/10, GitHub a refusé de la passer sur `main` (« Could not change default branch »), cause inconnue. À retenter après la fusion du J0 ; si ça marche, supprimer `Mainold`. En attendant, toujours viser `main` explicitement.
- À confirmer au J5 : la proposition « redescendre de 2 répétitions », gardée par défaut (`docs/decisions.md`, fin de l'entrée du 07/10).
- Le document Claude Docs du programme (révision 44) ne contient pas les décisions du 07/10 ; `docs/PROGRAMME.md` fait foi. À mettre à jour par José, ou à demander à Claude.
