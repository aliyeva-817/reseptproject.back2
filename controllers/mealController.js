const Meal = require('../models/Meal');

exports.addMeal = async (req, res) => {
  try {
    const { day, mealType, content } = req.body;
    const meal = new Meal({ user: req.userId, day, mealType, content });
    const saved = await meal.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Əlavə edilmədi' });
  }
};

exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.userId });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: 'Yüklənmədi' });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const updated = await Meal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { content: req.body.content },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Yenilənmədi' });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    await Meal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmədi' });
  }
};
