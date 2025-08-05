// app.js

const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const userRouter = require("./Routes/UserRoutes");
require("./Models/UserModels");
require("./Models/Document");

const app = express();
const server = http.createServer(app);

// ========= CORS =========
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ========= Routes =========
app.use("/USERS", userRouter);

// ========= Register =========
const User = mongoose.model("register");

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await User.create({ name, email, password });
    res.send({ status: "ok" });
  } catch (err) {
    res.send({ status: "err" });
  }
});

// ========= Login =========
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user || user.password !== password) {
      return res.json({ status: "error", data: "Invalid email or password" });
    } else {
      res.json({ status: "ok", data: user });
    }
  } catch (err) {
    console.log(err);
    res.json({ status: "error", data: "An error occurred" });
  }
});

// ========= WebSocket Server =========
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

const documents = new Map();
const chatRooms = new Map();
const activeUsers = new Map();

const getOrCreateDocument = async (id) => {
  if (documents.has(id)) return documents.get(id);
  const defaultValue = { ops: [{ insert: '' }] };
  documents.set(id, defaultValue);
  return defaultValue;
};

const getOrCreateChatRoom = (roomId) => {
  if (!chatRooms.has(roomId)) {
    chatRooms.set(roomId, {
      messages: [],
      users: new Map(),
      typingUsers: new Set()
    });
  }
  return chatRooms.get(roomId);
};

const generateMessageId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-document', async (documentId) => {
    socket.join(documentId);
    socket.documentId = documentId;
    const document = await getOrCreateDocument(documentId);
    socket.emit('load-document', document);

    if (!activeUsers.has(documentId)) activeUsers.set(documentId, new Set());
    activeUsers.get(documentId).add(socket.id);
  });

  socket.on('send-changes', (delta) => {
    if (socket.documentId) {
      socket.to(socket.documentId).emit('receive-changes', delta);
    }
  });

  socket.on('save-document', ({ docId, data }) => {
    documents.set(docId, data);
    console.log(`Document ${docId} saved`);
  });

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(`chat-${roomId}`);
    socket.chatRoomId = roomId;
    socket.user = user;

    const chatRoom = getOrCreateChatRoom(roomId);
    chatRoom.users.set(socket.id, {
      id: socket.id,
      name: user.name,
      photo: user.photo,
      online: true,
      joinedAt: new Date()
    });

    socket.emit('room-data', {
      users: Array.from(chatRoom.users.values()),
      messages: chatRoom.messages.slice(-50)
    });

    socket.to(`chat-${roomId}`).emit('user-joined', {
      user: chatRoom.users.get(socket.id),
      users: Array.from(chatRoom.users.values())
    });

    const systemMessage = {
      id: generateMessageId(),
      type: 'system',
      message: `${user.name} joined the conversation`,
      timestamp: new Date().toISOString(),
      roomId
    };
    chatRoom.messages.push(systemMessage);
    io.to(`chat-${roomId}`).emit('new-message', systemMessage);
  });

  socket.on('send-message', ({ message, roomId }) => {
    if (!socket.user || !roomId) return;

    const chatRoom = getOrCreateChatRoom(roomId);
    const newMessage = {
      id: generateMessageId(),
      user: socket.user.name,
      message,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      roomId
    };
    chatRoom.messages.push(newMessage);
    if (chatRoom.messages.length > 100) {
      chatRoom.messages = chatRoom.messages.slice(-100);
    }

    io.to(`chat-${roomId}`).emit('new-message', newMessage);
    socket.emit('message-delivered', { messageId: newMessage.id });
  });

  socket.on('typing-start', ({ roomId }) => {
    if (!socket.user || !roomId) return;
    const chatRoom = getOrCreateChatRoom(roomId);
    chatRoom.typingUsers.add(socket.user.name);
    socket.to(`chat-${roomId}`).emit('user-typing', {
      user: socket.user.name,
      typing: true
    });
  });

  socket.on('typing-stop', ({ roomId }) => {
    if (!socket.user || !roomId) return;
    const chatRoom = getOrCreateChatRoom(roomId);
    chatRoom.typingUsers.delete(socket.user.name);
    socket.to(`chat-${roomId}`).emit('user-typing', {
      user: socket.user.name,
      typing: false
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    if (socket.documentId) {
      const docUsers = activeUsers.get(socket.documentId);
      if (docUsers) {
        docUsers.delete(socket.id);
        if (docUsers.size === 0) {
          activeUsers.delete(socket.documentId);
        }
      }
    }

    if (socket.chatRoomId && socket.user) {
      const chatRoom = chatRooms.get(socket.chatRoomId);
      if (chatRoom) {
        chatRoom.users.delete(socket.id);
        chatRoom.typingUsers.delete(socket.user.name);

        socket.to(`chat-${socket.chatRoomId}`).emit('user-left', {
          user: socket.user,
          users: Array.from(chatRoom.users.values())
        });

        const systemMessage = {
          id: generateMessageId(),
          type: 'system',
          message: `${socket.user.name} left the conversation`,
          timestamp: new Date().toISOString(),
          roomId: socket.chatRoomId
        };
        chatRoom.messages.push(systemMessage);
        io.to(`chat-${socket.chatRoomId}`).emit('new-message', systemMessage);
      }
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    socket.emit('error-message', { message: 'An error occurred' });
  });
});

// ========== Optional REST APIs ==========
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeDocuments: documents.size,
    activeChatRooms: chatRooms.size
  });
});

app.get('/api/documents/:id', async (req, res) => {
  const document = await getOrCreateDocument(req.params.id);
  res.json(document);
});

app.get('/api/chat/:roomId/messages', (req, res) => {
  const chatRoom = getOrCreateChatRoom(req.params.roomId);
  res.json(chatRoom.messages);
});

app.get('/api/chat/:roomId/users', (req, res) => {
  const chatRoom = getOrCreateChatRoom(req.params.roomId);
  res.json(Array.from(chatRoom.users.values()));
});

// ========== MongoDB + Server Start ==========
mongoose
  .connect("mongodb+srv://admin:admin@collabwritecluster.qfwyw9d.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log(err));
