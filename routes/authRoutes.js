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
    sendResetOtp,
  resetPasswordWithOtp
} = require("../controllers/authController");

const verifyToken = require("../middlewares/verifyToken"); 


router.post("/register", (req, res, next) => {
  console.log("➡️ POST /register çağırıldı");
  next();
}, upload.single("profileImage"), register);

// OTP təsdiqləmə ilə log
router.post("/verify-otp", (req, res, next) => {
  console.log("➡️ POST /verify-otp çağırıldı");
  next();
}, verifyOtp);


router.post("/login", (req, res, next) => {
  console.log("➡️ POST /login çağırıldı");
  next();
}, login);


router.post("/logout", (req, res, next) => {
  console.log("➡️ POST /logout çağırıldı");
  next();
}, logout);


router.get("/profile", (req, res, next) => {
  console.log("➡️ GET /profile çağırıldı");
  next();
}, verifyToken, getProfile);

router.post("/send-reset-otp", (req, res, next) => {
  console.log("➡️ POST /send-reset-otp çağırıldı");
  next();
}, sendResetOtp);


router.post("/reset-password", (req, res, next) => {
  console.log("➡️ POST /reset-password çağırıldı");
  next();
}, resetPasswordWithOtp);

module.exports = router;
