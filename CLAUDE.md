# Fit-dad — consignes pour Claude Code

## Le projet

- Appli personnelle de suivi d'entraînement de José : PWA installée sur Android, hors ligne, sans compte ni serveur.
- **v1 en ligne** à la racine du dépôt (`index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `README.md`) : https://alhyanmaz.github.io/Fit-dad/. Le code de l'appli est lisible dans `index.html`, après la bibliothèque React. **Ne pas modifier la v1 avant le jalon J6.**
- **v2 en construction** dans `app/`, selon `docs/SPEC.md`. Son build est commité dans `v2/` et servi sous https://alhyanmaz.github.io/Fit-dad/v2/.

## À lire au début de chaque session

1. `docs/reprise.md` : où on en est, prochaine étape.
2. `docs/SPEC.md` : cahier des charges, règles métier, scénarios de recette, jalons.
3. `docs/decisions.md` : décisions déjà prises ; ne pas les rouvrir sans raison.

Selon la tâche : `docs/PROGRAMME.md` (contenu du programme, il fait foi), `data/programme.json` (mêmes valeurs, structurées), `docs/MIGRATION.md`, `legacy/` (références en lecture seule).

## Travailler avec José

- José est architecte, maître d'œuvre ; il n'est pas développeur. Il travaille depuis son téléphone (Pixel 10 Pro XL) et découvre Claude Code avec ce projet.
- Tout en français, tutoiement, phrases courtes, conclusion d'abord. Pas de jargon sans l'expliquer en une ligne.
- Une session = un jalon ou une partie de jalon = une branche = une PR vers `main`. Description de PR lisible sur téléphone : ce qui change, comment le tester, ce qui reste, « tests verts, build à jour ».
- Quand José réfléchit à voix haute, propose sans modifier ; ne modifie que sur demande explicite.
- Esprit critique : si une demande contredit le programme, la SPEC ou une décision, le dire avant de coder.
- Étiqueter ce qui n'est pas évident : [Sourcé] avec lien, [Non vérifié], [Interprétation].
- Une question à la fois, avec une proposition par défaut.
- Fin de session : mettre à jour `docs/reprise.md` (état, prochaine étape, questions ouvertes) et, si une décision a été prise, `docs/decisions.md`.

## Règles du programme, jamais enfreintes

Les mêmes sept règles figurent dans `docs/SPEC.md` §4.

1. La progression dépend de la performance, jamais de la date.
2. Étirements : 30 s, jamais plus ; on ajoute des séries.
3. Une seule hausse par semaine sur le bas de jambe (corde, mollets, tibialis) ; le sac est hors de la règle.
4. L'appli propose, José valide : aucun niveau ne change tout seul. Les changements de charge ou de variante ne sont jamais proposés : José les fait (« Ajuster », semaine de test).
5. Pas de musculation le soir.
6. Aucun critère de douleur, aucune consigne d'arrêt dans l'appli : José s'en charge.
7. Aucune donnée ne sort du téléphone, sauf par l'export lancé par José.

## Choix techniques

Détail et raisons dans `docs/decisions.md`.

- `app/` : Vite, React, TypeScript strict, `vite-plugin-pwa`, Dexie (IndexedDB, base `fit-dad-v2`), zod, Vitest, ESLint, Prettier.
- Versions figées dans `app/package-lock.json`, montées seulement lors d'une session dédiée. TypeScript 6.0 tant que `typescript-eslint` n'accepte pas la 7. Dexie et `vite-plugin-pwa` arrivent au J3.
- Règles métier en fonctions pures dans `app/src/domain`, couvertes par les scénarios de `docs/SPEC.md` §9. Écrire le test avant ou avec la règle.
- Valeurs du programme lues dans `data/programme.json`, validé au chargement.
- Aucune requête réseau à l'exécution (pas de police en ligne, pas de statistiques).
- **Publication sans GitHub Actions** : les sessions cloud ne peuvent pas pousser de fichiers sous `.github/workflows/` (ticket ouvert anthropics/claude-code#61189). Pages reste en « Deploy from a branch », `main`, racine. Vite : `base: '/Fit-dad/v2/'`, `outDir: '../v2'`. Avant chaque PR : tests, puis build, puis commit du dossier `v2/` à part (« build v2 »).
- Navigation interne sans dépendre du chemin de l'URL (pas de repli pour les applis à une page sur Pages).

## Commandes

Toutes dans `app/` (`cd app`), avec Node 22.12 ou plus récent.

- Installation : `npm ci`. Automatique au démarrage d'une session cloud (`scripts/install_pkgs.sh`, journal dans `/tmp/fit-dad-npm-install.log`).
- Développement : `npm run dev`, puis http://localhost:5173/Fit-dad/v2/.
- Vérification complète avant chaque commit : `npm run check` (types, lint, mise en forme, tests).
- Séparément : `npm test`, `npm run typecheck`, `npm run lint`, `npm run format` (corrige) ou `npm run format:check`.
- Build vers `../v2` : `npm run build`. Le build refuse tout autre dossier de sortie (`app/config/sortie.ts`), parce qu'il vide ce dossier avant d'écrire. Ensuite, commit du dossier `v2/` seul, message « build v2 ».
- Contrôle de la v1 avant chaque PR : `git diff main -- index.html sw.js manifest.webmanifest icons README.md .nojekyll` doit être vide.

## Arborescence

```
/                     v1 en ligne (ne pas modifier avant J6)
app/                  code de la v2 : src/data (programme et son schéma zod), src/domain (règles métier, fonctions pures), src/ui (écrans) ; src/storage à venir (J3) ; config/ (sécurité du build)
v2/                   build de la v2, servi sous /Fit-dad/v2/ (généré, ne pas éditer à la main)
data/programme.json   programme structuré
docs/                 PROGRAMME, SPEC, MIGRATION, decisions, reprise, DEMARRAGE, relecture-programme (J1)
legacy/               lever-tot.html (artefact « Lever tôt ») ; suivi-pied-mollet.jsx (source de l'artefact claude.ai d'origine, sans l'export ni les ajouts de la v1 en ligne) ; v1.html à partir du J6 (copie consultable de la v1)
.claude/ et scripts/  installation des dépendances au démarrage des sessions cloud
```

## Pièges connus

- **Dépôt public** : jamais de sauvegarde, d'export « Lever tôt » ni de note personnelle dans le dépôt (voir `.gitignore`).
- **Données de la v1** : `localStorage` de `alhyanmaz.github.io`, clés préfixées `suivi_app_`. La v2 ne les lit pas, ne les écrit pas, ne les efface pas : pas de `localStorage.clear()`, pas d'en-tête `Clear-Site-Data`.
- **Service worker de la v1** : `sw.js`, portée `/Fit-dad/`, couvre aussi `/Fit-dad/v2/`, et efface tous les autres caches à son activation. Ne pas le modifier ni le réenregistrer avant J6 ; au J6, suivre la liste de contrôle de `docs/SPEC.md` §8.1 (la v2 remplace la v1 à la racine).
- **Branches** : GitHub Pages publie `main` (vérifié le 07/10/2026 dans l'historique des déploiements). La branche par défaut du dépôt est `Mainold`, figée au commit `d861224` (la v1, sans ce fichier) : le 08/10, GitHub a refusé de la passer sur `main` (« Could not change default branch »), cause inconnue. Toujours partir de `main` et ouvrir les PR vers `main`, en choisissant `main` explicitement comme base. À retenter après la fusion du J0 ; si ça marche, supprimer `Mainold`.
- **Environnement cloud temporaire** : ce qui n'est pas poussé sur GitHub est perdu. Commiter et pousser au fil de l'eau.
