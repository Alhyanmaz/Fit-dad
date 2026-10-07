# Fit-dad v2 — cahier des charges

> Version du 06/10/2026, relue par un second agent. Rédigé pour Claude Code à partir du programme (`docs/PROGRAMME.md`), de la v1 en ligne (`index.html` à la racine du dépôt, code lisible après la bibliothèque React ; `README.md`) et de l'artefact « Lever tôt » (`legacy/lever-tot.html`).
> Les choix marqués **[Interprétation]** n'ont pas de source directe : ils sont à confirmer par José.
> Mise à jour du 07/10/2026 : décisions de José intégrées (`docs/decisions.md`, revue du kit).

## 1. Objet

Remplacer l'appli de suivi actuelle par une v2 qui :

- applique le programme 2026 (`docs/PROGRAMME.md`), sa journée type et sa semaine type ;
- intègre « Lever tôt » : le palier du matin décide du contenu du matin ;
- pilote la progression par critères de performance, jamais par la date ;
- garde le principe de la v1 : pendant la semaine de tests, José règle lui-même le cycle suivant ;
- s'installe sur le téléphone (PWA), fonctionne hors ligne, sans problème de zoom ;
- exporte et réimporte toutes les données dans un fichier.

## 2. Contexte d'usage

- Un seul utilisateur, José, sur un Google Pixel 10 Pro XL (Android, Chrome). Pas de compte, pas de serveur.
- Utilisation debout, entre deux séries, souvent d'une main, tôt le matin dans une pièce sombre.
- Trois moments par jour : matin (palier de « Lever tôt »), midi en semaine (au travail), soir (bloc clé et pied). Week-end : journée complète et bloc boxe.
- La boxe en club tombe un soir de semaine, jour variable : José le signale le jour même ou à l'avance.

## 3. Périmètre

**Dans la v2**

- Écran « Aujourd'hui » qui dit quoi faire maintenant, selon l'heure, le type de jour et le palier.
- Saisie des séances (séries, répétitions, tenues, charges, ressenti), minuteur de repos.
- Journal « Lever tôt » (coucher, lever, nuit, lumière, note), verdict du matin, passage de palier.
- Propositions de progression dans l'échelon, validées par José ; réglage manuel « Ajuster » ; règle « bas de jambe ».
- Cycles, semaine de décharge, tests, bilan et réglage du cycle suivant par José.
- Mesure hebdomadaire (poids ou tour de taille).
- Export et import des données ; import de l'historique « Lever tôt ».

**Hors périmètre**

- Critères de douleur, signes ou consignes d'arrêt : José s'en charge. L'appli n'affiche rien de ce type.
- Alimentation, sparring, synchronisation entre appareils, comptes, notifications push, lecture automatique de la Fitbit.
- Affichage des niveaux de preuve A à D : ils restent dans `docs/PROGRAMME.md`.
- Migration de l'historique de la v1 : décidé (Q10 = b, on repart de zéro). Au J6, une copie de la v1 reste consultable (`legacy/v1.html`, §8.1) ; aucun export n'est nécessaire.

## 4. Règles non négociables

Les mêmes sept règles figurent dans `CLAUDE.md`.

1. Toute progression dépend de la performance, jamais de la date.
2. Étirements : tenues de 30 s, jamais plus ; on progresse en nombre de séries.
3. Une seule hausse par semaine sur le bas de jambe (corde, mollets, tibialis) ; le sac est hors de la règle.
4. L'appli propose, José décide : aucun niveau ne change sans lui. Les changements de charge ou de variante ne sont jamais proposés : José les fait lui-même (« Ajuster », semaine de test).
5. Pas de musculation le soir.
6. Aucun critère de douleur ni consigne d'arrêt : José s'en charge.
7. Aucune donnée ne sort du téléphone, sauf par l'export lancé par José.

## 5. Écrans

### 5.1 Aujourd'hui (écran d'accueil)

