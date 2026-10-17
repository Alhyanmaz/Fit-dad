# Relecture du programme (jalon J1, 08/10/2026)

**En bref** : `data/programme.json` est fidèle à `docs/PROGRAMME.md`. Deux corrections faites, quatre points à trancher par José, chacun avec une proposition. Le fichier est désormais vérifié à chaque ouverture de l'appli.

## Méthode

- Lecture complète de `data/programme.json` (1 543 lignes), comparée section par section à `docs/PROGRAMME.md` (version du 07/10/2026, qui fait foi).
- Schéma de validation `app/src/data/schema.ts` : structure stricte (toute clé inconnue est refusée) et contrôles croisés. Le vrai fichier passe ; 12 fichiers volontairement faussés sont refusés, avec un message en français (tests dans `app/src/data/programme.test.ts`).

## Ce qui est conforme

| Section du programme | Vérifié | Verdict |
| --- | --- | --- |
| Cadre | Budget temps, matériel | Conforme |
| Semaine type | Boxe, jour de récupération, alternances « la suivante », boxe le vendredi | Conforme |
| Matin par paliers | Minutes des 5 paliers (3, 15, 30, 45 et 60 min), heures de lever et de coucher, passage de palier, ordre des blocs, versions courte et minimum, intentions | Conforme |
| Musculation | 12 exercices : fourchettes, charges, variantes, place dans les séances A et B, ajouts du palier 4, « pousser plus loin », swing à un bras, charges de départ | Conforme |
| Mobilité | Routines A et B (7 mouvements chacune), cossack, reverse table top, neck CARs | Conforme |
| Étirements | Zones, séries par moment et par cycle. Contrôle de cohérence : les durées retombent exactement sur 5 min (paliers 3 et 4) et 10 min (palier 5) | Conforme |
| Bloc clé du soir | Suspension et knee raises, one arm hang, deep squat, trois versions, levier si le soir déborde | Conforme |
| Pied et cheville | Routines A et B, 4 exercices, short foot recalibré, tib bar, single leg balance | Conforme |
| Cardio du midi | Corde de 20 à 30 min (+2 min par José), marche 40 min, objectif de 3 séances | Conforme |
| Boxe à la maison | 5 rounds de 3 min, choix du thème, rotation de 6 thèmes, sac | Conforme |
| Jour de récupération, week-end | Contenus et durées | Conforme |
| Progression, décharge, tests | Décisions, pas, « Ajuster », bas de jambe, décharge, 9 tests et leurs unités | Conforme |

Total : 41 exercices = 12 de musculation, 4 du pied, 12 de mobilité, 7 étirements, 3 du bloc clé, 1 d'équilibre, 2 de cardio.

## Corrections faites (2)

1. **`lever_tot.plancher`** : le texte citait encore les durées fixes de l'artefact « Lever tôt » (5 min au palier 2, 10 min aux paliers 3 à 5). Le programme dit : « le plancher correspond à cette séance » (`PROGRAMME.md` ligne 108). Corrigé : le plancher est la séance du matin du palier, en version complète, courte ou minimum.
2. **`meta.source` et `meta.statut`** : ils mentionnent la relecture du 08/10 et le schéma de validation.

## Tranché par la SPEC, sans question

- **Matin du jour de récupération** : une seule routine de mobilité, l'autre que celle de la veille, au ralenti, puis les neck CARs ; pas de bloc mobilité en plus. C'est le scénario 7 de `docs/SPEC.md` §9, et le JSON le dit déjà.

## Questions pour José (4) — tranchées le 17/10/2026

### Q1. Le swing : combien, selon les jours ?

- **Le programme** : « Swing en EMOM, 6 × 10 », en fin de séance B (ligne 156). Palier 3 : « 1 série par exercice », séance B ≈ 10 min (ligne 130). Décharge et version courte : 1 série par exercice. Palier 2, matin A : 2 séries de 10 (ta décision du 07/10).
- **Le flou** : l'EMOM se compte en minutes, pas en séries. [Interprétation] Les durées du programme ne tombent juste que si le swing reste un EMOM complet de 6 min : séance B ≈ 10 min au palier 3, ≈ 18 min aux paliers 4 et 5.
- **Ma proposition** : EMOM de 6 min (6 × 10) à partir du palier 3, week-end compris. En version courte et en décharge : 3 min, la moitié, comme la corde en décharge. Palier 2 : tes 2 séries de 10.

### Q2. Cossack et reverse table top : que veut dire « une série courte » ?

- **Le programme** : paliers 2 à 4, « toute la routine, 30 s par mouvement ; cossack et reverse table top en une série courte » ; palier 5, « toute la routine, 60 s par mouvement » (ligne 200). Or ces deux mouvements se comptent en répétitions : cossack de 8 à 14 par côté, avec 0, 5 puis 10 kg ; reverse table top de 5 répétitions + 10 s à 10 répétitions + 30 s.
- **Le flou** : « courte » n'est pas chiffré, et rien n'est dit pour ces deux mouvements au palier 5.
- **Ma proposition** : à tous les paliers de 2 à 5, une seule série à ta cible du moment (cossack : répétitions par côté, à ta charge ; reverse table top : répétitions puis tenue). « Courte » veut dire « une seule série ». Les autres mouvements suivent le temps du palier (30 s ou 60 s).

