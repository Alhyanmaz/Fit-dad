# Reprise de la session (18/10/2026)

## État

- **J0, J1 et J2 terminés et fusionnés dans `main`** : PR #1 le 08/10 ; PR #2 (programme validé au chargement) et PR #3 (moteur de règles) le 17/10, à la demande de José. La v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/` ; la v1 est intacte à la racine.
- **Moteur** (`app/src/domain`) : type de jour, alternances, matin, midi, soir, week-end, jour tenu, en fonctions pures ; scénarios 1 à 7, 12, 15 et 16 verts ; 60 tests au total.
- **Programme** (`docs/PROGRAMME.md`, `data/programme.json`, version du 17/10/2026) :
  - ancrage en deux niveaux, un par cycle de 5 semaines : N1 (lever 6h50), puis N2 (6h40) ; ni jour de récupération ni version courte ;
  - puis 4 paliers, de 6h30 à 6h00, **un par cycle** (décision du 17/10) ;
  - palier 1 confirmé le 17/10 ; contenus des paliers 2 à 4 provisoires.
- **Une appli, deux tranches** (décision du 17/10, `docs/SPEC.md` §10) : tranche 1, l'ancrage puis le premier cycle du palier 1 (jalons J3 à J5) ; tranche 2, les paliers 2 à 4 et la bascule de la v1 (J6).
- **Les 22 questions du 17/10 sont tranchées** (`docs/decisions.md`).
- **Ancrage commencé le lundi 19/10/2026** (décision du 18/10), sans attendre l'appli.
- **J3 en cours** sur la branche `j3-aujourdhui` (PR en brouillon) : thème noir et orange, écran Aujourd'hui de l'ancrage branché sur le moteur (matin, midi, soir, week-end, boxe ce soir, jauge des jours tenus), avec les validations demandées par José le 18/10 : midi en corde ou marche, soir en deux (bloc clé, routine pied), single leg balance matin et soir. Pas encore d'enregistrement : rien n'est gardé, et les alternances partent de A. Pas encore mis en ligne pour cette raison.

## Prochaine étape

Suite du J3, sur la branche `j3-aujourdhui` : l'enregistrement sur le téléphone (Dexie : réglages avec la date de début et le niveau, journal par date), les alternances tirées de l'historique, puis la mise en ligne ; ensuite la saisie des séances, « Ajuster », le minuteur, l'export et l'import, et le test de cohabitation hors ligne avec la v1.

```
Pars de la branche j3-aujourdhui. Lis CLAUDE.md et docs/reprise.md. On continue le jalon J3 de la tranche 1 (docs/SPEC.md §10) : l'enregistrement d'abord. Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt.

## Questions ouvertes

Numérotation à la suite de celle du 17/10 (questions 1 à 22, tranchées).

23. Le soir de boxe et la version minimum ont une suspension de durée fixe (1 min). Comptent-ils pour la progression de la suspension ? Défaut : non, une durée fixe n'est pas une cible [Interprétation]. À trancher au J5.
24. Paliers 2 à 4 : contenus du matin repris des anciens paliers 4 et 5, et les 10 min du palier 4 ; à confirmer avant la semaine 16 (tranche 2). Défaut : les contenus actuels.
25. Jour tenu : le soir compte dès que le bloc clé est fait, la routine pied seule ne suffit pas. Défaut : oui [Interprétation].
26. Single leg balance : deux validations, matin et soir. Défaut : oui [Interprétation].

**À faire par José (pas des décisions)**

- Retenter de passer la branche par défaut du dépôt de `Mainold` à `main` (refus de GitHub le 08/10, cause inconnue).

**Note, sans décision à prendre**

- Poids de l'appli : zod ajoute environ 31 Ko compressés (112 Ko au total). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