- En-tête : date, palier en cours, type de jour (normal, boxe, récupération, décharge), semaine du cycle.
- Trois blocs : **Matin**, **Midi** (semaine seulement), **Soir**. Le week-end ajoute le **bloc boxe**.
- À l'ouverture, le bloc mis en avant suit l'heure, comme la v1 (`README.md`) : avant 11 h le matin, de 11 h à 15 h le midi, après 15 h le soir.
- Chaque bloc liste son contenu dans l'ordre, coché au fur et à mesure ; un tap ouvre la saisie.
- Bouton « Boxe ce soir » (et « Pas de boxe cette semaine »). Déclarer la boxe recalcule le soir du jour et le lendemain.
- Bandeaux contextuels : version courte conseillée (nuits hachées), semaine de décharge, propositions de progression à valider, rappel d'export.
- Navigation interne sans dépendre du chemin de l'URL (GitHub Pages n'a pas de repli pour les applis à une page) : état interne ou routes en `#`.

### 5.2 Séance (saisie)

- Une carte par exercice : nom, échelon (charge ou variante), cible du jour, côté le cas échéant, dernières performances.
- Saisie rapide : boutons − / + et valeur pré-remplie avec la cible ; tenues au chronomètre.
- Bouton **« Ajuster »** sur chaque carte (décision du 07/10/2026) : répétitions ou secondes (− / +), charge (matériel et échelons de `data/programme.json`, ou valeur libre), réglage série par série en option. Effet dès la séance suivante, sans validation supplémentaire, noté dans l'historique de l'exercice. Sert aussi aux niveaux de départ et à la reprise après une absence.
- Après la dernière série, le ressenti en trois choix : « Propre, ~2 en réserve », « Juste, 1 en réserve », « À l'échec ou technique dégradée ».
- Minuteur de repos (60 s entre deux tours par défaut), dans l'esprit de la v1 : calé sur l'heure de fin, donc juste au retour sur l'écran ; garde l'écran allumé (Wake Lock) si le navigateur le permet ; sonne et vibre à la fin quand l'écran est resté allumé.
- EMOM du swing : minuteur de 6 minutes qui bipe chaque minute ; en mode un bras, il affiche la main de chaque minute.

### 5.3 Lever tôt

Reprend l'artefact actuel (`legacy/lever-tot.html`), dans la même appli :

- cibles du palier (coucher, lever), journal du matin (couché hier à, levé à + bouton « Maintenant », nuit, lumière, note) ;
- verdict du jour, 7 derniers jours, barre de progression vers le palier suivant ;
- passage au palier suivant et retour d'un palier, toujours après confirmation ;
- échelle des paliers, grille des 4 dernières semaines, règles.

Le « plancher » n'est plus une case à part : il est fait quand la séance du matin du palier est faite, en version complète, courte ou minimum [Interprétation]. José peut aussi le cocher à la main.

### 5.4 Progression

- Pour chaque exercice : niveau actuel, « plafond atteint » le cas échéant, historique des niveaux (propositions acceptées ou refusées, réglages « Ajuster »), dernières séances.
- Propositions en attente, avec leur raison (« cible atteinte 2 séances de suite, ~2 en réserve »). José accepte ou refuse.
- État de la semaine « bas de jambe » : hausse déjà utilisée ou non, hausses programmées (reportées au lundi suivant ou étalées après les tests).

### 5.5 Cycle et tests

- Frise du cycle : semaines de travail, semaine de décharge, position actuelle.
- Saisie des 9 tests (`data/programme.json` → `tests`) avec le résultat précédent en regard.
- « Préparer le cycle suivant » : pour chaque exercice, José fixe le niveau de départ, l'échelon ou la variante, ajoute ou retire un exercice. Les choix prennent effet au début du cycle suivant ; les hausses « bas de jambe » décidées ici sont étalées, une par semaine (6.9).

### 5.6 Données et réglages

