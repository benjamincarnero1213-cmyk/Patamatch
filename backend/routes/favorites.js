const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET / — list user's favorite pet IDs
router.get('/', requireAuth, async (req, res) => {
  try {
    const favorites = await queryAll('SELECT pet_id FROM favorites WHERE user_id = ?', [req.user.id]);
    const petIds = favorites.map(f => f.pet_id);

    res.json({ success: true, data: petIds });
  } catch (err) {
    console.error('List favorites error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
});

// POST /:petId — toggle favorite
router.post('/:petId', requireAuth, async (req, res) => {
  try {
    const petId = req.params.petId;

    const existing = await queryOne(
      'SELECT id FROM favorites WHERE user_id = ? AND pet_id = ?',
      [req.user.id, petId]
    );

    let is_favorite;
    if (existing) {
      await runQuery('DELETE FROM favorites WHERE id = ?', [existing.id]);
      is_favorite = false;
    } else {
      await runQuery('INSERT INTO favorites (user_id, pet_id) VALUES (?, ?)', [req.user.id, petId]);
      is_favorite = true;
    }

    res.json({ success: true, data: { is_favorite } });
  } catch (err) {
    console.error('Toggle favorite error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle favorite' });
  }
});

module.exports = router;
