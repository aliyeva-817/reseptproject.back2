const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const commentController = require('../controllers/commentController');

router.post('/', verifyToken, commentController.addComment);
router.get('/:recipeId', commentController.getCommentsByRecipe);
router.patch('/:id/like', verifyToken, commentController.toggleLike);
router.delete('/:id', verifyToken, commentController.deleteComment);
router.post('/:id/reply', verifyToken, commentController.replyToComment);

module.exports = router;
