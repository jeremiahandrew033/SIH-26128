# Netlify Deployment Guide for Livestock Sentinel

## 🚀 Option 1: Deploy Frontend Only (Recommended for Development)

### Prerequisites
- Netlify account (free at https://netlify.com)
- GitHub account
- Git installed locally

### Step 1: Push to GitHub

```bash
cd D:\animal-2\livestock-health-platform
git init
git add .
git commit -m "Initial commit: Livestock Sentinel SIH project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/livestock-sentinel.git
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to https://netlify.com and sign in
2. Click "Add new site" → "Import an existing project"
3. Select GitHub
4. Choose your `livestock-sentinel` repository
5. Configure build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Publish directory:** `frontend/dist`
   - **Node version:** 18
6. Click "Deploy site"

### Step 3: Set Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add environment variable:
   ```
   VITE_API_BASE_URL = https://your-backend-api.com
   ```
3. Redeploy the site

### Result
- Frontend deployed at `https://your-site-name.netlify.app`
- Backend remains on your server/Docker
- All API calls route to your backend

---

## 🚀 Option 2: Full Stack on Netlify (Using Functions + External Backend)

### Setup

1. **Frontend** → Deployed on Netlify (static)
2. **API Proxy** → Netlify Functions (forwarding to backend)
3. **Backend** → Hosted separately (Heroku, Railway, AWS, etc.)

### Deploy with Netlify Functions

```bash
# Build frontend
cd frontend
npm run build

# Deploy with Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

---

## ⚙️ Option 3: Backend on Heroku (Full-Stack Hosting)

### Deploy Backend to Heroku

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create livestock-sentinel-api

# Set environment variables
heroku config:set APP_ENV=production -a livestock-sentinel-api

# Deploy from Git
git subtree push --prefix backend heroku main

# Check logs
heroku logs --tail -a livestock-sentinel-api
```

### Deploy Frontend to Netlify

Update `frontend/.env.production`:
```
VITE_API_BASE_URL=https://livestock-sentinel-api.herokuapp.com
```

Deploy via Netlify dashboard or CLI:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔒 Environment Variables for Production

### Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-backend-api.com
VITE_APP_ENV=production
```

### Backend (Heroku config)
```
APP_ENV=production
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-netlify-domain.netlify.app
```

---

## 📋 Deployment Checklist

- [ ] Frontend built successfully: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Environment variables set in Netlify
- [ ] Backend API endpoint configured
- [ ] CORS headers configured in backend
- [ ] Database migrations run
- [ ] Test login flow works
- [ ] Test API calls work
- [ ] CCTV feature (optional - requires backend)

---

## 🧪 Test Production Deployment

```bash
# Build frontend locally and test
cd frontend
npm run build
npm run preview  # Preview production build

# Test API connectivity
curl https://your-backend-api.com/health
```

---

## 📊 Netlify Deployment Benefits

✅ **Automatic HTTPS**
✅ **CDN for fast global delivery**
✅ **Auto-deploys on Git push**
✅ **Branch previews**
✅ **Serverless functions**
✅ **Atomic deployments**
✅ **Built-in analytics**

---

## 🆘 Troubleshooting

**Problem:** "CORS error when calling backend"
- **Solution:** Add backend URL to Netlify environment variables and rebuild

**Problem:** "API not found (404)"
- **Solution:** Check `VITE_API_BASE_URL` matches actual backend URL

**Problem:** "Deploy failed: npm ERR!"
- **Solution:** Clear Netlify cache → re-deploy

---

## 📞 Support

- Netlify Docs: https://docs.netlify.com
- Heroku Docs: https://devcenter.heroku.com
- React Router: https://reactrouter.com/docs
