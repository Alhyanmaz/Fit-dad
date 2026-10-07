# Reprise de la session (07/10/2026)

## État

- Kit de démarrage sur la branche `kit-v2` : `CLAUDE.md`, `docs/`, `data/programme.json`, `legacy/`, `.claude/`, `scripts/`, `.gitignore`.
- Aucune ligne de code de la v2. La v1 est en ligne et intacte.
- `data/programme.json` est un brouillon : il sera relu contre `docs/PROGRAMME.md` au jalon J1.

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Déroulé prévu : jalon J0, le socle

Travailler sur la branche `kit-v2` ; la PR du J0 part de `kit-v2` vers `main` et contient le kit et le socle.

1. Lire `CLAUDE.md`, `docs/SPEC.md` et `docs/decisions.md`. Signaler à José ce qui paraît contradictoire ou flou, une question à la fois, avec une proposition.
2. Proposer le plan du J0 et attendre le feu vert de José.
3. Créer `app/` : Vite, React, TypeScript strict, ESLint, Prettier, Vitest, un premier test.
4. Configurer Vite : `base: '/Fit-dad/v2/'`, `outDir: '../v2'`, `emptyOutDir: true`.
5. Page d'accueil minimale qui lit `data/programme.json` et affiche « Programme chargé : 41 exercices » (la validation complète vient au J1).
6. Tests, puis build, puis commit du dossier `v2/` à part (« build v2 »). Pousser.
7. Compléter la section « Commandes » de `CLAUDE.md`, puis mettre à jour ce fichier.
8. Ouvrir la PR `kit-v2` → `main`, en choisissant `main` comme base : ce n'est pas encore la branche par défaut du dépôt (`CLAUDE.md`, « Branches »). Résumé pour José, avec les deux adresses à vérifier après la fusion : `https://alhyanmaz.github.io/Fit-dad/` (v1 inchangée) et `https://alhyanmaz.github.io/Fit-dad/v2/`.

## Questions ouvertes

Non bloquantes pour le J0 : `docs/SPEC.md` §11.
