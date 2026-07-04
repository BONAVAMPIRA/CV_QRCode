# learnings.md — Journal de formation Jaona (qrcode-cv)
> SOURCE UNIQUE d'apprentissage. Chaque session y ajoute ce que Jaona a
> découvert, décidé, questionné.

---
## Session 0 (Cabinet — avant Claude Code)
### Concepts découverts
- Le dossier de travail supposé (`QR Code CV`) n'était pas le code réel — leçon :
  toujours vérifier `git remote -v` et l'emplacement réel avant de supposer.
- Gmail SMTP est structurellement fragile depuis un environnement serverless (Vercel) :
  Google applique du rate limiting/blocage qui n'apparaît pas en dev local.
### Décisions
- P0 sécurité (mdp admin en clair sur repo public) traité avant le bug fonctionnel.
- Migration directe vers Resend plutôt que tentative de réparation Gmail SMTP.
### Questions ouvertes
- Détail de la feature additionnelle à définir en session Claude Code.

## Session 2026-07-03/04 — P0 sécurité + mail + multi-CV
### Leçons techniques
- **Purge d'historique git** : `git filter-repo --replace-text` (via `python -m git_filter_repo` sur Windows) + force-push. Un backup miroir DOIT être rafraîchi pour inclure les commits locaux non poussés avant la purge (le reviewer a attrapé ça). GitHub garde les commits orphelins accessibles par SHA direct — seule la rotation du secret rend ça inoffensif.
- **Diagnostiquer un envoi mail** : ne jamais conclure sur un HTTP 200 — créer une boîte jetable API (mail.tm), envoyer dessus, lire le mail et télécharger la pièce jointe. C'est ce qui a prouvé que Gmail SMTP marchait et évité une migration Resend inutile.
- **Resend sans domaine vérifié** n'envoie qu'à sa propre adresse — à vérifier AVANT de planifier une migration.
- **Next.js App Router** : un fichier route.ts ne peut exporter que les handlers HTTP — les helpers partagés vont dans `lib/`.
- **Auth côté client = pas d'auth** : un mdp comparé dans un composant "use client" est visible dans le bundle. Vérification côté serveur obligatoire (+ l'endpoint upload était ouvert à tous sans que personne ne l'ait remarqué).
### Leçons process
- Le trio propagateur (a trouvé 2 fichiers impactés non évidents + 1 route morte) / reviewer (2 GO-avec-réserves pertinents) / tests réels a bien fonctionné — à refaire.
- Décision Cabinet ≠ dogme : la décision « migrer Resend » reposait sur une hypothèse (« Gmail cassé ») invalidée par le test réel → décision inversée avec l'accord de Jaona, coût zéro.
