# Reprise de la session (07/10/2026)

## État

- Kit de démarrage sur la branche `kit-v2` : `CLAUDE.md`, `docs/`, `data/programme.json`, `legacy/`, `.claude/`, `scripts/`, `.gitignore`.
- Revue du kit faite avec José le 07/10 : les 10 choix « à valider » du 06/10 et les 10 questions de la SPEC §11 sont tranchés (`docs/decisions.md`, entrée du 07/10). Documents mis à jour : `docs/PROGRAMME.md`, `docs/SPEC.md`, `data/programme.json`, `docs/MIGRATION.md`, `docs/DEMARRAGE.md`, `CLAUDE.md`.
- Aucune ligne de code de la v2. La v1 est en ligne et intacte.
- `data/programme.json` est un brouillon : il sera relu contre `docs/PROGRAMME.md` au jalon J1.

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Déroulé prévu : jalon J0, le socle

Travailler sur la branche `kit-v2` ; la PR du J0 part de `kit-v2` vers `main` et contient le kit et le socle.

1. ~~Lire le kit, signaler à José ce qui paraît contradictoire ou flou, une question à la fois.~~ Fait le 07/10.
2. Proposer le plan du J0 et attendre le feu vert de José. **En cours : plan proposé le 07/10, en attente du feu vert.**
Plan du J0 proposé à José le 07/10 (à dérouler après son « ok, vas-y ») :

3. Créer `app/` : Vite, React 19, TypeScript 6.0 strict, ESLint (`typescript-eslint`) et Prettier, Vitest. Versions figées dans `package-lock.json`. Si Vite 8 pose problème à l'installation, redescendre d'une version et le signaler.
4. Configurer Vite : `base: '/Fit-dad/v2/'`, `outDir: '../v2'`, `emptyOutDir: true`, avec une sécurité : le build refuse de démarrer si le dossier de sortie n'est pas exactement `<dépôt>/v2`.
5. `data/programme.json` importé au build (aucune requête réseau). Contrôle minimal : 41 exercices et la version (`meta.version`) ; le schéma zod complet vient au J1. Autoriser Vite à lire `../data`.
6. Page d'accueil minimale : « Fit-dad v2 — Programme chargé : 41 exercices » et la version du programme. Thème sombre (fond `#161B19`), textes de 16 px au moins, police système. Pas de service worker ni de manifeste au J0 (J3).
7. Tests : types, lint, mise en forme, un test de chargement du programme (41 exercices) et un test de la sécurité du dossier de sortie.
8. Vérification dans Chromium au format téléphone : `/Fit-dad/v2/` et la v1 à la racine, servies en local comme sur Pages ; fichiers de la v1 identiques à `main` (`git diff main -- index.html sw.js manifest.webmanifest icons README.md` vide).
9. Build dans `v2/`, commit à part « build v2 », pousser.
10. Compléter « Commandes » dans `CLAUDE.md` ; vérifier que `scripts/install_pkgs.sh` installe bien les dépendances maintenant que `app/package.json` existe ; mettre à jour ce fichier.
11. Ouvrir la PR `kit-v2` → `main` en choisissant `main` comme base (ce n'est pas encore la branche par défaut). Elle contient le kit, les décisions du 07/10 et le socle. Résumé pour José avec les deux adresses à vérifier après la fusion : `https://alhyanmaz.github.io/Fit-dad/` (v1 inchangée) et `https://alhyanmaz.github.io/Fit-dad/v2/`. Finir par « tests verts, build à jour ».

Hors J0 : schéma zod (J1), règles (J2), écrans, stockage, hors-ligne et « Ajuster » (J3).

## Questions ouvertes

- Aucune bloquante : la SPEC §11 est vide.
- À confirmer au J5 : la proposition « redescendre de 2 répétitions », gardée par défaut (`docs/decisions.md`, fin de l'entrée du 07/10).
- Le document Claude Docs du programme (révision 44) ne contient pas les décisions du 07/10 ; `docs/PROGRAMME.md` fait foi. À mettre à jour par José, ou à demander à Claude.
