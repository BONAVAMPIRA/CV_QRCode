#!/usr/bin/env bash
# Handshake automatique — exécuté par le hook SessionStart.
# Son output est injecté dans le contexte de Claude Code.
# Pas de VPS pour ce projet : on vérifie git + l'état du mode learning à la place.

echo "════════ CONTEXTE DE SESSION ($(date '+%Y-%m-%d %H:%M')) ════════"

echo ""
echo "── ÉTAT GIT ──"
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Branche : $(git branch --show-current 2>/dev/null)"
  echo "Dernier commit : $(git log -1 --format='%h %ad %s' --date=short 2>/dev/null)"
  REMOTE=$(git remote get-url origin 2>/dev/null)
  echo "Remote : ${REMOTE:-aucun}"
  STATUS=$(git status --porcelain 2>/dev/null)
  if [ -n "$STATUS" ]; then
    echo "⚠️ Modifications non commitées présentes."
  else
    echo "Working tree propre."
  fi
else
  echo "⚠️ Pas de repo Git détecté dans ce dossier."
fi

echo ""
echo "── RAPPEL SÉCURITÉ ──"
echo "Vérifier l'état de la Phase 1 (P0) dans ROADMAP.md avant tout autre travail :"
echo "  - Mot de passe admin retiré du code ? variable d'env en place ?"
echo "  - Historique git purgé (si pas encore fait, NE PAS travailler sur Phase 2/3/4) ?"

echo ""
echo "── MODE APPRENTISSAGE ──"
if [ -f .meta/learning_mode.txt ] && [ "$(cat .meta/learning_mode.txt)" = "on" ]; then
  echo "ON — pédagogie pas-à-pas active, validation avant prod."
else
  echo "OFF (défaut) — rapide, récap tenu dans agents/memory/learnings.md."
fi

echo ""
echo "── JOURNAL DES SESSIONS PRÉCÉDENTES (dernier en bas) ──"
if [ -f .session/journal.md ]; then
  tail -50 .session/journal.md
else
  echo "(première session de ce projet)"
fi
echo "══════════════════════════════════════════════════════════"
