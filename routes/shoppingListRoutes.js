const express = require('express');
const router = express.Router();
const {
  getNotes,
  addNote,
  updateNote,
  deleteNote
} = require('../controllers/shoppingListController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, getNotes);
router.post('/', verifyToken, addNote);
router.put('/:id', verifyToken, updateNote);
router.delete('/:id', verifyToken, deleteNote);

module.exports = router;
