# 🚀 Guía de Deployment - Hyperfocus AI

## ✅ PRE-REQUISITOS

1. **Cuenta de Vercel**: https://vercel.com/signup
2. **Cuenta de GitHub**: Repositorio creado
3. **Variables de entorno configuradas en Vercel**

---

## 📋 PASOS PARA DEPLOYMENT

### 1. **Verificar que todo funcione localmente**

```bash
# Instalar dependencias
npm install

# Construir el proyecto (test build)
npm run build

# Previsualizar build localmente
npm run preview
```

Si todo funciona sin errores, proceder al siguiente paso.

---

### 2. **Subir código a GitHub**

```bash
# Inicializar git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: add Supabase integration and fix storage persistence"

# Agregar remote (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU_USUARIO/usehyperfocus.git

# Push al repositorio
git push -u origin main
```

---

### 3. **Configurar Variables de Entorno en Vercel**

**Ve a:** https://vercel.com/dashboard → Tu Proyecto → Settings → Environment Variables

Agrega las siguientes variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_OPENROUTER_API_KEY` | `sk-or-v1-5988757a752de52f425921cad4a2618735798c87c38cf8a3aedfb3ff4611e92` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://wbxgiacprflxhwjeovkt.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2eGdpYWNwcmZseGh3amVvdmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzkyMTksImV4cCI6MjA1MjYxNTIxOX0.6TH1c9sZSI6ImFub24iLCJpYXQiOjE3M3cwMzkyMTksImV4cCI6MjA1MjYxNTIxOX0.SETHvTCZuZ_JYNVn8WeBFtBhHF1qAdzR1EsIGMHZU` | Production, Preview, Development |

---

### 4. **Deployment en Vercel**

#### Opción A: Desde la Web de Vercel (RECOMENDADO)

1. Ve a https://vercel.com/dashboard
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite
5. Verifica que la configuración sea:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click en **"Deploy"**

#### Opción B: Desde la Terminal con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login a Vercel
vercel login

# Deployment
vercel

# Para producción
vercel --prod
```

---

### 5. **Configurar Dominio en Google OAuth**

Después del deployment, Vercel te dará una URL como:
```
https://usehyperfocus-5dzyc4c57-erodriguezro-upedupes-projects.vercel.app
```

**Ve a Google Cloud Console:**
1. https://console.cloud.google.com/auth/branding?project=hyperfocus-ai-production
2. **Desarrollo de la marca** → **Información de marca**
3. En **Dominios autorizados**, agrega:
   - `usehyperfocus-5dzyc4c57-erodriguezro-upedupes-projects.vercel.app`
   - `wbxgiacprflxhwjeovkt.supabase.co` (ya está)
4. Guarda los cambios

**Configura los URIs de redirección:**
1. **Clientes** → Tu cliente OAuth
2. En **Orígenes de JavaScript autorizados**, agrega:
   ```
   https://usehyperfocus-5dzyc4c57-erodriguezro-upedupes-projects.vercel.app
   ```
3. En **URIs de redireccionamiento autorizados**, agrega:
   ```
   https://usehyperfocus-5dzyc4c57-erodriguezro-upedupes-projects.vercel.app
   https://wbxgiacprflxhwjeovkt.supabase.co/auth/v1/callback
   ```
4. Guarda los cambios

---

### 6. **Verificar Deployment**

1. Abre la URL de Vercel
2. Inicia sesión con Google
3. Crea un chat
4. Envía un mensaje
5. **Cierra sesión y vuelve a entrar**
6. Verifica que los chats y mensajes se hayan guardado

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch"
- Verifica que las variables de entorno estén correctamente configuradas en Vercel
- Asegúrate de que las URLs no tengan espacios ni caracteres extraños

### Error: OAuth redirect_uri_mismatch
- Verifica que el dominio de Vercel esté agregado en Google Cloud Console
- Asegúrate de que coincidan exactamente (sin trailing slash)

### Error: "User not authenticated"
- Verifica que Supabase tenga el dominio de Vercel en los dominios autorizados
- Ve a Supabase → Authentication → URL Configuration

---

## 📝 NOTAS IMPORTANTES

- **NO COMMITEES** el archivo `.env.local` a GitHub (ya está en `.gitignore`)
- Las variables de entorno se configuran en Vercel, NO en el código
- Cada vez que actualices el código, haz `git push` y Vercel redesplegará automáticamente

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Build local (test)
npm run build

# Preview local
npm run preview

# Push a GitHub (auto-deploy a Vercel)
git add .
git commit -m "tu mensaje"
git push

# Deployment manual con Vercel CLI
vercel --prod
```

---

¡LISTO! 🎉 Tu app estará disponible en la URL de Vercel.


