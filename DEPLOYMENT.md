# 🚀 Deployment Guide - Hyperfocus AI

## ✅ Build Status: SUCCESS

The project builds successfully with no errors!

---

## 📦 What's Ready

✅ **Production Build**: Optimized and minified  
✅ **TypeScript**: No type errors  
✅ **Linter**: No linting errors  
✅ **Assets**: Logo and static files ready  
✅ **Dependencies**: All installed and working  

---

## 🖥️ Local Development

### Start Development Server
```bash
npm run dev
```
- Opens at `http://localhost:5173`
- Hot module reloading enabled
- Fast refresh for instant updates

### Build for Production
```bash
npm run build
```
- Output: `dist/` folder
- Optimized and minified
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Test production build locally
- Opens at `http://localhost:4173`

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero configuration
- Automatic SSL
- Global CDN
- Perfect for Vite apps

**Steps:**
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable:
   - `VITE_OPENROUTER_API_KEY` = your key
4. Deploy!

**Build Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Option 2: Netlify

**Steps:**
1. Push code to GitHub
2. Import project on [netlify.com](https://netlify.com)
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - `VITE_OPENROUTER_API_KEY` = your key
5. Deploy!

### Option 3: GitHub Pages

**Steps:**
1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/usehyperfocus",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/usehyperfocus/',
     plugins: [react()],
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Self-Hosted (VPS/Server)

**Requirements:**
- Node.js 18+
- Nginx or Apache (optional)

**Steps:**
1. Build the project:
   ```bash
   npm run build
   ```

2. Upload `dist/` folder to your server

3. Nginx config example:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     root /path/to/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

4. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Option 5: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

**Build and run:**
```bash
docker build -t hyperfocus-ai .
docker run -p 80:80 hyperfocus-ai
```

---

## 🔐 Environment Variables

### Required
```
VITE_OPENROUTER_API_KEY=your_api_key_here
```

### Setting Up

**Local (.env.local):**
```bash
# Already configured in your project
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

**Production:**
- **Vercel**: Dashboard → Settings → Environment Variables
- **Netlify**: Site settings → Environment → Environment variables
- **GitHub Pages**: Not recommended (exposes API key)
- **VPS**: Use environment variables or secrets manager

⚠️ **Security Note**: 
- Never commit `.env.local` to git
- For production, consider using a backend proxy to hide API keys
- Current setup exposes API key in client-side code (OK for MVP)

---

## 📊 Build Output

### Production Build Stats
- **Total Size**: ~886 KB (main bundle)
- **Gzipped**: ~260 KB
- **Largest Dependencies**:
  - Mermaid.js: ~500 KB (includes all diagram types)
  - React: ~40 KB
  - React Markdown: ~50 KB

### Performance Tips
1. **Code Splitting**: Consider lazy loading diagram types
2. **CDN**: Use Vercel/Netlify CDN for global performance
3. **Caching**: Configure proper cache headers
4. **Compression**: Enable Brotli compression

---

## 🧪 Pre-Deployment Checklist

- [ ] `npm run build` succeeds
- [ ] `npm run preview` works correctly
- [ ] All features tested in production build
- [ ] Environment variables configured
- [ ] Logo and assets loading correctly
- [ ] API calls working
- [ ] localStorage persisting data
- [ ] Diagrams rendering properly
- [ ] Hyperfocus mode working
- [ ] Settings panel functional
- [ ] Responsive on mobile/tablet/desktop

---

## 🐛 Common Deployment Issues

### Issue: API Key Not Working
**Solution**: 
- Check environment variable name: `VITE_OPENROUTER_API_KEY`
- Must start with `VITE_` for Vite to expose it
- Restart dev server after adding

### Issue: 404 on Refresh
**Solution**: 
- Configure server for SPA routing
- Nginx: `try_files $uri $uri/ /index.html;`
- Netlify: Add `_redirects` file with `/* /index.html 200`

### Issue: Blank Page After Deploy
**Solution**:
- Check browser console for errors
- Verify base URL in `vite.config.ts`
- Check network tab for failed asset loads
- Ensure environment variables are set

### Issue: Diagrams Not Rendering
**Solution**:
- Check CSP (Content Security Policy) headers
- Mermaid needs `unsafe-eval` for some features
- Try different diagram syntax

### Issue: Large Bundle Size
**Solution**:
- Mermaid is large (~500KB) but necessary
- Consider dynamic imports for diagram types
- Enable compression (Gzip/Brotli)
- Use CDN for caching

---

## 📈 Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Built-in, free
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking
- **LogRocket**: Session replay

### Adding Analytics
```typescript
// src/main.tsx
import ReactGA from 'react-ga4';

ReactGA.initialize('YOUR_GA_ID');
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

---

## 🔄 Update Process

### Minor Updates
1. Make changes locally
2. Test: `npm run dev`
3. Build: `npm run build`
4. Deploy: Push to git (auto-deploys on Vercel/Netlify)

### Major Updates
1. Create feature branch
2. Test thoroughly
3. Build and preview
4. Merge to main
5. Deploy

---

## 🎯 Post-Deployment

### Test These Features
1. **New Chat Creation**: Click "New Chat" button
2. **Send Messages**: Type and send messages
3. **Hyperfocus Alert**: Change topics to trigger alert
4. **Diagram Generation**: Request various diagram types
5. **Settings**: Change font styles and hyperfocus settings
6. **Persistence**: Refresh page, data should persist
7. **Mobile**: Test on mobile devices

### Share Your App
- URL: Your deployment URL
- Share on social media
- Get feedback from users
- Iterate based on feedback

---

## 📞 Support

### Resources
- [Vite Deployment Docs](https://vite.dev/guide/static-deploy.html)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Troubleshooting
1. Check browser console
2. Check network tab
3. Check deployment logs
4. Verify environment variables
5. Test in production mode locally first

---

## 🎉 You're Ready to Deploy!

Your Hyperfocus AI MVP is production-ready. Choose your deployment platform and go live!

**Recommended Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add API key
4. Deploy!

Total time: ~5 minutes

---

Built with ❤️ for neurodivergent learners


