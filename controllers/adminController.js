const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Category = require("../models/Category");
const Payment = require("../models/Payment");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.REFRESH_SECRET, {
    expiresIn: "30d",
  });
  return { accessToken, refreshToken };
};


exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email tapılmadı." });
    if (!user.isAdmin) return res.status(403).json({ message: "Bu səhifəyə yalnız admin giriş edə bilər." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Şifrə yanlışdır." });

    if (user.otp) {
      return res.status(403).json({ message: "OTP təsdiqlənməyib. Emaili yoxlayın." });
    }

    const tokens = generateTokens(user);
    res.status(200).json({ message: "Admin girişi uğurludur.", tokens, user });
  } catch (err) {
    console.error("❌ Admin login xətası:", err);
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
};


exports.getAdminStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    const categoryCount = await Category.countDocuments();
    const payments = await Payment.find({});
    const totalIncome = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username createdAt");

    res.status(200).json({ userCount, recipeCount, categoryCount, totalIncome, recentUsers });
  } catch (err) {
    console.error("❌ Statistika xətası:", err);
    res.status(500).json({ message: "Statistikalar yüklənmədi", error: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "İstifadəçilər yüklənmədi", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı" });
    res.status(200).json({ message: "İstifadəçi silindi" });
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
};


exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("user", "username email");
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Reseptlər yüklənmədi", error: err.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Resept tapılmadı" });
    res.status(200).json({ message: "Resept silindi" });
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "username email")
      .populate("recipe", "title");
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: "Ödənişlər yüklənmədi", error: err.message });
  }
};


exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: "Kateqoriyalar yüklənmədi", error: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: "Bu kateqoriya artıq mövcuddur" });

    const category = new Category({ name });
    await category.save();
    res.status(201).json({ message: "Kateqoriya əlavə olundu", category });
  } catch (err) {
    res.status(500).json({ message: "Kateqoriya əlavə olunmadı", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Kateqoriya tapılmadı" });
    res.status(200).json({ message: "Kateqoriya silindi" });
  } catch (err) {
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
};


exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "username")
      .populate("recipe", "title");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Şərhlər yüklənmədi", error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: "Şərh tapılmadı" });
    res.status(200).json({ message: "Şərh silindi" });
  } catch (err) {
    res.status(500).json({ message: "Şərh silinmədi", error: err.message });
  }
};


exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Bildirişlər alınmadı", error: err.message });
  }
};

exports.changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "İstifadəçi tapılmadı" });

    user.isAdmin = isAdmin;
    await user.save();

    res.status(200).json({ message: `İstifadəçinin rolu uğurla dəyişdirildi: ${isAdmin ? 'Admin' : 'İstifadəçi'}` });
  } catch (err) {
    res.status(500).json({ message: "Rol dəyişdirilmədi", error: err.message });
  }
};

