# 🚀 Hyperfocus AI - Deployment Guide

## ✅ Local Testing Completed

La aplicación ya está corriendo localmente en: **http://localhost:5173/**

## 📋 Requirements Before Deploying to Vercel

### 1. Environment Variables in Supabase
Ensure you have the following configured in your Supabase project:

- **Project URL:** `https://wbxgiacprflxhwjeovkt.supabase.co`
- **Anon Key:** (your key from Supabase dashboard)

### 2. Google OAuth Configuration

#### A. In Google Cloud Console:
1. Go to: https://console.developers.google.com/
2. Enable **Google Sign-In API**
3. Create OAuth 2.0 credentials
4. Add **Authorized redirect URIs**:
   - `http://localhost:5173` (for local development)
   - `https://YOUR-VERCEL-URL.vercel.app` (for production)
   - `https://wbxgiacprflxhwjeovkt.supabase.co/auth/v1/callback` (for Supabase)

#### B. In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Save changes

### 3. Environment Variables for Vercel

You'll need to add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://wbxgiacprflxhwjeovkt.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🚀 Deployment Steps to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI (if not installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Add environment variables:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_OPENROUTER_API_KEY
   ```

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard (Manual)

1. Go to: https://vercel.com/dashboard

2. Click **"Add New"** → **"Project"**

3. Import your GitHub repository

4. Configure Build Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`

6. Click **"Deploy"**

7. Once deployed, update Google OAuth redirect URIs with your Vercel URL

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] Login page appears with modern gradient design
- [ ] "Sign in with Google" button works
- [ ] After login, main app interface appears
- [ ] User profile shows at bottom of sidebar
- [ ] Sign out button works
- [ ] Chat functionality works normally
- [ ] All features (Hyperfocus, Diagrams, Semantic Chunking) work

---

## 🐛 Troubleshooting

### Problem: "Sign in with Google" button doesn't work
**Solution:** Check that Google OAuth redirect URIs include your Vercel URL

### Problem: White screen after deployment
**Solution:** Check browser console for errors. Verify environment variables are set correctly in Vercel

### Problem: "Missing Supabase environment variables"
**Solution:** Make sure all env variables start with `VITE_` and are set in Vercel dashboard

---

## 📝 Local Development Setup

If you need to set up locally again:

1. Create `.env.local` file:
   ```
   VITE_SUPABASE_URL=https://wbxgiacprflxhwjeovkt.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key_here
   VITE_OPENROUTER_API_KEY=your_key_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

---

## 🎉 Success!

Your Hyperfocus AI app is now deployed with:
- ✅ Google OAuth authentication
- ✅ Modern, luminous login page
- ✅ User profile in sidebar
- ✅ Sign out functionality
- ✅ All original features working

**Made with ❤️ for neurodivergent minds**

