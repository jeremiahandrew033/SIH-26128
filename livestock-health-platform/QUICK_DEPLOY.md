# 🚀 Quick Start: Deploy Livestock Sentinel to Netlify

## 5-Minute Setup

### Step 1: Prepare GitHub
```bash
cd D:\animal-2\livestock-health-platform
git init
git add .
git commit -m "Livestock Sentinel - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/livestock-sentinel.git
git push -u origin main
```

### Step 2: Deploy to Netlify
1. Go to https://netlify.com → Sign up
2. Click "Add new site" → "Import an existing project"
3. Select GitHub
4. Choose `livestock-sentinel` repository
5. **Build command:** `cd frontend && npm install && npm run build`
6. **Publish directory:** `frontend/dist`
7. Click "Deploy site"

### Step 3: Set Environment Variables
1. In Netlify dashboard → **Site settings** → **Build & deploy** → **Environment**
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-api.com
   VITE_APP_ENV=production
   ```
3. Click "Deploy site" again

✅ **Done!** Your site is live at `https://your-site-name.netlify.app`

---

## Backend API Options

### Option A: Keep Backend Local (Development)
- Run: `docker compose up -d`
- Backend: `http://localhost:8000`
- CORS: Already enabled
- **Good for:** Testing before full deployment

### Option B: Deploy Backend to Heroku (Recommended)
```bash
heroku create livestock-sentinel-api
heroku config:set APP_ENV=production -a livestock-sentinel-api
git subtree push --prefix backend heroku main
```
- Backend URL: `https://livestock-sentinel-api.herokuapp.com`
- Set in Netlify: `VITE_API_BASE_URL=https://livestock-sentinel-api.herokuapp.com`

### Option C: Deploy Backend to Railway
- Sign up: https://railway.app
- Connect GitHub
- Select `backend` directory
- Deploy
- Get API URL from Railway dashboard
- Set in Netlify

---

## Files Added for Deployment

✅ `netlify.toml` — Netlify build configuration
✅ `frontend/.env.production` — Production environment variables
✅ `frontend/.env.development` — Development environment variables
✅ `netlify/functions/api.js` — API proxy (optional)
✅ `NETLIFY_DEPLOYMENT.md` — Detailed deployment guide
✅ `DEPLOYMENT_CHECKLIST.md` — Pre-launch checklist
✅ `deploy-netlify.sh` — Bash deployment script
✅ `deploy-netlify.ps1` — PowerShell deployment script

---

## Production Build Stats

```
✅ HTML:  0.65 kB (gzip: 0.41 kB)
✅ CSS:  46.25 kB (gzip: 7.74 kB)
✅ JS:   428.74 kB (gzip: 105.82 kB)
✅ Total: ~105 KB gzipped
✅ Build time: ~20 seconds
✅ Ready for production ✅
```

---

## Verify Deployment

After deploying, test:
1. Open `https://your-site-name.netlify.app`
2. Test login flow
3. Navigate all pages
4. Check browser console for errors
5. Verify API calls work

---

## Deploy Updates

Every time you push to `main` branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Netlify automatically rebuilds and deploys!

---

## Environment Variables Cheat Sheet

### Development (Local)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

### Production (Netlify)
```
VITE_API_BASE_URL=https://livestock-sentinel-api.herokuapp.com
VITE_APP_ENV=production
```

---

## Quick Links

- 📖 Full Guide: `NETLIFY_DEPLOYMENT.md`
- ✅ Checklist: `DEPLOYMENT_CHECKLIST.md`
- 🌐 Frontend: https://netlify.com
- 🐍 Backend: https://heroku.com or https://railway.app
- 📚 Docs: https://docs.netlify.com

---

**Your Livestock Sentinel is production-ready!** 🎉
