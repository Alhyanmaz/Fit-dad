# Décisions — Fit-dad v2

Registre des décisions. Une entrée datée par série de décisions ; on ne rouvre une décision qu'avec une raison nouvelle, et on note ici le changement.

## 06/10/2026 — décisions de José (conversation de refonte du programme)

- **Historique de la v1** : on repart de zéro (Q10 = b). Pas de migration ; les charges de départ sont reprises à la main. La v1 reste ouvrable pour exporter son historique et le garder en archive. **→ 07/10 : pas d'export ; au J6, copie consultable dans `legacy/v1.html`.**
- **Signes d'arrêt et douleur** : écartés (Q7 = a), ni dans le programme ni dans l'appli. José s'en charge.
- **« Lever tôt »** : intégré dans l'appli v2.
- **Semaines de tests** : comme dans l'appli actuelle, José règle lui-même le cycle suivant d'après ses résultats.
- **Export des données** : oui, sauvegarde complète dans un fichier et réimport.
- **Matin** : palier 1 = reverse table top, bear walk, puis 1 exercice de musculation ; palier 2 = 2 exercices, pris sur le café ; la séance complète à partir du palier 3.
- **Boxe en club** : un soir de semaine, jour variable ; pas de sparring pour l'instant.
- **Phase 4 (document de passation)** : Claude Code, dépôt GitHub, structure en plusieurs fichiers, PWA installable, zoom corrigé, progression pilotée par les critères plutôt que par la semaine.
- **Calendrier** : Claude Code démarre le 07/10/2026, sans attendre la fin de l'essai à blanc. Le document de passation l'autorise (phase 4 « peut démarrer en parallèle de la phase 3 »). Les durées seront revues après l'essai.

## 06/10/2026 — choix de Claude, à valider par José

