const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET / — list approved stories
router.get('/', (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const stories = queryAll(
      'SELECT * FROM stories WHERE is_approved = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );

    res.json({ success: true, data: stories });
  } catch (err) {
    console.error('List stories error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stories' });
  }
});

// POST / — submit a story (pending approval)
router.post('/', requireAuth, (req, res) => {
  try {
    const { pet_name, author_name, title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and body are required' });
    }

    const result = runQuery(
      'INSERT INTO stories (pet_name, author_name, title, body, is_approved, user_id) VALUES (?, ?, ?, ?, 0, ?)',
      [pet_name || null, author_name || null, title, body, req.user.id]
    );

    const story = queryOne('SELECT * FROM stories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: story });
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit story' });
  }
});

module.exports = router;
