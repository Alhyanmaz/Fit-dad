# Reprise de la session (13/10/2026)

## État

- **J0 terminé et fusionné** (PR #1, le 08/10) : la v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/`, la v1 est intacte à la racine.
- **J1 en cours** sur la branche `j1-programme`, PR #2 en brouillon vers `main` : schéma zod de `data/programme.json`, relecture du programme (`docs/relecture-programme.md`, 4 questions en attente), 18 tests verts, build à jour.
- **13/10 : cycles d'ancrage décidés** (`docs/decisions.md`) et écrits dans `docs/PROGRAMME.md`. Ils ne sont pas encore dans `data/programme.json`, son schéma ni `docs/SPEC.md`.
- **GitHub bloqué depuis le 09/10** : toute requête de la session renvoie « Sorry. Your account was suspended » (erreur 403), jusqu'au 13/10 compris. Dernier commit poussé : `cbf8416` (« build v2 »). Les commits du 13/10 sont seulement locaux. José a reçu une copie complète du dépôt (fichier `.bundle`).

## Prochaine étape

1. José vérifie son compte GitHub : connexion à github.com, e-mails de GitHub. S'il est suspendu : demande de réactivation (formulaire « Appeal and Reinstatement »), puis reconnexion de GitHub à Claude.
2. Dès que l'accès revient : pousser `j1-programme`.
3. Claude reporte les cycles d'ancrage dans `data/programme.json`, le schéma (`app/src/data/schema.ts`, tests) et `docs/SPEC.md` (§6, scénarios du §9), dans la PR du J1.
4. José répond aux 4 questions de `docs/relecture-programme.md`, une à la fois ; Claude les reporte, refait tests et build, passe la PR en « prête » ; José fusionne.
5. Ensuite : jalon J2 (moteur de règles), dans une nouvelle session partie de `main` à jour :

```
Pars de la branche main à jour. Lis CLAUDE.md et docs/reprise.md. On attaque le jalon J2 de docs/SPEC.md §10. Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Questions ouvertes

- **GitHub** : compte suspendu ou simple souci de connexion ? Cause inconnue. Sans accès, rien ne peut être poussé ni fusionné.
- **J1** : les 4 questions de `docs/relecture-programme.md` (swing selon les jours, « série courte » du cossack et du reverse table top, séries du one arm hang, séries fixes des ajouts).
- **Ancrage** : date de début choisie par José, pour compter les 10 semaines.
- **Poids de l'appli** : zod ajoute environ 31 Ko compressés (110 Ko au total). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
- **Branche par défaut** : `Mainold`, figée sur l'ancienne version (commit `d861224`). GitHub refuse de la passer sur `main` (« Could not change default branch ») ; cause inconnue. Sans conséquence tant que chaque session vise `main` explicitement.
- À confirmer au J5 : la proposition « redescendre de 2 répétitions », gardée par défaut (`docs/decisions.md`, fin de l'entrée du 07/10).
- Le document Claude Docs du programme (révision 44) ne contient ni les décisions du 07/10 ni les cycles d'ancrage ; `docs/PROGRAMME.md` fait foi.
