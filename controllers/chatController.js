
const Message = require('../models/Message');
const User = require('../models/User');


exports.getMyChats = async (req, res) => {
  try {
    const userId = req.userId;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    const userSet = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== userId) userSet.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId) userSet.add(msg.receiver.toString());
    });

    const users = await User.find({ _id: { $in: Array.from(userSet) } })
      .select('username profileImage');

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Chat siyahısı alınmadı', error: err.message });
  }
};


exports.clearChatWithUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetUsername } = req.params;

    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) return res.status(404).json({ message: 'İstifadəçi tapılmadı' });

    
    res.status(200).json({ message: 'Söhbət sidebar-dan silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmə zamanı xəta', error: err.message });
  }
};
