const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const Recipe = require('../models/Recipe');

// Resept yarat
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);

// Axtarış
router.get('/search', verifyToken, recipeController.searchRecipes);

// Ingredient filtrinə görə reseptlər
router.get('/', async (req, res) => {
  const { ingredient } = req.query;

  let filter = {};

  if (ingredient) {
    const ingredientsArray = ingredient.split(',').map(i => i.trim());
    filter = {
      ingredients: { $all: ingredientsArray }
    };
  }

  try {
    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xətası' });
  }
});

// ✅ Yeni əlavə: ID-yə görə resept detalı
router.get('/:id', recipeController.getRecipeById);

module.exports = router;
