# Quick Start: Deploy to GitHub, Railway & Vercel

## 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `orbitalcompute` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license
4. Click "Create repository"

## 2. Push to GitHub

Run the setup script:
```bash
./setup-github.sh
```

Or manually:
```bash
git remote add origin https://github.com/YOUR_USERNAME/orbitalcompute.git
git branch -M main
git push -u origin main
```

## 3. Deploy Backend to Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `orbitalcompute` repository
5. Railway will auto-detect the backend
6. Add environment variable (optional):
   - `ALLOWED_ORIGINS`: Your Vercel domain (e.g., `https://your-app.vercel.app,http://localhost:3000`)
7. Copy your Railway URL (e.g., `https://your-app.railway.app`)

## 4. Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `orbitalcompute` repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
6. Add Environment Variables:
   - `NEXT_PUBLIC_CESIUM_ION_TOKEN`: Get from https://cesium.com/ion/
   - `NEXT_PUBLIC_API_BASE`: Your Railway URL (e.g., `https://your-app.railway.app`)
7. Click "Deploy"

## 5. Update Vercel Config

After deployment, update `vercel.json` with your Railway URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_RAILWAY_APP.railway.app/:path*"
    }
  ]
}
```

Then push the update:
```bash
git add vercel.json
git commit -m "Update Railway URL in vercel.json"
git push
```

## 6. Update Railway CORS (if needed)

If you get CORS errors, add your Vercel domain to Railway environment variables:
- Variable: `ALLOWED_ORIGINS`
- Value: `https://your-app.vercel.app,http://localhost:3000`

## That's it! 🎉

Your app should now be live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.railway.app`

Both will auto-deploy on every push to `main` branch.

