@echo off
color 0B
echo(
echo  ================================================
echo    CV QR Code - Installation
echo  ================================================
echo(

node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo(
    echo  [ERREUR] Node.js n est pas installe !
    echo(
    echo  On va ouvrir la page de telechargement...
    echo  Clique sur le gros bouton vert LTS
    echo  Installe-le, puis double-clique a nouveau sur ce fichier.
    echo(
    start https://nodejs.org/fr
    pause
    exit /b 1
)

echo  [OK] Node.js detecte :
node --version
echo(

echo  Installation des dependances (2-3 minutes)...
echo  C est normal si tu vois beaucoup de texte defiler.
echo(

call npm install

if %errorlevel% neq 0 (
    color 0C
    echo(
    echo  [ERREUR] L installation a echoue.
    echo  Essaie : clic droit sur ce fichier -> Executer en tant qu administrateur
    echo(
    pause
    exit /b 1
)

color 0A
echo(
echo  ================================================
echo    Installation reussie !
echo  ================================================
echo(
echo  Prochaine etape :
echo  Double-clique sur LANCER.bat
echo(
pause
