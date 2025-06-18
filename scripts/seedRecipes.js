require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const recipes = require('../data/recipesSeed');
const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  await Recipe.deleteMany(); // varsa silmək istəyirsənsə
  await Recipe.insertMany(recipes);
  console.log("Hazır reseptlər bazaya əlavə olundu!");
  process.exit();
};

seed();
