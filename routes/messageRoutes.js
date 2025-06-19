const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const Message = require("../models/Message");

// İki istifadəçi arasındakı mesajları qaytarır
router.get("/conversation/:userId/:recipientId", verifyToken, async (req, res) => {
  try {
    const { userId, recipientId } = req.params;

    if (!userId || !recipientId) {
      return res.status(400).json({ message: "İstifadəçi ID-ləri tələb olunur." });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: recipientId },
        { sender: recipientId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
});

// Mesaj göndərmə
router.post("/", verifyToken, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Bütün sahələr doldurulmalıdır." });
    }

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      createdAt: new Date(),
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Mesaj göndərmə xətası", error: err.message });
  }
});

module.exports = router;