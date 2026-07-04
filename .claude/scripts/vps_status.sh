#!/usr/bin/env bash
# État du projet — utilisé par /status. Pas de VPS pour ce projet :
# on rapporte git + ce qui est déterminable localement sur le déploiement.

echo "═ État du projet qrcode-cv ═"
echo "─ Git ─"
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "Branche : $(git branch --show-current 2>/dev/null)"
  echo "Dernier commit : $(git log -1 --format='%h %ad %s' --date=short 2>/dev/null)"
  echo "Remote : $(git remote get-url origin 2>/dev/null || echo aucun)"
  git status --porcelain | wc -l | xargs -I{} echo "Fichiers modifiés non commités : {}"
else
  echo "Pas de repo Git détecté."
fi

echo ""
echo "─ Variables d'environnement attendues (.env.example, noms seulement) ─"
if [ -f .env.example ]; then
  grep -oE '^[A-Z_]+' .env.example 2>/dev/null
else
  echo "(.env.example absent)"
fi

echo ""
echo "─ Rappel déploiement ─"
echo "Vérifier manuellement sur vercel.com/dashboard : dernier déploiement, statut build, logs runtime de /api/send-email."
