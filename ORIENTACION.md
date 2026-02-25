# Corrección Automática de Orientación - Cómo Funciona

## Descripción General

El programa detecta y corrige automáticamente la orientación de cada página en el PDF. Esto es especialmente útil cuando los documentos han sido escaneados en diferentes orientaciones.

## Tipos de Corrección

### 1. Páginas en Horizontal (Landscape → Portrait)
**Problema**: La página está escaneada horizontalmente pero debería estar vertical
**Solución**: El programa rota la página 90° para ponerla en posición vertical
**Ejemplo**: Cédula escaneada de lado → Se corrige a vertical

### 2. Páginas al Revés (180°)
**Problema**: La página está completamente invertida (de cabeza)
**Solución**: El programa rota la página 180° para ponerla derecha
**Ejemplo**: Documento escaneado al revés → Se corrige a posición normal

### 3. Páginas Rotadas (90° o 270°)
**Problema**: La página está rotada pero debería estar recta
**Solución**: El programa corrige la rotación a 0° o 90° según corresponda
**Ejemplo**: PDF con rotación incorrecta → Se corrige a orientación correcta

## Detección Automática

El programa analiza cada página para determinar:
1. **Dimensiones**: Compara ancho vs. alto para detectar orientación
2. **Rotación actual**: Lee la metadata de rotación de la página
3. **Orientación esperada**: La mayoría de documentos de identidad deben estar en vertical

## Ventajas

✅ **Ahorra tiempo**: No necesitas corregir manualmente cada página
✅ **Consistencia**: Todos los documentos quedan con la misma orientación
✅ **Listo para usar**: Los PDFs generados están listos para imprimir o enviar
✅ **Automático**: El proceso ocurre durante la división, sin pasos adicionales

## Casos de Uso Comunes

### Caso 1: Cédula Escaneada de Lado
```
Original: Página horizontal (landscape)
Detectado: width > height
Acción: Rotar 90° a la derecha
Resultado: Página vertical (portrait)
```

### Caso 2: Constancia al Revés
```
Original: Rotación de 180°
Detectado: rotation === 180
Acción: Rotar a 0°
Resultado: Página derecha
```

### Caso 3: Curriculum con Páginas Mixtas
```
Original: Algunas páginas verticales, otras horizontales
Detectado: Dimensiones diferentes
Acción: Normalizar todas a vertical
Resultado: Documento consistente
```

## Notas Técnicas

- La corrección se aplica **durante** el proceso de división
- Se preserva la calidad original del PDF
- No se modifica el contenido, solo la orientación
- La corrección se registra en la consola del navegador para debugging

## Ejemplo de Log

Cuando se corrige una página, verás en la consola:
```
Página corregida: rotada de 0° a 90° (landscape -> portrait)
Página corregida: rotada de 180° a 0° (al revés -> derecha)
```

Esto te permite verificar qué correcciones se aplicaron a tu documento.
