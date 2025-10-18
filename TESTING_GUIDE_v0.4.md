# 🧪 Guía Rápida de Testing - Hyperfocus AI v0.4.0

## ⚡ Inicio Rápido

```bash
npm run dev
# Abre http://localhost:5176 (o el puerto que muestre)
```

---

## 🎯 Tests Esenciales (5 minutos)

### 1️⃣ Test Panel Auto-Open (30 seg)

**Acción**:
```
Escribe en el chat: "dame un mapa mental de inteligencia artificial"
```

**Resultado Esperado**:
- ✅ El panel lateral se abre **automáticamente**
- ❌ **NO debe aparecer** botón "Diagram Ready"
- ✅ El diagrama se visualiza inmediatamente

**Si falla**: Panel no se abre → Revisa `Message.tsx` useEffect line 28

---

### 2️⃣ Test Panel Se Cierra Al Cambiar Chat (20 seg)

**Acción**:
1. Abre un diagrama (panel lateral visible)
2. Click en "New Chat" en sidebar
3. Regresa al chat con el diagrama

**Resultado Esperado**:
- ✅ Al hacer "New Chat", el panel se **cierra**
- ✅ Al regresar al chat original, el panel se abre de nuevo

**Si falla**: Panel persiste → Revisa `App.tsx` useEffect line 42

---

### 3️⃣ Test Edit con Lenguaje Natural (1 min)

**Acción**:
1. Abre un diagrama cualquiera
2. Click en tab "Edit" abajo del panel
3. Escribe: `add a node called Deep Learning`
4. Click "Apply Changes"
5. Espera respuesta del AI

**Resultado Esperado**:
- ✅ Aparece recuadro de texto **abajo del panel**
- ✅ AI responde con nuevo diagrama (sin errores de sintaxis)
- ✅ El panel se cierra para mostrar el nuevo mensaje

**Si falla**: Errores de sintaxis → Revisa `App.tsx` handleEditDiagram line 75

---

### 4️⃣ Test Chunks NO Se Regeneran (1 min)

**Acción**:
1. Habilita "Semantic Chunks" (botón "+" → Organization)
2. Escribe: `explícame la fotosíntesis`
3. Espera a que aparezcan los chunks (color por tipo)
4. Cambia a otro chat o crea uno nuevo
5. Regresa al chat original

**Resultado Esperado**:
- ✅ Los chunks aparecen **instantáneamente** (sin "analyzing...")
- ✅ NO se reenvía el mensaje
- ✅ NO se regenera contenido

**Si falla**: Se regenera → Revisa `Message.tsx` saveChat() line 52

---

### 5️⃣ Test Settings Estables (No Retroactivos) (1 min)

**Acción**:
1. Settings actual: Bionic Reading (botón "+")
2. Escribe: `qué es el aprendizaje automático`
3. Espera respuesta (debe verse en Bionic)
4. Cambia a "Normal" (botón "+")
5. Vuelve a ver el mensaje anterior

**Resultado Esperado**:
- ✅ El mensaje anterior **mantiene** su estilo Bionic
- ✅ Los nuevos mensajes usan el estilo Normal
- ✅ Cada mensaje es **estable e inmutable**

**Si falla**: Todo cambia → Revisa `Message.tsx` effectiveFontStyle line 20

---

### 6️⃣ Test Botón "+" y Layout (30 seg)

**Acción**:
1. Busca el input de chat
2. Verifica el orden de los elementos

**Resultado Esperado**:
```
[+] [📎] [Model Selector] [Input largo] [Send]
```
- ✅ Botón "+" primero
- ✅ Botón Attach solo con ícono (sin texto)
- ✅ Model Selector después
- ✅ Click en "+" muestra dropdown con Style y Organization

**Si falla**: Layout incorrecto → Revisa `ChatInput.tsx` line 53

---

### 7️⃣ Test Settings Solo Tiene Focus Mode (20 seg)

**Acción**:
1. Click en ⚙️ (Settings) en top bar
2. Revisa contenido del sidebar

