
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const controller = require('../controllers/chatController');


router.get('/my-chats', verifyToken, controller.getMyChats);


router.delete('/clear/:targetUsername', verifyToken, controller.clearChatWithUser);

module.exports = router;
