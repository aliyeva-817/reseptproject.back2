const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin girişi tələb olunur" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Admin yoxlanışı zamanı xəta", error: err.message });
  }
};

module.exports = isAdmin;
