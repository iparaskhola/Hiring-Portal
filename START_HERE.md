# Hiring Portal - Quick Start Guide

## Starting the Application

### Option 1: Using Startup Scripts (Easiest)

**Windows:**
- Double-click `start.bat` OR `start.ps1`
- Both servers will open in separate windows

### Option 2: Manual Start

**Terminal 1 - Backend Server:**
```bash
cd vite-admin/server
npm start
```

**Terminal 2 - Frontend Server:**
```bash
cd vite-admin/hirewise-admin-vite
npm run dev
```

## Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:5173/admin

## Troubleshooting

### ERR_CONNECTION_REFUSED Error
- Make sure both servers are running
- Check that backend is on port 5000
- Check that frontend is on port 5173

### Port Already in Use
- Close any previous instances
- Or use different ports in the config files

## Environment Setup

Make sure you have a `.env` file in `vite-admin/server/` with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
PORT=5000
```

---
*For production deployment, see DEPLOYMENT.md*
