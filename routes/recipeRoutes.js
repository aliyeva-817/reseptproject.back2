const express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const {
  createRecipe,
  searchRecipes,
  getRecipeById,
  getRecipesByCategory,
  getAllRecipes,
} = require('../controllers/recipeController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// 🔓 Bütün reseptlər (Home page üçün)
router.get('/', getAllRecipes);

// 🔐 Ərzaqlara görə axtarış
router.get('/search', verifyToken, searchRecipes);

// 🔐 Kategoriya ilə filtr
router.get('/category/search', verifyToken, getRecipesByCategory);

// 🔐 ID ilə resepti al
router.get('/:id', verifyToken, getRecipeById);

// 🔐 Yeni resept əlavə et (şəkil ilə)
router.post('/', verifyToken, upload.single('image'), createRecipe);

module.exports = router;
