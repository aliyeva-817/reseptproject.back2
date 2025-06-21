const express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const {
  createRecipe,
  searchRecipes,
  getRecipeById,
  getRecipesByCategory,
  searchByIngredient,
  getAllRecipes,
  getPremiumRecipes,
  getAllPremiumRecipes // ✅ Əlavə
} = require('../controllers/recipeController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ✅ Bütün reseptlər (hamıya açıq)
router.get('/', getAllRecipes);

// ✅ Ingredient ilə axtarış (hamıya açıq)
router.get('/search', searchByIngredient);

// ✅ Kategoriya ilə axtarış (hamıya açıq)
router.get('/category/search', getRecipesByCategory);

// ✅ Premium reseptlər (hamıya açıq)
router.get('/premium', getPremiumRecipes);

// ✅ Yeni resept əlavə et (yalnız daxil olmuş istifadəçilər üçün)
router.post('/', verifyToken, upload.single('image'), createRecipe);

// ✅ Resepti ID ilə al (hamıya açıq)
router.get('/:id', getRecipeById);
router.get('/premium', getAllPremiumRecipes);

module.exports = router;
