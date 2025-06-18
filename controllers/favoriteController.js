const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    const { recipeId } = req.body;

    // Debug: yoxla userId və recipeId gəlirmi
    console.log('userId:', req.userId);
    console.log('recipeId:', recipeId);

    if (!req.userId || !recipeId) {
      return res.status(400).json({ error: 'İstifadəçi və ya resept ID-si mövcud deyil' });
    }

    const existing = await Favorite.findOne({ user: req.userId, recipe: recipeId });
    if (existing) return res.status(400).json({ message: 'Already in favorites' });

    const fav = await Favorite.create({ user: req.userId, recipe: recipeId });

    res.status(201).json(fav);
  } catch (err) {
    console.error('Favorit əlavə edilərkən xəta:', err); // Əsas error log
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};


exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId }).populate('recipe');
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ user: req.userId, recipe: req.params.recipeId });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};
