const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

// İstifadəçi axtarışı (username ilə)
router.get("/users/search", verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      username: { $regex: q, $options: "i" },
    }).select("username _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

// İstifadəçinin chat-lərini gətir
router.get("/my-chats", verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.userId }).populate("users", "username").populate("lastMessage");
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

module.exports = router;