### Q3. One arm hang : combien de séries ?

- **Le programme** : « chaque bras, 10 → 20 s », ajouté quand la suspension atteint 80 s (ligne 245). Le nombre de séries n'est pas dit ; la suspension en a 2.
- **Ma proposition** : une tenue par bras, dans le bloc clé standard. Pas de one arm hang en récupération (le programme l'exclut) ni le soir de boxe (la version boxe ne garde qu'une suspension).

### Q4. Horse stance, carry, Copenhagen et L-sit : séries fixes ou non ?

- **Le programme** : horse stance 1 ×, carry 2 ×, Copenhagen 2 ×, L-sit 1 × (lignes 144 à 155). Mais le week-end des paliers 1 à 3 annonce « 3 séries + ajouts », et la décharge « 1 série ».
- **Le flou** : au week-end, ces quatre exercices passent-ils à 3 séries ? En décharge, à 1 ?
- **Ma proposition** : leur nombre de séries reste fixe (1 ou 2), y compris le week-end ; en décharge, 1 série pour tous, comme le reste de la musculation.

## Ce que vérifie l'appli à chaque ouverture

- Structure complète du fichier : chaque section, chaque champ, chaque type. Une faute de frappe dans un nom de champ est signalée.
- Valeurs : fourchettes dans le bon ordre, heures au format 24 h, dates, paliers de 1 à 4 dans l'ordre.
- Renvois entre sections : chaque exercice cité (séances, matin, mobilité, étirements, bloc clé, pied, équilibre) existe et appartient au bon bloc, et chaque étirement à la bonne zone.
- Cohérences : chaque élément du bas de jambe a au moins un exercice ; chaque palier a un contenu de week-end ; les tests ont des identifiants uniques ; la rotation de boxe et les rounds sont complets.
- En cas d'erreur, la page d'accueil affiche « Programme illisible » et la liste des erreurs, avec leur emplacement dans le fichier.

## Ajout du 13/10/2026

- La section « Cycles d'ancrage » entre dans `docs/PROGRAMME.md` (décision du 13/10/2026, `docs/decisions.md`), puis dans `data/programme.json` (clé `ancrage`, version du programme du 13/10/2026). Le schéma la vérifie : mobilité prise dans la routine du jour, exercices du bon bloc, étirement du matin dans la zone des hanches, durée minimale égale à 2 cycles de 5 semaines, rounds de boxe existants. 4 fichiers faussés de plus sont refusés (22 tests).
- `docs/SPEC.md` : §6.11, scénarios 15 à 17, jalons J2 et J5.
- Q1 à Q4 restent ouvertes. Elles portent surtout sur le programme complet ; l'ancrage exclut les exercices du palier 4 (Q4) et fixe déjà le swing à 1 série de 10 en semaine et 3 × 10 le week-end (Q1).

## Ajout du 14/10/2026

- L'ancrage passe à deux niveaux (N1, N2) et le programme complet à 4 paliers (décision du 14/10/2026, `docs/decisions.md`). `data/programme.json` suit : `ancrage.niveaux`, 4 paliers dans `lever_tot` et `matin`, `soir_par_palier`, week-end par palier ; les contenus des paliers 1 à 4 sont provisoires.
- Le schéma vérifie aussi : un niveau par cycle et ses semaines de passage, les minutes de travail de chaque palier, des levers et des couchers de plus en plus tôt de N1 au palier 4, un contenu de week-end et de soir par palier. 25 tests.
- Q1 à Q4 restent ouvertes, avec les nouveaux numéros : ancien palier 2 = N2, ancien 3 = palier 1, ancien 4 = palier 2, ancien 5 = palier 3. Pour l'ancrage, Q2 est déjà tranchée : cossack et reverse table top à 1 série, à la cible du moment.
- Formulation corrigée : le « au mieux » du week-end de l'ancrage exclut les exercices du palier 2 (anciennement 4), Copenhagen compris, comme décidé le 13/10. Le 14/10, j'avais écrit « sans les ajouts du palier 2 » : le Copenhagen n'étant pas un ajout, la phrase semblait le garder. Les données l'excluaient déjà.

## Ajout du 17/10/2026

José a accepté les propositions par défaut pour Q1 à Q4, avec les nouveaux numéros de paliers (`docs/decisions.md`) :

- **Q1, swing** : EMOM de 6 min (6 × 10) en fin de séance B, à partir du palier 1, week-end compris ; 3 min en version courte et en décharge. Pendant l'ancrage : 1 × 10 à N2, 3 × 10 au « au mieux ».
- **Q2, cossack et reverse table top** : toujours 1 série à la cible du moment, jamais au temps, à tous les niveaux, week-end compris.
- **Q3, one arm hang** : 1 tenue par bras, une fois ajouté ; tous les soirs sauf le jour de récupération, soir de boxe compris (réponse de José du 14/10, qui remplace ma proposition de l'en exclure).
- **Q4, horse stance, carry, Copenhagen, tuck hang L-sit** : séries fixes (1 ou 2), week-end compris ; 1 série en décharge.
