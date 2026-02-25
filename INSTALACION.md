# Guía de Instalación y Uso Detallada

## Requisitos Previos

- Node.js 18.0 o superior
- npm o yarn

## Instalación Paso a Paso

### 1. Descargar el Proyecto
Descarga la carpeta `pdf-splitter-app` a tu computadora.

### 2. Abrir Terminal
- **Windows**: Presiona `Win + R`, escribe `cmd` y presiona Enter
- **Mac**: Presiona `Cmd + Espacio`, escribe `Terminal` y presiona Enter
- **Linux**: Presiona `Ctrl + Alt + T`

### 3. Navegar al Directorio del Proyecto
```bash
cd ruta/a/pdf-splitter-app
```

Por ejemplo:
```bash
cd C:\Users\TuNombre\Downloads\pdf-splitter-app
```

### 4. Instalar Dependencias
```bash
npm install
```

Este comando descargará todas las librerías necesarias. Puede tomar algunos minutos.

### 5. Ejecutar la Aplicación
```bash
npm run dev
```

Verás un mensaje similar a:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 6. Abrir en el Navegador
Abre tu navegador (Chrome, Firefox, Edge, etc.) y ve a:
```
http://localhost:3000
```

## Uso de la Aplicación

### Dividir Automáticamente
1. Haz clic en el botón "Selecciona un archivo PDF"
2. Elige tu archivo PDF que contiene todos los documentos
3. Haz clic en "Dividir Automático"
4. La aplicación:
   - Divide el PDF asumiendo el orden típico (Cédula → RIF → Títulos/Certificaciones → Constancia → Curriculum)
   - **Corrige automáticamente** la orientación de páginas rotadas o al revés
   - Genera PDFs separados listos para usar

### Configurar Manualmente
Si tu PDF tiene un orden diferente:
1. Haz clic en "Configurar y Dividir"
2. Ajusta los números de página para cada documento
3. Haz clic en "Aplicar Configuración"
4. Las páginas se corrigen automáticamente durante el proceso

### Descargar Resultados
- **Individual**: Haz clic en "Descargar" junto a cada documento
- **ZIP completo**: Haz clic en "📦 Descargar Todo (ZIP)" 
  - Se descarga un archivo ZIP con el nombre `[nombre-original]_divididos.zip`
  - Dentro del ZIP hay una carpeta llamada `documentos_divididos`
  - La carpeta contiene todos los PDFs organizados

## Solución de Problemas

### Corrección de Orientación
La aplicación corrige automáticamente:
- Páginas escaneadas de lado (horizontales)
- Páginas al revés (180°)
- Páginas con rotación incorrecta

Si notas que alguna página no se corrigió correctamente, verifica:
1. Que el PDF original sea válido
2. La consola del navegador (F12) para ver los mensajes de corrección
3. Si el problema persiste, usa el modo "Configurar y Dividir" para ajustar manualmente

### El comando "npm" no se reconoce
**Solución**: Necesitas instalar Node.js desde https://nodejs.org/

### El puerto 3000 está ocupado
**Solución**: Cierra otras aplicaciones que puedan estar usando ese puerto o ejecuta:
```bash
npm run dev -- -p 3001
```
Y abre http://localhost:3001

### Error al dividir el PDF
**Posibles causas**:
- El PDF está protegido con contraseña
- El PDF está corrupto
- El PDF no es un formato válido

**Solución**: Intenta abrir el PDF en un lector de PDF primero para verificar que funcione correctamente.

## Detener la Aplicación
Presiona `Ctrl + C` en la terminal donde está corriendo la aplicación.

## Compilar para Producción (Opcional)
Si quieres crear una versión optimizada:
```bash
npm run build
npm start
```

## Soporte
Si encuentras problemas, verifica:
1. Que Node.js esté instalado correctamente
2. Que todas las dependencias se hayan instalado
3. Que el archivo PDF no esté corrupto
4. Que tengas suficiente espacio en disco
