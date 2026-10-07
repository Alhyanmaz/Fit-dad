# Fit-dad v2 — cahier des charges

> Version du 06/10/2026, relue par un second agent. Rédigé pour Claude Code à partir du programme (`docs/PROGRAMME.md`), de la v1 en ligne (`index.html` à la racine du dépôt, code lisible après la bibliothèque React ; `README.md`) et de l'artefact « Lever tôt » (`legacy/lever-tot.html`).
> Les choix marqués **[Interprétation]** n'ont pas de source directe : ils sont à confirmer par José.

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
- Propositions de progression validées par José, règle « bas de jambe ».
- Cycles, semaine de décharge, tests, bilan et réglage du cycle suivant par José.
- Mesure hebdomadaire (poids ou tour de taille).
- Export et import des données ; import de l'historique « Lever tôt ».

**Hors périmètre**

- Critères de douleur, signes ou consignes d'arrêt : José s'en charge. L'appli n'affiche rien de ce type.
- Alimentation, sparring, synchronisation entre appareils, comptes, notifications push, lecture automatique de la Fitbit.
- Affichage des niveaux de preuve A à D : ils restent dans `docs/PROGRAMME.md`.
- Migration de l'historique de la v1 : décidé (Q10 = b, on repart de zéro). La v1 reste ouvrable pour exporter et consulter son historique.

## 4. Règles non négociables

1. Toute progression dépend de la performance, jamais de la date.
2. Étirements : tenues de 30 s, jamais plus ; on progresse en nombre de séries.
3. Une seule hausse par semaine sur le bas de jambe (corde, mollets, tibialis, sac).
4. L'appli propose, José décide : aucun niveau ne change sans validation.
5. Pas de musculation le soir.
6. Aucune donnée ne sort du téléphone, sauf par l'export lancé par José.

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

- Pour chaque exercice : niveau actuel, historique des niveaux, dernières séances.
- Propositions en attente, avec leur raison (« cible atteinte 2 séances de suite, ~2 en réserve »). José accepte ou refuse.
- État de la semaine « bas de jambe » : hausse déjà utilisée ou non, prochain élément de la rotation, éléments en attente.

### 5.5 Cycle et tests

- Frise du cycle : semaines de travail, semaine de décharge, position actuelle.
- Saisie des 9 tests (`data/programme.json` → `tests`) avec le résultat précédent en regard.
- « Préparer le cycle suivant » : pour chaque exercice, José fixe le niveau de départ, l'échelon ou la variante, ajoute ou retire un exercice. Les choix prennent effet au début du cycle suivant.

### 5.6 Données et réglages

