const Recipe = require('../models/Recipe');
const User = require('../models/User');

// ✅ Yarat
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

    const user = await User.findById(req.userId);
    const isAdminRecipe = user?.isAdmin === true;

    const newRecipe = await Recipe.create({
      title,
      ingredients: ingredients.split(',').map(i => i.trim()),
      instructions: instructionSteps,
      image,
      category,
      isPremium: isPremium === 'true' || isPremium === true,
      user: req.userId,
      addedByAdmin: isAdminRecipe, // ✅ əlavə edildi
    });

    res.status(201).json({ message: 'Recipe yaradıldı', recipe: newRecipe });
  } catch (err) {
    console.error('Resept yaratma xətası:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

// ✅ Ingredient ilə sadə axtarış
exports.searchRecipes = async (req, res) => {
  const { ingredients } = req.query;

  if (!ingredients) {
    return res.status(400).json({ message: 'Ingredient yazılmalıdır' });
  }

  const ingredientArray = ingredients.split(',').map(i => i.trim().toLowerCase());

  try {
    const recipes = await Recipe.find({
      ingredients: { $in: ingredientArray },
    }).populate('user', 'username isAdmin');

    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

// ✅ Detala görə resept
exports.getRecipeById = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).populate('user', 'username isAdmin');
    if (!recipe) return res.status(404).json({ message: 'Resept tapılmadı' });

    if (typeof recipe.instructions === 'string') {
      recipe = {
        ...recipe.toObject(),
        instructions: recipe.instructions.split('.').map(s => s.trim()).filter(Boolean),
      };
    }

    res.json(recipe);
  } catch (err) {
    console.error('Resept tapılmadı:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

// ✅ Kateqoriyaya görə reseptlər
exports.getRecipesByCategory = async (req, res) => {
  try {
    const category = req.query.category;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const recipes = await Recipe.find({
      category: { $regex: category, $options: 'i' },
    }).populate('user', 'username isAdmin');

    res.status(200).json(recipes);
  } catch (error) {
    console.error('Filter error:', error);
    res.status(500).json({ error: 'Category-based filter failed' });
  }
};

// ✅ Ətraflı ingredient axtarışı
// ✅ Ətraflı ingredient axtarışı (dəqiqləşdirilmiş və tolerant versiya)
exports.searchByIngredient = async (req, res) => {
  const { ingredient } = req.query;
  if (!ingredient) {
    return res.status(400).json({ error: 'Ərzaq adı tələb olunur' });
  }

  const normalize = str =>
    str
      .toLowerCase()
      .replace(/ə/g, 'e')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g');

  const searchTerms = ingredient
    .split(',')
    .map(i => normalize(i.trim()))
    .filter(Boolean);

  try {
    const allRecipes = await Recipe.find().populate('user', 'username isAdmin');

    const matched = allRecipes.filter(recipe => {
      const normalizedIngredients = recipe.ingredients.map(i => normalize(i));

      return searchTerms.every(term =>
        normalizedIngredients.some(ing =>
          ing.includes(term) || ing.split(/\s+/).includes(term)
        )
      );
    });

    if (matched.length === 0) {
      return res.status(404).json({ message: 'Uyğun resept tapılmadı.' });
    }

    res.json(matched);
  } catch (err) {
    console.error('Axtarış xətası:', err);
    res.status(500).json({ error: 'Server xətası' });
  }
};


// ✅ Premium reseptlər
exports.getPremiumRecipes = async (req, res) => {
  try {
    const premiumRecipes = await Recipe.find({ isPremium: true }).populate('user', 'username isAdmin');
    res.status(200).json(premiumRecipes);
  } catch (err) {
    console.error('Premium reseptlər alınarkən xəta:', err);
    res.status(500).json({ error: 'Premium reseptlər yüklənmədi' });
  }
};

exports.getAllPremiumRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPremium: true }).populate('user', 'username isAdmin');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Premium reseptlər alınmadı' });
  }
};

// ✅ Bütün reseptlər
exports.getAllRecipes = async (req, res) => {
  try {
    let recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username isAdmin');

    recipes = recipes.map(recipe => {
      if (typeof recipe.instructions === 'string') {
        return {
          ...recipe.toObject(),
          instructions: recipe.instructions.split('.').map(s => s.trim()).filter(Boolean),
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
// 🔒 Auth ilə yalnız login olmuş istifadəçinin reseptləri
exports.getMyRecipes = async (req, res) => {
  try {
    const myRecipes = await Recipe.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(myRecipes);
  } catch (err) {
    console.error('Mənim reseptlərimi alarkən xəta:', err);
    res.status(500).json({ message: 'Server xətası' });
  }
};

