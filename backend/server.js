const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { Groq } = require('groq-sdk');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// ✅ Use .env variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ GROQ Client initialization
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('🚀 Supabase Status:', supabaseUrl ? 'Connected' : 'Not Configured');
console.log('🤖 GROQ AI Status:', process.env.GROQ_API_KEY ? 'Connected' : 'Not Configured');

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    res.json({
      success: true,
      message: '🚀 DevNest Backend Running!',
      database: error ? 'Connection Failed' : 'Supabase Connected',
      groq: process.env.GROQ_API_KEY ? 'ACTIVE' : 'DISABLED',
      model: 'llama3-8b-8192',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Chat endpoint with GROQ AI
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('📨 Received message:', message);

    // ✅ GROQ API call only - no manual responses
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again later.'
      });
    }

    let aiResponse;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are DevNest AI - a professional coding assistant. You specialize in:
- React, JavaScript, TypeScript, Python, CSS, HTML
- Web development and programming  
- Code debugging and optimization
- Clear explanations with code examples

Always provide clean, efficient code with professional explanations. Be helpful and concise.`
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      aiResponse = completion.choices[0]?.message?.content || "I couldn't generate a response at the moment.";
      console.log('✅ GROQ Response received');

    } catch (groqError) {
      console.error('GROQ API Error:', groqError);
      
      // Only error message, no manual responses
      return res.status(500).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again in a few moments.',
        error: 'GROQ_API_ERROR'
      });
    }

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{
          user_id: userId && userId.startsWith('anonymous') ? '00000000-0000-0000-0000-000000000000' : userId,
          prompt: message,
          response: aiResponse,
          created_at: new Date()
        }])
        .select();

      if (error) {
        console.log('Database save error:', error.message);
      } else {
        console.log('✅ Chat saved to Supabase');
      }
    } catch (dbError) {
      console.log('Database connection failed');
    }

    res.json({
      success: true,
      response: aiResponse,
      message: "AI response generated successfully"
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred. Please try again.',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 DevNest Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      chat: 'POST /api/chat'
    },
    database: 'Supabase via .env',
    ai: {
      provider: 'GROQ',
      model: 'llama3-8b-8192',
      status: process.env.GROQ_API_KEY ? 'ACTIVE' : 'DISABLED'
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🤖 GROQ AI: ${process.env.GROQ_API_KEY ? 'ACTIVE - llama3-8b-8192' : 'DISABLED'}`);
});

module.exports = app;