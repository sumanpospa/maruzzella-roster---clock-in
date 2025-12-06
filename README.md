<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1zOE0rDXNV9uqPUiDmDCCjAbv-8sV5r7P

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend (local development)

This project now includes a tiny local backend used to persist app state instead of using browser localStorage.

1. Install server dependencies:
   ```
   cd server
   npm install
   ```
2. Start the backend (defaults to port 4000):
   ```
   npm run start
   ```

If your frontend is running on a different host/port, you can set the API base URL for the frontend using an environment variable when starting Vite:

Create an `.env.local` at project root containing:

```
VITE_API_BASE=http://localhost:4000
```

Then run the frontend as before (`npm run dev`). The app will fetch/save state to the backend rather than localStorage.

## Deploy to Production

**Frontend**: Vercel (free)  
**Backend**: Railway or Render (free)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step deployment instructions.

Quick summary:
1. Push code to GitHub
2. Deploy frontend to Vercel (auto-detects Vite config)
3. Deploy backend to Railway/Render (auto-detects Procfile)
4. Set `VITE_API_BASE` env var in Vercel to your backend URL
5. Done! ✅

## ⚠️ Git Configuration Notice

If you see red × (unverified) signs next to commits on GitHub, you need to configure git with valid credentials.

**Quick Fix:**
```bash
git config --global user.name "Your GitHub Username"
git config --global user.email "your-github-email@example.com"
```

See **[GIT_SETUP.md](./GIT_SETUP.md)** for detailed instructions on fixing unverified commits.

