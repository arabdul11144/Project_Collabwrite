import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ roomId, user, socket }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [chatMode, setChatMode] = useState('group');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const userListRef = useRef(null);

  const commonEmojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '🤔'];

  const getUserInitials = (username) => {
    if (!username || typeof username !== 'string') {
      return 'U';
    }
    return username.slice(0, 2).toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ FIXED: Main socket listener setup with correct dependencies
  useEffect(() => {
    if (!socket) {
      console.error('Socket is null or undefined');
      setConnectionStatus('No Socket');
      setIsOnline(false);
      return;
    }

    if (!user || typeof user !== 'string') {
      console.error('User is required for chat connection');
      setConnectionStatus('User Error');
      return;
    }

    console.log('🔌 Chat Socket Status:', socket.connected ? 'CONNECTED' : 'DISCONNECTED');
    console.log('🔌 Initializing Chat Socket for user:', user);

    // ✅ Define all handlers inside useEffect
    const handleConnect = () => {
      console.log('✅ Chat connected to server');
      setIsOnline(true);
      setConnectionStatus('Connected');
      
      socket.emit('join-room', { 
        roomId, 
        user: { 
          name: user,
          photo: `https://via.placeholder.com/40?text=${getUserInitials(user)}`
        }
      });
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Chat disconnected from server:', reason);
      setIsOnline(false);
      setConnectionStatus('Disconnected');
      setTimeout(() => {
        if (socket && !socket.connected) {
          console.log('🔄 Attempting to reconnect...');
          socket.connect();
        }
      }, 2000);
    };

    const handleConnectError = (error) => {
      console.error('⚠️ Chat connection error:', error);
      setConnectionStatus('Connection Error');
      setIsOnline(false);
    };

    const handleRoomData = (data) => {
      console.log('📦 Received room data:', data);
      if (data && data.users) {
        setUsers(data.users);
      }
      if (data && data.messages) {
        setMessages(data.messages);
      }
    };

    const handleUserJoined = (data) => {
      console.log('👤 User joined:', data?.user?.name);
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    const handleUserLeft = (data) => {
      console.log('👤 User left:', data?.user?.name);
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    const handleUsersUpdated = (data) => {
      console.log('👥 Users updated:', data?.users?.length);
      if (data && data.users) {
        setUsers(data.users);
      }
    };

    const handleNewMessage = (message) => {
      console.log('💬 New message:', message);
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

    const handleUserTyping = (data) => {
      if (data && data.user && data.user !== user) {
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

    // ✅ Check if socket already connected
    if (socket.connected) {
      console.log('✅ Socket already connected, calling handleConnect');
      handleConnect();
    } else {
      console.log('⏳ Waiting for socket to connect...');
      setIsOnline(false);
      setConnectionStatus('Connecting...');
    }

    // ✅ Attach all event listeners
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

    // ✅ FIXED: Clean up all listeners when component unmounts
    return () => {
      console.log('🧹 Cleaning up chat listeners');
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
    };
  }, [socket]); // ✅ ONLY socket as dependency!

  // Close user list when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userListRef.current && !userListRef.current.contains(e.target)) {
        setShowUserList(false);
      }
    };
    
    if (showUserList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserList]);

  const handleTyping = (value) => {
    setMessageInput(value);
    
    if (!socket || !isOnline) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      socket.emit('typing-start', { roomId });
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing-stop', { roomId });
      }, 2000);
    } else {
      socket.emit('typing-stop', { roomId });
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && socket && isOnline) {
      if (chatMode === 'individual' && !selectedUser) {
        alert('Please select a user for direct messaging');
        return;
      }

      console.log('📤 Sending message:', {
        mode: chatMode,
        recipient: selectedUser,
        message: messageInput.trim()
      });

      socket.emit('send-message', {
        message: messageInput.trim(),
        roomId,
        mode: chatMode,
        recipient: chatMode === 'individual' ? selectedUser : null
      });
      
      setMessageInput('');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit('typing-stop', { roomId });
    }
  };

  const getAvatar = (username) => {
    const foundUser = users.find((u) => u.name === username);
    return foundUser?.photo || `https://via.placeholder.com/40?text=${getUserInitials(username)}`;
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

  const filteredMessages = chatMode === 'group' 
    ? messages.filter(msg => !msg.recipient || msg.recipient === null || msg.mode === 'group')
    : messages.filter(msg => 
        (msg.sender === user && msg.recipient === selectedUser) || 
        (msg.sender === selectedUser && msg.recipient === user)
      );

  const onlineUsers = users.filter(u => u.online && u.name !== user);

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
      {/* Header */}
      <div style={{ 
        padding: '12px', 
        backgroundColor: isOnline ? '#f8f9fa' : '#fff3cd', 
        borderBottom: '1px solid #e1e5e9', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          {users.filter(u => u.online).slice(0, 4).map((u) => (
            <img
              key={u.id}
              src={u.photo}
              alt={`${u.name}`}
              style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                border: '2px solid #22c55e',
                cursor: 'pointer'
              }}
              title={`${u.name} - Online`}
            />
          ))}
        </div>
        <div style={{ fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isOnline ? (
            <>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
              <span style={{ color: '#16a34a' }}>Connected</span>
            </>
          ) : (
            <>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#fbbf24', 
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }}></span>
              <span style={{ color: '#b45309' }}>Connecting...</span>
            </>
          )}
        </div>
      </div>

      {/* Chat mode selector */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e1e5e9', 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
          Mode:
        </div>
        
        {/* Group Chat Button */}
        <button
          onClick={() => {
            setChatMode('group');
            setSelectedUser(null);
            setShowUserList(false);
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: chatMode === 'group' ? '#3b82f6' : '#e5e7eb',
            color: chatMode === 'group' ? '#ffffff' : '#374151',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          👥 Everyone
        </button>

        {/* Individual Chat Button */}
        <button
          onClick={() => setChatMode('individual')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: chatMode === 'individual' ? '#3b82f6' : '#e5e7eb',
            color: chatMode === 'individual' ? '#ffffff' : '#374151',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          👤 Direct
        </button>

        {/* User selector button */}
        {chatMode === 'individual' && (
          <div style={{ position: 'relative' }} ref={userListRef}>
            <button
              onClick={() => setShowUserList(!showUserList)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '2px solid #3b82f6',
                backgroundColor: '#ffffff',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {selectedUser ? `💬 ${selectedUser}` : '👥 Select User'}
            </button>

            {/* Dropdown user list */}
            {showUserList && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {onlineUsers.length > 0 ? (
                  onlineUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u.name);
                        setShowUserList(false);
                        setMessages([]);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: 'none',
                        backgroundColor: selectedUser === u.name ? '#eff6ff' : '#ffffff',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = selectedUser === u.name ? '#eff6ff' : '#ffffff';
                      }}
                    >
                      <img 
                        src={u.photo} 
                        alt={u.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%'
                        }}
                      />
                      <span>{u.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#22c55e' }}>🟢</span>
                    </button>
                  ))
                ) : (
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '12px'
                  }}>
                    No online users
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat title */}
      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e1e5e9', 
        textAlign: 'center' 
      }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '16px' }}>
          💬 {chatMode === 'group' ? 'Group Chat' : `💬 ${selectedUser || 'Select User'}`}
        </h3>
        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
          {getFormattedDate()}
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
        {chatMode === 'individual' && !selectedUser ? (
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
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
            <div style={{ fontWeight: '500' }}>Select a user to chat</div>
          </div>
        ) : filteredMessages.length === 0 ? (
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
            <div style={{ fontWeight: '500' }}>No messages yet</div>
          </div>
        ) : (
          filteredMessages.map((msg) => (
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
                  width: '100%'
                }}>
                  {msg.message}
                </div>
              ) : (
                <>
                  <img
                    src={getAvatar(msg.user)}
                    alt={msg.user}
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
                        lineHeight: '1.4'
                      }}
                    >
                      {msg.message}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af', 
                      marginTop: '4px',
                      textAlign: isCurrentUser(msg.user) ? 'right' : 'left'
                    }}>
                      {formatTime(msg.timestamp)}
                      {isCurrentUser(msg.user) && (
                        <span style={{ marginLeft: '4px' }}>
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
            {typingUsers.join(', ')} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div style={{ 
        padding: '16px 12px', 
        borderTop: '1px solid #e1e5e9', 
        backgroundColor: '#ffffff' 
      }}>
        {showEmojiPicker && (
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isOnline || (chatMode === 'individual' && !selectedUser)}
            style={{
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '50%',
              backgroundColor: showEmojiPicker ? '#eff6ff' : '#ffffff',
              cursor: (isOnline && (chatMode === 'group' || selectedUser)) ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (isOnline && (chatMode === 'group' || selectedUser)) ? 1 : 0.5,
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
            placeholder={
              !isOnline ? "Waiting for connection..." : 
              (chatMode === 'individual' && !selectedUser) ? "Select a user first..." :
              "Type a message..."
            }
            disabled={!isOnline || (chatMode === 'individual' && !selectedUser)}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '25px',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: (isOnline && (chatMode === 'group' || selectedUser)) ? '#ffffff' : '#f9fafb',
              opacity: (isOnline && (chatMode === 'group' || selectedUser)) ? 1 : 0.7
            }}
          />
          
          <button
            onClick={sendMessage}
            disabled={!messageInput.trim() || !isOnline || (chatMode === 'individual' && !selectedUser)}
            style={{
              padding: '12px 18px',
              backgroundColor: (messageInput.trim() && isOnline && (chatMode === 'group' || selectedUser)) ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: (messageInput.trim() && isOnline && (chatMode === 'group' || selectedUser)) ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              minWidth: '60px'
            }}
          >
            Send
          </button>
        </div>
      </div>

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