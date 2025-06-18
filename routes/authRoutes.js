const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  register,
  verifyOtp,
  login,
  logout,
  getProfile, 
} = require("../controllers/authController");

const verifyToken = require("../middlewares/verifyToken"); 

// Register route ilə log əlavə
router.post("/register", (req, res, next) => {
  console.log("➡️ POST /register çağırıldı");
  next();
}, upload.single("profileImage"), register);

// OTP təsdiqləmə ilə log
router.post("/verify-otp", (req, res, next) => {
  console.log("➡️ POST /verify-otp çağırıldı");
  next();
}, verifyOtp);

// Login ilə log
router.post("/login", (req, res, next) => {
  console.log("➡️ POST /login çağırıldı");
  next();
}, login);

// Logout ilə log
router.post("/logout", (req, res, next) => {
  console.log("➡️ POST /logout çağırıldı");
  next();
}, logout);

// Profil məlumatlarını alma (token tələb olunur) ilə log
router.get("/profile", (req, res, next) => {
  console.log("➡️ GET /profile çağırıldı");
  next();
}, verifyToken, getProfile);

module.exports = router;
