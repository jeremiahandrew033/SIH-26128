# 🚀 Livestock Sentinel - Netlify Deployment Checklist

## Pre-Deployment

### Local Development
- [ ] Clone repository locally
- [ ] Install dependencies: `npm install`
- [ ] Build frontend: `cd frontend && npm run build`
- [ ] No build errors
- [ ] Test locally: `npm run dev`
- [ ] All pages load without errors
- [ ] Login flow works
- [ ] API calls successful (with local backend running)

### Code Quality
- [ ] Run linter: `npm run lint` (no errors)
- [ ] TypeScript check: `tsc --noEmit`
- [ ] No console errors in browser
- [ ] Remove debug code/console.logs
- [ ] Sensitive data not in code (no hardcoded passwords/keys)

---

## GitHub Setup

- [ ] Create GitHub account (https://github.com)
- [ ] Create new repository: `livestock-sentinel`
- [ ] Initialize Git in project
- [ ] Add .gitignore (ignore `node_modules`, `.env.local`, `dist`, etc.)
- [ ] Commit and push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Livestock Sentinel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/livestock-sentinel.git
git push -u origin main
```

---

## Netlify Setup

### Account & Site
- [ ] Create Netlify account (https://netlify.com)
- [ ] Login to dashboard
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect GitHub account
- [ ] Select `livestock-sentinel` repository
- [ ] Authorize Netlify access

### Build Configuration
- [ ] **Build command:** `cd frontend && npm install && npm run build`
- [ ] **Publish directory:** `frontend/dist`
- [ ] **Node version:** 18.x (set in netlify.toml)
- [ ] Click "Deploy site"

### Site Settings
- [ ] Set custom domain (optional)
- [ ] Enable HTTPS (automatic)
- [ ] Set branch to deploy: `main`
- [ ] Enable branch deploys

---

## Environment Variables

### In Netlify Dashboard
**Site settings** → **Build & deploy** → **Environment**

Add these variables:
```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_APP_ENV=production
NODE_VERSION=18
```

- [ ] Variables added and saved
- [ ] Trigger rebuild after adding variables

---

## Backend API Configuration

### Option A: Local Backend (Development)
```
VITE_API_BASE_URL=http://localhost:8000
```
- [ ] Backend running locally
- [ ] CORS enabled for localhost:5173
- [ ] API endpoints responding

### Option B: Heroku Backend (Production)
```
VITE_API_BASE_URL=https://livestock-sentinel-api.herokuapp.com
```
- [ ] Heroku account created
- [ ] Backend deployed to Heroku
- [ ] CORS enabled for your Netlify domain
- [ ] Database migrations run
- [ ] Health check endpoint working

### Option C: Railway Backend (Production)
```
VITE_API_BASE_URL=https://livestock-api.up.railway.app
```
- [ ] Railway account created
- [ ] Backend deployed
- [ ] Environment variables set
- [ ] CORS configured

---

## Testing

### Functional Testing
- [ ] Homepage loads without errors
- [ ] Navigation menu works
- [ ] Login page accessible
- [ ] Login flow completes successfully
- [ ] Dashboard loads after login
- [ ] All role-specific pages render
- [ ] Forms submit successfully
- [ ] API calls return correct data
- [ ] Images and assets load
- [ ] Mobile responsive layout works

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No 404 errors in console
- [ ] No CORS errors
- [ ] API responses < 2s

---

## Production Deployment

### Final Checks
- [ ] All environment variables set in Netlify
- [ ] Frontend builds successfully: `npm run build`
- [ ] Build size acceptable (< 500KB gzipped)
- [ ] No console errors/warnings
- [ ] Test all user flows (login, create, view, edit)

### Deploy
- [ ] Push to main branch
- [ ] Monitor build in Netlify dashboard
- [ ] Verify deployment succeeded
- [ ] Test production URL
- [ ] Check all pages load
- [ ] Verify API connectivity

### Post-Deployment
- [ ] Monitor error logs
- [ ] Check Netlify analytics
- [ ] Verify uptime
- [ ] Test from multiple devices
- [ ] Monitor API response times

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Netlify dashboard
# Common issues:
- Node version mismatch → set in netlify.toml
- Missing dependencies → npm ci instead of npm install
- Build command wrong → verify in netlify.toml
```

### API Not Responding
```
✅ Check backend is running
✅ Verify VITE_API_BASE_URL environment variable
✅ Check CORS settings in backend
✅ Verify backend API endpoints exist
```

### CORS Errors
```
✅ Add Netlify domain to CORS_ORIGINS in backend
✅ Check backend CORS configuration
✅ Verify headers are set correctly
```

### Pages Not Loading
```
✅ Check redirects in netlify.toml
✅ Verify index.html in dist folder
✅ Check React Router configuration
```

---

## Monitoring & Maintenance

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor Netlify analytics
- [ ] Check API response times weekly
- [ ] Review error logs daily
- [ ] Update dependencies monthly
- [ ] Back up database regularly

---

## Rollback Plan

If deployment fails:
1. Go to Netlify dashboard
2. Click "Deploys" tab
3. Select previous successful deploy
4. Click "Publish deploy"

---

## Resources

- **Netlify Docs:** https://docs.netlify.com
- **React Router:** https://reactrouter.com/docs
- **Vite:** https://vitejs.dev
- **Node/npm:** https://nodejs.org

---

**Status: Ready for Netlify Deployment** ✅
