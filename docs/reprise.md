# Reprise de la session (17/10/2026)

## État

- **J0 terminé et fusionné** (PR #1, le 08/10) : la v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/`, la v1 est intacte à la racine.
- **J1 terminé** sur la branche `j1-programme`, PR #2 prête à fusionner vers `main` : schéma zod de `data/programme.json`, relecture du programme, 25 tests verts, build à jour. Dernier commit du 14/10 : le « au mieux » du week-end de l'ancrage exclut tous les exercices du palier 2, Copenhagen compris (sens du 13/10).
- **J2 terminé** sur la branche `j2-moteur`, partie de `j1-programme` : PR #3 en brouillon vers `main`, à fusionner après la PR #2. Moteur de règles dans `app/src/domain` (type de jour, alternances, matin, midi, soir, week-end, jour tenu), en fonctions pures ; scénarios 1 à 7, 12, 15 et 16 verts (57 tests au total). Les choix du moteur là où le programme ne tranche pas sont dans `docs/SPEC.md`, étiquetés [Interprétation], et listés dans la PR #3. Réponses de José du 14/10 appliquées (`docs/decisions.md`) : ni jour de récupération ni version courte pendant l'ancrage ; soir de boxe en suspension seule.
- **Programme restructuré** (décisions des 13 et 14/10, `docs/decisions.md`) :
  - ancrage en deux niveaux, un par cycle de 5 semaines : N1 (lever 6h50), puis N2 (lever 6h40) ;
  - passages au plus tôt en semaines 6 et 11, seulement si 5 jours sur 7 ont tenu, samedi et dimanche compris ; José valide ;
  - puis 4 paliers, de 6h30 à 6h00, avec 20, 30, 40 et 50 min de travail le matin ;
  - contenus des paliers 1 à 4 **provisoires** (anciens paliers 3 à 5), à confirmer avant la semaine 11.
- **Une appli, deux tranches** (décision du 17/10, `docs/decisions.md`, `docs/SPEC.md` §10) : tranche 1, l'ancrage puis le premier cycle du palier 1 ; tranche 2, la suite. Ordre de livraison de la tranche 1 : jour 1 de l'ancrage, propositions de progression, passage à N2, palier 1.
- **GitHub** : compte suspendu du 09/10 au 13/10, rétabli le 13/10 au soir ; tout est poussé.

## Prochaine étape

1. José répond aux questions ci-dessous, au moins aux questions 1 à 4.
2. José fusionne la PR #2, puis la PR #3 (base `main` pour les deux).
3. Session suivante : tranche 1, ce qu'il faut pour le jour 1 de l'ancrage (jalon J3 recadré).

```
Pars de la branche main à jour (ou de j2-moteur si la PR #3 n'est pas fusionnée). Lis CLAUDE.md et docs/reprise.md. On attaque la tranche 1 : ce qu'il faut pour le jour 1 de l'ancrage (docs/SPEC.md §10, décision du 17/10). Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt.

## Questions ouvertes

Numérotées le 17/10 ; garder ces numéros pour les réponses de José. Le défaut s'applique tant que José n'a pas répondu.

**A. Pour lancer la tranche 1 (urgentes)**

1. Date de début de l'ancrage (jour 1 de N1). Défaut : le lundi qui suit la livraison du « jour 1 ».
2. Pendant la tranche 1, la v2 a sa propre icône (`/Fit-dad/v2/`) ; la v1 reste en place, intacte ; la v2 prend sa place à la racine (J6) en tranche 2. Défaut : oui, sous réserve d'un test de cohabitation hors ligne par Claude [Non vérifié].
3. Historique de l'artefact « Lever tôt » : importé en tranche 2 ; d'ici là, il reste consultable dans l'artefact. Défaut : oui.
4. Palier 2 atteint avant la fin du premier cycle du palier 1 : la tranche 1 l'affiche. Défaut : oui.

**B. Ancrage, en attente depuis le 14/10 (défauts déjà appliqués dans le moteur)**

5. Cossack squat et reverse table top : toujours 1 série à la cible, jamais au temps, à tous les niveaux, week-end compris (couvre le « au mieux » de l'ancrage et la Q2 du J1). Défaut : oui. Si oui, passer aussi les paliers 3 et 4 à « 1 série à la cible » dans le moteur.
6. Étirements de hanche du « au mieux » : couch stretch et pancake, sans le pigeon. Défaut : oui.
7. Soir de l'ancrage, version minimum (qui sert aussi de soir de boxe) : suspension seule, sans knee raises. Défaut : oui.
8. One arm hang, une fois ajouté : 1 tenue par bras (10 → 20 s), au soir normal de l'ancrage, au bloc clé standard des paliers et au soir de boxe ; jamais le jour de récupération (couvre la Q3 du J1). Défaut : oui.

**C. Tranche 1, plus tard**

9. Lundi après un week-end avec la base de l'ancrage (ancrage, palier 1) : la base du dimanche compte comme B, donc lundi A ; si seul le samedi est fait, lundi B. Défaut : oui.
10. « Alléger » pendant l'ancrage : propose la version minimum, puisqu'il n'y a pas de version courte. Défaut : oui.
11. « Redescendre d'un cran » : −2 répétitions après 2 séances manquées de suite, sans passer sous la fourchette. Défaut : on garde.

**D. Palier 1, avant la semaine 11 (contenus provisoires du 14/10)**

12. Matin du palier 1, repris de l'ancien palier 3 : respiration 5 min, café 5, mobilité 5 (routine du jour à 30 s), musculation 10 (1 série de chaque exercice, sans les éléments du palier 2, swing compris en B), étirements de hanche 2 × 30 s. Défaut : oui.
13. Swing à partir du palier 1 : EMOM de 6 min (6 × 10) en fin de séance B, week-end compris ; 3 min en version courte et en décharge (Q1 du J1). Défaut : oui.
14. Soir des paliers 1 et 2 (≈ 15 min) : bloc clé complet, routine pied à 1 série par exercice. Défaut : oui.
15. Week-end du palier 1 (≈ 30 min) : base de l'ancrage, puis boxe en 3 rounds. Défaut : oui.
16. Passage d'un palier au suivant : au moins 7 jours au palier et 5 matins réussis sur les 7 derniers, samedi et dimanche compris. Autre option : un palier par cycle de 5 semaines, comme l'ancrage. Défaut : la première.
17. Version courte et décharge : règles actuelles. Version courte : 1 série par exercice, sans étirements. Décharge : musculation et pied à 1 série, corde divisée par 2, shadow à la place du sac, tests. Défaut : oui.

**E. Tranche 2, peut attendre**

18. Étirements du pied au cycle 2 : 1 série, puis 2, d'une routine pied à l'autre. Défaut : oui.
19. Horse stance, carry, Copenhagen et tuck hang L-sit (palier 2) : séries fixes (1 ou 2), week-end compris ; 1 série en décharge (Q4 du J1). Défaut : oui.
20. Week-end des paliers 2 à 4 : 45, 60, puis 75 min. Défaut : oui.
21. Palier 4 : les 10 min de plus, contenu à définir par José. Défaut d'ici là : contenu du palier 3, avec les 10 min signalées.

**F. Divers**

22. Document Claude Docs du programme (révision 44, pas à jour) : abandonné, `docs/PROGRAMME.md` fait foi. Défaut : oui.

**À faire par José (pas des décisions)**

- Fusionner la PR #2, puis la PR #3.
- Retenter de passer la branche par défaut du dépôt de `Mainold` à `main` (refus de GitHub le 08/10, cause inconnue).

**Note, sans décision à prendre**

- Poids de l'appli : zod ajoute environ 31 Ko compressés (112 Ko au total). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
