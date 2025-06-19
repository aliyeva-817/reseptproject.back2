const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  ingredients: [{ type: String, required: true }],
  instructions: [{ type: String, required: true }],  // ✅ Addım-addım
  category: {
  type: String,
  required: true
},
                        // ✅ Kateqoriya
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

module.exports = mongoose.model('Recipe', recipeSchema);
