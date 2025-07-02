const express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const {
  createRecipe,
  searchByIngredient,
  getRecipeById,
  getRecipesByCategory,
  deleteRecipe,
  getAllRecipes,
  getPremiumRecipes,
  getMyRecipes,
  getAllPremiumRecipes
} = require('../controllers/recipeController');


const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// ✅ Bütün reseptlər (hamıya açıq)
router.get('/', getAllRecipes);
router.delete('/:id', verifyToken, deleteRecipe);

// ✅ Ətraflı ingredient axtarışı (hamıya açıq)
router.get('/search', searchByIngredient);

// ✅ Kategoriya ilə axtarış (hamıya açıq)
router.get('/category/search', getRecipesByCategory);

// ✅ Premium reseptlər (hamıya açıq)
router.get('/premium', getPremiumRecipes);

// ✅ Bütün premium reseptlər (admin və s. üçün ayrıca route varsa istifadə edilə bilər)
router.get('/premium/all', getAllPremiumRecipes);

// ✅ İstifadəçinin öz reseptləri (yalnız login olan)
router.get('/my', verifyToken, getMyRecipes);

// ✅ Yeni resept əlavə et
router.post('/', verifyToken, upload.single('image'), createRecipe);

// ✅ ID ilə resept al (hamıya açıq)
router.get('/:id', getRecipeById);

module.exports = router;
