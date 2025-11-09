// ============================================
// File: backend/Utils/socketConfig.js
// ============================================

const socketIo = require('socket.io');
const ChatController = require('../Controllers/ChatController');

function setupSocket(server) {
  // ✅ CRITICAL: CORS configuration for Socket.IO
  const io = socketIo(server, {
    cors: {
      origin: [
        "http://localhost:3000",     // React dev server
        "http://localhost:5000",     // Backend
        "http://127.0.0.1:3000",
      ],
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
    maxHttpBufferSize: 1e6,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity
  });

  // ========== CONNECTION HANDLER ==========
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);
    console.log('📊 Total connected users:', io.engine.clientsCount);

    // ========== JOIN ROOM ==========
    socket.on('join-room', (data) => {
      try {
        ChatController.joinRoom(socket, data, io);
      } catch (error) {
        console.error('❌ Error in join-room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ========== SEND MESSAGE ==========
    socket.on('send-message', (data) => {
      try {
        ChatController.sendMessage(socket, data, io);
      } catch (error) {
        console.error('❌ Error in send-message:', error);
        socket.emit('send-error', { message: 'Failed to send message' });
      }
    });

    // ========== TYPING START ==========
    socket.on('typing-start', (data) => {
      try {
        ChatController.typingStart(socket, data, io);
      } catch (error) {
        console.error('❌ Error in typing-start:', error);
      }
    });

    // ========== TYPING STOP ==========
    socket.on('typing-stop', (data) => {
      try {
        ChatController.typingStop(socket, data, io);
      } catch (error) {
        console.error('❌ Error in typing-stop:', error);
      }
    });

    // ========== JOIN DOCUMENT (For collaborative editing) ==========
    socket.on('join-document', (docId) => {
      try {
        console.log(`📄 User ${socket.userName} joining document ${docId}`);
        socket.join(`doc-${docId}`);
        socket.docId = docId;

        // Send empty document (replace with DB query in production)
        socket.emit('load-document', {});
      } catch (error) {
        console.error('❌ Error in join-document:', error);
      }
    });

    // ========== SEND CHANGES (For collaborative editing) ==========
    socket.on('send-changes', (delta) => {
      try {
        if (!socket.docId) return;
        
        // Broadcast changes to all users in document
        socket.broadcast.to(`doc-${socket.docId}`).emit('receive-changes', delta);
      } catch (error) {
        console.error('❌ Error in send-changes:', error);
      }
    });

    // ========== SAVE DOCUMENT ==========
    socket.on('save-document', (data) => {
      try {
        const { docId, data: content } = data;
        console.log(`💾 Saving document ${docId}`);
        
        // TODO: Save to MongoDB
        // await Document.findByIdAndUpdate(docId, { content });
        
        socket.emit('document-saved', { docId });
      } catch (error) {
        console.error('❌ Error in save-document:', error);
      }
    });

    // ========== DISCONNECT ==========
    socket.on('disconnect', () => {
      try {
        ChatController.userDisconnect(socket, io);
        console.log('📊 Total connected users:', io.engine.clientsCount);
      } catch (error) {
        console.error('❌ Error in disconnect:', error);
      }
    });

    // ========== ERROR HANDLING ==========
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      socket.emit('connect_error', error);
    });

    // ========== DISCONNECT DUE TO ERROR ==========
    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });
  });

  return io;
}

module.exports = setupSocket;