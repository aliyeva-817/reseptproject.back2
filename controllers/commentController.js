const Comment = require('../models/Comment');

exports.addComment = async (req, res) => {
  try {
    const { recipeId, text } = req.body;
    if (!recipeId || !text) return res.status(400).json({ error: 'Zəhmət olmasa bütün sahələri doldurun' });

    const comment = new Comment({
      recipe: recipeId,
      user: req.userId,
      content: text,
    });

    await comment.save();
    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error('Şərh əlavə xətası:', err);
    res.status(500).json({ error: 'Şərh əlavə olunmadı' });
  }
};

exports.getCommentsByRecipe = async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate('user', 'name')
      .populate('replies.user', 'name')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Şərhlər gətirilmədi:', err);
    res.status(500).json({ error: 'Şərhlər alınmadı' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Şərh tapılmadı' });

    const userId = req.userId;
    const liked = comment.likes.includes(userId);

    if (liked) {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ likes: comment.likes.length });
  } catch (err) {
    console.error('Like toggle xətası:', err);
    res.status(500).json({ error: 'Like dəyişdirilə bilmədi' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Şərh tapılmadı' });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Silməyə icazəniz yoxdur' });
    }

    await comment.remove();
    res.json({ message: 'Şərh silindi' });
  } catch (err) {
    console.error('Silinmə xətası:', err);
    res.status(500).json({ error: 'Şərh silinmədi' });
  }
};

exports.replyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Şərh tapılmadı' });

    comment.replies.push({
      user: req.userId,
      content: text,
    });

    await comment.save();
    const updatedComment = await Comment.findById(comment._id).populate('replies.user', 'name');
    res.status(201).json(updatedComment);
  } catch (err) {
    console.error('Reply əlavə olunmadı:', err);
    res.status(500).json({ error: 'Reply əlavə olunmadı' });
  }
};
