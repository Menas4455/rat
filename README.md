# PDF Splitter - Dividir Documentos Automáticamente

Aplicación Next.js que divide automáticamente un PDF con múltiples documentos en archivos separados.

## Características

- ✅ Identifica automáticamente tipos de documentos:
  - Cédula de Identidad
  - RIF (Registro Único de Información Fiscal)
  - Títulos y Certificaciones (agrupados juntos)
  - Constancia de Prestación de Servicios
  - Curriculum Vitae

- ✅ **Corrección automática de orientación**: Detecta y corrige páginas que están rotadas o al revés
- ✅ **Descarga en carpeta ZIP**: Al descargar todos los archivos, se crea un archivo ZIP con una carpeta organizada
- ✅ Agrupa títulos múltiples con sus certificaciones en un solo PDF
- ✅ Procesa todo en el navegador (sin necesidad de servidor)
- ✅ Descarga individual o descarga masiva en ZIP
- ✅ Interfaz simple y fácil de usar
- ✅ Modo automático y modo de configuración personalizada

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

## Uso

### Modo Automático
1. Haz clic en "Selecciona un archivo PDF"
2. Elige el PDF que contiene todos los documentos
3. Presiona "Dividir Automático"
4. Espera a que se procese el documento
5. Descarga los archivos:
   - **Individual**: Haz clic en "Descargar" junto a cada documento
   - **ZIP completo**: Haz clic en "📦 Descargar Todo (ZIP)" para obtener todos los archivos en una carpeta comprimida

### Modo Configuración Personalizada
1. Haz clic en "Selecciona un archivo PDF"
2. Elige el PDF que contiene todos los documentos
3. Presiona "Configurar y Dividir"
4. Ajusta las páginas de cada documento según tu PDF
5. Presiona "Aplicar Configuración"
6. Descarga los archivos:
   - **Individual**: Haz clic en "Descargar" junto a cada documento
   - **ZIP completo**: Haz clic en "📦 Descargar Todo (ZIP)" para obtener todos los archivos en una carpeta comprimida

## Estructura de Archivos Generados

Los archivos se generan con los siguientes nombres:

1. `01_Cedula_Identidad.pdf` - Cédula de identidad
2. `02_RIF.pdf` - Registro de información fiscal
3. `03_Titulos_Certificaciones.pdf` - Todos los títulos y certificaciones
4. `04_Constancia_Servicios.pdf` - Constancia de prestación de servicios
5. `05_Curriculum.pdf` - Curriculum vitae completo

## Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **pdf-lib** - Manipulación de PDFs en el navegador
- **JSZip** - Creación de archivos ZIP

## Corrección Automática de Orientación

El programa detecta y corrige automáticamente:
- Páginas en orientación horizontal (landscape) que deberían estar vertical (portrait)
- Páginas rotadas 90°, 180° o 270°
- Páginas al revés

Esto asegura que todos los documentos se generen con la orientación correcta, listos para imprimir o visualizar sin necesidad de edición posterior.

## Lógica de Identificación

La aplicación identifica los tipos de documento buscando palabras clave en cada página:

- **Cédula**: "cedula", "identidad", "venezolano"
- **RIF**: "rif", "registro", "fiscal"
- **Títulos**: "titulo", "bachiller", "certificado", "certificacion"
- **Constancia**: "constancia", "prestacion", "servicios"
- **Curriculum**: "curriculum", "sintesis", "curricular"

## Notas Importantes

- Los títulos y certificaciones se agrupan automáticamente hasta encontrar la constancia de servicios
- El curriculum incluye todas las páginas desde su inicio hasta el final del documento
- Si hay páginas no identificadas, se crean documentos separados para ellas
- Todo el procesamiento ocurre en el navegador, los archivos no se suben a ningún servidor

## Licencia

MIT
