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
- **Lever tôt** : au palier 1, le lever seul valide le matin. Passage de palier : 5 matins réussis sur 7, **dont le samedi et le dimanche** (en semaine, le travail impose déjà le lever).
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

