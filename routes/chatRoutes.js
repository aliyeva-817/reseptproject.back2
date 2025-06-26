// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const controller = require('../controllers/chatController');

// Sidebar-da göstərilən chat siyahısı
router.get('/my-chats', verifyToken, controller.getMyChats);

// Sidebar-dan istədiyin istifadəçi ilə chat-i sil
router.delete('/clear/:targetUsername', verifyToken, controller.clearChatWithUser);

module.exports = router;
