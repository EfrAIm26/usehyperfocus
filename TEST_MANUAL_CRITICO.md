# 🧪 TEST MANUAL CRÍTICO - Hyperfocus AI

## ⚠️ ANTES DE EMPEZAR

1. **LIMPIA EL CACHE**: `Ctrl + Shift + R`
2. **Abre DevTools**: `F12`
3. **Ve a Console**: Busca errores rojos

---

## 🎯 TEST 1: Chunks Inteligentes (EL MÁS IMPORTANTE)

### Paso 1: Habilita Chunks
1. Click en botón `+` (izquierda del chat)
2. Marca "Semantic Chunks"
3. Cierra el dropdown

### Paso 2: Envía mensaje de prueba
```
dame modelo de negocios de oracle
```

### Paso 3: Verifica el resultado

#### ✅ CORRECTO (lo que DEBES ver):
```
[Amarillo/Naranja] 1. Descripción General
Oracle es una empresa...

[Morado] 2. Segmentos de Clientes
• Grandes Empresas...

[Morado] 3. Propuesta de Valor
• Software de Base de Datos...

[Azul] 4. Canales
• Ventas Directas...

[Azul] 5. Relación con Clientes
• Soporte Técnico...

[Gris] 6. Fuentes de Ingresos
...
```

**Características CORRECTAS**:
- ✅ Múltiples recuadros (5-6 chunks)
- ✅ Diferentes colores (amarillo, morado, azul, gris)
- ✅ Cada título tiene su propio chunk
- ✅ Cada chunk tiene un ícono

#### ❌ INCORRECTO (cache no limpiado):
```
[Gris] EXPLANATION
Claro, aquí tienes un modelo...
[TODO EL TEXTO JUNTO EN UN SOLO BLOQUE GRIS]
```

**Si ves esto**:
1. Cache NO se limpió
2. Haz `Ctrl + Shift + R` de nuevo
3. O abre modo incógnito

---

## 🎯 TEST 2: Settings Persistentes

### Paso 1: Configura Bionic
1. Click en `+`
2. Selecciona "Bionic Reading" en Style
3. Cierra dropdown

### Paso 2: Envía mensaje
```
qué es machine learning
```

### Paso 3: Verifica que se ve en Bionic
- ✅ Palabras con inicio en negrita
- ✅ Texto más fácil de leer

### Paso 4: Cambia a Normal
1. Click en `+`
2. Selecciona "Normal" en Style
3. Cierra dropdown

### Paso 5: Envía OTRO mensaje
```
qué es deep learning
```

### Paso 6: Verifica ambos mensajes

#### ✅ CORRECTO:
- Primer mensaje ("machine learning"): **Sigue en Bionic** (no cambió)
- Segundo mensaje ("deep learning"): En Normal

#### ❌ INCORRECTO:
- Ambos mensajes cambiaron a Normal
- → Settings NO son persistentes (cache viejo)

---

## 🎯 TEST 3: Panel Lateral Cierra

### Paso 1: Genera diagrama
```
mind map de programación
```

### Paso 2: Verifica que se abre
- ✅ Panel lateral aparece automáticamente
- ✅ Diagrama se muestra

### Paso 3: Click en X (arriba derecha del panel)

#### ✅ CORRECTO:
- Panel se cierra
- Chat visible de nuevo

#### ❌ INCORRECTO:
- Panel no se cierra
- X no responde

---

## 🎯 TEST 4: Error Mermaid Pequeño

### Paso 1: Genera diagrama con error
```
edit: add a completely invalid syntax
```

### Paso 2: Verifica el error

#### ✅ CORRECTO:
```
[Pequeño recuadro rojo]
⚠️ Diagram Error
[Texto pequeño con sugerencias]
Try:
• Check the Code tab
• Ask AI to fix
```

**Características CORRECTAS**:
- ✅ Texto pequeño (text-xs)
- ✅ Recuadro compacto
- ✅ Sugerencias de solución

#### ❌ INCORRECTO:
```
[ERROR GIGANTE QUE OCUPA TODA LA PANTALLA]
Syntax error in text
mermaid version 11.12.0
```

---

## 🎯 TEST 5: Cambiar de Chat Cierra Panel

### Paso 1: Abre diagrama
- Genera diagrama en Chat 1
- Panel lateral se abre

### Paso 2: Cambia de chat
- Click en "New Chat"

