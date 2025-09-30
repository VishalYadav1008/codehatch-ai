// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { Groq } = require('groq-sdk');

// Load environment variables
dotenv.config();

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// ✅ Supabase Config
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ GROQ Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Status logs
console.log('🚀 Supabase:', supabaseUrl ? 'Connected' : 'Not Configured');
console.log('🤖 GROQ AI:', process.env.GROQ_API_KEY ? 'Connected' : 'Not Configured');

// ✅ Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 DevNest Backend Running!',
    database: supabaseUrl ? 'Supabase Connected' : 'Not Connected',
    ai: {
      provider: 'GROQ',
      model: 'llama-3.1-8b-instant',
      status: process.env.GROQ_API_KEY ? 'ACTIVE' : 'DISABLED'
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    console.log('📨 User Message:', message);

    // ✅ GROQ AI Response
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service unavailable. Please try again later.'
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are DevNest AI - a professional coding assistant. You specialize in:
- React, JavaScript, TypeScript, Python, CSS, HTML
- Web development, debugging, optimization
- Clear explanations with clean code examples`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",  // ✅ Best Groq Model
      temperature: 0.7,
      max_tokens: 1024
    });

    const aiResponse = completion.choices[0]?.message?.content || "⚠️ No response generated.";
    console.log('✅ AI Response Ready');

    // ✅ Save Chat in Supabase
    try {
      const { error } = await supabase
        .from('chats')
        .insert([{
          user_id: userId && userId.startsWith('anonymous') ? '00000000-0000-0000-0000-000000000000' : userId,
          prompt: message,
          response: aiResponse,
          created_at: new Date()
        }]);

      if (error) console.log('❌ DB Save Error:', error.message);
      else console.log('✅ Chat Saved in Supabase');
    } catch (dbError) {
      console.log('❌ Supabase Insert Failed:', dbError.message);
    }

    return res.json({
      success: true,
      response: aiResponse,
      message: "AI response generated successfully"
    });

  } catch (error) {
    console.error('❌ Chat Endpoint Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unexpected server error.',
      error: error.message
    });
  }
});

// ✅ Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 DevNest Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      chat: 'POST /api/chat'
    },
    database: 'Supabase Configured via .env',
    ai: {
      provider: 'GROQ',
      model: 'llama-3.1-8b-instant',
      status: process.env.GROQ_API_KEY ? 'ACTIVE' : 'DISABLED'
    }
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});
