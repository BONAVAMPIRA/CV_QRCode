# PROJECT_CONTEXT — qrcode-cv (CV_QRCode)
> Généré par le Cabinet Jaona le 2026-06-29. Ce fichier contient TOUT le contexte.
> Un Claude Code qui n'a jamais vu la conversation d'origine doit pouvoir travailler avec ce seul fichier.

## 1. Objectif
Faciliter le réseautage professionnel : un QR code imprimé/partagé pointe vers une
page qui affiche le CV de Jaona, capture l'email de la personne qui scanne, et lui
envoie automatiquement une copie du CV par mail. Critère de succès : flow QR → affichage
→ capture email → envoi mail fonctionnel à 100%, sans secret exposé publiquement.

## 2. Type et cadre
- Type : perso (outil de réseautage personnel)
- Mode : RECOVERY (reprise d'un projet existant avec bug + risque sécurité)
- Timeline : pas pressé, mais le P0 sécurité est à traiter dès la première session
- Pas de client, pas de consulting sur ce projet

## 3. Environnements (cartographie complète)
### Local
- Dossier RÉEL du code actif : `C:\cv-networking`
- ⚠️ Piège découvert à l'audit : `C:\Jaona\Perso\CV\QR Code CV` contient une VIEILLE
  version zippée avec une config Resend obsolète. Ne pas travailler dans ce dossier —
  il peut servir de référence ponctuelle (voir section 6) mais n'est pas la source de vérité.
- Stack : Next.js 14 (App Router probable — à confirmer en session), nodemailer

### VPS
- Aucun. Ce projet n'a pas de composant VPS.

### Cloud
- **Vercel** : hébergement + fonctions API serverless (`/api/send-email` notamment)
- **Gmail SMTP** (via nodemailer) : service mail actuel — EN PANNE depuis serverless
- **Resend** (cible de migration) : service mail prévu en remplacement

### Git
- Repo : `github.com/BONAVAMPIRA/CV_QRCode`
- ⚠️ Repo **PUBLIC** — c'est la raison du P0 sécurité (voir section 6)

## 4. Architecture
Next.js 14 : une route génère/affiche le QR code, une page publique affiche le CV au
scan, un formulaire capture l'email du visiteur, une route API (`/api/send-email`)
déclenche l'envoi du CV par mail via nodemailer/Gmail SMTP (à remplacer par Resend).
Une page `/admin` existe avec une protection par mot de passe — actuellement en dur
dans le code source (`app/admin/page.tsx:6`), donc visible par quiconque consulte le
repo public. Pattern cible : mot de passe en variable d'env Vercel, jamais dans le code.

## 5. Décisions prises (avec le Cabinet)
| Date | Décision | Raison |
|---|---|---|
| 2026-06-29 | Stratégie RECOVERY = Option A (Continuer) | Score audit 5.2/10, effort Light, archi saine, bug isolé — pas besoin de refonte |
| 2026-06-29 | P0 = purge historique git + rotation mdp admin, avant tout autre travail | Secret exposé publiquement sur GitHub = risque actif, pas théorique |
| 2026-06-29 | Migration mail : Gmail SMTP → Resend (pas de tentative de réparation Gmail SMTP) | Gmail SMTP est structurellement peu fiable depuis serverless (rate limiting/blocage Google) ; Resend est conçu pour ce cas d'usage et Jaona a déjà une config Resend de référence dans l'ancien zip |
| 2026-06-29 | Feature additionnelle non détaillée au Cabinet | Jaona préfère la décrire directement en session Claude Code, une fois le socle assaini |
| 2026-07-03 | P0 sécurité TERMINÉ : mdp roté (env var `ADMIN_PASSWORD` Vercel+local), auth côté serveur (`/api/admin-auth` + `lib/admin-auth.ts`), `POST /api/upload` protégé (était ouvert à tous), historique git purgé (`git filter-repo`) + force-push, vérifié sur GitHub | Repo public ; l'ancien commit reste accessible par SHA direct (cache GitHub) mais le mdp est roté → risque nul |
| 2026-07-03 | Migration Resend ABANDONNÉE — on reste sur Gmail SMTP | Test réel de bout en bout : Gmail fonctionne (mail+PDF intact reçus en 10 s sur boîte externe). Resend sans domaine vérifié ne peut envoyer qu'à soi-même, et Jaona ne veut pas payer un domaine. Le problème historique = délivrabilité (spam destinataire), pas panne d'envoi |
| 2026-07-03 | Feature Phase 4 = multi-CV piloté par config : `lib/cv-config.ts` source de vérité unique, 5 types (babi, ba, bi, data=Analyste de données, bsa=Business Solution Analyst) | Ajouter un CV = 1 entrée dans cv-config.ts + upload via /admin. Route orpheline /api/cvs supprimée |
| 2026-07-04 | Passe UX du parcours scan : civilité M./Mme optionnelle (« Bonjour Mme Dupont »), entreprise OPTIONNELLE (phrase du mail adaptative), événement entre guillemets, champs agrandis (lisibilité sans lunettes), PDF ouvert en nouvel onglet | Retours terrain de Jaona (test Toky) ; l'iframe PDF cassait le bouton retour sur téléphone. UX en attente : vCard, FR/EN, compteur de scans |

## 6. Plan de reprise
- Score audit : 5.2/10 — rapport complet : voir audit_summary.txt fourni par Jaona (l'AUDIT_REPORT.md complet a été généré par Claude Code lors de l'audit, dans `C:\cv-networking`)
- Stratégie choisie : **A — Continuer**, parce que le flow est fonctionnel à 75% (QR, affichage, capture email tous OK), seul l'envoi mail est cassé, et l'architecture est jugée propre.

**ON GARDE** :
- Toute la logique de génération QR code (fonctionnelle)
- La page d'affichage du CV au scan (fonctionnelle)
- Le formulaire de capture d'email (fonctionnel)
- L'architecture Next.js générale

**ON ADAPTE** :
- `/api/send-email` : remplacer le transport nodemailer/Gmail SMTP par Resend
- `app/admin/page.tsx` : sortir le mot de passe du code, le lire depuis une variable d'env

**ON RÉÉCRIT** :
- Rien en profondeur — édits chirurgicaux uniquement sur les deux points ci-dessus

**ON ARCHIVE** :
- `C:\Jaona\Perso\CV\QR Code CV` (vieux zip) — à garder comme référence pour la config
  Resend qu'il contient, mais à ne plus utiliser comme dossier de travail. Pas de
  suppression nécessaire, juste ne pas y retoucher.

⚠️ **Divergence détectée** : le dossier que Jaona pensait être le bon (`QR Code CV`)
n'est PAS le code en production. Le code réel et déployé est dans `C:\cv-networking`.
Aucune action requise au-delà de la clarification — pas de divergence local/VPS classique,
juste une confusion de dossier résolue par l'audit.

Backup : pas fait à ce stade — recommandé avant la purge d'historique git (étape destructive) :
`git clone` une copie du repo actuel dans un dossier séparé avant de réécrire l'historique.

## 7. Budget API
Aucun appel LLM côté production pour ce projet (pas de scoring, pas de génération IA
en runtime). Resend a un free tier (3000 emails/mois) largement suffisant pour du
réseautage personnel — pas de garde-fou budget nécessaire ici, contrairement à cockpit-jaona.

## 8. Compétences développées (learning)
Ce projet travaille : **sécurité applicative** (purge d'historique git, gestion de
secrets via variables d'env, niveau actuel→visé : 2→3), **intégrations API serverless**
(migration SMTP → API mail transactionnelle, niveau actuel→visé : 2→3).
En fin de projet : `/retro` met à jour `C:\Jaona\Perso\Projets\.cabinet-jaona\learning_tracker.yaml`.

## 9. Composants _shared
- Réutilisés : aucun pour l'instant (projet isolé, pas encore connecté à `_shared\`)
- Candidats à promotion en fin de projet : un éventuel adapter Resend générique,
  si réutilisable pour d'autres projets personnels nécessitant l'envoi de mail
  transactionnel (à évaluer en fin de projet, pas avant)

## 10. Sécurité — détail du P0 (priorité absolue, à faire en premier)
1. **Rotation immédiate** du mot de passe admin (en choisir un nouveau, ne JAMAIS
   réutiliser l'ancien qui est compromis puisque public)
2. **Variable d'env** : créer `ADMIN_PASSWORD` (ou nom similaire) dans Vercel + `.env.local`,
   lire via `process.env.ADMIN_PASSWORD` dans `app/admin/page.tsx`
3. **Purge de l'historique git** : un nouveau commit qui supprime le mot de passe du
   fichier NE SUFFIT PAS — il reste consultable dans l'historique du repo public.
   Utiliser `git filter-repo` (recommandé, successeur de `filter-branch`) ou BFG Repo-Cleaner
   pour purger la chaîne de l'historique, puis force-push. **Faire un backup du repo
   avant cette opération destructive** (clone séparé).
4. **Vérification réelle** : après purge, vérifier sur GitHub (interface web, pas juste
   en local) que l'ancien mot de passe n'apparaît plus dans aucun commit de l'historique visible.
