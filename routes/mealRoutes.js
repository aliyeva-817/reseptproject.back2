const express = require('express');
const router = express.Router();
const { addMeal, getMeals, updateMeal, deleteMeal } = require('../controllers/mealController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, addMeal);
router.get('/', verifyToken, getMeals);
router.put('/:id', verifyToken, updateMeal);
router.delete('/:id', verifyToken, deleteMeal);

module.exports = router;
