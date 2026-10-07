#!/bin/bash
# Installe les dépendances de la v2 (dossier app/) au démarrage d'une session cloud de Claude Code.
# Ne fait rien en local, ni tant que app/package.json n'existe pas (avant le jalon J0),
# ni quand les dépendances sont déjà à jour. La sortie de npm va dans un fichier journal.
if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi
APP="$CLAUDE_PROJECT_DIR/app"
[ -f "$APP/package.json" ] || exit 0
cd "$APP" || exit 0

LOCK=package-lock.json
[ -f "$LOCK" ] || LOCK=package.json
STAMP=node_modules/.install-stamp
SUM=$(sha256sum "$LOCK" | cut -d' ' -f1)
if [ -d node_modules ] && [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$SUM" ]; then
  echo "Dépendances déjà à jour."
  exit 0
fi

LOG=/tmp/fit-dad-npm-install.log
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund >"$LOG" 2>&1 || npm install --no-audit --no-fund >>"$LOG" 2>&1
else
  npm install --no-audit --no-fund >"$LOG" 2>&1
fi
STATUS=$?
if [ $STATUS -eq 0 ]; then
  mkdir -p node_modules && echo "$SUM" > "$STAMP"
  echo "Dépendances installées (journal : $LOG)."
else
  echo "Échec de l'installation des dépendances (journal : $LOG)."
fi
exit 0
