const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const supabase = require('./config/supabase');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Fix CORS middleware
// ✅ CORS ko yeh banao:
app.use(cors({
  origin: ['https://devnest-ai.vercel.app', 'http://localhost:3000'],
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

// 🔵 Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user in Supabase
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          password: password, // In real app, hash this password
          name: name,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// 🔵 Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password) // In real app, use hashed password comparison
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// 🔵 Profile endpoint (protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// 🤖 AI Chat endpoint (protected)
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Save chat to Supabase
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([
        {
          user_id: req.user.userId,
          prompt: prompt,
          response: 'AI response will be implemented with Groq API',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (chatError) {
      throw chatError;
    }

    // TODO: Integrate Groq API here
    const aiResponse = "Groq API integration will be implemented soon";

    res.json({
      success: true,
      data: {
        prompt: prompt,
        response: aiResponse,
        chatId: chat.id
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI chat failed',
      error: error.message
    });
  }
});

// 📜 Chat History endpoint (protected)
app.get('/api/chats/history', authenticateToken, async (req, res) => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: { chats: chats || [] }
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

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

// ✅ Vercel ke liye export (IMPORTANT)
module.exports = app;

// ✅ Sirf local development ke liye listen karo
// ✅ YEH LAST LINES HO NI CHAHIYE
module.exports = app;

// ✅ Sirf local development ke liye
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
}