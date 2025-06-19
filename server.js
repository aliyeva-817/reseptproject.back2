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

const app = express();
const server = http.createServer(app);
connectDB();

app.use(cors({ origin: [/localhost:\d+$/], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// ✅ Socket.IO konfiqurasiyası
const io = new Server(server, {
  cors: { origin: [/localhost:\d+$/], credentials: true },
});

// ✅ Global online istifadəçi siyahısı
const onlineUsers = new Map();

// ✅ Socket və istifadəçi xəritəsini `req` obyektinə əlavə et
app.use((req, res, next) => {
  req.io = io;
  req.ioUsers = onlineUsers;
  next();
});

// ✅ API routelar
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// ✅ Socket.IO əlaqələri
io.on('connection', (socket) => {
  console.log('Yeni istifadəçi qoşuldu:', socket.id);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('İstifadəçi əlavə olundu:', userId);
  });

  // ✅ Mesaj göndərildi
  socket.on('sendMessage', (message) => {
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', message);
    }
  });

  // ✅ Mesaj redaktə olundu (real vaxt)
  socket.on('editMessage', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getEditedMessage', data);
    }
  });

  // ✅ Mesaj silindi (real vaxt)
  socket.on('deleteMessage', ({ messageId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getDeletedMessage', messageId);
    }
  });

  // ✅ İstifadəçi bağlantını kəsdi
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
