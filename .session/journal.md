# Journal de session — qrcode-cv

(première session à venir)

## Session du 2026-07-03 22h17 → 2026-07-04 00h30

- **Fait** : Phase 1 P0 complète (mdp roté → env var `ADMIN_PASSWORD`, auth serveur `/api/admin-auth`, `/api/upload` protégé, historique git purgé via filter-repo + force-push, vérifié sur GitHub, backup `C:\cv-networking-backup-20260703.git`). Phase 2 close : envoi mail prouvé fonctionnel par 3 tests réels de bout en bout (boîtes jetables mail.tm + Gmail Jaona, PDF intact). Phase 3 : rate limiting (10/10min IP, 3/h destinataire) + validation email + anti-injection. Phase 4 : 5 CV pilotés par `lib/cv-config.ts` (babi, ba, bi, data, bsa), `/api/cvs` orpheline supprimée. Passe UX : civilité M./Mme optionnelle, entreprise optionnelle, guillemets événement, champs agrandis, PDF en nouvel onglet. Commits `727f5bf`→`5b2e86b`, déployé et testé en prod.
- **Décisions** : migration Resend ABANDONNÉE (pas de domaine vérifié, Jaona ne veut pas payer ; Gmail SMTP marche empiriquement — le problème historique était la délivrabilité/spam côté destinataire, pas une panne). Multi-CV = config-driven (ajouter un CV = 1 entrée dans cv-config.ts).
- **Problèmes** : aucun bloquant. Restes connus : `POST /api/config` non protégé par mdp (trou pré-existant, signalé reviewer, à corriger) ; var `ADMIN_PASSWORD` non posée sur l'env "preview" Vercel (bug CLI, prod+dev OK) ; ancien commit purgé encore accessible par SHA direct sur GitHub (cache, sans risque car mdp roté).
- **Prochaine étape** : Jaona uploade les PDF « data » et « bsa » via /admin, puis protéger `POST /api/config` par le mot de passe admin. Idées UX en attente : bouton vCard « Ajouter aux contacts », toggle FR/EN, compteur de scans.
