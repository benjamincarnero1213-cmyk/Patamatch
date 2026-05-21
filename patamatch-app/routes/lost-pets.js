const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET / — list lost pets (not yet found)
router.get('/', (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const pets = queryAll(
      'SELECT * FROM lost_pets WHERE is_found = 0 ORDER BY created_at DESC LIMIT ?',
      [Number(limit)]
    );

    res.json({ success: true, data: pets });
  } catch (err) {
    console.error('List lost pets error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch lost pets' });
  }
});

// POST / — report a lost pet
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, breed, location, description } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, error: 'Name and location are required' });
    }

    const result = runQuery(
      'INSERT INTO lost_pets (name, breed, location, description, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, breed || null, location, description || null, req.user.id]
    );

    const lostPet = queryOne('SELECT * FROM lost_pets WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: lostPet });
  } catch (err) {
    console.error('Report lost pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to report lost pet' });
  }
});

// PUT /:id/found — mark lost pet as found
router.put('/:id/found', requireAuth, (req, res) => {
  try {
    const pet = queryOne('SELECT * FROM lost_pets WHERE id = ?', [req.params.id]);
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Lost pet report not found' });
    }

    runQuery('UPDATE lost_pets SET is_found = 1 WHERE id = ?', [req.params.id]);

    const updated = queryOne('SELECT * FROM lost_pets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Mark found error:', err);
    res.status(500).json({ success: false, error: 'Failed to update lost pet status' });
  }
});

module.exports = router;
