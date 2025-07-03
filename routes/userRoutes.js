const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");


router.get("/search", verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Axtarış üçün 'q' parametrini daxil edin." });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" },  
    }).select("username _id");

    res.json(users);
  } catch (err) {
    console.error("[userRoutes] Search error:", err);
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

module.exports = router;
