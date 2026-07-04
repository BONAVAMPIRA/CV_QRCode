# qrcode-cv (CV_QRCode)

## Mission
Faciliter le réseautage : un QR code transmet un CV en ligne, et envoie automatiquement
une copie par email à la personne qui scanne. La réussite = le flow complet marche
de bout en bout, sans secret exposé.

## Démarrage de session
Le hook SessionStart a déjà injecté : dernier état git + journal des sessions précédentes.
Commence par un résumé en 3 lignes : où on en est, phase en cours, prochaine étape suggérée.
Puis attends.

## Contexte complet
Lis `PROJECT_CONTEXT.md` pour : objectif détaillé, architecture, état de la reprise,
décisions prises, plan de migration mail. **Ne demande jamais à Jaona une info qui s'y trouve.**

## Règles de travail
1. **Lean** : pas d'explications non sollicitées. Code → test → statut court.
2. **P0 sécurité avant tout** : ne touche pas au bug mail ou à la feature avant que
   la purge de l'historique git + rotation du mot de passe admin soient FAITES et
   VÉRIFIÉES (pas juste un commit qui le supprime — l'historique git doit être purgé).
3. **Prudence prod** : ce projet est déployé sur Vercel et utilisé réellement (réseautage
   en cours). Tout changement passe par le subagent `reviewer` AVANT déploiement.
   On ne casse jamais le flow QR → affichage → mail qui fonctionne déjà (3 étapes sur 4 OK).
4. **Anti-loop** : 3 tentatives max sur une même erreur, puis on s'arrête et on expose le problème.
5. **Vérifier le réel** : un déploiement Vercel réussi (build OK) ne prouve pas que l'email
   part réellement. Tester l'envoi réel après chaque changement sur `/api/send-email`.
6. **Réutilisation** : avant de créer un nouvel adapter mail, vérifier si l'ancien zip
   (`C:\Jaona\Perso\CV\QR Code CV`) contient une config Resend réutilisable.
7. **Fin de session** : rappeler à Jaona de taper `/save` si du travail significatif a été fait.

## Commandes disponibles
`/save` (journal + commit + push) · `/status` (état git + déploiement + avancement) ·
`/retro` (fin de projet : leçons → learning tracker) · `/learn` (toggle mode pédagogique)

## Subagents
`auditor` (exploration lecture seule) · `reviewer` (tests + sécurité, OBLIGATOIRE avant
déploiement) · `teacher` (pédagogie sur demande) · `propagateur` (analyse d'impact,
lecture seule) · `gardien` (alignement objectif, lecture seule)

## Stack
Next.js 14, nodemailer (→ migration Resend prévue), déploiement Vercel, GitHub.

## Environnements
Local : `C:\cv-networking` · Repo : `github.com/BONAVAMPIRA/CV_QRCode` · Déploiement : Vercel.
Détail complet et précautions : PROJECT_CONTEXT.md section Environnements.
