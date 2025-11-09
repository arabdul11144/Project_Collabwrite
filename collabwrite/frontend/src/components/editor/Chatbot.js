import React, { useState, useRef, useEffect } from 'react';
  import './Chatbot.css';
  
  const Chatbot = () => {
    const [messages, setMessages] = useState(() => {
      const saved = localStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [
        {
          id: 1,
          text: "Hello! I'm your AI assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ];
    });
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('medium');
    const [showSettings, setShowSettings] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [toast, setToast] = useState(null);
  
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const maxCharacters = 500;
  
    
  
    // Quick action prompts
    const quickActions = [
      "Generate-content",
      "Create a summary",
      "Generate ideas",
      "Check grammar",
    ];
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
  
    useEffect(() => {
      scrollToBottom();
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);
  
    useEffect(() => {
      inputRef.current?.focus();
    }, []);
  
    // Show toast notification
    const showToast = (message) => {
      setToast(message);
      setTimeout(() => setToast(null), 3000);
    };
  
    // Copy message to clipboard
    const copyMessage = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Message copied to clipboard!");
      } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast("Failed to copy message");
      }
    };
  
    const simulateAIResponse = (userMessage) => {
      const responses = [
        "That's an interesting question! Let me think about that...",
        "I understand what you're asking. Here's what I think:",
        "Great point! Based on what you've said, I would suggest:",
        "I can help you with that. Here are some thoughts:",
        "That's a complex topic. Let me break it down for you:",
        "I see what you mean. From my perspective:",
        "Thanks for sharing that with me. My response would be:",
        "I appreciate your question. Here's my analysis:"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Add more detailed responses based on keywords
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('email')) {
        return "I'd be happy to help you write an email! Please provide me with the purpose, recipient, and key points you'd like to include, and I'll help you craft a professional message.";
      } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
        return "I'll explain that concept clearly for you. " + randomResponse + " This is a simulated AI response that would provide detailed explanations in a real implementation.";
      } else if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
        return "I can help create a summary! Please share the content you'd like me to summarize, and I'll provide you with key points and main ideas in a concise format.";
      }
      
      return randomResponse + " This is a simulated AI response for demonstration purposes.";
    };
  
  const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  if (inputMessage.length > maxCharacters) return;

  const newMessage = {
    id: Date.now(),
    text: inputMessage.trim(),
    sender: 'user',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, newMessage]);
  setInputMessage('');
  setIsTyping(true);

  // Hide quick actions after first message
  if (messages.length <= 1) {
    setShowQuickActions(false);
  }

  try {
    // 🔗 Send user input to your FastAPI backend
    const response = await fetch("http://127.0.0.1:8000/api/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage.text }),
    });

    
    const data = await response.json();

    // 💬 Add AI response to chat
    const botResponse = {
      id: Date.now() + 1,
      text: data.response || "⚠️ No response from AI",
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botResponse]);
  } catch (error) {
    console.error("Error fetching AI response:", error);
    const errorResponse = {
      id: Date.now() + 2,
      text: "⚠️ Unable to connect to AI service. Please check your backend.",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorResponse]);
  } finally {
    setIsTyping(false);
  }
};

    const handleQuickAction = (action) => {
      setInputMessage(action);
      inputRef.current?.focus();
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };
  
    // Auto-resize textarea
    const handleInputChange = (e) => {
      const value = e.target.value;
      if (value.length <= maxCharacters) {
        setInputMessage(value);
        
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
      }
    };
  
    const clearChat = () => {
      setMessages([{
        id: 1,
        text: "Chat cleared! How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
      localStorage.removeItem("chatMessages");
      setShowQuickActions(true);
      showToast("Chat history cleared!");
    };
  
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
  
    const toggleTheme = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme} theme`);
    };
  
    // Calculate remaining characters
    const remainingChars = maxCharacters - inputMessage.length;
    const showCharCounter = inputMessage.length > maxCharacters * 0.8;
  
    return (
      <div className={`chatbot-container ${theme}`}>
        {/* Toast Notification */}
        {toast && (
          <div className="toast">
            {toast}
          </div>
        )}
  
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="avatar" role="img" aria-label="AI Bot">🤖</div>
            <div className="header-info">
              <h1>AI Writing Assistant</h1>
              <p>💡 Think. Write. Refine</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={clearChat} className="icon-button" title="Clear chat">🔄</button>
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)} 
              className="icon-button" 
              title="Quick Actions"
            >
              ⚡
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="icon-button" 
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
  
        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-panel">
            <div className="setting-item">
              <label>Theme:</label>
              <button onClick={toggleTheme} className="theme-button">
                {theme === 'light' ? '🌙 Dark' : '🌞 Light'}
              </button>
            </div>
            <div className="setting-item">
              <label>Font Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="font-size-select"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
  
          </div>
        )}
  
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="quick-actions">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="quick-action"
              >
                {action}
              </button>
            ))}
          </div>
        )}
  
        {/* Messages */}
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-avatar">
                {message.sender === 'bot' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${fontSize}`}>
                  {message.text}
                  <button 
                    className="copy-button"
                    onClick={() => copyMessage(message.text)}
                    title="Copy message"
                  >
                    📋
                  </button>
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
  
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="message-bubble typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
  
        {/* Input Area */}
        <div className="input-area">
        <div style={{ flex: 1, position: 'relative' }}>
        <textarea
         ref={inputRef}
         value={inputMessage}
         onChange={handleInputChange}
         onKeyPress={handleKeyPress}
         placeholder="Type your message here..."
         rows={1}
         className={`message-input ${fontSize}`}
         maxLength={maxCharacters}
       />
       {/* Always show character counter */}
       <div className={`char-counter ${remainingChars < maxCharacters * 0.2 ? 'warning' : ''}`}>
       {remainingChars} characters remaining
       </div>
       </div>
       <button
        onClick={handleSendMessage}
        disabled={!inputMessage.trim() || isTyping || inputMessage.length > maxCharacters}
    className="send-button"
    title="Send message"
  >
    <svg xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
    </svg>
  </button>
</div>

      </div>
    );
  };
  
  export default Chatbot;

