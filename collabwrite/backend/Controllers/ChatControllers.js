// ============================================
// File: backend/Controllers/ChatController.js
// ============================================

// In-memory storage (replace with MongoDB in production)
const rooms = {};
const userSockets = {};

class ChatController {
  
  // ========== Initialize Room ==========
  static initializeRoom(roomId) {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: [],
        messages: [],
        typingUsers: []
      };
    }
    return rooms[roomId];
  }

  // ========== Join Room ==========
  static joinRoom(socket, data, io) {
    const { roomId, user } = data;
    console.log(`👤 User ${user.name} joining room ${roomId}`);

    // Store user socket mapping
    userSockets[user.name] = socket.id;

    // Join socket to room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = user.name;
    socket.userPhoto = user.photo;

    // Initialize room if not exists
    this.initializeRoom(roomId);

    // Add user to room
    if (!rooms[roomId].users.find(u => u.name === user.name)) {
      rooms[roomId].users.push({
        id: socket.id,
        name: user.name,
        photo: user.photo,
        online: true
      });
    }

    // Send room data to the connecting user
    socket.emit('room-data', {
      users: rooms[roomId].users,
      messages: rooms[roomId].messages
    });

    // Notify others that user joined
    socket.broadcast.to(roomId).emit('user-joined', {
      user: { name: user.name, photo: user.photo },
      users: rooms[roomId].users
    });

    // Emit users updated to all
    io.to(roomId).emit('users-updated', {
      users: rooms[roomId].users
    });

    console.log(`✅ ${user.name} joined room ${roomId}. Total users: ${rooms[roomId].users.length}`);
  }

  // ========== Send Message ==========
  static sendMessage(socket, data, io) {
    const { message, roomId, mode, recipient } = data;
    const sender = socket.userName;

    console.log(`💬 Message from ${sender}:`, {
      mode,
      recipient,
      message: message.substring(0, 50)
    });

    if (!rooms[roomId]) {
      console.error('❌ Room not found:', roomId);
      socket.emit('send-error', { error: 'Room not found' });
      return;
    }

    const messageObj = {
      id: Date.now().toString(),
      user: sender,
      sender: sender,
      message: message,
      timestamp: new Date(),
      status: 'delivered',
      mode: mode,
      recipient: mode === 'individual' ? recipient : null,
      type: 'message'
    };

    // Store message in room
    rooms[roomId].messages.push(messageObj);
    console.log(`📝 Message stored. Total messages in ${roomId}: ${rooms[roomId].messages.length}`);

    if (mode === 'group') {
      // ✅ BROADCAST TO GROUP
      console.log(`📢 Broadcasting to all users in room ${roomId}`);
      io.to(roomId).emit('new-message', messageObj);
    } else if (mode === 'individual' && recipient) {
      // ✅ SEND TO INDIVIDUAL USER
      console.log(`📨 Sending direct message to ${recipient}`);
      
      // Send to recipient
      const recipientSocketId = userSockets[recipient];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('new-message', messageObj);
        console.log(`✅ Message delivered to ${recipient}`);
      } else {
        console.warn(`⚠️ Recipient ${recipient} not found in active users`);
      }
      
      // Send to sender (so they see their own message)
      socket.emit('new-message', messageObj);
      console.log(`✅ Message sent to sender ${sender}`);
    }

    // Emit delivery confirmation
    socket.emit('message-delivered', {
      messageId: messageObj.id,
      status: 'delivered'
    });
  }

  // ========== Typing Start ==========
  static typingStart(socket, data, io) {
    const { roomId } = data;
    const userName = socket.userName;

    if (!rooms[roomId]) return;

    if (!rooms[roomId].typingUsers.includes(userName)) {
      rooms[roomId].typingUsers.push(userName);
    }

    // Broadcast typing status to room
    io.to(roomId).emit('user-typing', {
      user: userName,
      typing: true
    });

    console.log(`⌨️ ${userName} is typing in ${roomId}`);
  }

  // ========== Typing Stop ==========
  static typingStop(socket, data, io) {
    const { roomId } = data;
    const userName = socket.userName;

    if (!rooms[roomId]) return;

    rooms[roomId].typingUsers = rooms[roomId].typingUsers.filter(
      u => u !== userName
    );

    // Broadcast typing stop to room
    io.to(roomId).emit('user-typing', {
      user: userName,
      typing: false
    });

    console.log(`✋ ${userName} stopped typing in ${roomId}`);
  }

  // ========== User Disconnect ==========
  static userDisconnect(socket, io) {
    console.log('❌ User disconnected:', socket.id);

    const userName = socket.userName;
    const roomId = socket.roomId;

    // Remove from user sockets
    delete userSockets[userName];

    // Update room
    if (rooms[roomId]) {
      const userIndex = rooms[roomId].users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        rooms[roomId].users[userIndex].online = false;
      }

      // Notify others
      const onlineUsers = rooms[roomId].users.filter(u => u.online);
      
      io.to(roomId).emit('user-left', {
        user: { name: userName },
        users: onlineUsers
      });

      io.to(roomId).emit('users-updated', {
        users: onlineUsers
      });

      console.log(`📊 Room ${roomId} active users: ${onlineUsers.length}`);
    }
  }

  // ========== Get Room Info ==========
  static getRoomInfo(roomId) {
    if (!rooms[roomId]) return null;
    return {
      roomId,
      users: rooms[roomId].users.filter(u => u.online),
      messageCount: rooms[roomId].messages.length,
      typingUsers: rooms[roomId].typingUsers
    };
  }

  // ========== Get All Rooms ==========
  static getAllRooms() {
    const roomStats = Object.keys(rooms).map(roomId => ({
      roomId,
      users: rooms[roomId].users.filter(u => u.online).length,
      messages: rooms[roomId].messages.length,
      typingUsers: rooms[roomId].typingUsers.length
    }));
    return roomStats;
  }

  // ========== Clear Old Messages (Optional) ==========
  static clearOldMessages(roomId, maxMessages = 1000) {
    if (rooms[roomId] && rooms[roomId].messages.length > maxMessages) {
      const removed = rooms[roomId].messages.length - maxMessages;
      rooms[roomId].messages = rooms[roomId].messages.slice(-maxMessages);
      console.log(`🗑️ Removed ${removed} old messages from room ${roomId}`);
    }
  }
}

module.exports = ChatController;