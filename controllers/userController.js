const User = require('../models/User');

exports.searchUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    
    const user = await User.findOne({ username }).select('_id username');
    if (!user) {
      return res.status(404).json({ message: 'İstifadəçi tapılmadı' });
    }
    res.json(user);
  } catch (err) {
    console.error('İstifadəçi axtarış xətası:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};
