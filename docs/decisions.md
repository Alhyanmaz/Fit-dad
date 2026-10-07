# Décisions — Fit-dad v2

Registre des décisions. Une entrée datée par série de décisions ; on ne rouvre une décision qu'avec une raison nouvelle, et on note ici le changement.

## 06/10/2026 — décisions de José (conversation de refonte du programme)

- **Historique de la v1** : on repart de zéro (Q10 = b). Pas de migration ; les charges de départ sont reprises à la main. La v1 reste ouvrable pour exporter son historique et le garder en archive.
- **Signes d'arrêt et douleur** : écartés (Q7 = a), ni dans le programme ni dans l'appli. José s'en charge.
- **« Lever tôt »** : intégré dans l'appli v2.
- **Semaines de tests** : comme dans l'appli actuelle, José règle lui-même le cycle suivant d'après ses résultats.
- **Export des données** : oui, sauvegarde complète dans un fichier et réimport.
- **Matin** : palier 1 = reverse table top, bear walk, puis 1 exercice de musculation ; palier 2 = 2 exercices, pris sur le café ; la séance complète à partir du palier 3.
- **Boxe en club** : un soir de semaine, jour variable ; pas de sparring pour l'instant.
- **Phase 4 (document de passation)** : Claude Code, dépôt GitHub, structure en plusieurs fichiers, PWA installable, zoom corrigé, progression pilotée par les critères plutôt que par la semaine.
- **Calendrier** : Claude Code démarre le 07/10/2026, sans attendre la fin de l'essai à blanc. Le document de passation l'autorise (phase 4 « peut démarrer en parallèle de la phase 3 »). Les durées seront revues après l'essai.

## 06/10/2026 — choix de Claude, à valider par José

- **Dépôt** : Fit-dad, déjà en ligne sur GitHub Pages. Même adresse, même installation sur le téléphone. Le dépôt doit rester public : avec l'offre gratuite de GitHub, Pages ne fonctionne que sur les dépôts publics ([doc GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). Le code et la documentation sont donc lisibles par tous ; les données restent sur le téléphone.
- **Publication** : pas de GitHub Actions, parce que les sessions Claude Code dans le cloud ne peuvent pas pousser de fichiers sous `.github/workflows/` ([ticket ouvert](https://github.com/anthropics/claude-code/issues/61189)). Pages reste en « Deploy from a branch », `main`, racine. Le code de la v2 vit dans `app/`, son build est commité dans `v2/` et servi sous `/Fit-dad/v2/`. Aucun réglage à changer sur GitHub. Si le ticket est corrigé, on pourra ajouter une intégration continue.
- **Cohabitation v1 / v2** : v1 intacte à la racine jusqu'à la bascule (J6), puis rangée dans `v1/` selon la liste de contrôle de `docs/SPEC.md` §8.1.
- **Outils** : Vite, React et TypeScript (React comme la v1, outillage courant et bien maîtrisé par Claude Code) ; Dexie sur IndexedDB (plus robuste que `localStorage` pour des années d'historique) ; zod pour valider le programme et les imports ; Vitest pour les règles métier ; `vite-plugin-pwa` pour l'installation et le hors-ligne.
- **Palier 2** : le binôme 1 de la séance du jour (push + squat) ; tirage et hinge arrivent au palier 3. Alternative écartée pour l'instant : faire tourner les binômes.
- **Pas entre deux niveaux** : 2 répétitions, comme la v1 (voir la question ouverte sur les petites fourchettes).
- **Séries mixtes** : une série de plus à la nouvelle charge à chaque montée ; appliqué aussi aux passages bidon → kettlebell.
- **Bas de jambe** : une « hausse » est un changement d'échelon, +2 min de corde ou du sac en plus ; les +2 répétitions dans un échelon ne comptent pas. La hausse de la semaine va à l'élément éligible le plus proche dans la rotation corde → mollets → tibialis → sac.
- **Absence** : jugée sur l'ensemble du journal (7 jours sans musculation, ou absence déclarée), pas exercice par exercice.
- **Midis** : corde proposée les 3 premiers midis éligibles ; José peut échanger.
