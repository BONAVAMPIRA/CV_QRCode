@echo off
color 0B
echo(
echo  ================================================
echo    CV QR Code - Lancement
echo  ================================================
echo(

:: Verifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  [ERREUR] Node.js n est pas installe !
    echo(
    echo  1. Va sur https://nodejs.org/fr
    echo  2. Clique sur le bouton vert LTS
    echo  3. Installe-le, redemarre l ordinateur
    echo  4. Relance ce fichier
    echo(
    start https://nodejs.org/fr
    pause
    exit /b 1
)

echo  [OK] Node.js :
node --version
echo(

:: Verifier que npm install a ete fait
if not exist "node_modules" (
    color 0E
    echo  [ATTENTION] Les dependances ne sont pas installees.
    echo  Lancement de npm install...
    echo(
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo(
        echo  [ERREUR] npm install a echoue.
        echo  Essaie : clic droit sur ce fichier - Executer en tant qu administrateur
        pause
        exit /b 1
    )
    echo(
)

echo  Demarrage de l application...
echo(
echo  --> Ouvre dans ton navigateur : http://localhost:3000
echo(
echo  Pour arreter : Ctrl + C
echo(
call npm run dev
if %errorlevel% neq 0 (
    echo(
    echo  [ERREUR] Le demarrage a echoue. Voir le message ci-dessus.
)
pause
