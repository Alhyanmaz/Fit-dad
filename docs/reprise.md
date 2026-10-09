# Reprise de la session (09/10/2026)

## État

- **J0 terminé et fusionné** (PR #1, le 08/10) : la v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/`, la v1 est intacte à la racine.
- **J1 fait en autonomie la nuit du 08 au 09/10**, sur la branche `j1-programme`, PR en brouillon vers `main` :
  - schéma zod de `data/programme.json` (`app/src/data/schema.ts`), branché au chargement de l'appli ;
  - relecture ligne à ligne contre `docs/PROGRAMME.md` : fichier conforme, 2 corrections, 4 questions (`docs/relecture-programme.md`) ;
  - 18 tests verts, build à jour.
- **Rien n'est tranché à la place de José** : les 4 questions attendent sa réponse.

## Prochaine étape

1. José répond aux 4 questions de `docs/relecture-programme.md`, une à la fois (proposition par défaut pour chacune).
2. Claude reporte les réponses dans `data/programme.json`, `docs/PROGRAMME.md` et `docs/decisions.md`, refait les tests et le build, puis passe la PR en « prête ».
3. José fusionne. Ensuite : jalon J2 (moteur de règles, `docs/SPEC.md` §10), dans une nouvelle session partie de `main` à jour :

```
Pars de la branche main à jour. Lis CLAUDE.md et docs/reprise.md. On attaque le jalon J2 de docs/SPEC.md §10. Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Questions ouvertes

- **J1** : les 4 questions de `docs/relecture-programme.md` (swing selon les jours, « série courte » du cossack et du reverse table top, séries du one arm hang, séries fixes des ajouts).
- **Poids de l'appli** : zod ajoute environ 31 Ko compressés (110 Ko au total). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
- **Branche par défaut** : `Mainold`, figée sur l'ancienne version (commit `d861224`). GitHub refuse de la passer sur `main` (« Could not change default branch »), même après la fusion du J0 ; cause inconnue. La synchroniser depuis une session a été bloqué par le garde-fou de l'environnement. Sans conséquence tant que chaque session vise `main` explicitement.
- À confirmer au J5 : la proposition « redescendre de 2 répétitions », gardée par défaut (`docs/decisions.md`, fin de l'entrée du 07/10).
- Le document Claude Docs du programme (révision 44) ne contient pas les décisions du 07/10 ; `docs/PROGRAMME.md` fait foi. À mettre à jour par José, ou à demander à Claude.
