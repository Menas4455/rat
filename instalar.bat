@echo off
echo ====================================
echo  PDF Splitter - Instalacion Rapida
echo ====================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor descarga e instala Node.js desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js detectado correctamente
echo.

echo Instalando dependencias...
echo Esto puede tomar unos minutos...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

echo.
echo ====================================
echo  Instalacion completada!
echo ====================================
echo.
echo Para iniciar la aplicacion ejecuta:
echo   npm run dev
echo.
echo Luego abre en tu navegador:
echo   http://localhost:3000
echo.
pause
