import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Chat = ({ roomId, user, socket: externalSocket }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '🤔'];

  // Safe function to get user initials
  const getUserInitials = (username) => {
    if (!username || typeof username !== 'string') {
      return 'U';
    }
    return username.slice(0, 2).toUpperCase();
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.IO connection and event handlers
  useEffect(() => {
    if (!user || typeof user !== 'string') {
      console.error('User is required for chat connection');
      setConnectionStatus('User not defined');
      return;
    }

    // Use external socket if provided, otherwise create new connection
    if (externalSocket) {
      socketRef.current = externalSocket;
      setIsOnline(externalSocket.connected);
    } else {
      socketRef.current = io('http://localhost:4000', {
        transports: ['websocket']
      });
    }

    const socket = socketRef.current;

    // Connection events
    const handleConnect = () => {
      console.log('Chat connected to server');
      setIsOnline(true);
      setConnectionStatus('Connected');
      
      // Join the chat room
      socket.emit('join-room', { 
        roomId, 
        user: { 
          name: user,
          photo: `https://via.placeholder.com/30?text=${getUserInitials(user)}`
        }
      });
    };

    const handleDisconnect = () => {
      console.log('Chat disconnected from server');
      setIsOnline(false);
      setConnectionStatus('Disconnected');
    };

    const handleConnectError = (error) => {
      console.error('Chat connection error:', error);
      setConnectionStatus('Connection Error');
    };

    // Room events
    const handleRoomData = (data) => {
      console.log('Received room data:', data);
      if (data && data.users) {
        setUsers(data.users);
      }
      if (data && data.messages) {
        setMessages(data.messages);
      }
    };

    const handleUserJoined = (data) => {
      console.log('User joined:', data?.user?.name);
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data?.user?.name);
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    const handleUsersUpdated = (data) => {
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    // Message events
    const handleNewMessage = (message) => {
      console.log('New message:', message);
      if (message) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleMessageDelivered = (data) => {
      if (data && data.messageId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }
    };

    // Typing events
    const handleUserTyping = (data) => {
      if (data && data.user) {
        if (data.typing) {
          setTypingUsers(prev => {
            if (!prev.includes(data.user)) {
              return [...prev, data.user];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u !== data.user));
        }
      }
    };

    // Set up event listeners
    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room-data', handleRoomData);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('users-updated', handleUsersUpdated);
    socket.on('new-message', handleNewMessage);
    socket.on('message-delivered', handleMessageDelivered);
    socket.on('user-typing', handleUserTyping);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room-data', handleRoomData);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('users-updated', handleUsersUpdated);
      socket.off('new-message', handleNewMessage);
      socket.off('message-delivered', handleMessageDelivered);
      socket.off('user-typing', handleUserTyping);
      
      // Only disconnect if we created the socket (not using external socket)
      if (!externalSocket && socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, externalSocket]);

  // Handle typing indicator
  const handleTyping = (value) => {
    setMessageInput(value);
    
    if (!socketRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      socketRef.current.emit('typing-start', { roomId });
      
      // Stop typing indicator after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing-stop', { roomId });
      }, 2000);
    } else {
      socketRef.current.emit('typing-stop', { roomId });
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && socketRef.current && isOnline) {
      // Send message to server
      socketRef.current.emit('send-message', {
        message: messageInput.trim(),
        roomId
      });
      
      setMessageInput('');
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit('typing-stop', { roomId });
    }
  };

  const getAvatar = (username) => {
    const foundUser = users.find((u) => u.name === username);
    return foundUser?.photo || `https://via.placeholder.com/30?text=${getUserInitials(username)}`;
  };

  const getFormattedDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date();
    return `${days[date.getDay()]}, ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;
  };

  const addEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatus = (status) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'delivered':
        return '✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  const isCurrentUser = (messageUser) => {
    return messageUser === user;
  };

  // Early return if user is not defined
  if (!user || typeof user !== 'string') {
    return (
      <div style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        color: '#dc2626'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
          <div>User not defined</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Please provide a valid username
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100%', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#ffffff'
    }}>
      {/* Header with online users and connection status */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: isOnline ? '#f8f9fa' : '#fee2e2', 
        borderBottom: '1px solid #e1e5e9', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {users.filter(u => u.online).slice(0, 5).map((u) => (
            <img
              key={u.id}
              src={u.photo}
              alt={`${u.name}'s avatar`}
              style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                marginRight: '6px', 
                marginBottom: '2px',
                border: '2px solid #22c55e',
                cursor: 'pointer'
              }}
              title={`${u.name} - Online`}
            />
          ))}
          {users.filter(u => u.online).length > 5 && (
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
              +{users.filter(u => u.online).length - 5} more
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: isOnline ? '#6b7280' : '#dc2626' }}>
          {isOnline ? `${users.filter(u => u.online).length} online` : connectionStatus}
        </div>
      </div>

      {/* Chat title */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e1e5e9', 
        textAlign: 'center' 
      }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '16px' }}>
          💬 Document Chat
        </h3>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {getFormattedDate()}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
          Room: {roomId?.slice(-8)}
        </div>
      </div>

      {/* Messages area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af', 
            fontSize: '14px', 
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px dashed #d1d5db'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💭</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {isOnline ? 'Start the conversation!' : 'Connecting to chat...'}
            </div>
            <div style={{ fontSize: '12px' }}>
              Chat with others editing this document
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '16px',
                flexDirection: msg.type === 'system' ? 'column' : (isCurrentUser(msg.user) ? 'row-reverse' : 'row'),
              }}
            >
              {msg.type === 'system' ? (
                <div style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#9ca3af',
                  fontStyle: 'italic',
                  padding: '8px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  width: '100%',
                  border: '1px solid #f3f4f6'
                }}>
                  {msg.message}
                </div>
              ) : (
                <>
                  <img
                    src={getAvatar(msg.user)}
                    alt={`${msg.user}'s avatar`}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      margin: isCurrentUser(msg.user) ? '0 0 0 8px' : '0 8px 0 0',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#374151', 
                      fontSize: '13px',
                      marginBottom: '4px',
                      textAlign: isCurrentUser(msg.user) ? 'right' : 'left'
                    }}>
                      {msg.user}
                    </div>
                    <div
                      style={{
                        backgroundColor: isCurrentUser(msg.user) ? '#3b82f6' : '#f3f4f6',
                        color: isCurrentUser(msg.user) ? '#ffffff' : '#374151',
                        padding: '10px 14px',
                        borderRadius: '18px',
                        wordWrap: 'break-word',
                        fontSize: '14px',
                        lineHeight: '1.4',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      {msg.message}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af', 
                      marginTop: '4px',
                      textAlign: isCurrentUser(msg.user) ? 'right' : 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCurrentUser(msg.user) ? 'flex-end' : 'flex-start',
                      gap: '4px'
                    }}>
                      {formatTime(msg.timestamp)}
                      {isCurrentUser(msg.user) && (
                        <span style={{ fontSize: '10px' }}>
                          {getMessageStatus(msg.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            fontStyle: 'italic',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}></div>
            {typingUsers.filter(u => u !== user).join(', ')} {typingUsers.filter(u => u !== user).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div style={{ 
        padding: '16px 12px', 
        borderTop: '1px solid #e1e5e9', 
        backgroundColor: '#ffffff' 
      }}>
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            border: '1px solid #e5e7eb'
          }}>
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'background-color 0.2s',
                  minWidth: '36px',
                  minHeight: '36px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isOnline}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '50%',
              backgroundColor: showEmojiPicker ? '#eff6ff' : '#ffffff',
              cursor: isOnline ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOnline ? 1 : 0.5,
              transition: 'all 0.2s',
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            😊
          </button>
          
          <input
            type="text"
            value={messageInput}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isOnline ? "Type a message..." : "Connecting..."}
            disabled={!isOnline}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '25px',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: isOnline ? '#ffffff' : '#f9fafb',
              opacity: isOnline ? 1 : 0.7,
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              if (isOnline) {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim() || !isOnline}
            style={{
              padding: '12px 18px',
              backgroundColor: (messageInput.trim() && isOnline) ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: (messageInput.trim() && isOnline) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              minWidth: '60px'
            }}
            onMouseEnter={(e) => {
              if (messageInput.trim() && isOnline) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (messageInput.trim() && isOnline) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            Send
          </button>
        </div>

        {/* Connection status indicator */}
        {!isOnline && (
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#ef4444',
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px'
          }}>
            {connectionStatus} - Retrying...
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Chat;