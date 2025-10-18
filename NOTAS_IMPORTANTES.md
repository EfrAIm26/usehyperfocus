# 📌 Notas Importantes - Hyperfocus AI

## ⚠️ Funcionalidades NO Implementadas (Pendientes)

### 1. Botón Attach (📎)

**Estado**: **NO FUNCIONAL** - Solo visual

**Razón**: Requiere implementación completa de:
- File upload API
- Procesamiento de imágenes (OCR/Vision)
- Procesamiento de PDFs
- Gestión de archivos en memoria/storage
- Límites de tamaño
- Validación de tipos

**Para Implementar**:
```typescript
// Necesitarías:
1. Input file hidden
2. Handler para selección de archivos
3. Conversión a base64 o upload a servidor
4. Enviar a API que soporte multimodal
5. Mostrar preview de archivos adjuntos
```

**Dónde está**: `src/components/chat/ChatInput.tsx` (línea 58-64)

**Cuándo implementar**: Fase 2 - Después del MVP core

---

## ✅ Funcionalidades Completamente Implementadas

### 1. Chunks Inteligentes
- Por secciones/títulos
- Múltiples tipos y colores
- Persistentes

### 2. Settings Persistentes
- No retroactivos
- Se congelan por mensaje
- 100% inmutables

### 3. Panel Lateral Diagramas
- Auto-apertura
- Botón X funcional
- Errores compactos

### 4. Edición de Diagramas
- Lenguaje natural
- Prompt optimizado
- Menos errores de sintaxis

---

## 🔧 Configuración Actual

### Modelos AI:
- **Chat principal**: Seleccionable (GPT-4o Mini, Gemini, Grok, etc.)
- **Chunks**: Claude Haiku 4.5 (rápido y económico)
- **Topic detection**: Modelo seleccionado por usuario

### Storage:
- **Tipo**: localStorage (cliente)
- **Capacidad**: ~5-10 MB (límite del navegador)
- **Persistencia**: Solo en mismo navegador
- **Backup**: NO automático (pendiente)

---

## 🐛 Problemas Conocidos Menores

### 1. localStorage puede llenarse
**Solución temporal**: Borrar chats antiguos manualmente
**Solución futura**: Sistema de archivado automático

### 2. Chunks pueden ser lentos en textos muy largos
**Solución temporal**: AI analiza en ~2-3 segundos
**Solución futura**: Cache de análisis

### 3. Diagrama muy grandes pueden ser lentos
**Solución temporal**: Mermaid renderiza en ~1 segundo
**Solución futura**: Lazy loading

---

## 📊 Límites Técnicos Actuales

| Aspecto | Límite | Razón |
|---------|--------|-------|
| **Chats guardados** | ~50-100 | localStorage limitado |
| **Mensajes por chat** | ~200 | Rendimiento |
| **Longitud mensaje** | ~8000 chars | Límite API |
| **Archivos adjuntos** | 0 (no implementado) | Pendiente |

---

## 🎯 Roadmap Futuro (Post-MVP)

### Fase 2: Archivos
- ✅ Botón Attach funcional
- ✅ Soporte para imágenes (JPEG, PNG, WebP)
- ✅ Soporte para PDFs
- ✅ Preview de archivos

### Fase 3: Persistencia Avanzada
- ✅ Backend opcional (Firebase/Supabase)
- ✅ Sincronización multi-dispositivo
- ✅ Backup automático

### Fase 4: Mejoras UX
- ✅ Dark mode
- ✅ Temas personalizables
- ✅ Atajos de teclado
- ✅ Búsqueda en chats

### Fase 5: Colaboración
- ✅ Compartir chats
- ✅ Export a PDF/Markdown
- ✅ Integración con Notion/Obsidian

---

## 💡 Consejos de Uso

### Para Mejores Chunks:
1. Pide respuestas estructuradas: "explica en secciones"
2. Usa preguntas claras: "¿Qué es X? ¿Cómo funciona?"
3. Especifica formato: "dame ejemplos prácticos"

### Para Mejores Diagramas:
1. Especifica el tipo: "mind map", "flowchart", "gantt"
2. Sé específico con cambios: "add a node called X"
3. Si hay error, pide: "fix the diagram syntax"

### Para Hyperfocus Mode:
1. Actívalo antes de empezar
2. Mantén el tema claro desde el inicio
3. Si necesitas cambiar, usa "New Chat"

---

## 📝 Changelog Rápido

### v0.5.0 (Actual)
- ✅ Chunks inteligentes por secciones
- ✅ Settings verdaderamente persistentes
- ✅ Botón X funcional
- ✅ Errores compactos

### v0.4.0
- ✅ Panel lateral auto-open
- ✅ Settings sidebar
- ✅ Model selector
- ✅ QuickSettings (+)

### v0.3.0
- ✅ Mermaid diagrams
- ✅ Semantic chunks (v1)
- ✅ Hyperfocus mode

### v0.2.0
- ✅ Bionic reading
- ✅ Multiple fonts
- ✅ Chat persistence

### v0.1.0
- ✅ Basic chat
- ✅ OpenRouter integration

---

## 🆘 Soporte

### Si encuentras un bug:
1. Abre la consola del navegador (F12)
2. Copia el error
3. Reporta con:
   - Qué estabas haciendo
   - Qué esperabas
   - Qué pasó en realidad
   - Screenshot si es posible

### Si algo no funciona:
1. Recarga la página (Ctrl+R)
2. Limpia localStorage: `localStorage.clear()` en consola
3. Verifica API key en `.env.local`

---

**Última actualización**: Enero 2025  
**Versión**: 0.5.0