- Exporter une sauvegarde, restaurer depuis un fichier (avec confirmation, après une sauvegarde automatique de l'état actuel).
- Importer l'historique « Lever tôt » (`docs/MIGRATION.md`).
- Niveaux de départ (première ouverture, avec « Ajuster »), sac installé ou non, tib bar achetée ou non, swing à un bras actif ou non, jour de la mesure hebdomadaire.
- État du stockage persistant (`navigator.storage.persist()`), date du dernier export.

## 6. Règles métier

Toutes ces règles vivent dans `app/src/domain`, en fonctions pures testées (section 9). Les valeurs viennent de `data/programme.json`.

### 6.1 Type de jour

- **Jour de boxe** : José a déclaré la boxe en club ce soir-là.
- **Jour de récupération** : le lendemain d'un jour de boxe, sauf quand la boxe tombe le vendredi (pas de jour de récupération ce week-end-là, décision du 07/10/2026). Un jour de récupération tombe donc toujours en semaine.
- **Jour normal** : les autres jours.
- **Semaine de décharge** : se superpose au type de jour (section 6.10).
- Le samedi et le dimanche ajoutent le bloc boxe, sauf le samedi qui suit une boxe le vendredi.
- Une déclaration tardive (boxe saisie le soir même ou après coup) recalcule le soir du jour et tout le lendemain ; ce qui est déjà saisi reste tel quel.

### 6.2 Matin, selon le palier

Ordre fixe : respiration → café → mobilité → musculation → étirements, puis douche. Minutes par bloc :

| Palier | Respiration | Café (marge) | Mobilité | Musculation | Étirements | Total |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | — | — | 1 | 2 | — | 3 |
| 2 | 5 | 3 | 5 | 2 | — | 15 |
| 3 | 5 | 5 | 5 | 10 | 5 | 30 |
| 4 | 5 | 10 | 5 | 20 | 5 | 45 |
| 5 | 10 | 10 | 10 | 20 | 10 | 60 |

Contenu :

- **Mobilité** : palier 1, reverse table top et bear walk (30 s chacun [Interprétation]) ; paliers 2 à 4, la routine du jour à 30 s par mouvement, cossack et reverse table top en une série courte ; palier 5, la routine du jour à 60 s par mouvement. La routine du jour a la même lettre que la séance (A avant A, B avant B).
- **Musculation** : palier 1, 1 série de KT press (matin A) ou de rings row (matin B) ; palier 2, matin A : 1 série de KT press et 2 séries de 10 swings, matin B : 1 série de rings row et 1 série de goblet squat (décision du 07/10/2026 : les 4 patrons, un exercice du haut et un du bas chaque matin ; matin A ≈ 3 min, pris sur le café [Interprétation]) ; palier 3, 1 série de chaque exercice sans les éléments « palier 4 », swing compris en B ; paliers 4 et 5, 2 séries de la séance complète avec ajouts.
- **Étirements** : paliers 3 et 4, hanches 2 × 30 s ; palier 5, hanches 3 × 30 s puis pied et mollet 1 × 30 s.
- **Week-end, paliers 1 à 3** : la séance complète remplace la musculation du matin (A le samedi, B le dimanche, 3 séries + ajouts, environ 25 min). Aux paliers 1 et 2, elle est suivie des étirements de hanche 2 × 30 s ; au palier 3, ce sont ceux du matin, une seule fois.
- **Jour de récupération** : la musculation est remplacée par l'autre routine Mob. matin (pas celle de la veille), au ralenti, puis des neck CARs (3 par sens) ; étirements conservés. Palier 1 : reverse table top et bear walk, puis neck CARs, sans série de musculation ; palier 2 : l'autre routine à 30 s par mouvement, puis neck CARs [Interprétation].
- **Version courte** (retard au-delà de la marge du café) : 1 série par exercice, pas d'étirements. **Version minimum** (nuit très hachée) : un seul mouvement de mobilité. José choisit la version ; l'appli la propose (section 6.8, « Alléger »).

### 6.3 Alternances « la suivante »

- Musculation : A puis B d'un matin à l'autre, jour de récupération exclu. On fait toujours la séance qui suit la dernière faite, sans compter les jours.
- Week-end des paliers 1 à 3 : A le samedi, B le dimanche, y compris quand la boxe tombe le vendredi ; la séance du dimanche fixe la suivante (A le lundi).
- Routine pied : A puis B chaque soir sans boxe, jour de récupération compris.
- Thèmes de boxe : la rotation avance à chaque bloc qui utilise un thème de la rotation.
- Les pointeurs avancent quand le bloc est fait (ou marqué « sauté » par José), pas quand le jour passe.

### 6.4 Midi (semaine)

- Objectif : bouger le midi ; la marche est toujours valable (décision du 07/10/2026).
- Jour de boxe et jour de récupération : marche active, 40 min.
- Autres jours : corde et flow rope proposés tant que la semaine compte moins de 3 séances de corde **faites** ; sinon marche. Semaine sans boxe : en pratique corde les 3 premiers midis, marche les 2 autres ; boxe le vendredi : 4 midis éligibles (lundi à jeudi).
- Les 3 séances de corde sont un objectif, pas une obligation : l'appli affiche « corde : 2/3 cette semaine », sans alerte ni reproche.
- Bouton « Corde ↔ Marche » sur le bloc du midi : échange pour le jour même.
- Corde : alternance 1 min de corde, 1 min de flow ; 20 min au départ, jusqu'à 30 min. José ajoute 2 min avec un bouton quand il le décide ; l'appli ne le propose pas. Chaque +2 min est une hausse « bas de jambe » (6.9). Moitié de la durée en semaine de décharge.

### 6.5 Soir

- **Bloc clé** selon le jour : standard (≈ 8 min : 2 séries de suspension avec knee raises, one arm hang une fois les 80 s atteintes, deep squat 2 × 2 min), récupération (≈ 6 min : suspension passive sans knee raises ni one arm hang, deep squat à la charge habituelle), boxe (≈ 4 min : 1 suspension et 1 × 2 min de deep squat).
- **Routine pied** chaque soir sans boxe : la suivante (A : short foot et extension de mollet ; B : tibialis posterior et tibialis raise), 2 séries par exercice, puis les 4 étirements (étirement mollet, kiza, seiza, ATG split squat).
- Séries des 4 étirements : 1 au premier cycle ; 1 et 2 en alternance au deuxième ; 2 à partir du troisième.
- Soir de boxe : les 4 étirements du pied après la boxe, 1 série, facultatifs.
- Single leg balance : le matin et le soir, pendant le brossage des dents, 1 min par jambe.
- Si le soir déborde, premier levier proposé : 1 série de suspension au lieu de 2 [Interprétation].

### 6.6 Bloc boxe du week-end

- 5 rounds de 3 min, 1 min de repos (≈ 19 min), contenu dans `data/programme.json` → `boxe.maison`.
- Round 1 : corde, flow, corde le samedi ; flow, corde, flow le dimanche.
- Thème du samedi : la technique vue au club cette semaine (texte saisi par José) ; à défaut, le thème suivant de la rotation. Thème du dimanche : le thème suivant de la rotation.
- Boxe le vendredi : samedi normal, avec la musculation complète, mais sans bloc boxe ; un seul bloc le dimanche, technique du club en priorité (décision du 07/10/2026).
- Une case « vidéo 30 s du round 5 » une fois par semaine.
- Sac : tant que « sac installé » est faux, les rounds 4 et 5 se font sans sac. Première utilisation : un seul round, un seul jour ; le sac est hors de la règle « bas de jambe » (décision du 07/10/2026). En décharge, le sac est remplacé par du shadow.

### 6.7 Lever tôt

Reprend la logique de `legacy/lever-tot.html` :

- Une entrée par date : coucher de la veille, lever, nuit (calme, 1 réveil, plusieurs réveils, très hachée), lumière, minutes faites, plancher fait, note ; palier et cibles du jour figés à la première saisie.
- Verdict : **manqué** si le lever dépasse la cible de plus de 10 min ; **réussi** si le lever est tenu et que le plancher est fait, ou que la nuit est difficile (plusieurs réveils ou très hachée), ou que le palier ne l'exige pas (palier 1 : le lever seul valide le matin, décision du 07/10/2026) ; **partiel** sinon.
- Passage au palier suivant : au moins 5 matins réussis sur les 7 derniers jours (jours du palier en cours seulement), **dont le samedi et le dimanche**, et au moins 14 jours au palier 1, 7 jours ensuite (décision du 07/10/2026 : en semaine, le travail impose déjà le lever). La barre de progression montre les deux conditions (« 4/5 matins · week-end 1/2 »). Le bouton s'active ; José confirme. Retour d'un palier possible à tout moment, avec confirmation.
- L'état (palier, date de début) et les entrées sont importables depuis l'artefact actuel (`docs/MIGRATION.md`).

### 6.8 Progression des exercices

Définitions :

- **Échelon** : une charge ou une variante (KT press 16 kg ; pistol appui 45 cm ; bande 2).
- **Niveau** : un échelon et une cible (répétitions par série, ou secondes de tenue), éventuellement différents d'une série à l'autre. Exemple : « 16 kg × 8 ».

Trois façons de faire évoluer un exercice (décision du 07/10/2026) :

1. **Proposition de l'appli, dans le même échelon** : +2 répétitions (`progression.pas_de_repetitions`), le dernier pas s'arrêtant au haut de la fourchette (pistol 5 → 7 → 8 ; Copenhagen et short foot 5 → 7 → 9 → 10) ; +`pas_s` secondes pour une tenue (5 s, 2 s pour le L-sit). Au haut de la fourchette : « plafond atteint », sans autre proposition. José accepte ou refuse.
2. **« Ajuster »**, par José, à tout moment (§5.2).
3. **Semaine de test** : « Préparer le cycle suivant » (§5.5).

Les changements d'échelon (charge ou variante) ne sont **jamais proposés** : pas de séries mixtes automatiques, pas de passage automatique au kettlebell suivant. José les fait avec « Ajuster » (série par série s'il le veut) ou en semaine de test.

