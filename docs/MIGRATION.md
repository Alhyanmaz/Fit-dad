# Migration des données

En bref : rien n'est repris de la v1 (décision Q10 = b) ; l'historique de « Lever tôt » est repris, parce que le passage de palier dépend des 7 derniers jours.

## 1. Appli v1 (Fit-dad actuelle)

- Pas de migration : la v2 démarre avec des niveaux de départ saisis par José, d'après ses dernières séances.
- La v1 stocke tout dans le `localStorage` du navigateur, clés préfixées `suivi_app_`. La v2 ne les lit pas, ne les écrit pas, ne les efface pas.
- Export de la v1 : facultatif, José n'en a pas besoin (décision du 07/10/2026). Si besoin : bouton **Données** en haut à droite → **Exporter une sauvegarde** ; le fichier se garde hors du dépôt (téléphone, Drive).
- Après le J6, une copie de la v1 reste consultable sous `https://alhyanmaz.github.io/Fit-dad/legacy/v1.html`. Même origine, donc normalement mêmes données [Interprétation, à vérifier sur le téléphone au J6].
- Si José utilise encore l'artefact claude.ai d'origine plutôt que Fit-dad, cet artefact n'a pas d'export. Sans conséquence avec Q10 = b.

## 2. « Lever tôt »

### Où sont les données

- Base de données de l'artefact claude.ai « Lever tôt » : collection `days` (un document par date) et document `config/state`.
- Secours, si la base n'était pas disponible : `localStorage`, clé `levertot-v1`, au format `{ days, state }`, dans le navigateur qui a ouvert l'artefact.
- Code de référence : `legacy/lever-tot.html`.

### Format d'origine

- `days/<AAAA-MM-JJ>` : toujours `{ date, targetWake, targetBed, palier }`, puis, seulement s'ils ont été saisis, `bed`, `wake`, `night`, `floor`, `mins`, `light`, `note`. Tous ces champs sont donc facultatifs.
  - `palier` : numéro de 1 à 5. `targetWake` et `targetBed` : cibles `"HH:MM"`. Palier et cibles sont figés à la première saisie du jour, avec le palier en cours à ce moment : un jour saisi après coup peut porter un palier plus récent.
  - `night` : `"calme"`, `"un"`, `"plusieurs"`, `"hachee"` ou `""` (choix retiré). `light` : `"dehors"`, `"lampe"`, `"aucune"` ou `""`.
  - `floor` : plancher coché (booléen). Dans l'artefact, le plancher vaut 5 min au palier 2 et 10 min aux paliers 3 à 5. `mins` : minutes faites, nombre ou `null`.
- `config/state` : `{ palier, since }`, où `palier` est un **index de 0 à 4** (0 = palier 1) et `since` la date de début du palier.

### Procédure

1. Au jalon J4, puis juste avant la bascule : José ouvre une conversation Claude (claude.ai), y colle le bloc « Format attendu » ci-dessous et demande : « Exporte les données de mon artefact Lever tôt dans ce format. » Claude lit la base de l'artefact et produit `lever-tot-export-AAAA-MM-JJ.json`.
2. Dans la v2 : **Données** → **Importer Lever tôt**, puis choix du fichier.
3. L'import :
   - convertit l'index de palier (0 à 4) en numéro (1 à 5) ;
   - garde les cibles figées de chaque jour ;
   - reprend `floor` comme plancher coché à la main ;
   - recalcule les verdicts avec les règles de la v2, identiques à celles de l'artefact (seul le critère de passage de palier change : il exige en plus le samedi et le dimanche, décision du 07/10/2026) ;
   - montre un aperçu avant d'enregistrer.
   - Depuis le 14/10/2026, la v2 n'a plus les mêmes paliers : niveaux N1 et N2 de l'ancrage, puis paliers 1 à 4, de 6h50 à 6h00. Les paliers de l'artefact (1 à 5, de 7h00 à 6h00) restent dans l'historique importé, avec leurs cibles figées ; ils ne fixent pas le niveau en cours de la v2, que José choisit [Interprétation, à confirmer au J4].
4. Une date déjà présente dans la v2 garde la version de la v2 ; l'aperçu le signale.
5. Après l'import final, l'artefact n'est plus utilisé. Il reste consultable.

### Format attendu par l'import de la v2

Exemple fictif. Dans `days`, seuls `date`, `targetWake`, `targetBed` et `palier` sont obligatoires.

```json
{
  "source": "lever-tot-artefact",
  "exporte_le": "2026-10-20T07:00:00+02:00",
  "state": { "palier": 1, "since": "2026-10-12" },
  "days": {
    "2026-10-19": {
      "date": "2026-10-19", "targetWake": "06:45", "targetBed": "22:45", "palier": 2,
      "bed": "22:50", "wake": "06:47", "night": "un", "floor": true, "mins": 15,
      "light": "lampe", "note": ""
    }
  }
}
```

## 3. Données de la v2

- Export et import : `docs/SPEC.md` §7.3.
- Aucun fichier d'export dans le dépôt : il est public. Le `.gitignore` bloque les noms prévus (`fit-dad-sauvegarde-*.json`, `lever-tot-export-*.json`).
