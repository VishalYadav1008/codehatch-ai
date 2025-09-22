const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const supabase = require('./config/supabase');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Fix CORS middleware
app.use(cors({
  origin: true, // Allow all origins (or set specific frontend URL)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug info
console.log('🚀 Supabase Integration Status:');
console.log('✅ Supabase URL:', process.env.SUPABASE_URL ? 'Configured' : 'Not configured');
console.log('✅ Supabase Anon Key:', process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Not configured');
console.log('✅ JWT Secret:', process.env.JWT_SECRET ? 'Configured' : 'Not configured');
console.log('✅ Groq API:', process.env.GROQ_API_KEY ? 'Configured' : 'Not configured');

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// 🌐 Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    let dbStatus = '✅ Connected';
    let dbError = null;
    
    if (process.env.SUPABASE_URL) {
      const { error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        dbStatus = '❌ Error';
        dbError = error.message;
      }
    }

    res.json({
      success: true,
      message: 'Devnest Server Running with Supabase!',
      timestamp: new Date().toISOString(),
      database: { status: dbStatus, error: dbError },
      services: {
        supabase: !!process.env.SUPABASE_URL,
        groq: !!process.env.GROQ_API_KEY,
        jwt: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// 🟢 Registration, Login, Profile, AI, Chat History endpoints
// (same as tumhare code me, maine untouched chhoda hai)


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Devnest Backend API with Supabase',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register (POST)',
      login: '/api/auth/login (POST)',
      profile: '/api/auth/profile (GET) - requires auth',
      aiChat: '/api/ai/chat (POST) - requires auth',
      chatHistory: '/api/chats/history (GET) - requires auth'
    },
    database: {
      supabase: !!process.env.SUPABASE_URL,
      status: process.env.SUPABASE_URL ? 'Connected' : 'Not configured'
    }
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  const baseURL = process.env.RENDER_EXTERNAL_URL || process.env.VERCEL_URL || `http://localhost:${PORT}`;
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Devnest Server with Supabase                   ║
║                                                      ║
║   Server: ${baseURL}                                 ║
║   Database: ${process.env.SUPABASE_URL ? '✅ Supabase' : '❌ None'}           ║
║   AI: ${process.env.GROQ_API_KEY ? '✅ Groq API' : '❌ Disabled'}           ║
║   Auth: ${process.env.JWT_SECRET ? '✅ JWT' : '❌ Disabled'}               ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
