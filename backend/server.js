const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const supabase = require('./config/supabase');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    let dbStatus = '✅ Connected';
    let dbError = null;
    
    if (process.env.SUPABASE_URL) {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        dbStatus = '❌ Error';
        dbError = error.message;
      }
    }

    res.json({
      success: true,
      message: 'Devnest Server Running with Supabase!',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        error: dbError
      },
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

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, display_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user in Supabase
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          display_name: display_name || '',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
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

// User Login
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
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        last_login: user.last_login
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

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
        last_login: user.last_login
      }
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

// AI Chat endpoint with Supabase logging
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log("📨 AI Message from user:", req.user.email, "-", message);
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        success: true,
        response: `You asked: "${message}". ❌ Groq API key not configured.`,
        mode: 'not-configured'
      });
    }

    // Groq API call
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for Devnest project. Provide clear, concise and friendly answers."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      throw new Error(errorData.error?.message || `Groq API error: ${groqResponse.status}`);
    }

    const data = await groqResponse.json();
    const aiResponse = data.choices[0].message.content;

    // Save chat to Supabase
    try {
      const { error: chatError } = await supabase
        .from('chats')
        .insert([
          {
            user_id: req.user.id,
            user_message: message,
            ai_response: aiResponse,
            model_used: data.model,
            tokens_used: data.usage.total_tokens,
            created_at: new Date().toISOString()
          }
        ]);

      if (chatError) {
        console.warn('⚠️ Failed to save chat:', chatError.message);
      }
    } catch (dbError) {
      console.warn('⚠️ Chat logging failed:', dbError.message);
    }

    res.json({
      success: true,
      response: aiResponse,
      model: data.model,
      tokens: data.usage.total_tokens,
      provider: 'Groq'
    });

  } catch (error) {
    console.error('❌ AI Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error processing AI request',
      error: error.message
    });
  }
});

// Get Chat History
app.get('/api/chats/history', authenticateToken, async (req, res) => {
  try {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      chats: chats || [],
      count: chats ? chats.length : 0
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

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🚀 Devnest Server with Supabase                   ║
║                                                      ║
║   Server: http://localhost:${PORT}                       ║
║   Database: ${process.env.SUPABASE_URL ? '✅ Supabase' : '❌ None'}           ║
║   AI: ${process.env.GROQ_API_KEY ? '✅ Groq API' : '❌ Disabled'}           ║
║   Auth: ${process.env.JWT_SECRET ? '✅ JWT' : '❌ Disabled'}               ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;