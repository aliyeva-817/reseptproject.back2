const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendOTP");

// Token yaratma funksiyası
const generateTokens = (user) => {
  console.log("[generateTokens] Token yaradılır üçün user ID:", user._id);
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });
  console.log("[generateTokens] Tokenlar yaradıldı");
  return { accessToken, refreshToken };
};

// Qeydiyyat (yalnız username, email, password)
exports.register = async (req, res) => {
  console.log("🔥 FUNKSİYA İŞƏ DÜŞDÜ");
  console.log("📥 Gələn body:", req.body);
  const { username, email, password } = req.body;

  try {
    console.log("[register] İstifadəçi adı yoxlanılır:", username);
    const existingUsername = await User.findOne({ username });
   if (existingUsername) {
  return res.status(400).json({ message: "Bu istifadəçi adı artıq istifadə olunub" });
}

    console.log("[register] Email yoxlanılır:", email);
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
  return res.status(400).json({ message: "Bu email artıq istifadə olunub" });
}

    console.log("[register] Şifrə hash edilir");
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("[register] Yeni istifadəçi yaradılır");
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    console.log("✅ İstifadəçi yaradıldı:", user);

    await sendOTP(email, otp);
    console.log("✅ OTP göndərildi");

    res.status(201).json({
      message: "OTP emailə göndərildi.",
      userId: user._id,
    });
  } catch (err) {
    console.error("❌ Qeydiyyat xətası:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      console.error(`Unikal sahə xətası: ${field} artıq mövcuddur.`);
      return res.status(400).json({
        message: `${field} artıq mövcuddur.`,
        error: err.message,
      });
    }
    res.status(500).json({
      message: "Server xətası",
      error: err.message,
    });
  }
};



// OTP təsdiqləmə
exports.verifyOtp = async (req, res) => {
  console.log("🔥 FUNKSİYA İŞƏ DÜŞDÜ - verifyOtp");
  const { userId, otp } = req.body;
  console.log(`[verifyOtp] userId: ${userId}, otp: ${otp}`);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("[verifyOtp] İstifadəçi tapılmadı");
      return res.status(404).json({ message: "İstifadəçi tapılmadı." });
    }

    if (user.otp !== otp) {
      console.log("[verifyOtp] OTP yanlışdır");
      return res.status(400).json({ message: "OTP etibarsızdır." });
    }
    if (Date.now() > user.otpExpires) {
      console.log("[verifyOtp] OTP vaxtı keçib");
      return res.status(400).json({ message: "OTP vaxtı keçib." });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    console.log("[verifyOtp] OTP təsdiqləndi");
    res.status(200).json({ message: "OTP təsdiqləndi." });
  } catch (err) {
    console.error("❌ OTP təsdiqləmə xətası:", err);
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
};

// Giriş
exports.login = async (req, res) => {
  console.log("🔥 FUNKSİYA İŞƏ DÜŞDÜ - login");
  const { email, password } = req.body;
  console.log(`[login] Giriş cəhdi - email: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[login] Email tapılmadı");
      return res.status(400).json({ message: "Email tapılmadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("[login] Şifrə yanlışdır");
      return res.status(400).json({ message: "Şifrə yanlışdır." });
    }

    if (user.otp) {
      console.log("[login] OTP təsdiqlənməyib");
      return res.status(403).json({ message: "OTP təsdiqlənməyib. Emaili yoxlayın." });
    }

    const tokens = generateTokens(user);

    console.log("[login] Giriş uğurludur");
    res.status(200).json({
      message: "Giriş uğurludur.",
      tokens,
      user,
    });
  } catch (err) {
    console.error("❌ Giriş xətası:", err);
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
};

// Çıxış
exports.logout = (req, res) => {
  console.log("🔥 FUNKSİYA İŞƏ DÜŞDÜ - logout");
  res.status(200).json({ message: "Çıxış olundu." });
};

// Profil məlumatlarını alma
exports.getProfile = async (req, res) => {
  console.log("🔥 FUNKSİYA İŞƏ DÜŞDÜ - getProfile");
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      console.log("[getProfile] İstifadəçi tapılmadı");
      return res.status(404).json({ message: "İstifadəçi tapılmadı." });
    }

    console.log("[getProfile] Profil məlumatları göndərilir");
    res.json(user);
  } catch (err) {
    console.error("❌ Profil məlumatları alınmadı:", err);
    res.status(500).json({ message: "Profil yüklənmədi." });
  }
};
exports.sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dəq etibarlı

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP emailə göndərildi" });
  } catch (err) {
    res.status(500).json({ message: "OTP göndərilmədi", error: err.message });
  }
};

// ✅ Yeni əlavə: OTP ilə şifrəni sıfırla
exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP etibarsız və ya vaxtı keçib" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Şifrə uğurla yeniləndi" });
  } catch (err) {
    res.status(500).json({ message: "Şifrə yenilənmədi", error: err.message });
  }
};