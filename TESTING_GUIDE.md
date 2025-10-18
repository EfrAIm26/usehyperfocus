# 🧪 Guía de Pruebas - Hyperfocus AI v0.2.0

## 🚀 Iniciar la Aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## ✅ Pruebas de Funcionalidad

### 1. **Bug Fix: Settings No Borra Texto** 

**Pasos**:
1. Escribe algo en el input del chat (NO lo envíes)
2. Haz clic en el icono de Settings (⚙️)
3. Cambia cualquier setting (por ejemplo, cambia el Reading Style)
4. Haz clic en "Save"

**Resultado Esperado**: ✅ El texto que escribiste debe seguir en el input

**Antes**: ❌ El texto se borraba

---

### 2. **Bug Fix: Chunks Persisten**

**Pasos**:
1. Asegúrate de que "Semantic Chunking" esté activado en Settings
2. Envía un mensaje largo (ej: "Dame 5 definiciones de IA y ejemplos")
3. Espera a que el AI responda con chunks coloreados
4. Cambia a otro chat o refresca la página
5. Vuelve al chat original

**Resultado Esperado**: ✅ Los chunks deben aparecer inmediatamente (sin re-analizar)

**Antes**: ❌ Se volvía a analizar cada vez

---

### 3. **Diagramas Grandes con Controles Inline**

**Pasos**:
1. Envía: "dame un mind map de la neurodivergencia"
2. Espera la respuesta del AI

**Resultado Esperado**: ✅
- El diagrama se muestra grande directamente
- No hay botón "Expand Diagram"
- Hay tabs "View" y "Code"
- Hay controles de zoom (-, 100%, +)
- Hay botones "PNG" y "SVG"
- El mapa mental tiene letra grande y legible

**Antes**: ❌ 
- Diagrama pequeño con botón "Expand"
- Letra muy pequeña en mapas mentales

---

### 4. **Selector de Modelos**

**Pasos**:
1. Mira en la parte inferior del chat input
2. Deberías ver un selector con el modelo actual (ej: "GPT-4o Mini" con icono de OpenAI)
3. Haz clic en el selector
4. Debe aparecer un dropdown con 6 modelos

**Resultado Esperado**: ✅
- Cada modelo tiene su icono de proveedor
- Puedes ver la descripción de cada modelo
- El modelo activo tiene un badge "Active"
- Al seleccionar uno, se cierra el dropdown
- Los siguientes mensajes usan el modelo seleccionado

**Modelos Disponibles**:
- 🟢 OpenAI: GPT-4o Mini
- 🔵 Google: Gemini 2.5 Flash
- ⚫ xAI: Grok 4 Fast
- 🟠 Anthropic: Claude 3.5 Sonnet
- 🟠 Anthropic: Claude 3.5 Haiku
- 🟣 Perplexity: Sonar Deep Research

---

### 5. **Settings Sidebar Estilo Gemini**

**Pasos**:
1. Haz clic en el icono de Settings (⚙️)
2. El panel debe deslizarse desde la derecha
3. Debe haber un backdrop gris sutil detrás
4. Cambia alguna opción
5. Haz clic en "Save"

**Resultado Esperado**: ✅
- Panel se desliza suavemente desde la derecha
- Ancho del panel: ~320px
- Backdrop gris claro (10% opacidad)
- Al guardar, se cierra y aplica sin recargar
- Al cerrar (X o backdrop), los cambios no guardados se descartan

**Antes**: ❌
- Modal en el centro con backdrop oscuro
- Recargaba la página al guardar

---

### 6. **Chunks con Haiku 4.5 (Más Rápido)**

**Pasos**:
1. Activa "Semantic Chunking" en Settings
2. Envía: "Explícame qué es la inteligencia artificial"
3. Observa el tiempo de respuesta y análisis

**Resultado Esperado**: ✅
- El análisis es más rápido que antes
- Los chunks son resumidos (no texto completo)
- Los chunks están organizados por tipo con colores

**Antes**: ❌
- Usaba Sonnet (más lento y caro)
- Texto completo en chunks

---

## 🎨 Pruebas Visuales

### Colores de Chunks (Semantic Chunking)

Si está activado, deberías ver:
- 💙 **Azul**: Definiciones
- 💚 **Verde**: Ejemplos
- 💛 **Amarillo**: Acciones/Pasos
- 💜 **Púrpura**: Puntos Clave
- ⚪ **Gris**: Explicaciones

### Diagramas

Prueba diferentes tipos:
```
"dame un mind map de estudiar"
"crea un flowchart de cómo hacer café"
"crea un gantt chart para un proyecto de 3 meses"
"dame un diagrama de clase de una aplicación de notas"
```

**Verifica**:
- ✅ Letra grande (20px)
- ✅ Espaciado amplio entre nodos
- ✅ Controles de zoom funcionan
- ✅ Descarga PNG/SVG funciona
- ✅ Tab "Code" muestra el código Mermaid
- ✅ Puedes editar el código y ver cambios

---

## 🧩 Pruebas de Hyperfocus Mode

**Pasos**:
1. En Settings, selecciona "🎯 Hyperfocus Mode"
2. Crea un nuevo chat
3. Envía: "dame estrategias de estudio"
4. Espera respuesta
5. Envía: "cuál es el mejor restaurante en Lima" (cambio de tema)

**Resultado Esperado**: ✅
- Debe aparecer una alerta: "🎯 Stay focused!"
- Te dice el tema actual y el nuevo tema detectado
- Opciones: "Continue with [tema]" o "New Chat"
- No envía el mensaje hasta que decidas

---

## 📱 Pruebas Responsive

**Verifica en diferentes tamaños**:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Debe funcionar**:
- ✅ Sidebar se oculta en mobile
- ✅ Settings panel se adapta
- ✅ Diagramas son scrollables
- ✅ Input del chat es accesible

---

## 🔍 Checklist Final

Antes de dar por completa la prueba, verifica:

- [ ] Settings no borra texto escrito
- [ ] Chunks persisten al cambiar de chat
- [ ] Diagramas se ven grandes con controles inline
- [ ] Mapas mentales tienen letra legible (20px)
- [ ] Selector de modelos muestra iconos correctos
- [ ] Settings es un sidebar que se desliza desde la derecha
- [ ] Backdrop de settings es sutil (no oscuro)
- [ ] Chunks usan Haiku y son más rápidos
- [ ] Todos los 6 modelos están disponibles
- [ ] Descarga PNG/SVG de diagramas funciona
- [ ] Zoom de diagramas funciona
- [ ] Tab View/Code en diagramas funciona
- [ ] Hyperfocus mode funciona correctamente

---

## 🐛 Reportar Bugs

Si encuentras algún problema:

1. **Describe el problema**: ¿Qué estabas haciendo?
2. **Pasos para reproducir**: ¿Cómo puedo ver el mismo error?
3. **Comportamiento esperado**: ¿Qué debería pasar?
4. **Comportamiento actual**: ¿Qué está pasando?
5. **Screenshots**: Si es visual, adjunta una captura
6. **Console errors**: Abre DevTools (F12) y copia errores en rojo

---

## ✅ Todo Funciona?

Si todas las pruebas pasaron: **¡Felicitaciones!** 🎉

Tu aplicación Hyperfocus AI ahora tiene:
- ✅ Mejor UX (no pierde texto)
- ✅ Mejor rendimiento (chunks persisten)
- ✅ UI moderna (estilo Gemini)
- ✅ Más opciones (selector de modelos)
- ✅ Mejor visualización (diagramas grandes)
- ✅ Más velocidad (Haiku para chunks)