Décisions, après chaque séance d'un exercice :

| Décision | Condition | Proposition |
| --- | --- | --- |
| Monter | Cible atteinte sur toutes les séries, 2 séances de suite, ressenti « Propre, ~2 en réserve » les deux fois | +2 répétitions ou +`pas_s`, sans dépasser la fourchette |
| Maintenir | Cible atteinte, ressenti « À l'échec ou technique dégradée » ; ou « Juste, 1 en réserve » [Interprétation] | Aucune |
| Redescendre d'un cran | Cible manquée 2 séances de suite | −2 répétitions ou −`pas_s`, sans passer sous la fourchette [Interprétation] |
| Alléger | Plusieurs nuits difficiles de suite dans « Lever tôt » (2 ou plus), ou José signale une fréquence cardiaque au repos nettement au-dessus de sa moyenne | Version courte du matin [Interprétation] |

- Pas de règle de reprise après une absence : José règle ses exercices avec « Ajuster » (décision du 07/10/2026).
- Les séances d'une seule série (paliers 1 à 3) comptent pour les décisions [Interprétation].
- Pas de décision pendant la semaine de décharge.
- « Pousser plus loin » : la dernière semaine du cycle, une option sur la dernière série de pompes, rings row, traction assistée et goblet squat. Une série marquée « poussée » ne déclenche pas « Maintenir » [Interprétation].
- Cas particuliers :
  - reverse table top : seules les répétitions sont proposées (5 → 10) ; la tenue (10 → 30 s) se règle avec « Ajuster » ;
  - suspension : +5 s de 50 à 80 s, knee raises +2 de 5 à 20 ; le passage au hanging leg raise (8 → 18) et l'ajout du one arm hang à 80 s (10 → 20 s, +5 s) se font avec « Ajuster » ;
  - deep squat : le contrepoids (16 → 10 → 5 kg → poids du corps) se retire avec « Ajuster » ;
  - goblet squat (20 répétitions fixes) et swing (6 × 10) : aucune proposition ; la charge se règle avec « Ajuster » ;
  - single leg balance : « 1 min propre sur chaque jambe, deux fois de suite » s'affiche comme « plafond atteint » ; le niveau suivant se règle avec « Ajuster » [Interprétation] ;
  - étirements : séries fixées par le cycle, pas de décision.