#### ✅ CORRECTO:
- Panel lateral se CIERRA automáticamente
- Nuevo chat sin panel

#### ❌ INCORRECTO:
- Panel lateral sigue abierto
- Panel muestra diagrama del chat anterior

---

## 📊 Tabla de Resultados

| Test | ✅ Pasa | ❌ Falla | Notas |
|------|---------|----------|-------|
| 1. Chunks coloreados | | | |
| 2. Settings persistentes | | | |
| 3. Panel X funciona | | | |
| 4. Error pequeño | | | |
| 5. Panel se cierra | | | |

---

## 🐛 Si algún test FALLA:

### Test 1 Falla (Chunks en gris):
**Causa**: Cache viejo del navegador
**Solución**:
1. `Ctrl + Shift + R` (hard refresh)
2. Abre DevTools (F12) → Console
3. Busca mensajes como "CRITICAL RULES" en Network
4. Si no aparece, cache NO se limpió

### Test 2 Falla (Settings cambian):
**Causa**: `appliedFontStyle` no se guarda
**Solución**:
1. Abre DevTools → Application → Local Storage
2. Busca tu dominio (localhost:5178)
3. Busca "hyperfocus-ai-data"
4. Verifica que messages tengan `appliedFontStyle`

### Test 3 Falla (X no funciona):
**Causa**: Z-index bajo
**Solución**:
1. Abre DevTools → Elements
2. Inspecciona el panel lateral
3. Verifica que tenga `z-index: 50`

### Test 4 Falla (Error grande):
**Causa**: Código viejo de DiagramSidePanel
**Solución**:
1. Verifica `src/components/diagrams/DiagramSidePanel.tsx`
2. Busca `text-xs` en el código de error
3. Si no está, rebuild: `npm run build`

### Test 5 Falla (Panel no cierra):
**Causa**: useEffect no detecta cambio de chat
**Solución**:
1. Verifica `src/App.tsx`
2. Busca `useEffect` que dependa de `currentChatId`
3. Debe llamar a `handleCloseDiagram()`

---

## 🔍 Verificación de Código

### Verifica que estos cambios estén en tu código:

#### 1. `src/lib/openrouter.ts` (línea ~216):
```typescript
const prompt = `Analyze this text for a neurodivergent learning application. Separate it into semantic chunks BY SECTION (each title/heading = one chunk).

CRITICAL RULES:
1. Detect section titles/headings:
```

**Si NO ves "CRITICAL RULES"**: Cache o código viejo

#### 2. `src/components/chat/Message.tsx` (línea ~35):
```typescript
// Freeze settings on first render for this message (only once!)
useEffect(() => {
  if (message.role === 'assistant' && message.appliedFontStyle === undefined) {
```

**Si NO ves "Freeze settings"**: Rebuild necesario

#### 3. `src/components/diagrams/DiagramSidePanel.tsx` (línea ~60):
```typescript
<div class="text-red-700 p-4 bg-red-50 rounded-lg text-xs border border-red-200">
  <div class="font-semibold mb-2">⚠️ Diagram Error</div>
```

**Si NO ves "text-xs"**: Rebuild necesario

#### 4. `src/App.tsx` (línea ~50):
```typescript
// Close diagram panel when changing chats
useEffect(() => {
  handleCloseDiagram();
}, [currentChatId]);
```

**Si NO ves este useEffect**: Rebuild necesario

---

## ✅ Todos los Tests Pasan = ÉXITO

Si TODOS los tests pasan:
- ✅ Código correcto
- ✅ Cache limpiado
- ✅ Aplicación funcional al 100%

---

## ❌ Algún Test Falla = CACHE VIEJO

Si ALGÚN test falla:
1. **Cierra TODAS las ventanas del navegador**
2. **Mata el servidor**: `taskkill /F /IM node.exe`
3. **Limpia cache de Vite**: `rm -rf dist node_modules/.vite`
4. **Rebuild**: `npm run build`
5. **Inicia**: `npm run dev`
6. **Abre en MODO INCÓGNITO**: `Ctrl + Shift + N`
7. **Ve a la app**: `localhost:[puerto]`

---

**Tiempo estimado**: 5-7 minutos para todos los tests

**¡IMPORTANTE!** Haz hard refresh (`Ctrl + Shift + R`) ANTES de cada test.


