const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
});

module.exports = mongoose.model("Chat", chatSchema);