- Toute proposition attend la validation de José. Un refus est gardé dans l'historique.

### 6.9 Bas de jambe : une hausse par semaine

- Éléments : corde (durée du midi), mollets (extension de mollet), tibialis (tibialis posterior ou tibialis raise). La marche n'a pas de progression ; le sac est hors de la règle (décision du 07/10/2026).
- Une **hausse** : +2 min de corde (bouton, décidé par José), ou un changement d'échelon (charge ou variante) des mollets ou des tibialis (« Ajuster » ou semaine de test). Les +2 répétitions dans un échelon ne comptent pas.
- Au plus une hausse par semaine ISO (lundi à dimanche), aucune en décharge.
- Règle stricte : une hausse demandée alors que celle de la semaine est déjà prise n'est pas appliquée ; l'appli propose de la programmer pour le lundi suivant.
- Après une semaine de test, plusieurs hausses décidées ensemble sont étalées, une par semaine, dans l'ordre corde → mollets → tibialis ; José voit le calendrier et peut changer l'ordre.

### 6.10 Cycle, décharge, tests

- Cycle par défaut : 4 semaines de travail, puis 1 semaine de décharge. José peut avancer la décharge (« tout stagne ») ou la décaler jusqu'à 6 semaines.
- Décharge : musculation et exercices du pied à 1 série, mêmes charges ; corde réduite de moitié ; sac remplacé par du shadow ; mobilité, étirements, bloc clé et équilibre inchangés ; tests.
- Tests : en semaine 1 du programme, puis pendant chaque décharge, dans les mêmes conditions.
- Après les tests : écran « Préparer le cycle suivant » (5.5) ; les hausses « bas de jambe » s'étalent, une par semaine (6.9). Le numéro de cycle augmente au début du cycle suivant ; il règle les séries des étirements du pied.
- Mesure hebdomadaire : poids ou tour de taille, le jour choisi ; ce n'est pas un critère de progression.

