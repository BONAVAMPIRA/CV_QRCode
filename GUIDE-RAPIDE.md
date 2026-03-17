# 🚀 Guide Rapide — CV QR Code App

## Étape 1 : Installer Node.js (si pas déjà fait)
→ Va sur https://nodejs.org/fr → bouton vert "LTS" → installe

## Étape 2 : Installer l'application
→ Double-clique sur **INSTALL-WINDOWS.bat**

## Étape 3 : Configurer les clés API

Ouvre le fichier **.env.local** avec le Bloc-notes et remplis :

### RESEND_API_KEY (pour envoyer les emails)
1. Va sur https://resend.com → créer un compte gratuit
2. Menu gauche → "API Keys" → "Create API Key"
3. Copie la clé (commence par `re_`)
4. Colle-la dans .env.local : `RESEND_API_KEY=re_ta_cle_ici`

### BLOB_READ_WRITE_TOKEN (pour stocker le CV)
→ Ce token est ajouté automatiquement quand tu déploies sur Vercel
→ Pour le test local, vois l'Étape 4 d'abord

## Étape 4 : Tester en local (sans email)
→ Double-clique sur **LANCER.bat**
→ Ouvre http://localhost:3000/admin dans ton navigateur
→ Mot de passe : `Jaona2026!`

## Étape 5 : Déployer sur Internet (Vercel)
→ Double-clique sur **DEPLOYER-VERCEL.bat**
→ Suis les instructions à l'écran

## Après le déploiement :
1. Va sur https://vercel.com → ton projet → **Storage** → **Create Store** → **Blob**
2. Va dans **Settings** → **Environment Variables** :
   - `RESEND_API_KEY` = ta clé Resend
   - `MY_EMAIL` = jrabaona@gmail.com
   - `NEXT_PUBLIC_APP_URL` = https://ton-url.vercel.app
3. **Redeploy** le projet pour appliquer les variables

## Pour utiliser l'app au réseautage :
1. Ouvre https://ton-url.vercel.app/admin sur ton ordi
2. Entre le nom de l'événement + la date + uploade ton CV
3. Clique "Générer le QR Code"
4. Télécharge le QR Code sur ton téléphone (dans ta galerie)
5. Au réseautage : montre la photo du QR Code !

## Mot de passe admin :
`Jaona2026!` (tu peux le changer dans .env.local : ADMIN_PASSWORD)
