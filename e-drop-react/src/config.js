// API Configuration
const isDevelopment = import.meta.env.DEV;

// Replace this with your Render backend URL
const PRODUCTION_API_URL = "https://your-render-backend-url.onrender.com"; 
const DEVELOPMENT_API_URL = "http://localhost:5000";

export const API_BASE_URL = isDevelopment 
  ? DEVELOPMENT_API_URL 
  : PRODUCTION_API_URL;
