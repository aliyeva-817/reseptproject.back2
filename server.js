require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

// DB və routelar
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

const adminRoutes = require('./routes/adminRoutes');
const mealRoutes = require('./routes/mealRoutes');
const shoppingListRoutes = require('./routes/shoppingListRoutes');



// Express və server
const app = express();
const server = http.createServer(app);

// DB bağlantısı
connectDB();

// ✅ CORS ayarları (bütün `localhost` portlarına icazə)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
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


// ✅ Stripe route
app.use('/api/stripe', stripeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/admin', adminRoutes); // ✅ Yeni admin login routu


// ✅ Socket.IO düzgün CORS ilə
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

// ✅ Global istifadəçi xəritəsi
const onlineUsers = new Map();

// ✅ Req-ə əlavə et
app.use((req, res, next) => {
  req.io = io;
  req.ioUsers = onlineUsers;
  next();
});

// ✅ API routeları
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ✅ Socket hadisələri
io.on('connection', (socket) => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('İstifadəçi əlavə olundu:', userId);
  });

  socket.on('sendMessage', (message) => {
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
    }
  });

  socket.on('editMessage', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getEditedMessage', data);
    }
  });

  socket.on('deleteMessage', ({ messageId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getDeletedMessage', messageId);
    }
  });

  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// ✅ Serveri işə sal
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
