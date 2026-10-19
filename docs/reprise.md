# Reprise de la session (19/10/2026)

## État

- **J0, J1 et J2 terminés et fusionnés dans `main`** : PR #1 le 08/10 ; PR #2 (programme validé au chargement) et PR #3 (moteur de règles) le 17/10, à la demande de José. La v2 est en ligne sous `https://alhyanmaz.github.io/Fit-dad/v2/` ; la v1 est intacte à la racine.
- **Moteur** (`app/src/domain`) : type de jour, alternances, matin, midi, soir, week-end, jour tenu, « Lever tôt » (verdict du matin), couches (minimum, principale, bonus), passages (critère, moment, niveau suivant), en fonctions pures ; scénarios 1 à 7, 12, 15, 16 et 18 verts ; scénarios 8 et 17 en partie (la proposition de chaque semaine viendra avec l'enregistrement) ; 94 tests au total.
- **Programme** (`docs/PROGRAMME.md`, `data/programme.json`, version du 18/10/2026) :
  - ancrage en deux niveaux, un par cycle de 5 semaines : N1 (lever 6h50), puis N2 (6h40) ; ni jour de récupération ni version courte ; « Alléger » n'y propose rien (décision du 18/10) ;
  - puis 4 paliers, de 6h30 à 6h00, **un par cycle** (décision du 17/10) ;
  - tous les passages : 12 jours tenus sur 14, dont les deux week-ends ; bouton pour forcer le passage (décisions du 18/10) ;
  - 2 min de deep squat dans le minimum de tous les matins ; lever tenu à 5 min près (décisions du 18/10) ;
  - palier 1 confirmé le 17/10 ; contenus des paliers 2 à 4 provisoires.
- **Une appli, deux tranches** (décision du 17/10, `docs/SPEC.md` §10) : tranche 1, l'ancrage puis le premier cycle du palier 1 (jalons J3 à J5) ; tranche 2, les paliers 2 à 4 et la bascule de la v1 (J6).
- **Les 22 questions du 17/10 sont tranchées** (`docs/decisions.md`).
- **Ancrage commencé le lundi 19/10/2026** (décision du 18/10), sans attendre l'appli.
- **J3 en cours** sur la branche `j3-aujourdhui` (PR #4 en brouillon), thème noir et orange :
  - écran Aujourd'hui de l'ancrage branché sur le moteur : matin, midi (corde ou marche), soir en deux (bloc clé, routine pied), week-end en une carte (un échauffement par exercice ; minimum, une paire ; principale, + 3 exercices et + 3 mouvements de mobilité), boxe ce soir, single leg balance matin et soir, jauge des jours tenus sur 14 (lever à l'heure, matin et soir), lien « Saisir le lever » ;
  - chaque bloc dit d'abord ce qu'il est (mobilité, musculation, étirements, cardio…) ; la couche de chaque exercice se lit à la couleur de son nom (minimum vert, principale orange, bonus rouge), avec une légende ; chaque exercice une fois ; chaque bloc se valide par la couche atteinte ;
  - chaque mouvement se coche ; la couche atteinte de chaque bloc s'en déduit, et les boutons de couche sont des raccourcis ;
  - un compteur de répétitions par série pour chaque mouvement à répétitions, échauffements compris ; une durée réglable pour chaque mouvement au temps (étirements : 30 s au plus) ;
  - carte « Passage » : date au plus tôt, critère, « Forcer le passage » avec confirmation (le niveau choisi n'est pas encore gardé ; arrêt à N2 avant l'écran des paliers) ;
  - onglet « Lever tôt » : cibles du niveau, saisie du matin (coucher, lever avec « Maintenant », premier réveil ou snooze, nuit, lumière, note), verdict, règles ; barre du bas pour changer d'écran ;
  - pas encore d'enregistrement : rien n'est gardé, et les alternances partent de A. Pas encore mis en ligne pour cette raison.

## Prochaine étape

Suite du J3, sur la branche `j3-aujourdhui` : l'enregistrement sur le téléphone (Dexie : réglages avec la date de début, le niveau en cours et le jour où il a commencé ; journal par date ; puis le retour au niveau précédent), les alternances tirées de l'historique, puis la mise en ligne ; ensuite la saisie des séances, « Ajuster », le minuteur, l'export et l'import, et le test de cohabitation hors ligne avec la v1.

```
Pars de la branche j3-aujourdhui. Lis CLAUDE.md et docs/reprise.md. On continue le jalon J3 de la tranche 1 (docs/SPEC.md §10) : l'enregistrement d'abord. Propose le plan avant de coder.
```

## À fournir au démarrage

Rien : tout est dans le dépôt.

## Questions ouvertes

Numérotation à la suite de celle du 17/10 (questions 1 à 22, tranchées).

23. Le soir de boxe et la version minimum ont une suspension de durée fixe (1 min). Comptent-ils pour la progression de la suspension ? Défaut : non, une durée fixe n'est pas une cible [Interprétation]. À trancher au J5.
24. Paliers 2 à 4 : contenus du matin repris des anciens paliers 4 et 5, et les 10 min du palier 4 ; à confirmer avant la semaine 16 (tranche 2). Défaut : les contenus actuels.
25. Jour tenu : le soir compte dès que le bloc clé est fait, la routine pied seule ne suffit pas. **Tranchée : oui (José, 18/10).**
26. Single leg balance : deux validations, matin et soir. Défaut : oui [Interprétation].
27. « Lever tôt » : saisir le lever et la nuit dans la carte du matin, et le coucher dans celle du soir ; l'onglet ne garde que l'historique (courbe des levers, grille des 4 semaines, progression vers le niveau suivant). Défaut : oui [Interprétation]. **Tranchée (José, 18/10) : non, la saisie du matin reste dans l'onglet « Lever tôt »** [Interprétation de sa réponse].
28. Compteurs de répétitions : départ au bas de la fourchette tant que l'historique est vide, puis à la dernière valeur ; « chaque côté » = un côté. Défaut : oui [Interprétation].
29. Passages de l'ancrage (vers N2 au plus tôt le 23/11, puis vers le palier 1 au plus tôt le 28/12) : ils restent sur les jours tenus, 5 sur 7, samedi et dimanche compris ; la règle des 12 matins réussis sur 14 ne vaut qu'entre les paliers. Défaut : oui [Interprétation]. À trancher avant le 23/11. **Tranchée (José, 18/10) : non, tous les passages après 12 jours tenus** (`docs/decisions.md`).
30. « Alléger » aux paliers : après 2 nuits difficiles de suite, l'appli propose la version courte du matin ; José accepte ou non. Défaut : oui [Interprétation]. À trancher avant le palier 1 (28/12 au plus tôt).
31. Snooze : noté pour l'historique, sans effet sur le verdict du matin. Défaut : oui [Interprétation].
32. Cossack squat : José a écrit « 8-10 rep / side » ; le programme dit 8 à 14. Défaut : 8-14, la fourchette du programme [Interprétation].
33. Le lever à l'heure (à 5 min près) entre-t-il dans le jour tenu, donc dans les passages ? Proposition de Claude : oui. Sinon, plus rien ne vérifie le lever avant de l'avancer, alors que c'est le but des paliers ; et les week-ends, où le travail n'impose pas le lever, ne le vérifient plus non plus. D'ici la réponse de José, rien ne change : le jour tenu reste le matin et le soir faits. À trancher avant le 23/11. **Tranchée (José, 18/10) : oui.**
34. Week-end complet = base + bonus : le samedi, 6 exercices de musculation au lieu des 4 du « au mieux » seul, car le swing et le goblet squat de la base restent. Défaut : oui. **José ne comprend pas ces 6 exercices (18/10) : voir la question 35.**
35. Week-end, proposition de Claude d'après « un mouvement d'échauffement pour un exo de musculation (muscle concerné) » : minimum, un échauffement et l'exercice qu'il prépare, en 1 série, plus le deep squat (samedi : hip hinge au bâton et swing, le programme disant que le hip hinge prépare le swing ; dimanche : cossack squat et goblet squat) ; principale, le reste de la base, 4 exercices en tout ; bonus, le reste de la routine de mobilité, les étirements de hanche et la boxe, sans exercice de musculation en plus. Défaut : oui [Interprétation]. À trancher avant le samedi 24/10. **Tranchée (José, 18/10) : non ; la principale ajoute 3 exercices et 3 mouvements de mobilité, un échauffement par exercice.** Minimum et bonus gardés [Interprétation].
36. Respiration : 5 min dès N2 et aux paliers (programme) ; à N1, rien, le matin n'a pas de marge. L'ajouter dès N1 ? Défaut : non ; un minuteur de respiration viendra avec celui des tenues.
37. Paires échauffement-exercice du week-end : shoulder dislocate pour le KT press, hip hinge au bâton pour le swing, scapula pull-up pour le rings row, cossack squat pour le goblet squat ; minimum, le swing le samedi et le goblet squat le dimanche. Défaut : oui [Interprétation ; le programme ne relie que le hip hinge au swing, et les deux mouvements d'épaule à la poussée et au tirage]. **Remplacée par la question 38 (José, 19/10).**
38. Week-end en séances A et B. José, 19/10 : « Samedi séance A, Dimanche séance B » ; minimum, 2 échauffements et le deep squat, 2 exercices, 2 étirements ; principale, 4 échauffements et le deep squat, 4 exercices, 4 étirements (les 3 de hanche et le prayer stretch) ; bonus, la boxe et le reste de la mobilité ; la progression prévoit les ajouts. Proposition de Claude, en attente de José :
    - paires, prises dans la routine Mob. du jour : samedi, séance A, shoulder dislocate → KT press, cossack squat → pistol box-assisté, scapula pull-up → rings row, hip hinge au bâton → KT single leg deadlift ; dimanche, séance B, shoulder dislocate → pompes, duck walk → goblet squat, scapula pull-up → traction assistée, hip hinge au bâton → swing (le programme relie le hip hinge au single leg deadlift et au swing, les deux mouvements d'épaule à la poussée et au tirage ; le reste est une interprétation) ;
    - minimum : samedi, rings row et KT single leg deadlift, dimanche, pompes et goblet squat, en 1 série, pour que le week-end au minimum couvre les quatre patrons ; couch stretch et pancake, 1 × 30 s ;
    - principale : les 4 exercices en 3 séries (swing 3 × 10), + pigeon et prayer stretch, les 4 étirements à 2 × 30 s ; bonus : le reste de la routine Mob. du jour, la boxe en 3 rounds ;
    - le prayer stretch contredit le programme (« Prayer stretch et shoulder extension ne font plus partie du programme », `docs/PROGRAMME.md`, « Étirements ») : à confirmer par José ;
    - ajouts du palier 2 (horse stance et carry le samedi, Copenhagen et tuck hang L-sit le dimanche, à leurs séries fixes) : déjà au programme du week-end du palier 2 ; dans la principale [Interprétation] ; leurs échauffements avec la question 24.
    Défaut : oui.

**À faire par José (pas des décisions)**

- Retenter de passer la branche par défaut du dépôt de `Mainold` à `main` (refus de GitHub le 08/10, cause inconnue).

**Note, sans décision à prendre**

- Poids de l'appli : zod ajoute environ 31 Ko compressés (120 Ko au total le 18/10). Acceptable pour une appli mise en cache ; allègement possible plus tard avec `zod/mini`, au prix d'une réécriture du schéma.
