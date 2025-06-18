const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  image: String,
  ingredients: [String],
  instructions: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
