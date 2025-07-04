require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');


const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoutes = require('./routes/chatRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mealRoutes = require('./routes/mealRoutes');

const shoppingListRoutes = require('./routes/shoppingListRoutes');

const app = express();
const server = http.createServer(app);
connectDB();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


const onlineUsers = new Map();
const unreadMessages = new Map(); 


const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO CORS error'));
      }
    },
    credentials: true,
  },
});


app.use((req, res, next) => {
  req.io = io;
  req.ioUsers = onlineUsers;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/admin', adminRoutes);


io.on('connection', (socket) => {
  console.log('🔌 Yeni istifadəçi qoşuldu:', socket.id);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('🧑‍💻 Istifadəçi əlavə olundu:', userId);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ _id, senderId, receiverId, text, content, createdAt, edited, emoji }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    const senderSocketId = onlineUsers.get(senderId);

    const messagePayload = {
      _id,
      senderId,
      receiverId,
      text: text || content,
      createdAt,
      edited,
      emoji
    };

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', messagePayload);
      io.to(receiverSocketId).emit('newNotification', {
        from: senderId,
        text: 'Yeni mesajınız var',
      });
    } else {
     
      const existing = unreadMessages.get(receiverId) || [];
      unreadMessages.set(receiverId, [...existing, messagePayload]);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit('getMessage', messagePayload);
    }
  });

  socket.on('editMessage', ({ _id, text, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messageEdited', { _id, text });
    }
  });

  socket.on('deleteMessage', ({ messageId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('messageDeleted', { messageId });
    }
  });

 
  socket.on('joinChat', ({ userId, partnerId }) => {
    const unread = unreadMessages.get(userId) || [];
    const related = unread.filter((msg) => msg.senderId === partnerId);
    if (related.length) {
      related.forEach((msg) => {
        io.to(socket.id).emit('getMessage', msg);
      });
      unreadMessages.set(userId, unread.filter((msg) => msg.senderId !== partnerId));
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log('❌ İstifadəçi ayrıldı:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
