# Vercel Deployment Guide

## Prerequisites
- GitHub repository with your code
- Vercel account (free tier is fine)
- Render/Railway account for backend (or use Vercel serverless)

## Step-by-Step Deployment

### 1️⃣ Deploy Frontend to Vercel

#### Option A: Using Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `vite-admin/hirewise-admin-vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-url.com` (add after backend deployment)
6. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy frontend
cd vite-admin/hirewise-admin-vite
vercel --prod
```

### 2️⃣ Deploy Backend

#### Option A: Render.com (Recommended - Free Tier)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `hiring-portal-backend`
   - **Root Directory:** `vite-admin/server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` or `node server.js`
   - **Plan:** Free
5. Add Environment Variables (from your `.env` file):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `PORT` = `5000`
   - Any other env variables
6. Click "Create Web Service"
7. Wait for deployment (you'll get a URL like `https://hiring-portal-backend.onrender.com`)

#### Option B: Railway.app
1. Go to [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables
5. Deploy

### 3️⃣ Connect Frontend to Backend

1. Copy your backend URL (from Render/Railway)
2. Go to Vercel project → Settings → Environment Variables
3. Add/Update:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend-url.onrender.com`
4. Go to Deployments → Click "..." → Redeploy

### 4️⃣ Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try registering a user
3. Check if backend API calls work

## 🔧 Quick Commands

### Deploy Frontend Only
```bash
cd vite-admin/hirewise-admin-vite
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

## 🐛 Troubleshooting

### "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- Backend not deployed yet
- Wrong `VITE_API_BASE_URL` environment variable
- Backend not running on correct port

### "404 Not Found" on refresh
- Already fixed in `vercel.json` with rewrites

### CORS Errors
- Add your Vercel frontend URL to backend CORS configuration
- Check `server.js` for CORS settings

## 📝 Important Notes

- **Frontend:** Deployed to Vercel (serverless)
- **Backend:** Deploy to Render/Railway (needs persistent server)
- **Database:** Supabase (already cloud-hosted)
- **Environment Variables:** Must be set in both Vercel and Render/Railway

## 🌐 Expected URLs After Deployment

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com` or `https://your-backend.railway.app`
- **Admin:** `https://your-app.vercel.app/admin`

---

**Need help?** Check the Vercel and Render documentation or ask for assistance!
