#!/usr/bin/env bash
# Sauvegarde de session. Appelé par /save (manuel) et SessionEnd (auto).
MODE="${1:-manual}"
DATE=$(date '+%Y-%m-%d %H:%M')

mkdir -p .session
touch .session/journal.md

if git rev-parse --git-dir > /dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -q -m "session ($MODE): $DATE"
    git push -q 2>/dev/null && echo "✅ Commit + push OK ($DATE)" || echo "✅ Commit local OK — push échoué (réseau ?)"
  else
    echo "Rien à committer."
  fi
else
  echo "⚠️ Pas de repo Git ici. Lance : git init && git add -A && git commit -m init"
fi
