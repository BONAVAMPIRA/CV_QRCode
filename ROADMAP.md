# ROADMAP — qrcode-cv (CV_QRCode)

## Phase 0 — Mise en place (session 1)
- [x] Kit déposé dans `C:\cv-networking` (PAS dans `C:\Jaona\Perso\CV\QR Code CV`)
- [x] `bash .claude/scripts/handshake.sh` exécuté à la main une fois → vérifier que
  l'état git + dernier déploiement s'affichent
- [x] Session Claude Code test : le contexte s'injecte automatiquement au démarrage
**Critère de passage** : Claude Code démarre en sachant qu'on est en plein P0 sécurité,
sans qu'on lui explique rien.

## Phase 1 — P0 Sécurité (PRIORITÉ ABSOLUE — avant tout le reste)
Objectif : le mot de passe admin n'est plus exposé, ni dans le code ni dans l'historique git public.
- [x] Backup : clone séparé du repo actuel (avant toute opération destructive)
- [x] Nouveau mot de passe admin choisi (ne jamais réutiliser l'ancien)
- [x] Variable d'env créée (Vercel + `.env.local`), code modifié pour la lire
- [x] Validation `reviewer` : confirme que le secret n'est plus en dur nulle part
- [x] Purge de l'historique git (`git filter-repo` ou BFG) + force-push
- [x] Vérification RÉELLE sur l'interface web GitHub : l'ancien mot de passe n'apparaît
  plus dans aucun commit visible de l'historique
- [x] Déploiement Vercel avec la nouvelle variable d'env, test de connexion admin réel
**Critère de passage** : mot de passe absent du code ET de l'historique git visible sur
GitHub, page admin fonctionnelle avec le nouveau mot de passe.

## Phase 2 — Envoi de mail (RÉVISÉE 2026-07-03 : on garde Gmail SMTP)
Objectif : le CV est réellement envoyé par mail à la personne qui scanne le QR code.
**Décision session 2026-07-03** : la migration Resend est ABANDONNÉE — le compte Resend
n'a aucun domaine vérifié, et sans domaine (payant ~15 $/an), Resend ne peut envoyer
qu'à sa propre adresse. Test réel de bout en bout : Gmail SMTP fonctionne (mail reçu
en 10 s sur une boîte externe, PDF intact). Le problème historique était probablement
de la délivrabilité (spam chez le destinataire), pas une panne d'envoi.
- [x] Diagnostic réel : POST /api/send-email en prod → mail + PDF complet reçus sur
  boîte externe (mail.tm) ET sur Gmail de Jaona (3/3)
- [x] Décision : rester sur Gmail SMTP (coût zéro, fonctionne) — Resend abandonné
- [x] Parade spam côté UX : mention « vérifiez vos indésirables » sur les écrans de
  confirmation + bouton de secours « Voir le CV en ligne » si l'envoi échoue
- [x] Robustesse : vérification que le blob CV répond avant de l'attacher (fini les
  pièces jointes corrompues si le blob est introuvable)
**Critère de passage** : un email avec le CV est réellement reçu après un scan réel du QR code. ✅ vérifié 2026-07-03

## Phase 3 — Durcissement
Objectif : `/api/send-email` n'est pas un vecteur de spam/abus.
- [x] Rate limiting basique sur l'endpoint (5/10min par IP + 3/h par email destinataire)
- [x] Validation du format email côté serveur (+ anti-injection : caractères de contrôle
  retirés, longueurs bornées, HTML échappé dans la notification)
- [x] Validation `reviewer` (GO avec réserves — quota IP élevé à 10/10min pour Wi-Fi
  d'événement, eventDescription nettoyée/échappée ; reste à planifier : protéger
  POST /api/config par mot de passe)
**Critère de passage** : l'endpoint refuse les abus évidents (spam de requêtes, emails invalides).

## Phase 4 — Feature : multi-CV piloté par config (définie le 2026-07-03)
Objectif : passer de 3 CV en dur à 5 CV (babi, ba, bi, data = Analyste de données,
bsa = Business Solution Analyst), extensibles à volonté via `lib/cv-config.ts`.
- [x] Description de la feature obtenue auprès de Jaona
- [x] `propagateur` : analyse d'impact sur le flow existant avant de coder (8 fichiers
  identifiés dont 2 non évidents ; route orpheline /api/cvs supprimée)
- [x] Implémentation (`lib/cv-config.ts` source de vérité unique, 8 fichiers branchés)
- [x] Validation `reviewer` (même passe que Phase 3 — GO)
- [x] Déployé en prod (5fec350) + test réel : mail + PDF intact reçus sur boîte externe
  avec le nouveau code, non-régression session babi confirmée
- [ ] Upload par Jaona des 2 nouveaux PDF (data, bsa) via /admin
**Critère de passage** : les 5 CV sélectionnables dans /configure, envoi mail OK sur
un type existant (non-régression) et sur un nouveau type après upload.

## Phase finale — Clôture
- [ ] Tests complets passants (flow QR → affichage → capture → envoi mail, de bout en bout)
- [ ] PROJECT_CONTEXT.md à jour (décisions, état final)
- [ ] `/retro` exécuté (learning tracker mis à jour : sécurité, intégrations API)
- [ ] Composants génériques promus vers `_shared\` si applicable (ex: adapter Resend)
- [ ] `/save` final

## Si dérive
- +30% de temps vs estimation → STOP, analyse, replanification (pas d'acharnement)
- Un module résiste après 3 tentatives → on l'isole et on le réécrit from scratch
- La purge d'historique git rate ou casse le repo → restaurer depuis le backup (Phase 1),
  ne jamais forcer une seconde tentative sans comprendre l'échec de la première
