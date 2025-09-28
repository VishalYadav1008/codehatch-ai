const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

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

console.log('🚀 Supabase Status:', supabaseUrl ? 'Connected' : 'Not Configured');

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    res.json({
      success: true,
      message: '🚀 DevNest Backend Running!',
      database: error ? 'Connection Failed' : 'Supabase Connected',
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

// Chat endpoint
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

    // AI Response
    const aiResponse = generateAIResponse(message);

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([{
          user_id: userId || 'anonymous',
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
      message: 'Chat failed',
      error: error.message
    });
  }
});

// AI Response Generator
function generateAIResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('react') || lowerMessage.includes('component')) {
    return `**React Component Created!** 🚀\n\n\`\`\`jsx
import React from 'react';

function ${getComponentName(message)}() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome to React!
      </h1>
      <p className="text-gray-600 mt-2">
        Start building amazing components!
      </p>
    </div>
  );
}

export default ${getComponentName(message)};
\`\`\``;
  }
  else if (lowerMessage.includes('css') || lowerMessage.includes('style')) {
    return `**CSS Solution** 🎨\n\n\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
\`\`\``;
  }
  else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
    return `**JavaScript Code** ⚡\n\n\`\`\`javascript
// Modern JavaScript
const ${getFunctionName(message)} = () => {
  console.log('Hello JavaScript!');
  
  // Async example
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return 'Code executed successfully!';
};

${getFunctionName(message)}();
\`\`\``;
  }
  else if (lowerMessage.includes('html')) {
    return `**HTML Template** 📄\n\n\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevNest Template</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">🚀 Welcome!</h1>
        <p class="text-gray-600">Your HTML template is ready.</p>
    </div>
</body>
</html>
\`\`\``;
  }
  else {
    return `**Hello! I'm DevNest AI** 🤖\n\nI can help you with:\n\n• **React Components** - "Create a login form"\n• **CSS Styling** - "Center a div with CSS"\n• **JavaScript** - "Write API call code"\n• **HTML Templates** - "Create landing page"\n\nWhat would you like to build today? 💡`;
  }
}

function getComponentName(message) {
  const match = message.match(/create.*component.*for\s+(\w+)/i) || 
                message.match(/component.*for\s+(\w+)/i);
  return match ? match[1] + 'Component' : 'MyComponent';
}

function getFunctionName(message) {
  const match = message.match(/function.*for\s+(\w+)/i) || 
                message.match(/create.*function.*(\w+)/i);
  return match ? match[1] : 'myFunction';
}

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
    database: 'Supabase via .env'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;