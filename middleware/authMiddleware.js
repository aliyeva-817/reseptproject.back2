const jwt = require('jsonwebtoken');

exports.auth = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h) return res.sendStatus(401);
  const token = h.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, p) => {
    if (err) return res.sendStatus(403);
    req.user = p;
    next();
  });
};
