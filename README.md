# Fit-dad · Suivi d'entraînement

Application web installable sur smartphone (PWA), issue de l'artefact « Suivi entrainement ».

## Organisation

| Section (barre du bas) | Onglets |
|---|---|
| **Matin** | Réveil · Mob. matin · Muscu |
| **Midi** | Cardio |
| **Soir** | Pied (routines A/B + étirements pied) · Mob. soir |
| **Étirements** | Étirements complémentaires |

À l'ouverture, l'appli propose la section selon l'heure (avant 11 h : Matin, 11 h–15 h : Midi, après : Soir) et se souvient du dernier onglet ouvert dans chaque section, ainsi que de la semaine, de la routine et de la séance affichées dans chaque onglet.

Minuteur de repos (Muscu) : calé sur l'heure de fin, il reste juste même si l'écran se verrouille ; il garde l'écran allumé pendant le décompte (si le navigateur le permet) et sonne / vibre à la fin.

## Données

Tout est enregistré dans le navigateur du téléphone (`localStorage`). Bouton **Données** en haut à droite :
- **Exporter une sauvegarde** : télécharge un fichier `.json`.
- **Restaurer depuis un fichier** : réimporte ce fichier (même téléphone ou autre appareil).

Effacer les données du navigateur efface l'historique : exporter régulièrement.

## Fichiers

- `index.html` : l'application (React 18 intégré, aucune dépendance à installer).
- `manifest.webmanifest`, `sw.js`, `icons/` : installation sur l'écran d'accueil et fonctionnement hors ligne.

Après une modification de `index.html`, changer `CACHE` dans `sw.js` (ex. `fitdad-v2`) pour que les téléphones récupèrent la nouvelle version.

## Mise en ligne

Il faut un hébergement HTTPS statique. Le dépôt étant privé, GitHub Pages demande un compte payant (GitHub Pro) ou de rendre le dépôt public. Alternatives gratuites : Netlify ou Cloudflare Pages reliés au dépôt.

Puis, sur le téléphone : ouvrir l'adresse, puis
- iPhone (Safari) : Partager → « Sur l'écran d'accueil » ;
- Android (Chrome) : menu ⋮ → « Installer l'application ».