**Resultado Esperado**:
- ✅ Solo aparece **Focus Mode** (Hyperfocus vs Default)
- ❌ **NO hay** botón "Save"
- ❌ **NO hay** opciones de Style ni Organization (están en "+")

**Si falla**: Aparecen otras opciones → Revisa `SettingsPanel.tsx`

---

## 🎨 Tests Visuales (1 min)

### Test Minimalismo:

**Revisa que NO aparezcan**:
- ❌ Botón "Diagram Ready"
- ❌ Texto "Attach" (solo ícono 📎)
- ❌ Botón "Save" en Settings
- ❌ Textos largos innecesarios

**Revisa que SÍ aparezcan**:
- ✅ Botón "+" con dropdown limpio
- ✅ Model Selector compacto
- ✅ Panel lateral sin clutter
- ✅ Settings sidebar simple

---

## 🔥 Tests de Regresión (2 min)

### Test Hyperfocus Mode:
1. Settings → Focus Mode: Hyperfocus
2. Nuevo chat
3. Pregunta: `qué es JavaScript`
4. Espera respuesta
5. Pregunta: `cuál es la capital de Francia` (tema diferente)

**Resultado Esperado**:
- ✅ Aparece alerta "Stay focused!" 
- ✅ Ofrece "New Chat" o "Continue"

---

### Test Model Selector:
1. Click en Model Selector
2. Selecciona diferentes modelos

**Resultado Esperado**:
- ✅ Muestra ícono del proveedor (OpenAI, Anthropic, etc.)
- ✅ Cambio se aplica inmediatamente
- ✅ Lista incluye:
  - GPT-4o Mini
  - Gemini 1.5 Flash
  - Grok 4 Fast
  - Claude Sonnet 4.5
  - Claude Haiku 4.5
  - Sonar Deep Research

---

## 🐛 Problemas Comunes y Soluciones

### Problema: Panel no se abre automáticamente
**Solución**: Verifica que `message.mermaidCode` existe y que el useEffect en Message.tsx (line 28) está funcionando

### Problema: Chunks se regeneran
**Solución**: Verifica que `storage.saveChat(chat)` se está llamando en Message.tsx (line 52)

### Problema: Settings cambian mensajes anteriores
**Solución**: Verifica que `appliedFontStyle` se está guardando en storage (Message.tsx line 42)

### Problema: Edit genera errores de sintaxis
**Solución**: Verifica el prompt en App.tsx (line 78) - debe pedir SOLO código Mermaid

---

## ✅ Checklist Final

Antes de considerar todo OK:

- [ ] Panel auto-abre ✅
- [ ] Panel cierra al cambiar chat ✅
- [ ] Edit con lenguaje natural funciona ✅
- [ ] Edit box está abajo del panel ✅
- [ ] Chunks NO se regeneran ✅
- [ ] Settings son estables ✅
- [ ] Botón "+" está presente ✅
- [ ] Attach es solo ícono ✅
- [ ] Settings solo tiene Focus Mode ✅
- [ ] Modelos son 4.5 (Sonnet y Haiku) ✅
- [ ] Build compila sin errores ✅
- [ ] No hay errores de linter ✅

---

## 📊 Tiempo Estimado Total

- **Tests Esenciales**: 5 minutos
- **Tests Visuales**: 1 minuto
- **Tests de Regresión**: 2 minutos
- **Total**: ~8 minutos

---

## 🎯 Criterio de Aceptación

**✅ TODO OK SI**:
- Todos los tests esenciales pasan
- No aparecen errores en consola
- UI se ve limpia y minimalista
- Navegación es fluida

**❌ HAY PROBLEMA SI**:
- Panel no se abre automáticamente
- Chunks se regeneran al navegar
- Settings cambian mensajes anteriores
- Hay errores de sintaxis en edición

---

## 📝 Notas

- **Usa localhost:5176** (o el puerto que muestre Vite)
- **Limpia localStorage** si ves comportamiento extraño: `localStorage.clear()`
- **Recarga la página** entre tests si es necesario
- **Abre la consola** para ver logs de debug

---

**¡Listo para probar!** 🚀


