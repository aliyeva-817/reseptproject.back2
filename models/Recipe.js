const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  instructions: {
  type: [String],
  required: true,
},
ingredients: {
  type: [String],
  required: true,
},
isPremium: {
  type: Boolean,
  default: false,
},


  image: String,
  category: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });


module.exports = mongoose.model('Recipe', recipeSchema);
