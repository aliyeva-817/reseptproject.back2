const Recipe = require('../models/Recipe');

exports.createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !ingredients || !instructions || !image) {
      return res.status(400).json({ message: 'Bütün sahələr doldurulmalıdır' });
    }

    const newRecipe = await Recipe.create({
      title,
      ingredients: ingredients.split(',').map(i => i.trim()),
      instructions,
      image,
      user: req.userId
    });

    res.status(201).json({ message: 'Recipe yaradıldı', recipe: newRecipe });
  } catch (err) {
    console.error('Resept yaratma xətası:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

exports.searchRecipes = async (req, res) => {
  const { ingredients } = req.query;

  if (!ingredients) {
    return res.status(400).json({ message: 'Ingredient yazılmalıdır' });
  }

  const ingredientArray = ingredients
    .split(',')
    .map((i) => i.trim().toLowerCase());

  try {
    const recipes = await Recipe.find({
      ingredients: { $in: ingredientArray }
    });

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Resept tapılmadı' });
    res.json(recipe);
  } catch (err) {
    console.error('Resept tapılmadı:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};
