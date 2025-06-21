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
} = require('../controllers/recipeController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Bütün reseptlər
router.get('/', getAllRecipes);

// Ingredient ilə axtarış (JWT olmadan)
router.get('/search', searchByIngredient);

// Kategoriya ilə filtr
router.get('/category/search', verifyToken, getRecipesByCategory);

// Yeni resept əlavə et
router.post('/', verifyToken, upload.single('image'), createRecipe);

// Resepti ID ilə al
router.get('/:id', verifyToken, getRecipeById);

module.exports = router;
