import { useState, useEffect, useRef } from 'react';
import './App.css';

// Function to fetch AI response from Hugging Face Inference API
const getAIResponse = async (message) => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_HF_API_KEY || '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'}`,
      },
      body: JSON.stringify({
        inputs: `<s>[INST] You are a test assistant. ${message} [/INST]`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API Error:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText,
      });
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    console.log('Hugging Face API Response:', data); // Debug log
    return data[0]?.generated_text || 'Error: No response content from AI';
  } catch (error) {
    console.error('Fetch Error:', error.message);
    // Fallback mock response
    return `Mock AI Response: You said "${message}". How can I assist you further?`;
  }
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Get AI response
    const aiResponse = await getAIResponse(input);
    setMessages(prev => [...prev, { text: aiResponse, sender: aiResponse.startsWith('Error') || aiResponse.startsWith('Mock') ? 'error' : 'ai' }]);
    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>AI Chatbot</h1>
      </header>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user-message' : msg.sender === 'error' ? 'error-message' : 'ai-message'}`}
          >
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">Loading...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;