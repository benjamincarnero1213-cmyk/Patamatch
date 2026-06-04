const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// GET / — list pets with optional filters
router.get('/', optionalAuth, (req, res) => {
  try {
    const { species, size, age, is_adopted, limit = 20, offset = 0 } = req.query;
    const conditions = [];
    const params = [];

    if (species) {
      conditions.push('p.species = ?');
      params.push(species);
    }
    if (size) {
      conditions.push('p.size = ?');
      params.push(size);
    }
    if (age) {
      conditions.push('p.age = ?');
      params.push(age);
    }
    if (is_adopted !== undefined) {
      conditions.push('p.is_adopted = ?');
      params.push(Number(is_adopted));
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT p.* FROM pets p ${whereClause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const pets = queryAll(sql, params);

    if (req.user) {
      const favorites = queryAll('SELECT pet_id FROM favorites WHERE user_id = ?', [req.user.id]);
      const favSet = new Set(favorites.map(f => f.pet_id));
      pets.forEach(pet => {
        pet.isFavorite = favSet.has(pet.id);
      });
    }

    res.json({ success: true, data: pets });
  } catch (err) {
    console.error('List pets error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pets' });
  }
});

// GET /:id — single pet
router.get('/:id', (req, res) => {
  try {
    const pet = queryOne('SELECT * FROM pets WHERE id = ?', [req.params.id]);
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    res.json({ success: true, data: pet });
  } catch (err) {
    console.error('Get pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pet' });
  }
});

// POST / — create pet
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, species, breed, age, size, location, image_url, description } = req.body;

    if (!name || !species) {
      return res.status(400).json({ success: false, error: 'Name and species are required' });
    }

    const result = runQuery(
      `INSERT INTO pets (name, species, breed, age, size, location, image_url, description, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, species, breed || null, age || null, size || null, location || null, image_url || null, description || null, req.user.id]
    );

    const pet = queryOne('SELECT * FROM pets WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: pet });
  } catch (err) {
    console.error('Create pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to create pet' });
  }
});

// POST /:id/adopt — simulate adoption
router.post('/:id/adopt', requireAuth, (req, res) => {
  try {
    const pet = queryOne('SELECT * FROM pets WHERE id = ?', [req.params.id]);
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    res.json({ success: true, data: { message: 'Adoption request submitted successfully! We will contact you soon.' } });
  } catch (err) {
    console.error('Adopt pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to process adoption request' });
  }
});

module.exports = router;