- Exporter une sauvegarde, restaurer depuis un fichier (avec confirmation, après une sauvegarde automatique de l'état actuel).
- Importer l'historique « Lever tôt » (`docs/MIGRATION.md`).
- Niveaux de départ (première ouverture), sac installé ou non, tib bar achetée ou non, swing à un bras actif ou non, jour de la mesure hebdomadaire, absence à déclarer.
- État du stockage persistant (`navigator.storage.persist()`), date du dernier export.

## 6. Règles métier

Toutes ces règles vivent dans `app/src/domain`, en fonctions pures testées (section 9). Les valeurs viennent de `data/programme.json`.

### 6.1 Type de jour

- **Jour de boxe** : José a déclaré la boxe en club ce soir-là.
- **Jour de récupération** : le lendemain d'un jour de boxe.
- **Jour normal** : les autres jours.
- **Semaine de décharge** : se superpose au type de jour (section 6.10).
- Le samedi et le dimanche ajoutent le bloc boxe, sauf s'ils sont jour de récupération.
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
- **Musculation** : palier 1, 1 série du premier exercice de la séance du jour (KT press en A, pompes en B) ; palier 2, 1 série de chaque exercice du binôme 1 ; palier 3, 1 série de chaque exercice sans les éléments « palier 4 », swing compris en B ; paliers 4 et 5, 2 séries de la séance complète avec ajouts.
- **Étirements** : paliers 3 et 4, hanches 2 × 30 s ; palier 5, hanches 3 × 30 s puis pied et mollet 1 × 30 s.
- **Week-end, paliers 1 à 3** : la séance complète remplace la musculation du matin (A le samedi, B le dimanche, 3 séries + ajouts, environ 25 min). Aux paliers 1 et 2, elle est suivie des étirements de hanche 2 × 30 s ; au palier 3, ce sont ceux du matin, une seule fois.
- **Jour de récupération** : la musculation est remplacée par l'autre routine Mob. matin (pas celle de la veille), au ralenti, puis des neck CARs (3 par sens) ; étirements conservés. Palier 1 : reverse table top et bear walk, puis neck CARs, sans série de musculation ; palier 2 : l'autre routine à 30 s par mouvement, puis neck CARs [Interprétation].
- **Version courte** (retard au-delà de la marge du café) : 1 série par exercice, pas d'étirements. **Version minimum** (nuit très hachée) : un seul mouvement de mobilité. José choisit la version ; l'appli la propose (section 6.8, « Alléger »).

### 6.3 Alternances « la suivante »

- Musculation : A puis B d'un matin à l'autre, jour de récupération exclu. On fait toujours la séance qui suit la dernière faite, sans compter les jours.
- Week-end des paliers 1 à 3 : A le samedi, B le dimanche ; la séance du dimanche fixe la suivante (A le lundi). Si le samedi est jour de récupération (boxe le vendredi), le dimanche fait la suivante [Interprétation, question 9 du §11].
- Routine pied : A puis B chaque soir sans boxe, jour de récupération compris.
- Thèmes de boxe : la rotation avance à chaque bloc qui utilise un thème de la rotation.
- Les pointeurs avancent quand le bloc est fait (ou marqué « sauté » par José), pas quand le jour passe.

### 6.4 Midi (semaine)

- Jour de boxe et jour de récupération : marche active, 40 min.
- Autres jours : corde et flow rope tant que la semaine compte moins de 3 séances de corde ; sinon marche. Semaine sans boxe : corde les 3 premiers midis, marche les 2 autres ; boxe le vendredi : 4 midis éligibles, corde les 3 premiers. José peut toujours échanger [Interprétation].
- Corde : alternance 1 min de corde, 1 min de flow ; 20 min au départ, puis +2 min par semaine jusqu'à 30 min. Chaque +2 min est une hausse « bas de jambe » (6.9), accordée si la durée en cours a été tenue la semaine précédente [Interprétation]. Moitié de la durée en semaine de décharge.

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
- Boxe le vendredi : samedi = jour de récupération, sans bloc boxe ; un seul bloc le dimanche, technique du club en priorité.
- Une case « vidéo 30 s du round 5 » une fois par semaine.
- Sac : tant que « sac installé » est faux, les rounds 4 et 5 se font sans sac. Première utilisation : un seul round, un seul jour, et cela consomme la hausse « bas de jambe » de la semaine. En décharge, le sac est remplacé par du shadow.

### 6.7 Lever tôt

Reprend la logique de `legacy/lever-tot.html` :

- Une entrée par date : coucher de la veille, lever, nuit (calme, 1 réveil, plusieurs réveils, très hachée), lumière, minutes faites, plancher fait, note ; palier et cibles du jour figés à la première saisie.
- Verdict : **manqué** si le lever dépasse la cible de plus de 10 min ; **réussi** si le lever est tenu et que le plancher est fait, ou que la nuit est difficile (plusieurs réveils ou très hachée), ou que le palier ne l'exige pas (palier 1) ; **partiel** sinon.
- Passage au palier suivant : au moins 5 matins réussis sur les 7 derniers jours (jours du palier en cours seulement) et au moins 14 jours au palier 1, 7 jours ensuite. Le bouton s'active ; José confirme. Retour d'un palier possible à tout moment, avec confirmation.
- L'état (palier, date de début) et les entrées sont importables depuis l'artefact actuel (`docs/MIGRATION.md`).

### 6.8 Progression des exercices

Définitions :

- **Échelon** : une charge ou une variante (KT press 16 kg ; pistol appui 45 cm ; bande 2).
- **Niveau** : un échelon et une cible (répétitions par série, ou secondes de tenue). Exemple : « 16 kg × 8 ».
- Dans un échelon, la cible monte par pas de 2 répétitions (`progression.pas_de_repetitions`) [Interprétation], ou de `pas_s` secondes pour une tenue, jusqu'au haut de la fourchette. Le niveau suivant est l'échelon suivant, au bas de la fourchette.
- **Séries mixtes** (`series_mixtes`, sauts de kettlebell de 4 à 8 kg) : au changement d'échelon, une seule série passe à la charge suivante, puis une de plus à chaque montée, jusqu'à ce que toutes y soient [Interprétation sur le rythme, et pour les passages bidon → kettlebell].
- Swing en EMOM : une minute de plus à la charge suivante à chaque montée.

Décisions, après chaque séance d'un exercice :

| Décision | Condition |
| --- | --- |
| Monter | Cible atteinte sur toutes les séries, 2 séances de suite, ressenti « Propre, ~2 en réserve » les deux fois |
| Maintenir | Cible atteinte, ressenti « À l'échec ou technique dégradée » ; ou « Juste, 1 en réserve » [Interprétation] |
| Redescendre d'un cran | Cible manquée 2 séances de suite |
| Alléger | Plusieurs nuits difficiles de suite dans « Lever tôt » (2 ou plus), ou José signale une fréquence cardiaque au repos nettement au-dessus de sa moyenne : version courte proposée [Interprétation] |
| Reprise après absence | Aucune séance de musculation pendant 7 jours ou plus, ou absence déclarée par José : au retour, niveau précédent pour tous les exercices ; 14 jours ou plus, 2 niveaux en dessous [Interprétation] |

- Pas de minuteur d'absence par exercice : aux paliers 1 à 3, certains exercices ne reviennent qu'une fois par semaine (le week-end).
- Les séances d'une seule série (paliers 1 à 3) comptent pour les décisions [Interprétation].
- Pas de décision pendant la semaine de décharge.
- « Pousser plus loin » : la dernière semaine du cycle, une option sur la dernière série de pompes, rings row, traction assistée et goblet squat. Une série marquée « poussée » ne déclenche pas « Maintenir » [Interprétation].
- Cas particuliers : deep squat (le contrepoids diminue, 16 → 10 → 5 kg → poids du corps) ; suspension (+5 s de 50 à 80 s, knee raises de 5 à 20, puis hanging leg raise de 8 à 18 ; one arm hang débloqué à 80 s) ; single leg balance (niveau suivant après 1 min propre sur chaque jambe, deux fois de suite) ; étirements (séries fixées par le cycle, pas de décision). Les pas non précisés sont dans le §11.
- Toute proposition attend la validation de José. Un refus est gardé dans l'historique.

### 6.9 Bas de jambe : une hausse par semaine

- Éléments : corde (durée du midi), mollets (extension de mollet), tibialis (tibialis posterior ou tibialis raise), sac.
- Une **hausse** est un changement d'échelon (charge ou variante) pour les mollets et les tibialis, +2 min pour la corde, l'introduction du sac ou un round de sac en plus. Les +2 répétitions dans un échelon ne comptent pas [Interprétation, appuyée sur « une seule hausse de charge par semaine »].
- Au plus une hausse par semaine ISO (lundi à dimanche) sur l'ensemble de ces éléments, aucune en décharge.
- Rotation : corde → mollets → tibialis → sac. Quand plusieurs éléments sont éligibles, la hausse va au plus proche dans la rotation, à partir de celui qui suit la dernière hausse. Les autres restent « en attente : bas de jambe » [Interprétation].

### 6.10 Cycle, décharge, tests

- Cycle par défaut : 4 semaines de travail, puis 1 semaine de décharge. José peut avancer la décharge (« tout stagne ») ou la décaler jusqu'à 6 semaines.
- Décharge : musculation et exercices du pied à 1 série, mêmes charges ; corde réduite de moitié ; sac remplacé par du shadow ; mobilité, étirements, bloc clé et équilibre inchangés ; tests.
- Tests : en semaine 1 du programme, puis pendant chaque décharge, dans les mêmes conditions.
- Après les tests : écran « Préparer le cycle suivant » (5.5). Le numéro de cycle augmente au début du cycle suivant ; il règle les séries des étirements du pied.
- Mesure hebdomadaire : poids ou tour de taille, le jour choisi ; ce n'est pas un critère de progression.

## 7. Données

### 7.1 Programme

- `data/programme.json` est la source des valeurs (exercices, échelons, fourchettes, paliers, rotations, tests). Le valider au chargement avec un schéma zod ; `pas_s` et les champs `*_interpretation` sont facultatifs.
- Les réglages de José (niveaux de départ, exercices ajoutés, variantes choisies) sont des données utilisateur ; ils ne modifient pas le fichier.

### 7.2 Stockage local

- IndexedDB (Dexie), base nommée `fit-dad-v2`. La v1 stocke ses données dans le `localStorage`, clés préfixées `suivi_app_` : la v2 ne les lit pas, ne les écrit pas, ne les efface pas.
- Magasins indicatifs : journal par date (blocs faits, version du matin), séances (séries saisies), niveaux par exercice et décisions, Lever tôt (entrées, état du palier), cycles, tests, mesures, réglages, méta (version du format, date du dernier export).
- Demander `navigator.storage.persist()` au premier lancement.

### 7.3 Export et import

- Export : un fichier JSON `fit-dad-sauvegarde-AAAA-MM-JJ.json` contenant `{ app: "fit-dad", version_format, exporte_le, donnees }`.
- Import : validation complète, aperçu (dates couvertes, nombre de séances), confirmation, sauvegarde automatique de l'état actuel avant de remplacer.
- Rappel discret quand le dernier export date de plus de 7 jours.
- Aucun fichier de données personnelles dans le dépôt (le dépôt est public).

## 8. Exigences techniques

- Vite, React, TypeScript strict ; `vite-plugin-pwa` ; Dexie ; zod ; Vitest ; ESLint et Prettier.
- Emplacement : le code de la v2 vit dans `app/` ; la v1 reste intacte à la racine du dépôt jusqu'à la bascule (J6).
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

### 8.1 Service workers et bascule (J6)

- La v1 enregistre `sw.js` avec la portée `/Fit-dad/`, qui couvre aussi `/Fit-dad/v2/`. Il fonctionne « réseau d'abord » : en ligne, `/v2/` arrive bien du réseau ; hors ligne, avant l'installation du service worker de la v2, il peut renvoyer la page de la v1. Sans gravité pendant le développement.
- Le service worker de la v2 est enregistré avec la portée `/Fit-dad/v2/` jusqu'à la bascule.
- Liste de contrôle de la bascule :
  1. José exporte l'historique de la v1 (bouton « Exporter une sauvegarde »).
  2. Les fichiers de la v1 passent dans `v1/` ; l'enregistrement de son service worker y est retiré (seule modification autorisée de la v1). Raison : à son activation, `sw.js` efface tous les caches sauf le sien, donc aussi ceux de la v2.
  3. Le build de la v2 passe à la racine, avec la portée `/Fit-dad/`. Son repli de navigation exclut `/Fit-dad/v1/` (`navigateFallbackDenylist`), sinon la v1 devient inaccessible.
  4. Le manifeste de la v2 garde `start_url` et `scope` de la v1 (`./`), pour que l'icône déjà installée ouvre la v2.
  5. Si José a installé `/v2/` pour tester, il désinstalle cette icône de test.
  6. Vérifier sur le téléphone : la v2 à la racine, en ligne et hors ligne ; la v1 sous `/Fit-dad/v1/`, son export toujours possible.

## 9. Scénarios de recette

À écrire en tests automatisés avant ou avec le code correspondant. Dates de 2026.

1. **Semaine type, boxe le mardi, palier 4** : lundi A, mardi B, mercredi récupération, jeudi A, vendredi B, samedi A, dimanche B. Midis : corde lundi, jeudi, vendredi ; marche mardi et mercredi. Soirs : pied A lundi, aucun pied mardi (boxe), pied B mercredi, puis A, B, A, B.
2. **Boxe le vendredi** : samedi = récupération, sans bloc boxe ; dimanche, un seul bloc, technique du club en priorité ; 4 midis éligibles à la corde, 3 proposés.
3. **Semaine sans boxe** : aucun jour de récupération ; corde 3 midis, marche 2 ; pied tous les soirs en alternance.
4. **Palier 1, matin A** : reverse table top, bear walk, 1 série de KT press ; total 3 min.
5. **Palier 2, matin B** : respiration 5 min, café 3 min, routine B à 30 s par mouvement, 1 série de pompes et 1 série de goblet squat.
6. **Palier 3, samedi** : séance complète A, 3 séries + ajouts, puis un seul bloc d'étirements de hanche 2 × 30 s.
7. **Jour de récupération après un mardi B, palier 4** : mobilité A au ralenti puis neck CARs, pas de musculation ; marche ; bloc clé version récupération et pied complet.
8. **Lever tôt** : 14 jours au palier 1, 5 matins réussis sur 7 → passage proposé, appliqué seulement après confirmation. Nuit « très hachée » + lever à l'heure sans plancher au palier 3 → réussi. Lever à cible + 11 min → manqué.
9. **Progression** : KT press 16 kg × 14 sur toutes les séries, 2 séances de suite, « Propre » → proposition : 1 série à 20 kg × 6, les autres à 16 kg × 14. Cible manquée 2 fois → proposition de redescendre. Aucun niveau ne change sans validation.
10. **Bas de jambe** : dernière hausse = corde ; la même semaine, l'extension de mollet et le tibialis raise remplissent leur critère de changement d'échelon → seule la hausse « mollets » est proposée ; tibialis attend la semaine suivante. Une montée de +2 répétitions dans un échelon reste possible.
11. **Décharge** : séances à 1 série, mêmes charges ; corde 10 min si la durée courante est 20 min ; aucune proposition de progression ; tests proposés.
12. **Étirements du pied** : cycle 1 → 1 série ; cycle 2 → 1 et 2 en alternance ; cycle 3 → 2 séries.
13. **Absence** : aucune séance de musculation du 1er au 9 du mois → au retour, niveau précédent proposé pour tous les exercices ; un exercice du seul week-end, fait 7 jours plus tôt, ne déclenche rien.
14. **Export puis import** sur une base vide : toutes les données reviennent à l'identique.

## 10. Jalons

Une session Claude Code et une PR par jalon. José relit sur son téléphone, puis fusionne.

| Jalon | Contenu | Fini quand |
| --- | --- | --- |
| J0 Socle | `app/` (Vite, React, TS, lint, Vitest), build commité dans `v2/`, page d'accueil qui lit `data/programme.json` | La v1 marche comme avant ; `/Fit-dad/v2/` affiche la page d'accueil ; tests verts |
| J1 Programme | Schéma zod de `data/programme.json`, relecture ligne à ligne contre `docs/PROGRAMME.md`, écarts signalés | Le fichier se valide ; écarts tranchés avec José |
| J2 Moteur | `app/src/domain` : type de jour, matin par palier, alternances, midi, soir, bloc boxe | Scénarios 1 à 7 et 12 verts |
| J3 Aujourd'hui | Écran Aujourd'hui, saisie des séances, minuteur, stockage, export et import | Une journée entière saisie sur le téléphone ; scénario 14 vert |
| J4 Lever tôt | Journal, verdict, paliers, historique, import depuis l'artefact | Scénario 8 vert ; données de l'artefact importées |
| J5 Progression | Niveaux, décisions, bas de jambe, cycle, décharge, tests, préparation du cycle suivant | Scénarios 9 à 11 et 13 verts |
| J6 Bascule | Liste de contrôle du §8.1 | v2 à la racine, installée ; v1 ouvrable sous `/Fit-dad/v1/` |

## 11. Questions ouvertes

1. Palier 1 : la séance de 3 min doit-elle compter pour valider le matin ? L'artefact actuel ne demande que le lever.
2. Knee raises : de combien monter, et quand ?
3. Pas entre deux niveaux : 2 répétitions comme la v1, ou 1 pour les petites fourchettes (pistol 5–8) ?
4. Tibialis posterior au-delà de 24 répétitions : quelle « résistance plus forte » ?
5. Reverse table top : étapes entre « 5 répétitions + 10 s » et « 10 répétitions + 30 s » ?
6. Deep squat : critère pour retirer du contrepoids ?
7. Carry et one arm hang : de combien allonger la tenue ? (Proposé : 5 s.)
8. Bas de jambe : la définition de la « hausse » (§6.9) et le critère de la corde te conviennent-ils ?
9. Boxe le vendredi aux paliers 1 à 3 : la séance A du samedi saute ; le dimanche fait-il la suivante, ou toujours B ?
10. Nom de l'appli : garder « Fit-dad » ?
