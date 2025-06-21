const Recipe = require('../models/Recipe');

exports.createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, category, isPremium } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !ingredients || !instructions || !image || !category) {
      return res.status(400).json({ message: 'Bütün sahələr doldurulmalıdır' });
    }

    const instructionSteps = Array.isArray(instructions)
      ? instructions
      : typeof instructions === 'string'
        ? instructions.split('.').map(s => s.trim()).filter(Boolean)
        : [];

    const newRecipe = await Recipe.create({
      title,
      ingredients: ingredients.split(',').map(i => i.trim()),
      instructions: instructionSteps,
      image,
      category,
      isPremium: isPremium === 'true' || isPremium === true, // ✅ Əlavə olundu
      user: req.userId,
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
      ingredients: { $in: ingredientArray },
    });

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Resept tapılmadı' });

    if (typeof recipe.instructions === 'string') {
      recipe = {
        ...recipe.toObject(),
        instructions: recipe.instructions
          .split('.')
          .map(s => s.trim())
          .filter(Boolean),
      };
    }

    res.json(recipe);
  } catch (err) {
    console.error('Resept tapılmadı:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  try {
    const category = req.query.category;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const recipes = await Recipe.find({
      category: { $regex: category, $options: 'i' },
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ error: 'Category-based filter failed' });
  }
};

exports.searchByIngredient = async (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'Ərzaq adı tələb olunur' });
  }

  const terms = ingredient
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(Boolean);

  if (terms.length === 0) {
    return res.status(400).json({ error: 'Ərzaq adı tələb olunur' });
  }

  try {
    const recipes = await Recipe.find();

    const filtered = recipes.filter(recipe => {
      const lowerIngredients = recipe.ingredients.map(i => i.toLowerCase());

      return terms.every(term => {
        if (term.split(' ').length > 1) {
          return lowerIngredients.includes(term);
        } else {
          return lowerIngredients.some(i => {
            const words = i.split(/\s+/);
            return words.includes(term);
          });
        }
      });
    });

    if (filtered.length === 0) {
      return res.status(404).json({ message: 'Uyğun resept tapılmadı.' });
    }

    res.json(filtered);
  } catch (err) {
    console.error('Ingredient ilə axtarış xətası:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};

exports.getPremiumRecipes = async (req, res) => {
  try {
    const premiumRecipes = await Recipe.find({ isPremium: true });
    res.status(200).json(premiumRecipes);
  } catch (err) {
    console.error('Premium reseptlər alınarkən xəta:', err);
    res.status(500).json({ error: 'Premium reseptlər yüklənmədi' });
  }
};

exports.getAllPremiumRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPremium: true });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Premium reseptlər alınmadı' });
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    let recipes = await Recipe.find().sort({ createdAt: -1 });

    recipes = recipes.map(recipe => {
      if (typeof recipe.instructions === 'string') {
        return {
          ...recipe.toObject(),
          instructions: recipe.instructions
            .split('.')
            .map(s => s.trim())
            .filter(Boolean),
        };
      }
      return recipe.toObject();
    });

    res.status(200).json(recipes);
  } catch (err) {
    console.error('Bütün reseptləri yükləmə xətası:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};
