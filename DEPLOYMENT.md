# Deployment Guide

This guide walks you through deploying the Maruzzella Roster & Clock-In app to production.

**Architecture:**
- **Frontend**: Vite React app → **Vercel**
- **Backend**: Express Node.js server → **Railway** or **Render**
- **Data**: JSON file stored on backend

---

## Prerequisites

- GitHub account (for pushing code)
- Vercel account (free tier works)
- Railway or Render account (free tier works)
- Git installed locally

---

## 1. Prepare Your Code

### Add files to git and push to GitHub

```bash
git add .
git commit -m "Ready for deployment: backend + frontend"
git push origin main
```

Make sure these files are committed:
- ✅ `vercel.json` (frontend config)
- ✅ `Procfile` (backend config)
- ✅ `server/.env.example` (backend env vars)

---

## 2. Deploy Frontend to Vercel

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository: `maruzzella-roster-&-clock-in`
4. Vercel auto-detects it as a Vite project

### Step 2: Configure Environment Variables

In Vercel dashboard for your project:

1. Go to **Settings → Environment Variables**
2. Add:
   - **Name**: `VITE_API_BASE`
   - **Value**: `https://your-backend-url.com` (you'll set this after deploying backend)
   
   For now, use a placeholder like `https://maruzzella-backend.railway.app`

3. Click **Save**

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait ~2 minutes
3. You'll get a URL like: `https://maruzzella-roster.vercel.app`

✅ **Frontend is now live!**

---

## 3. Deploy Backend to Railway (Recommended)

### Step 1: Connect GitHub to Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `maruzzella-roster-&-clock-in` repository
4. Railway auto-detects the `Procfile` and deploys

### Step 2: Configure Environment Variables

1. In Railway dashboard, go to your project
2. Click the **"Variables"** tab
3. Add:
   - **FRONTEND_URL**: Your Vercel frontend URL (e.g., `https://maruzzella-roster.vercel.app`)
   - **PORT**: `4000` (or leave empty for Railway's default)

4. Click **"Save"**

### Step 3: Wait for Deployment

1. Railway will build and deploy automatically
2. Once done, you'll see a public URL like: `https://maruzzella-backend-prod.railway.app`

### Step 4: Update Vercel with Backend URL

1. Go back to Vercel dashboard
2. Update the `VITE_API_BASE` environment variable to your Railway backend URL
3. Redeploy (Vercel will auto-redeploy when env vars change)

✅ **Backend is now live!**

---

## 4. Deploy Backend to Render (Alternative)

If you prefer Render instead of Railway:

### Step 1: Create New Web Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository
5. Configure:
   - **Name**: `maruzzella-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node index.js`
   - **Branch**: `main`

### Step 2: Set Environment Variables

In Render dashboard:

1. Go to **Environment**
2. Add:
   - **FRONTEND_URL**: Your Vercel frontend URL
   - **PORT**: `4000`

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3 minutes)
3. Get your backend URL: `https://maruzzella-backend.onrender.com`

### Step 4: Update Vercel with Backend URL

Same as Railway (Step 4 above).

---

## 5. Test Deployment

### Frontend
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Verify you can log in and see all 10 employees
3. Check browser console for any errors

### Backend
```bash
curl https://your-backend.railway.app/api/state
# Should return: {"employees":[...], "rosters":{...}, "timeLogs":[]}
```

### End-to-End
1. Log in to the frontend
2. Add a new employee or modify a roster
3. Refresh the page — data should persist
4. Verify backend's `data.json` was updated

---

## 6. Future Updates

### Push code changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both Vercel and Railway/Render will **auto-redeploy** when you push to main.

---

## Troubleshooting

### Frontend shows 404 or won't load

- Check `VITE_API_BASE` env var in Vercel is set correctly
- Redeploy Vercel after updating env vars

### Frontend can't reach backend API

- Verify backend URL in browser console (Network tab)
- Check CORS is allowing your frontend domain
- Ensure `FRONTEND_URL` is set on backend

### Backend won't start

- Check logs in Railway/Render dashboard
- Verify `Procfile` is correct: `web: cd server && node index.js`
- Ensure `server/package.json` has all dependencies

### Data not persisting

- Backend might be using ephemeral storage (Render free tier deletes files)
- Solution: Use a persistent database (PostgreSQL) instead of `data.json`
- See "Production Upgrade" section below

---

## Production Upgrade (Optional)

For production, consider:

1. **Database**: Replace `server/data.json` with PostgreSQL
   - Railway and Render both offer free PostgreSQL
   - Update `server/index.js` to use database instead of file

2. **Authentication**: Add user login/permissions
   - Currently anyone can modify any data

3. **SSL/TLS**: Already included (HTTPS) via Vercel/Railway/Render

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
