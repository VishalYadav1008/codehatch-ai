import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = "https://devnest-ai.onrender.com"

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const chatEndRef = useRef(null)

  const token = localStorage.getItem('token') // JWT token

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text) return

    const newMessage = {
      id: Date.now(),
      sender: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }

    setMessages((prev) => [...prev, newMessage])
    setInputText('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      })

      const data = await response.json()

      if (response.ok && data.reply) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'AI',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        }
        setMessages((prev) => [...prev, aiMessage])
      } else {
        console.error('AI chat error:', data.message)
      }
    } catch (error) {
      console.error('AI chat request failed:', error)
    }
  }

  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-semibold">Chat with AI</h2>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                  {!message.isMe && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                      {message.sender.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${message.isMe ? 'bg-primary text-white' : 'bg-white border'}`}>
                    {!message.isMe && <p className="font-semibold text-sm">{message.sender}</p>}
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isMe ? 'text-blue-100' : 'text-gray-500'}`}>{message.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="p-4 border-t flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-primary text-white px-4 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Chat
