---
description: Active/désactive le mode apprentissage (pédagogie pas-à-pas)
---

1. Lis `.meta/learning_mode.txt`. S'il contient "on", écris "off". Sinon écris "on".
   Crée le fichier avec "off" s'il n'existe pas avant ce basculement.

2. Confirme en une ligne l'état actuel : "Mode apprentissage : ON — pédagogie activée"
   ou "Mode apprentissage : OFF — rythme rapide, récap tenu dans learnings.md".

Rappel : que le mode soit ON ou OFF, `agents/memory/learnings.md` reste tenu à jour
à chaque `/save`. Seule la pédagogie affichée à l'écran change.
