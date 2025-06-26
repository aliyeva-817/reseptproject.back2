const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Qeydlər alınmadı' });
  }
};

exports.addNote = async (req, res) => {
  try {
    const note = new Note({ user: req.userId, text: req.body.text });
    const saved = await note.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Əlavə edilmədi' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { text: req.body.text },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Dəyişdirilmədi' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ message: 'Silinmədi' });
  }
};
