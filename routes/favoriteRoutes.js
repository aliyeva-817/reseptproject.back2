const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, favoriteController.addFavorite);
router.get('/', verifyToken, favoriteController.getFavorites);
router.delete('/:recipeId', verifyToken, favoriteController.removeFavorite);

module.exports = router;
