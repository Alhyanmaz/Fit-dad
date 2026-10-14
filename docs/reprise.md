# Reprise de la session (14/10/2026)

## État

- **J0 terminé et fusionné** (PR #1, le 08/10) : la v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/`, la v1 est intacte à la racine.
- **J1 terminé** sur la branche `j1-programme`, PR #2 prête à fusionner vers `main` : schéma zod de `data/programme.json`, relecture du programme, 25 tests verts, build à jour. Dernier commit du 14/10 : le « au mieux » du week-end de l'ancrage exclut tous les exercices du palier 2, Copenhagen compris (sens du 13/10).
- **J2 terminé** sur la branche `j2-moteur`, partie de `j1-programme` : PR #3 en brouillon vers `main`, à fusionner après la PR #2. Moteur de règles dans `app/src/domain` (type de jour, alternances, matin, midi, soir, week-end, jour tenu), en fonctions pures ; scénarios 1 à 7, 12, 15 et 16 verts (57 tests au total). Les choix du moteur là où le programme ne tranche pas sont dans `docs/SPEC.md`, étiquetés [Interprétation], et listés dans la PR #3. Réponses de José du 14/10 appliquées (`docs/decisions.md`) : ni jour de récupération ni version courte pendant l'ancrage ; soir de boxe en suspension seule.
- **Programme restructuré** (décisions des 13 et 14/10, `docs/decisions.md`) :
  - ancrage en deux niveaux, un par cycle de 5 semaines : N1 (lever 6h50), puis N2 (lever 6h40) ;
  - passages au plus tôt en semaines 6 et 11, seulement si 5 jours sur 7 ont tenu, samedi et dimanche compris ; José valide ;
  - puis 4 paliers, de 6h30 à 6h00, avec 20, 30, 40 et 50 min de travail le matin ;
  - contenus des paliers 1 à 4 **provisoires** (anciens paliers 3 à 5), à confirmer avant la semaine 11.
- **GitHub** : compte suspendu du 09/10 au 13/10, rétabli le 13/10 au soir ; tout est poussé. Les fichiers de passation vers un projet Claude (13/10) ne servent plus, sauf si José préfère y travailler.

## Prochaine étape

1. José fusionne la PR #2, puis la PR #3 (base `main` pour les deux), après avoir relu les interprétations de la PR #3.
2. Jalon J3 (écran Aujourd'hui, saisie, « Ajuster », minuteur, stockage, export et import), dans une session partie de `main` à jour :

```
Pars de la branche main à jour. Lis CLAUDE.md et docs/reprise.md. On attaque le jalon J3 de docs/SPEC.md §10. Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt. L'export de « Lever tôt » ne servira qu'au jalon J4.

## Questions ouvertes

- **Avant la semaine 11** (fin décembre au plus tôt), à confirmer par José :
  - les contenus des paliers 1 à 4, dont les 10 min de plus du palier 4 ;
  - le soir à 15 min (proposition : bloc clé complet, routine pied à 1 série) ;
  - la progression du week-end (proposition : 30, 45, 60, puis 75 min) ;
  - le passage entre paliers (5 matins sur 7, week-end compris, au moins 7 jours) ;
  - la version courte et la décharge (règles actuelles par défaut).
- **J1, Q1 à Q4** (`docs/relecture-programme.md`), avec les nouveaux numéros de paliers.
- **J2, deux points expliqués à José le 14/10, en attente de sa réponse** : « au mieux » du week-end (cossack et reverse table top à la cible, étirements de hanche sans le pigeon) ; étirements du pied au cycle 2 (1 puis 2 séries, d'une routine pied à l'autre). Plus deux déductions de Claude à valider : suspension seule dans la version minimum du soir de l'ancrage ; one arm hang dans le soir normal de l'ancrage, une fois ajouté.
- **J3, pointeur A/B après un week-end sans séance A/B** (base de l'ancrage, palier 1) : le dimanche compte-t-il comme B pour le lundi ? Proposition : oui, si la base du dimanche est faite [Interprétation].
- **Ancrage** : date de début choisie par José (jour 1 de N1).
- **Import de « Lever tôt »** (J4) : les paliers de l'artefact ne correspondent plus aux niveaux de la v2 (`docs/MIGRATION.md`).
- **Poids de l'appli** : zod ajoute environ 31 Ko compressés (111 Ko au total). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
- **Branche par défaut** : `Mainold`, figée sur l'ancienne version (commit `d861224`). GitHub a refusé de la passer sur `main` le 08/10 (« Could not change default branch »), peut-être à cause du problème de compte : à retenter.
- À confirmer au J5 : la proposition « redescendre de 2 répétitions », gardée par défaut (`docs/decisions.md`, fin de l'entrée du 07/10).
- À trancher au J5 : « Alléger » pendant l'ancrage, sans version courte à proposer. Proposition : la version minimum.
- Le document Claude Docs du programme (révision 44) ne contient ni les décisions du 07/10 ni celles des 13 et 14/10 ; `docs/PROGRAMME.md` fait foi.
