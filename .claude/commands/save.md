---
description: Sauvegarde la session — journal + commit + push
---

Fais exactement ceci, dans l'ordre :

1. Rédige un résumé de CETTE session en 5 lignes max :
   - Fait : [ce qui a été accompli]
   - Décisions : [choix faits, avec raison courte]
   - Problèmes : [bloqueurs ou bugs restants, ou "aucun"]
   - Prochaine étape : [la première chose à faire à la prochaine session]

2. Ajoute ce résumé À LA FIN de `.session/journal.md` sous un titre `## Session du [date heure]`. Crée le fichier si absent.

3. Si pertinent : mets à jour la section "Décisions prises" de PROJECT_CONTEXT.md, et
   coche les cases concernées dans ROADMAP.md.

4. Écris aussi une entrée dans `agents/memory/learnings.md` (même si le mode apprentissage
   est OFF — ce fichier est tenu à jour inconditionnellement).

5. Exécute : `bash .claude/scripts/save_session.sh manual`

6. Confirme en une ligne : "Session sauvegardée — prochaine étape : [X]".