- **Dépôt** : Fit-dad, déjà en ligne sur GitHub Pages. Même adresse, même installation sur le téléphone. Le dépôt doit rester public : avec l'offre gratuite de GitHub, Pages ne fonctionne que sur les dépôts publics ([doc GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Le code et la documentation sont donc lisibles par tous ; les données restent sur le téléphone. **→ 07/10 : validé ; profil familial retiré de la copie `docs/PROGRAMME.md`.**
- **Publication** : pas de GitHub Actions, parce que les sessions Claude Code dans le cloud ne peuvent pas pousser de fichiers sous `.github/workflows/` ([ticket ouvert](https://github.com/anthropics/claude-code/issues/61189)). Pages reste en « Deploy from a branch », `main`, racine. Le code de la v2 vit dans `app/`, son build est commité dans `v2/` et servi sous `/Fit-dad/v2/`. Aucun réglage à changer sur GitHub. Si le ticket est corrigé, on pourra ajouter une intégration continue. **→ 07/10 : validé.**
- **Cohabitation v1 / v2** : v1 intacte à la racine jusqu'à la bascule (J6), puis rangée dans `v1/` selon la liste de contrôle de `docs/SPEC.md` §8.1. **→ 07/10 : modifié : au J6, la v2 remplace la v1 à la racine, sans dossier `v1/`.**
- **Outils** : Vite, React et TypeScript (React comme la v1, outillage courant et bien maîtrisé par Claude Code) ; Dexie sur IndexedDB (plus robuste que `localStorage` pour des années d'historique) ; zod pour valider le programme et les imports ; Vitest pour les règles métier ; `vite-plugin-pwa` pour l'installation et le hors-ligne. **→ 07/10 : validé ; versions figées, TypeScript 6.0.**
- **Palier 2** : le binôme 1 de la séance du jour (push + squat) ; tirage et hinge arrivent au palier 3. Alternative écartée pour l'instant : faire tourner les binômes. **→ 07/10 : remplacé : les 4 patrons sur deux matins.**
- **Pas entre deux niveaux** : 2 répétitions, comme la v1 (voir la question ouverte sur les petites fourchettes). **→ 07/10 : validé, plafonné au haut de la fourchette.**
- **Séries mixtes** : une série de plus à la nouvelle charge à chaque montée ; appliqué aussi aux passages bidon → kettlebell. **→ 07/10 : annulé : aucun changement de charge automatique.**
- **Bas de jambe** : une « hausse » est un changement d'échelon, +2 min de corde ou du sac en plus ; les +2 répétitions dans un échelon ne comptent pas. La hausse de la semaine va à l'élément éligible le plus proche dans la rotation corde → mollets → tibialis → sac. **→ 07/10 : modifié : sac hors de la règle, report au lundi.**
- **Absence** : jugée sur l'ensemble du journal (7 jours sans musculation, ou absence déclarée), pas exercice par exercice. **→ 07/10 : annulé : José gère avec « Ajuster ».**
- **Midis** : corde proposée les 3 premiers midis éligibles ; José peut échanger. **→ 07/10 : validé et précisé : objectif de 3 corde, marche toujours valable.**

## 07/10/2026 — décisions de José (revue du kit, session du jalon J0)

Revue des 10 choix « à valider » du 06/10 et des 10 questions ouvertes de `docs/SPEC.md` §11. Documents mis à jour en conséquence : `docs/PROGRAMME.md`, `docs/SPEC.md`, `data/programme.json`, `docs/MIGRATION.md`, `docs/DEMARRAGE.md`, `CLAUDE.md`.

**Technique**

- **Dépôt public** : validé. Le profil familial est retiré de la copie `docs/PROGRAMME.md` ; il reste dans l'historique Git (réécrire l'historique n'a pas été demandé).
- **Publication** : validée telle quelle (build commité dans `v2/`, pas de GitHub Actions).
- **Remplacement de la v1 au J6** : la v2 prend la racine et remplace la v1 ; pas de dossier `v1/`. Une copie de la v1 reste consultable dans `legacy/v1.html`. José n'a pas besoin d'exporter l'historique de la v1. Liste de contrôle : `docs/SPEC.md` §8.1.
- **Outils** : validés ; Claude choisit les versions qui fonctionnent ensemble et les fige (`package-lock.json`). TypeScript 6.0, car `typescript-eslint` 8 n'accepte pas TypeScript 7 (vérifié sur le registre npm le 07/10/2026). Dexie et `vite-plugin-pwa` arrivent au J3.

**Programme**

- **Matin, palier 1** : 1 série de KT press le matin A, de rings row le matin B (les pompes ne sont plus au matin).
- **Matin, palier 2** : les 4 patrons sur deux matins, un exercice du haut et un du bas : matin A = 1 série de KT press + 2 séries de 10 swings ; matin B = 1 série de rings row + 1 série de goblet squat.
- **Progression dans un échelon** : l'appli propose +2 répétitions (dernier pas plafonné au haut de la fourchette : pistol 5 → 7 → 8), +5 s pour les tenues (carry et one arm hang compris), +2 s pour le L-sit, +2 knee raises. Reverse table top : seules les répétitions sont proposées.
- **Changements de charge ou de variante** : jamais proposés. José les fait avec « Ajuster » ou en semaine de test. Plus de séries mixtes automatiques.
- **« Ajuster »** : bouton sur chaque exercice ; répétitions ou secondes, charge, série par série en option ; effet dès la séance suivante, sans validation, noté dans l'historique.
- **Absence** : pas de règle automatique ; José gère avec « Ajuster ».
- **Bas de jambe** : corde, mollets, tibialis. La marche ne compte pas ; le sac est hors de la règle. Règle stricte : une hausse demandée quand celle de la semaine est prise est reportée au lundi suivant ; après les tests, les hausses s'étalent, une par semaine, dans l'ordre corde → mollets → tibialis.
- **Corde du midi** : la durée (+2 min) se règle par José avec un bouton, jamais proposée. Les 3 séances de corde sont un objectif ; la marche est toujours valable ; bouton « Corde ↔ Marche » pour le jour même.
- **Lever tôt** : au palier 1, le lever seul valide le matin. Passage de palier : 5 matins réussis sur 7, **dont le samedi et le dimanche** (en semaine, le travail impose déjà le lever). (**→ 18/10 : 12 matins sur 14, dont les deux week-ends**)
- **Boxe le vendredi** : pas de jour de récupération ; musculation complète samedi et dimanche ; bloc boxe le dimanche seulement (exception à la règle « lendemain de boxe = récupération »).
- **Nom** : Fit-dad.

**Gardé par défaut, à confirmer quand on y sera (J5)**

- La proposition « redescendre d'un cran » (−2 répétitions après une cible manquée 2 séances de suite) reste dans le programme : José ne l'a pas annulée explicitement.

## 13/10/2026 — décisions de José (cycles d'ancrage)

Le 12/10, José a du mal à tenir le programme et demande une version minimale pour ancrer l'habitude. Il propose le squelette du cycle 1 ; Claude l'étoffe à partir du programme ; José valide le 13/10. Détail : `docs/PROGRAMME.md`, section « Cycles d'ancrage ».

- **Cycles d'ancrage** : avant le programme complet, 2 cycles de 5 semaines au minimum, avec un socle réduit : matin ≈ 10 min, soir ≈ 10 min, midi libre, week-end au minimum comme un matin de semaine ; au mieux, séance complète en 3 séries et boxe en 3 rounds.
- **Sortie** : pas de date de fin (règle n° 1). Après 10 semaines, quand le socle tient 5 jours sur les 7 derniers, samedi et dimanche compris, l'appli propose de sortir ; José valide. Puis tests et réglage de la suite.
- **Jour tenu** : matin et soir faits, au moins en version minimum (matin : un mouvement de mobilité ; soir : suspension et deep squat). Midi et « au mieux » du week-end : bonus.
- **Swing** : 1 série de 10 pendant l'ancrage ; les 2 séries du palier 2 (décision du 07/10) reprennent après.
- **Single leg balance** : gardé, au brossage des dents (absent du squelette, gardé par défaut).
- **« Lever tôt »** : continue (heures, passage de palier) ; le contenu du matin reste celui de l'ancrage, et le plancher devient le matin d'ancrage.
- **Cycles** : pas de décharge pendant l'ancrage ; les cycles d'ancrage ne comptent pas dans la numérotation des cycles (étirements du pied à 1 série) ; tests à la sortie.
- **Report** : `data/programme.json` (clé `ancrage`), son schéma et `docs/SPEC.md` (§6.11, scénarios 15 à 17), par Claude le 13/10, dans la PR du J1.


**→ 14/10 : matin d'ancrage unique, sortie et « Lever tôt » remplacés par l'entrée suivante.**

## 14/10/2026 — décisions de José (ancrage en deux niveaux, quatre paliers)

Retour de José du 13/10 sur les paliers et les phases (document Word, lecture de Claude confirmée le 13/10), puis précisions des 13 et 14/10. Détail : `docs/PROGRAMME.md`, sections « Cycles d'ancrage », « Le matin par paliers » et « Week-end ».

- **Structure** : les anciens paliers 1 et 2 deviennent les deux niveaux de l'ancrage, N1 puis N2 (un par cycle de 5 semaines) ; le programme complet compte ensuite 4 paliers, par pas de 10 min. Anciens paliers 3, 4 et 5 = nouveaux paliers 1, 2 et 3 ; le palier 4 est nouveau.

| Niveau ou palier | Lever / coucher | Travail du matin |
| --- | --- | --- |
| N1 | 6h50 / 22h50 | 1 mouvement de mobilité, 1 série d'un exercice |
| N2 | 6h40 / 22h40 | 10 min de marge, puis un créneau de 10 min |
| Palier 1 | 6h30 / 22h30 | 20 min |
| Palier 2 | 6h20 / 22h20 | 30 min |
| Palier 3 | 6h10 / 22h10 | 40 min |
| Palier 4 | 6h00 / 22h00 | 50 min |

- **Couchers de N1 et N2** : 8 h avant le lever (proposition de Claude, non contestée).
- **N1** : matin A, reverse table top puis 1 série de rings row ; matin B, cossack squat puis 1 série de goblet squat. À N1, le lever seul valide le matin de « Lever tôt » (comme l'ancien palier 1, décision du 07/10).
- **N2** : matin A, bear walk (« bear crawl ») et hip hinge au bâton, puis 1 série de KT press et 1 × 10 swings, puis 1 étirement ; matin B, reverse table top et cossack squat, puis 1 série de rings row et de goblet squat, puis l'autre étirement. Le SL good morning, d'abord proposé par José, est remplacé par le hip hinge au bâton.
- **Étirements de l'ancrage** : couch stretch et pancake, à tour de rôle ; le pigeon sort de l'ancrage et reste dans le programme complet.
- **Cossack et reverse table top dans l'ancrage** : 1 série à la cible du moment (proposition de Claude, non contestée).
- **Passages** : N2 au plus tôt en semaine 6, palier 1 au plus tôt en semaine 11. L'appli ne propose le passage que si les 7 derniers jours ont tenu 5 jours, samedi et dimanche compris ; sinon, elle le propose de nouveau la semaine suivante ; José valide. José proposait des dates fixes ; il a retenu la proposition de Claude, qui garde la règle n° 1.
- **Soir** : ancrage ≈ 10 min (1 série du bloc pied, 1 série du bloc clé) ; paliers 1 et 2, 15 min ; paliers 3 et 4, 20 min.
- **Week-end de l'ancrage** : base ≈ 20 min : 2 mouvements d'échauffement, 3 séries des 4 exercices (KT press, swing, rings row, goblet squat), 1 étirement ; au mieux ≈ 45 min, sans changement.
- **Provisoire**, accepté par José le 14/10, à confirmer avant la semaine 11 :
  - contenus des paliers 1 à 3 = ceux des anciens paliers 3 à 5 ; palier 4 = ancien palier 5, plus 10 min à définir ; respiration et café des anciens paliers 3 à 5 ;
  - soir à 15 min : bloc clé complet et routine pied à 1 série par exercice ; à 20 min : soir complet (proposition de Claude) ;
  - week-end : base + boxe en 3 rounds au palier 1 (≈ 30 min) ; séance complète en 3 séries, mobilité complète, étirements de hanche et boxe en 3 rounds au palier 2 (≈ 45 min) ; boxe en 5 rounds au palier 3 (≈ 60 min) ; journée type et bloc boxe au palier 4 (≈ 75 min) (proposition de Claude) ;
  - passage entre les paliers 1 à 4 : 5 matins réussis sur 7, samedi et dimanche compris, au moins 7 jours au palier (**→ 17/10 : un palier par cycle ; → 18/10 : 12 matins sur 14, dont les deux week-ends**) ;
  - version courte et décharge : règles actuelles (**→ 17/10 : version courte avec 1 série d'étirements**).
- **Q1 à Q4 du J1** : toujours ouvertes, avec les nouveaux numéros (ancien palier 3 = palier 1, ancien 4 = palier 2, ancien 5 = palier 3). Le J1 se termine avec ces points provisoires (accord de José du 14/10).

## 14/10/2026 — réponses de José aux interprétations du moteur (J2)

Réponses de José, le 14/10, à la liste de la PR #3. Détail : `docs/PROGRAMME.md` (« Cycles d'ancrage », « Bloc clé du soir ») et `docs/SPEC.md` (§6.1, §6.5, §6.11).

- **Acceptés** :
  - lettre du week-end : A le samedi, B le dimanche, à tous les niveaux ; elle choisit aussi l'échauffement de la base et la journée type du palier 4 ;
  - week-end des paliers 2 et 3 : la routine de mobilité garde le temps du palier (30 s au palier 2, 60 s au palier 3) ;
  - soir de récupération aux paliers : 2 séries de suspension passive et 2 de deep squat.
- **Pas de jour de récupération pendant l'ancrage** : le lendemain d'une boxe en club suit le schéma des autres jours, matin et soir.
- **Pas de version courte pendant l'ancrage** : version normale ou version minimum.
- **Soir de boxe** : suspension seule, sans knee raises ; le one arm hang s'y ajoute une fois que José l'a débloqué (suspension à 80 s).
- **Déductions de Claude, à valider** (**→ 17/10 : acceptées, avec 1 min de suspension et 2 min de deep squat**) :
  - la version minimum du soir de l'ancrage, qui est aussi son soir de boxe, suit la même règle : suspension seule ;
  - le soir normal de l'ancrage prend le one arm hang une fois ajouté, comme le soir de boxe (« 1 série du bloc clé », entrée précédente).
- **En attente** : José a demandé des explications sur deux points ; les choix de Claude restent en place d'ici là (**→ 17/10 : pigeon ajouté au « au mieux » ; alternance acceptée**) :
  - « au mieux » du week-end : cossack squat et reverse table top en 1 série à la cible, étirements de hanche sans le pigeon ;
  - étirements du pied au cycle 2 du programme : 1 série, puis 2, d'une routine pied à l'autre.

## 17/10/2026 — décision de José (une appli, deux tranches)

- **Une seule appli, livrée en deux tranches** (proposition de Claude ; José demandait d'abord deux applis séparées) : même adresse, mêmes données ; la tranche 2 arrive comme une mise à jour.
- **Tranche 1** : les deux cycles d'ancrage (N1, N2), puis le premier cycle du palier 1 (« niveau 1 », lu par Claude comme le palier 1). **Tranche 2** : la suite du programme.
- **Ordre de livraison de la tranche 1** (proposition de Claude, non contestée) : pour le jour 1 de l'ancrage, l'écran du jour, la saisie avec « Ajuster », le jour tenu, « Lever tôt » et l'export ; dans les premières semaines, les propositions de progression ; avant la semaine 6, le passage à N2 ; avant la semaine 11, le palier 1, ses tests et sa décharge.

## 17/10/2026 — réponses de José aux 22 questions ouvertes

Liste numérotée de `docs/reprise.md` (version du 17/10). José a répondu aux questions 3, 4, 6, 7, 16 et 17, et accepté les choix par défaut pour les autres (« par défaut pose les autres questions », lu par Claude comme : appliquer les défauts). Il a ensuite demandé la fusion des PR #2 et #3.

- **Réponses de José** :
  - **3, historique de « Lever tôt »** : pas d'import (« historique supprimé ») ; la v2 commence avec un journal vide. L'artefact reste dans claude.ai ; la v2 ne le lit pas et ne l'efface pas.
  - **4, palier 2 dans la tranche 1** : oui. Sans objet avec la réponse 16 : le palier 2 arrive au plus tôt en semaine 16, en tranche 2.
  - **6, « au mieux » du week-end** : les 3 étirements de hanche (couch stretch, pigeon, pancake), 2 × 30 s.
  - **7, version minimum du soir de l'ancrage**, qui est aussi son soir de boxe : 1 min de suspension, 2 min de deep squat. Claude l'applique aussi au soir de boxe des paliers, qui avait le même contenu [Interprétation].
  - **16, passage entre paliers** : un palier par cycle de 5 semaines, comme pendant l'ancrage. Le passage se propose au plus tôt au début du cycle suivant ; le critère des 5 matins réussis sur 7, samedi et dimanche compris, est gardé [Interprétation] (**→ 18/10 : 12 matins sur 14, dont les deux week-ends**).
  - **17, version courte** : une série d'étirements gardée, soit 1 série de chaque étirement du palier [Interprétation] ; décharge : règles actuelles.
- **Défauts acceptés** :
  - **1** : l'ancrage commence le lundi qui suit la livraison du jour 1, soit la fin du J4.
  - **2** : pendant la tranche 1, la v2 a sa propre icône et la v1 reste en place ; la bascule vient en tranche 2, sous réserve d'un test de cohabitation hors ligne.
  - **5** : cossack squat et reverse table top, toujours 1 série à la cible, à tous les niveaux, week-end compris.
  - **8** : one arm hang, 1 tenue par bras une fois ajouté, tous les soirs sauf le jour de récupération.
  - **9** : la base du week-end compte pour sa lettre (dimanche fait → lundi A ; seul le samedi fait → lundi B).
  - **10** : « Alléger » propose la version minimum pendant l'ancrage (**→ 18/10 : rien n'est proposé pendant l'ancrage**).
  - **11** : « redescendre d'un cran » (−2 répétitions après 2 séances manquées) est gardé.
  - **12, 14, 15** : palier 1 confirmé : matin (ancien palier 3), soir à 15 min, week-end à 30 min.
  - **13** : swing en EMOM de 6 min à partir du palier 1, week-end compris ; 3 min en version courte et en décharge.
  - **18** : étirements du pied au cycle 2, 1 puis 2 séries, d'une routine pied à l'autre.
  - **19** : horse stance, carry, Copenhagen et tuck hang L-sit gardent leurs séries fixes, week-end compris ; 1 série en décharge.
  - **20** : week-end des paliers 2 à 4 à 45, 60 et 75 min.
  - **21** : palier 4, contenu du palier 3 avec les 10 min signalées, en attendant José.
  - **22** : le document Claude Docs du programme est abandonné ; `docs/PROGRAMME.md` fait foi.

## 18/10/2026 — décisions de José (début de l'ancrage, thème de l'appli)

- **Début de l'ancrage : lundi 19/10/2026**, sans attendre l'appli (remplace le défaut de la question 1 du 17/10). Passages au plus tôt : N2 le lundi 23/11, palier 1 le lundi 28/12, palier 2 le lundi 01/02/2027 ; ce sont les dates des scénarios 8 et 17. Les premiers jours sans appli ne changent rien aux passages : seuls les 7 derniers jours comptent.
- **Thème de l'appli** : fond noir, accent orange, d'après un exemple d'infographie d'appli fitness envoyé par José (Shutterstock, avec filigrane). Claude reprend le style (cartes arrondies, jauge circulaire, barre du bas), pas l'image, qui n'entre pas dans le dépôt.
- **Validations de l'écran Aujourd'hui** (José, 18/10, sur la première capture) : le midi se valide en « Corde » ou « Marche » ; le soir se valide en deux, le bloc clé et la routine pied ; le single leg balance se valide aussi. Claude en déduit, à valider :
  - le single leg balance a deux validations, matin et soir, comme le programme le prévoit ;
  - le soir compte pour le jour tenu dès que le bloc clé est fait (seul, c'est la version minimum) ; la routine pied seule ne suffit pas. **→ confirmé par José le 18/10.**
- **Répétitions** (José, 18/10) : chaque exercice qui se compte en répétitions se saisit, série par série, et sert à l'historique. Choix de Claude, à valider :
  - le compteur part du bas de la fourchette tant que l'historique est vide, puis de la dernière valeur ;
  - pour un exercice « chaque côté » (bras, jambe), il vaut pour un côté ;
  - les knee raises de la suspension ont leur compteur ; les tenues en secondes viendront avec le minuteur.
- **Week-end** : la base et le « au mieux » (bonus) se valident chacun de leur côté, comme le soir (choix de Claude, à valider).

## 18/10/2026 — décisions de José (« Lever tôt », code couleur, cossack)

Réponses de José à l'explication de l'onglet « Lever tôt » et à la question 27 de `docs/reprise.md`.

- **Tolérance du lever : 5 min** (au lieu de 10). À N2 (6h40), lever à 6h45 : tenu ; à 6h46 : manqué.
- **Pas de proposition de version minimum** : pendant l'ancrage, « Alléger » ne propose rien ; José choisit lui-même la version minimum, avec le bouton « Minimum ». Aux paliers, Claude garde la version courte proposée après 2 nuits difficiles de suite [Interprétation, question 30].
- **Réveil** : « Premier réveil » ou « Snooze », dans le journal du matin. Noté pour l'historique, sans effet sur le verdict [Interprétation, question 31].
- **Passage au palier suivant** : 12 matins réussis sur les 14 derniers jours, dont les deux week-ends (les deux samedis et les deux dimanches), au lieu de 5 sur 7 dont le samedi et le dimanche ; toujours un palier par cycle (décision du 17/10). Claude l'applique entre les paliers seulement : les passages de l'ancrage (vers N2, puis vers le palier 1) restent sur les jours tenus, 5 sur 7 [Interprétation, question 29]. (**→ 18/10, plus tard : 12 jours tenus sur 14, pour tous les passages**)
- **Cossack squat** : pas de compteur de répétitions ; l'appli affiche la cible (« 1 série · cible 8 à 14 rép. par côté »). (**→ 18/10, plus tard : légende « 8-14 rep / side », aucun compteur en mobilité**)
- **Code couleur des versions, sans rien masquer** : minimum en vert, normale en orange, « au mieux » en rouge. Chaque version garde son étiquette écrite (choix de Claude) : la couleur n'est jamais le seul repère, car environ 1 homme sur 12 voit mal les couleurs, surtout le rouge et le vert ([Colour Blind Awareness](https://www.colourblindawareness.org/colour-blindness/)). (**→ 18/10, plus tard : couches qui s'additionnent**)
- **Saisie du matin dans l'onglet « Lever tôt »** (question 27) : coucher, lever, réveil, nuit, lumière, note. Claude a lu « Ok pour la saisie des horaires de lever dans l'onglet lever tôt » comme le refus de son défaut, qui mettait cette saisie dans la carte du matin [Interprétation].

## 18/10/2026 — décisions de José (couches, deep squat, passages)

Réponses de José aux captures du soir et à la question 29 de `docs/reprise.md`.

- **Couches** (« Tu n'as pas compris l'idée des couleurs ») : le minimum (vert) s'ajoute à la principale (orange), qui s'ajoute au bonus (rouge) ; ensemble, ils forment la séance complète. Même gestion dans toute l'appli. Chaque exercice n'apparaît plus qu'une fois, dans la première couche qui le demande ; chaque bloc se valide par la couche atteinte. Lecture de Claude pour chaque bloc (`docs/SPEC.md` §5.1) :
  - matin : minimum, le premier mouvement de mobilité et le deep squat ; principale, le reste ;
  - week-end : minimum, le premier mouvement d'échauffement et le deep squat ; principale, la base ; bonus, ce que le « au mieux » ajoute à la base [Interprétation]. Le week-end complet additionne donc la base et le « au mieux » : le samedi, le swing et le goblet squat de la base restent, le pistol et le KT single leg deadlift s'ajoutent ;
  - midi : bonus ; bloc clé : minimum, 1 min de suspension seule et 2 min de deep squat, principale, les knee raises ; routine pied et single leg balance : principale ; étirements après la boxe : bonus [Interprétation].
- **« Normal » devient « principale »** : José proposait « principale » ou « courante » et demandait un meilleur nom. Claude garde « Principale », « courante » pouvant se lire « en cours ».
- **Deep squat dans le minimum de tous les matins** : 2 min, ancrage, paliers et week-end compris ; il fait donc partie de toutes les versions du matin. N1 passe de ≈ 3 à ≈ 5 min, la base du week-end de ≈ 20 à ≈ 22 min.
- **Passages** (question 29, « Non, tous les passages après 12 jours tenus ») : vers N2, vers le palier 1, puis d'un palier au suivant, la même règle, 12 jours tenus sur les 14 derniers. Elle remplace les 5 jours tenus sur 7 de l'ancrage et les 12 matins réussis sur 14 des paliers. Lecture de Claude [Interprétation] :
  - « sur 14 » et « dont les deux week-ends » sont repris de la règle du matin donnée le même jour ;
  - aux paliers, le jour tenu garde la définition de l'ancrage ;
  - le verdict de « Lever tôt » n'entre plus dans les passages (question 33) ;
  - le moment ne change pas : un niveau par cycle, N2 au plus tôt le lundi 23/11.
- **Forcer le passage** : un bouton, à tout moment, avec confirmation. Le cycle du nouveau niveau commence le jour du passage [Interprétation].
- **Aucun compteur dans les échauffements du matin** : aucun mouvement de mobilité n'a de compteur. Conséquence, signalée par Claude avant de coder : l'appli ne propose plus +2 répétitions au reverse table top ni au cossack squat ; José les règle avec « Ajuster ».
- **Légende du cossack squat et des mouvements du même type** : « 8-14 rep / side » ; pour le reverse table top, « 5-10 rep + tenue 10-30 s ». José a écrit « 8-10 rep / side » ; Claude garde la fourchette du programme, 8 à 14 [Interprétation, question 32].