## 7. Données

### 7.1 Programme

- `data/programme.json` est la source des valeurs (exercices, échelons, fourchettes, paliers, rotations, tests). Le valider au chargement avec un schéma zod ; `pas_s` et les champs `*_interpretation` sont facultatifs.
- Les réglages de José (niveaux de départ, exercices ajoutés, variantes choisies) sont des données utilisateur ; ils ne modifient pas le fichier.

### 7.2 Stockage local

- IndexedDB (Dexie), base nommée `fit-dad-v2`. La v1 stocke ses données dans le `localStorage`, clés préfixées `suivi_app_` : la v2 ne les lit pas, ne les écrit pas, ne les efface pas.
- Magasins indicatifs : journal par date (blocs faits, version du matin), séances (séries saisies), niveaux par exercice, réglages « Ajuster » et décisions, hausses « bas de jambe » programmées, Lever tôt (entrées, état du palier), cycles, tests, mesures, réglages, méta (version du format, date du dernier export).
- Demander `navigator.storage.persist()` au premier lancement.

### 7.3 Export et import

- Export : un fichier JSON `fit-dad-sauvegarde-AAAA-MM-JJ.json` contenant `{ app: "fit-dad", version_format, exporte_le, donnees }`.
- Import : validation complète, aperçu (dates couvertes, nombre de séances), confirmation, sauvegarde automatique de l'état actuel avant de remplacer.
- Rappel discret quand le dernier export date de plus de 7 jours.
- Aucun fichier de données personnelles dans le dépôt (le dépôt est public).

## 8. Exigences techniques

