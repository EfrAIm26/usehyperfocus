# 🚀 GUÍA PARA SUBIR A GITHUB Y VERCEL

## ✅ ESTADO ACTUAL

- ✅ TypeScript: SIN ERRORES
- ✅ Build: EXITOSO
- ✅ Código: VERIFICADO
- ✅ vercel.json: CREADO

## 📋 PASO 1: INICIALIZAR GIT

```bash
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
git init
git add .
git commit -m "Initial commit: Hyperfocus AI MVP"
```

## 📋 PASO 2: CREAR REPOSITORIO EN GITHUB

1. Ve a https://github.com/new
2. Nombre: `usehyperfocus`
3. Descripción: `AI chat app for neurodivergent focus`
4. Público o Privado (tu preferencia)
5. **NO** inicialices con README (ya tenemos uno)
6. Crea el repositorio

## 📋 PASO 3: CONECTAR GITHUB LOCALMENTE

Después de crear el repo, te mostrará estos comandos (úsalos):

```bash
git remote add origin https://github.com/TU_USUARIO/usehyperfocus.git
git branch -M main
git push -u origin main
```

## 📋 PASO 4: DESPLEGAR EN VERCEL

### Opción A: CLI (Recomendado)

```bash
npm install -g vercel
vercel login
vercel
```

Sigue las preguntas interactivas.

### Opción B: Web UI

1. Ve a https://vercel.com/dashboard
2. Haz clic en "Add New..." → "Project"
3. "Import Git Repository"
4. Busca `usehyperfocus`
5. Haz clic en "Import"
6. En "Configure Project":
   - Framework: Vite (Vercel lo detectará)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - NO cambies nada más
7. Haz clic en "Deploy"

## 📋 PASO 5: AGREGAR VARIABLE DE ENTORNO EN VERCEL

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `usehyperfocus`
3. Ve a "Settings"
4. "Environment Variables"
5. Agrega:
   - **Key**: `VITE_OPENROUTER_API_KEY`
   - **Value**: Tu API key de OpenRouter
   - Selecciona: Production, Preview, Development
6. Haz clic en "Save"

## ✅ VERIFICACIÓN FINAL

Después de desplegar:

1. Vercel te dará una URL como: `https://usehyperfocus.vercel.app`
2. Abre esa URL
3. Prueba:
   - ✅ Crear un chat
   - ✅ Enviar un mensaje
   - ✅ Presionar botón "+"
   - ✅ Activar Semantic Chunks
   - ✅ Ver si aparecen colores

## 🚨 SI FALLA EN VERCEL

1. Ve a Vercel → Logs
2. Verás exactamente qué error hay
3. Si hay un error de TypeScript, falla el build
4. Si hay un error de runtime, aparecerá en los logs

## 📊 RESUMEN

| Paso | Comando | Estado |
|------|---------|--------|
| 1 | `git init && git add . && git commit -m "..."` | ⏳ Pendiente |
| 2 | Crear repo en GitHub | ⏳ Pendiente |
| 3 | `git remote add origin ...` | ⏳ Pendiente |
| 4 | `git push -u origin main` | ⏳ Pendiente |
| 5 | `vercel` o usar UI | ⏳ Pendiente |
| 6 | Agregar env vars | ⏳ Pendiente |
| 7 | Probar en URL de Vercel | ⏳ Pendiente |

---

**¿NECESITAS AYUDA CON ALGÚN PASO? AVÍSAME.**
