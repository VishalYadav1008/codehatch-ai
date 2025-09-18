import { useState } from 'react'

const Chat = () => {
  const [messages] = useState([
    { id: 1, sender: 'John Doe', text: 'Hello there! How are you doing?', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'You', text: 'I\'m doing great! Thanks for asking.', time: '10:32 AM', isMe: true },
    { id: 3, sender: 'John Doe', text: 'That\'s good to hear. Have you finished the project?', time: '10:35 AM', isMe: false },
    { id: 4, sender: 'You', text: 'Almost done. Just putting the final touches.', time: '10:36 AM', isMe: true },
  ])

  const [inputText, setInputText] = useState('')

  const handleSend = () => {
    if (inputText.trim()) {
      // In a real app, this would send the message
      setInputText('')
    }
  }

  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Chat</h2>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Conversation with John Doe</h3>
          </div>
          
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