- Vite, React, TypeScript strict ; `vite-plugin-pwa` ; Dexie ; zod ; Vitest ; ESLint et Prettier. Versions figées dans `package-lock.json` et montées seulement lors d'une session dédiée ; TypeScript 6.0 tant que `typescript-eslint` n'accepte pas la version 7 ; Dexie et `vite-plugin-pwa` sont ajoutés au J3, quand on en a besoin.
- Emplacement : le code de la v2 vit dans `app/` ; la v1 reste intacte à la racine du dépôt jusqu'au J6, où la v2 la remplace (§8.1).
- Structure de `app/src` : `domain` (règles, sans React), `data` (chargement et schéma du programme), `storage` (base, export, import), `ui` (écrans, composants).
- **Publication sans GitHub Actions.** Les sessions Claude Code dans le cloud ne peuvent pas pousser de fichiers sous `.github/workflows/` (ticket ouvert [anthropics/claude-code#61189](https://github.com/anthropics/claude-code/issues/61189)). GitHub Pages reste donc en « Deploy from a branch », `main`, racine : la v1 reste servie telle quelle, et le build de la v2 est commité dans le dossier `v2/` du dépôt (`base: '/Fit-dad/v2/'`, `outDir: '../v2'`), servi sous `https://alhyanmaz.github.io/Fit-dad/v2/`.
- Le build est toujours refait et commité dans un commit à part (« build v2 »), après des tests verts, pour que José puisse l'ignorer en relisant la PR.
- Le site sert tout le dépôt, `docs/` et `legacy/` compris : c'est sans conséquence, le dépôt est déjà public.
- Téléphone d'abord, de 360 à 430 px de large ; thème sombre dans l'esprit de la v1 (fond `#161B19`).
- Aucun zoom involontaire et rien à zoomer : textes de 16 px au moins, champs à 16 px au moins, cibles tactiles de 44 px au moins, `touch-action: manipulation` sur les boutons.
- Hors ligne complet ; quand une nouvelle version est prête, un bandeau propose de recharger.
- Aucune requête réseau à l'exécution : pas de police en ligne, pas de statistiques, pas de CDN.
- Interface entièrement en français ; dates à la française, heures sur 24 h ; fuseau Europe/Paris ; semaines du lundi au dimanche.
- Accessibilité de base : libellés sur tous les champs, contraste suffisant, navigation possible sans geste complexe.
- Qualité : tests Vitest pour `app/src/domain` (scénarios de la section 9), lancés dans la session avant chaque commit ; la PR dit « tests verts, build à jour ».

### 8.1 Service workers et remplacement de la v1 (J6)

- La v1 enregistre `sw.js` avec la portée `/Fit-dad/`, qui couvre aussi `/Fit-dad/v2/`. Il fonctionne « réseau d'abord » : en ligne, `/v2/` arrive bien du réseau ; hors ligne, avant l'installation du service worker de la v2, il peut renvoyer la page de la v1. Sans gravité pendant le développement.
- Jusqu'au J6, le service worker de la v2 est enregistré avec la portée `/Fit-dad/v2/`.
- Au J6, la v2 **remplace** la v1 à la racine (décision du 07/10/2026) : pas de dossier `v1/`, pas d'export obligatoire. Liste de contrôle :
  1. Copier l'`index.html` de la v1 dans `legacy/v1.html`, sans autre modification. Servie depuis le même site, cette copie devrait retrouver les données de la v1, rangées par site et non par page [Interprétation, à vérifier sur le téléphone]. Son service worker ne peut pas s'y réenregistrer : aucun `sw.js` à côté d'elle.
  2. Construire la v2 pour la racine (`base: '/Fit-dad/'`) dans un dossier temporaire, puis remplacer les fichiers de la v1 à la racine (`index.html`, `sw.js`, `manifest.webmanifest`, `icons/`) sans toucher à `app/`, `data/`, `docs/`, `legacy/`. Ne jamais vider la racine (`emptyOutDir`).
  3. Le service worker de la v2 garde le nom `sw.js` et la portée `/Fit-dad/` : le navigateur le traite comme une mise à jour de celui de la v1, dont la règle d'effacement des caches cesse alors de s'appliquer [Interprétation]. Son repli de navigation exclut `/Fit-dad/legacy/` (`navigateFallbackDenylist`), sinon la copie de la v1 serait masquée. À son activation, il supprime le cache de la v1 (`fitdad-v*`).
  4. Le manifeste de la v2 garde `start_url` et `scope` de la v1 (`./`), pour que l'icône déjà installée ouvre la v2 [Non vérifié sur Android ; au pire, José réinstalle l'icône].
  5. Retirer `v2/` ; si José a installé l'icône de test `/v2/`, il la désinstalle.
  6. Vérifier sur le téléphone : la v2 à la racine, en ligne et hors ligne, ouverte par l'icône existante ; `legacy/v1.html` affiche l'historique de la v1.

## 9. Scénarios de recette

À écrire en tests automatisés avant ou avec le code correspondant. Dates de 2026.

1. **Semaine type, boxe le mardi, palier 4** : lundi A, mardi B, mercredi récupération, jeudi A, vendredi B, samedi A, dimanche B. Midis : corde lundi, jeudi, vendredi ; marche mardi et mercredi. Soirs : pied A lundi, aucun pied mardi (boxe), pied B mercredi, puis A, B, A, B.
2. **Boxe le vendredi** : pas de jour de récupération ; samedi, séance complète A (paliers 1 à 3), sans bloc boxe ; dimanche, séance complète B et un seul bloc boxe, technique du club en priorité ; 4 midis éligibles à la corde (lundi à jeudi), corde proposée tant que moins de 3 séances sont faites.
3. **Semaine sans boxe** : aucun jour de récupération ; corde 3 midis, marche 2 ; pied tous les soirs en alternance.
4. **Palier 1, matin A** : reverse table top, bear walk, 1 série de KT press ; total 3 min. **Matin B** : même déroulé avec 1 série de rings row.
5. **Palier 2, matin B** : respiration 5 min, café 3 min, routine B à 30 s par mouvement, 1 série de rings row et 1 série de goblet squat. **Matin A** : routine A, 1 série de KT press et 2 séries de 10 swings.
6. **Palier 3, samedi** : séance complète A, 3 séries + ajouts, puis un seul bloc d'étirements de hanche 2 × 30 s.
7. **Jour de récupération après un mardi B, palier 4** : mobilité A au ralenti puis neck CARs, pas de musculation ; marche ; bloc clé version récupération et pied complet.
8. **Lever tôt** : 14 jours au palier 1, 5 matins réussis sur 7 dont le samedi et le dimanche → passage proposé, appliqué seulement après confirmation ; 5 matins réussis du lundi au vendredi, week-end manqué → pas de passage. Nuit « très hachée » + lever à l'heure sans plancher au palier 3 → réussi. Lever à cible + 11 min → manqué.
9. **Progression** : KT press 16 kg × 12 sur toutes les séries, 2 séances de suite, « Propre » → proposition 16 kg × 14 ; à 16 kg × 14, tenu 2 fois → « plafond atteint », aucune proposition de charge. Pistol appui 45 cm × 7 tenu 2 fois → proposition × 8, pas × 9. Cible manquée 2 fois → proposition −2 répétitions, jamais sous le bas de la fourchette. Aucun niveau ne change sans validation.
10. **Bas de jambe** : cette semaine, José a déjà ajouté 2 min de corde ; il passe l'extension de mollet au bidon de 5 kg avec « Ajuster » → l'appli propose de l'appliquer lundi prochain. Après une semaine de test, corde, mollets et tibialis montent tous → étalés sur 3 semaines, dans cet ordre. Une montée de +2 répétitions dans un échelon reste possible. Introduire le sac ne compte pas.
11. **Décharge** : séances à 1 série, mêmes charges ; corde 10 min si la durée courante est 20 min ; aucune proposition de progression ; tests proposés.
12. **Étirements du pied** : cycle 1 → 1 série ; cycle 2 → 1 et 2 en alternance ; cycle 3 → 2 séries.
13. **Ajuster** : José règle le KT press à 1 série de 20 kg × 6 et 1 série de 16 kg × 14 → la séance suivante affiche ces cibles, sans validation ; le réglage figure dans l'historique. Après 9 jours sans séance, rien ne change tout seul.
14. **Export puis import** sur une base vide : toutes les données reviennent à l'identique.

## 10. Jalons

Une session Claude Code et une PR par jalon. José relit sur son téléphone, puis fusionne.

| Jalon | Contenu | Fini quand |
| --- | --- | --- |
| J0 Socle | `app/` (Vite, React, TS, lint, Vitest), build commité dans `v2/`, page d'accueil qui lit `data/programme.json` | La v1 marche comme avant ; `/Fit-dad/v2/` affiche la page d'accueil ; tests verts |
| J1 Programme | Schéma zod de `data/programme.json`, relecture ligne à ligne contre `docs/PROGRAMME.md`, écarts signalés | Le fichier se valide ; écarts tranchés avec José |
| J2 Moteur | `app/src/domain` : type de jour, matin par palier, alternances, midi, soir, bloc boxe | Scénarios 1 à 7 et 12 verts |
| J3 Aujourd'hui | Écran Aujourd'hui, saisie des séances, « Ajuster », minuteur, stockage, export et import | Une journée entière saisie sur le téléphone ; scénarios 13 et 14 verts |
| J4 Lever tôt | Journal, verdict, paliers, historique, import depuis l'artefact | Scénario 8 vert ; données de l'artefact importées |
| J5 Progression | Propositions dans l'échelon, bas de jambe, cycle, décharge, tests, préparation du cycle suivant | Scénarios 9 à 11 verts |
| J6 Bascule | Liste de contrôle du §8.1 : la v2 remplace la v1 à la racine | v2 à la racine, ouverte par l'icône existante ; copie de la v1 consultable sous `/Fit-dad/legacy/v1.html` |

## 11. Questions ouvertes

Aucune. Les dix questions du 06/10 ont été tranchées le 07/10/2026 (`docs/decisions.md`) :

1. Palier 1 : le lever seul valide le matin ; le passage de palier exige en plus le samedi et le dimanche réussis.
2. Knee raises : +2 ; le passage au hanging leg raise se fait avec « Ajuster ».
3. Pas : +2 répétitions, plafonné au haut de la fourchette (pistol 5 → 7 → 8).
4. Tibialis posterior au-delà de 24 : résistance réglée par José (« Ajuster »).
5. Reverse table top : +2 répétitions proposées ; la tenue se règle avec « Ajuster ».
6. Deep squat : contrepoids retiré par José (« Ajuster »).
7. Carry et one arm hang : +5 s.
8. Bas de jambe : corde, mollets, tibialis ; règle stricte avec report au lundi ; sac hors de la règle.
9. Boxe le vendredi : pas de jour de récupération ; musculation complète samedi et dimanche ; bloc boxe le dimanche seulement.
10. Nom : Fit-dad.
