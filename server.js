require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const http = require('http');                // əlavə etdik
const { Server } = require('socket.io');    // əlavə etdik

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const messageRoutes = require('./routes/messageRoutes');


const app = express();
const server = http.createServer(app);      // http server yaradılır

connectDB();

app.use(
  cors({
    origin: [/localhost:\d+$/],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

// Socket.IO server yaratmaq və konfiqurasiya
const io = new Server(server, {
  cors: {
    origin: [/localhost:\d+$/],
    credentials: true,
  },
});

// İstifadəçilərin socket ID-lərini saxlamaq üçün xəritə (istifadəçiId => socketId)
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

  // İstifadəçi öz userId-ni qeyd edir (frontend-dən göndərilir)
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('İstifadəçi əlavə olundu:', userId);
  });

  // Mesaj göndərilməsi (real vaxt)
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  // İstifadəçi bağlantısını kəsəndə
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

// Serveri http server üzərində işə salırıq (express yox)
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
