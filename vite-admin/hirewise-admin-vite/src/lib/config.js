// Centralized API base URL for frontend -> backend requests
// Set VITE_API_BASE_URL in Vercel/Env for production backend URL (e.g., https://your-api.onrender.com)
// For production, you MUST deploy the backend server and set VITE_API_BASE_URL environment variable
export const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
