const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload');
const Recipe = require('../models/Recipe');

// ✅ Resept yarat
router.post('/', verifyToken, upload.single('image'), recipeController.createRecipe);

// ✅ Axtarış (ingredient ilə)
router.get('/search', verifyToken, recipeController.searchRecipes);

// ✅ Ingredient filtrinə görə reseptlər
router.get('/', async (req, res) => {
  const { ingredient } = req.query;
  let filter = {};

  if (ingredient) {
    const ingredientsArray = ingredient.split(',').map(i => i.trim());
    filter = { ingredients: { $all: ingredientsArray } };
  }

  try {
    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xətası' });
  }
});

// ✅ Yeni: Kategoriya ilə filter
router.get('/category/search', async (req, res) => {
  try {
    const category = req.query.category;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const recipes = await Recipe.find({
      category: { $regex: category, $options: 'i' }
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ error: 'Category-based filter failed' });
  }
});

// ✅ Resept ID ilə
router.get('/:id', recipeController.getRecipeById);

module.exports = router;
