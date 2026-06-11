const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// GET / — list pets with optional filters
router.get('/', optionalAuth, async (req, res) => {
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

    const pets = await queryAll(sql, params);

    if (req.user) {
      const favorites = await queryAll('SELECT pet_id FROM favorites WHERE user_id = ?', [req.user.id]);
      const favSet = new Set(favorites.map(f => f.pet_id));
      for (let pet of pets) {
        pet.isFavorite = favSet.has(pet.id);
      }
    }

    res.json({ success: true, data: pets });
  } catch (err) {
    console.error('List pets error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch pets' });
  }
});

// GET /:id — single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await queryOne('SELECT * FROM pets WHERE id = ?', [req.params.id]);
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
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, species, breed, age, size, location, image_url, description } = req.body;

    if (!name || !species) {
      return res.status(400).json({ success: false, error: 'Name and species are required' });
    }

    const result = await runQuery(
      `INSERT INTO pets (name, species, breed, age, size, location, image_url, description, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, species, breed || null, age || null, size || null, location || null, image_url || null, description || null, req.user.id]
    );

    const pet = await queryOne('SELECT * FROM pets WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: pet });
  } catch (err) {
    console.error('Create pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to create pet' });
  }
});

// POST /:id/adopt — create adoption request / chat
router.post('/:id/adopt', requireAuth, async (req, res) => {
  try {
    const petId = req.params.id;
    const adopterId = req.user.id;
    const pet = await queryOne('SELECT * FROM pets WHERE id = ?', [petId]);
    
    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    if (pet.user_id === adopterId) {
      return res.status(400).json({ success: false, error: 'No puedes adoptar tu propia mascota' });
    }

    // Check if chat already exists
    let chat = await queryOne('SELECT * FROM chats WHERE pet_id = ? AND adopter_id = ?', [petId, adopterId]);
    
    if (!chat) {
      const result = await runQuery(
        'INSERT INTO chats (pet_id, adopter_id, owner_id) VALUES (?, ?, ?)',
        [petId, adopterId, pet.user_id]
      );
      chat = await queryOne('SELECT * FROM chats WHERE id = ?', [result.lastInsertRowid]);
      
      // Create notification for owner
      const text = `${req.user.name} quiere adoptar a ${pet.name}. ¡Abre el chat para conversar!`;
      await runQuery(
        'INSERT INTO notifications (user_id, type, related_id, text) VALUES (?, ?, ?, ?)',
        [pet.user_id, 'adoption_request', chat.id, text]
      );
    }

    res.json({ success: true, data: { message: '¡Solicitud enviada! Revisa tus chats.', chat_id: chat.id } });
  } catch (err) {
    console.error('Adopt pet error:', err);
    res.status(500).json({ success: false, error: 'Failed to process adoption request' });
  }
});

module.exports = router;
