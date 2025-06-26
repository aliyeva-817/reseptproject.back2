const Message = require('../models/Message');

// MESAJ GÖNDƏR (Real-Time ilə)
// MESAJ GÖNDƏR (Real-Time ilə)
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      edited: false,
    });

    const messagePayload = {
      _id: message._id,
      senderId,
      receiverId,
      text: message.content,
      createdAt: message.createdAt,
      edited: false,
    };

    // Qarşı tərəfə göndər
    const receiverSocketId = req.ioUsers.get(receiverId);
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('getMessage', messagePayload);
    }

    // Göndərən tərəfə də real vaxtda göndər (bunu etməmişdin)
    const senderSocketId = req.ioUsers.get(senderId);
    if (senderSocketId) {
      req.io.to(senderSocketId).emit('getMessage', messagePayload);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Mesaj göndərmə xətası', error: err.message });
  }
};


// MESAJLARI GÖTÜR
exports.getConversation = async (req, res) => {
  const { userId, recipientId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: recipientId },
        { sender: recipientId, receiver: userId },
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Xəta baş verdi', error: err.message });
  }
};

// MESAJ SİL
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Mesaj tapılmadı' });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'İcazə yoxdur' });
    }

    await Message.findByIdAndDelete(messageId);

    const receiverSocketId = req.ioUsers.get(message.receiver.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('messageDeleted', { messageId });
    }

    res.status(200).json({ message: 'Mesaj silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmə zamanı xəta', error: err.message });
  }
};

// MESAJ REDAKTƏ ET
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { newText } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Mesaj tapılmadı' });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: 'İcazə yoxdur' });
    }

    message.content = newText;
    message.edited = true;
    await message.save();

    const receiverSocketId = req.ioUsers.get(message.receiver.toString());
    if (receiverSocketId) {
      req.io.to(receiverSocketId).emit('messageEdited', {
        _id: message._id,
        text: message.content,
        edited: true,
      });
    }

    res.status(200).json({ message: 'Mesaj redaktə olundu', updatedMessage: message });
  } catch (err) {
    res.status(500).json({ message: 'Redaktə zamanı xəta', error: err.message });
  }
};

// SOHBƏTİ TƏMİZLƏ (yalnız öz baxışından)
exports.clearConversation = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.userId;

  if (userId !== currentUserId) {
    return res.status(403).json({ message: 'İcazə yoxdur' });
  }

  // Real təmizləmə əməlliyyatı yoxdur – sadəcə görünüşdən silinir
  res.status(200).json({ message: "Söhbət yalnız sizdən təmizləndi." });
};
