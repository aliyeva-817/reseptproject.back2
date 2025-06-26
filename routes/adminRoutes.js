const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const isAdmin = require("../middlewares/isAdmin");

const {
  adminLogin,
  getAdminStats,
  getAllUsers,
  deleteUser,
  getAllRecipes,
  deleteRecipe,
  getAllPayments,
  getAllCategories,
  addCategory,
  deleteCategory,
  getAllComments,
  deleteComment,
  getNotifications,
  changeUserRole // ✅ Əlavə olundu
} = require("../controllers/adminController");

// 🔐 Admin giriş
router.post("/login", adminLogin);

// 📊 Dashboard statistikaları
router.get("/stats", verifyToken, isAdmin, getAdminStats);

// 👥 İstifadəçilər
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
router.put("/users/:id/role", verifyToken, isAdmin, changeUserRole); // ✅ Rol dəyiş route

// 📦 Reseptlər
router.get("/recipes", verifyToken, isAdmin, getAllRecipes);
router.delete("/recipes/:id", verifyToken, isAdmin, deleteRecipe);

// 💰 Ödənişlər
router.get("/payments", verifyToken, isAdmin, getAllPayments);

// 📂 Kateqoriyalar
router.get("/categories", verifyToken, isAdmin, getAllCategories);
router.post("/categories", verifyToken, isAdmin, addCategory);
router.delete("/categories/:id", verifyToken, isAdmin, deleteCategory);

// 💬 Şərhlər
router.get("/comments", verifyToken, isAdmin, getAllComments);
router.delete("/comments/:id", verifyToken, isAdmin, deleteComment);

// 🔔 Bildirişlər
router.get("/notifications", verifyToken, isAdmin, getNotifications);

module.exports = router;
