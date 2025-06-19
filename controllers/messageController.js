const Message = require('../models/Message');

// Mesaj göndər
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = await Message.create({ sender: senderId, receiver: receiverId, content });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Mesaj göndərmə xətası', error: err.message });
  }
};

// Mesajları götür
exports.getConversation = async (req, res) => {
  const { userId, recipientId } = req.params;
  try {
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
};

// Mesaj sil
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  const message = await Message.findById(messageId);
  if (!message || message.sender.toString() !== userId) {
    return res.status(403).json({ message: 'İcazə yoxdur' });
  }

  await Message.findByIdAndDelete(messageId);

  // Socket.IO emit üçün: req.io istifadə edilir
  req.io.to(req.ioUsers.get(message.receiver.toString())).emit('messageDeleted', {
    messageId,
  });

  res.status(200).json({ message: 'Mesaj silindi' });
};

// Mesaj redaktə
exports.editMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;
  const userId = req.userId;

  const message = await Message.findById(messageId);
  if (!message || message.sender.toString() !== userId) {
    return res.status(403).json({ message: 'İcazə yoxdur' });
  }

  message.content = newText;
  message.edited = true;
  await message.save();

  // Socket.IO emit ilə qarşı tərəfə bildirilir
  req.io.to(req.ioUsers.get(message.receiver.toString())).emit('messageEdited', {
    _id: message._id,
    text: message.content,
    edited: true,
  });

  res.status(200).json({ message: 'Mesaj redaktə olundu', updatedMessage: message });
};

// Sohbəti təmizlə (yalnız öz baxışından)
exports.clearConversation = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  if (userId !== currentUserId) {
    return res.status(403).json({ message: 'İcazə yoxdur' });
  }

  res.status(200).json({ message: "Söhbət yalnız sizdən təmizləndi." });
};
