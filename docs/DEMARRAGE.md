# Démarrer la v2 avec Claude Code

**En bref** : le kit est sur la branche `kit-v2` du dépôt Fit-dad. Tu ouvres une session Claude Code sur ce dépôt et tu colles le premier message ci-dessous. Claude Code lit le kit, te pose ses questions, propose le plan du socle (jalon J0) et attend ton feu vert. Ta v1 reste en ligne, intacte, jusqu'à la bascule (J6).

## 1. Le kit est dans le dépôt

- **Fait le 07/10/2026** : le kit est sur la branche `kit-v2`. La branche `main`, celle que GitHub Pages publie, n'a pas bougé.
- **Recommandé, une fois (1 minute)** : dans Chrome, GitHub → Fit-dad → **Settings** → **General** → **Default branch** → choisis `main`. La branche par défaut actuelle, `ccr-5400ddd2-jcuhr3`, est un reste de la session du 28/09. Sans ce réglage, ça marche quand même : les messages ci-dessous disent à Claude Code de viser `main`.

## 2. Première session : le socle (J0)

1. Appli Claude → onglet **Code** → dépôt **Alhyanmaz/Fit-dad**. Si l'appli demande de relier GitHub, accepte et autorise l'accès à Fit-dad. L'environnement par défaut convient : son accès réseau « Trusted » couvre npm et GitHub.
2. Si un sélecteur de mode apparaît près du champ de saisie, choisis **Plan** pour ce message : Claude Code lit et propose, sans rien modifier.
3. Colle ce message :

```
On démarre la v2 de Fit-dad. Le kit est sur la branche kit-v2 : travaille sur cette branche.
Lis CLAUDE.md, puis docs/reprise.md, docs/SPEC.md et docs/decisions.md.
Ne code rien pour l'instant. Dis-moi d'abord ce qui te paraît contradictoire ou flou, une question à la fois avec ta proposition. Ensuite, propose le plan du jalon J0. J'attends ton plan avant de valider.
```

4. Réponds à ses questions. Pour valider le plan, remets le sélecteur sur le mode normal, puis écris « ok, vas-y ».
5. En fin de session, il ouvre une PR de `kit-v2` vers `main` (sinon, demande « crée la PR vers main »). Vérifie qu'elle vise bien `main`, puis lis le résumé : il doit dire « tests verts, build à jour ».
6. Fusionne la PR (**Merge**), attends 2 minutes, puis vérifie :
   - https://alhyanmaz.github.io/Fit-dad/ : ta v1, inchangée ;
   - https://alhyanmaz.github.io/Fit-dad/v2/ : la page d'accueil de la v2.
7. Si `/v2/` reste introuvable après 5 minutes, dis-le dans la session : Claude Code vérifie le dossier `v2/` et le réglage Pages.

## 3. Sessions suivantes (J1 à J6)

Une nouvelle session par jalon. Message type :

```
Pars de la branche main à jour. Lis CLAUDE.md et docs/reprise.md. On attaque le jalon J<numéro> de docs/SPEC.md §10. Propose le plan avant de coder.
```

| Jalon | Ce que tu vérifies sur ton téléphone |
| --- | --- |
| J1 Programme | La liste des écarts entre le programme structuré et ton programme ; tu tranches |
| J2 Moteur | Rien à l'écran : les scénarios de la SPEC passent (Claude Code te le montre) |
| J3 Aujourd'hui | Une journée complète saisie dans `/v2/`, puis un export et un import |
| J4 Lever tôt | Ton historique « Lever tôt » importé, le bon palier affiché |
| J5 Progression | Les propositions monter ou redescendre, la semaine de tests |
| J6 Bascule | La v2 installée sur l'écran d'accueil ; la v1 encore ouvrable sous `/v1/` |

## 4. Bon à savoir

- **Ce que tu valides** : le plan au début, la PR à la fin. Lire le code n'est pas nécessaire ; le résumé et le test sur le téléphone suffisent. Le dossier `v2/` est le build : inutile de le relire.
- **Si quelque chose cloche** : dis-le dans la même session, capture d'écran à l'appui si besoin.
- **Environnement temporaire** : ce qui n'est pas poussé sur GitHub est perdu ; Claude Code commite et pousse au fil de l'eau.
- **Reprise** : `docs/reprise.md` dit toujours où on en est ; c'est lui qui fait le lien entre deux sessions.
- **Limites d'usage** : les sessions cloud consomment le même quota que tes conversations Claude.
- **Dépôt public** : condition de GitHub Pages gratuit. Le code et la documentation sont lisibles par tous, y compris ton programme et tes horaires de palier. Tes données restent dans ton téléphone. Ne mets jamais un export dans le dépôt.
- **Avant la bascule** : exporte l'historique de ta v1 (bouton « Données » en haut à droite → « Exporter une sauvegarde ») et garde le fichier hors du dépôt.
- **Essai à blanc** : il se fait en parallèle, avec la v1 ou une simple liste ; la v2 devient utilisable au jalon J3.

## 5. Questions qui viendront

Tu peux y réfléchir d'ici là (détail dans `docs/SPEC.md` §11) :

1. Au palier 1, la séance de 3 min compte-t-elle pour valider le matin ?
2. Knee raises : de combien monter, et quand ?
3. Pas entre deux niveaux : 2 répétitions, ou 1 pour le pistol ?
4. Tibialis posterior au-delà de 24 : quelle résistance ?
5. Reverse table top : quelles étapes intermédiaires ?
6. Deep squat : quand retirer du contrepoids ?
7. Carry et one arm hang : de combien allonger la tenue ?
8. Bas de jambe : qu'est-ce qui compte comme « hausse » ?
9. Boxe le vendredi aux paliers 1 à 3 : que fait le dimanche ?
10. On garde le nom « Fit-dad » ?

## 6. Contenu du kit

| Fichier | Pour qui | Rôle |
| --- | --- | --- |
| `docs/DEMARRAGE.md` | Toi | Ce guide |
| `CLAUDE.md` | Claude Code | Consignes lues à chaque session |
| `docs/SPEC.md` | Claude Code, toi | Cahier des charges, règles, scénarios, jalons |
| `docs/PROGRAMME.md` | Claude Code | Ton programme, copie du document du 06/10 |
| `data/programme.json` | Claude Code | Le programme en données structurées (brouillon, relu en J1) |
| `docs/decisions.md` | Claude Code, toi | Décisions prises et choix à valider |
| `docs/reprise.md` | Claude Code, toi | Où on en est, prochaine étape |
| `docs/MIGRATION.md` | Claude Code | Reprise de « Lever tôt », sort de la v1 |
| `legacy/` | Claude Code | Code de « Lever tôt » et de l'artefact d'origine, en référence |
| `.claude/`, `scripts/`, `.gitignore` | Claude Code | Installation automatique, fichiers à ne jamais commiter |
