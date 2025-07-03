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
  changeUserRole 
} = require("../controllers/adminController");


router.post("/login", adminLogin);


router.get("/stats", verifyToken, isAdmin, getAdminStats);


router.get("/users", verifyToken, isAdmin, getAllUsers);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);
router.put("/users/:id/role", verifyToken, isAdmin, changeUserRole); 


router.get("/recipes", verifyToken, isAdmin, getAllRecipes);
router.delete("/recipes/:id", verifyToken, isAdmin, deleteRecipe);


router.get("/payments", verifyToken, isAdmin, getAllPayments);


router.get("/categories", verifyToken, isAdmin, getAllCategories);
router.post("/categories", verifyToken, isAdmin, addCategory);
router.delete("/categories/:id", verifyToken, isAdmin, deleteCategory);


router.get("/comments", verifyToken, isAdmin, getAllComments);
router.delete("/comments/:id", verifyToken, isAdmin, deleteComment);


router.get("/notifications", verifyToken, isAdmin, getNotifications);

module.exports = router;
