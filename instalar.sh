#!/bin/bash

echo "===================================="
echo " PDF Splitter - Instalación Rápida"
echo "===================================="
echo ""

echo "Verificando Node.js..."
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js no está instalado"
    echo ""
    echo "Por favor descarga e instala Node.js desde:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi

echo "Node.js detectado correctamente"
echo ""

echo "Instalando dependencias..."
echo "Esto puede tomar unos minutos..."
echo ""
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Falló la instalación de dependencias"
    exit 1
fi

echo ""
echo "===================================="
echo " Instalación completada!"
echo "===================================="
echo ""
echo "Para iniciar la aplicación ejecuta:"
echo "  npm run dev"
echo ""
echo "Luego abre en tu navegador:"
echo "  http://localhost:3000"
echo ""
