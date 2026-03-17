@echo off
color 0B
echo(
echo  ================================================
echo    Deploiement sur Vercel (gratuit)
echo  ================================================
echo(
echo  Ton app va etre mise en ligne sur Internet.
echo  Tu auras une URL : https://cv-networking-xxx.vercel.app
echo(
echo  Avant de continuer :
echo  - Cree un compte sur https://vercel.com (gratuit)
echo(
echo  Appuie sur une touche pour lancer...
pause >nul

echo(
echo  Lancement du deploiement...
echo(
call npx vercel --yes

echo(
echo  ================================================
echo  APRES le deploiement, va sur vercel.com et :
echo  1. Clique sur ton projet
echo  2. Storage -^> Create Store -^> Blob
echo  3. Settings -^> Environment Variables :
echo     RESEND_API_KEY  = ta cle Resend
echo     MY_EMAIL        = jrabaona@gmail.com
echo     NEXT_PUBLIC_APP_URL = https://ton-url.vercel.app
echo  4. Clique Redeploy
echo  ================================================
echo(
pause
