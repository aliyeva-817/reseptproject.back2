// middlewares/verifyToken.js

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token yoxdur və ya format yanlışdır' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT error:', err);
      return res.status(403).json({ message: 'Token yanlışdır və ya vaxtı bitib' });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
