const router = require('express').Router();
const { queryAll, queryOne } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET / — list user's carnets
router.get('/', requireAuth, (req, res) => {
  try {
    const carnets = queryAll('SELECT * FROM carnets WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    
    // Parse JSON fields if they are stored as strings
    for (const carnet of carnets) {
      if (carnet.vaccinations && typeof carnet.vaccinations === 'string') {
        try { carnet.vaccinations = JSON.parse(carnet.vaccinations); } catch (_) {}
      }
      if (carnet.medical_history && typeof carnet.medical_history === 'string') {
        try { carnet.medical_history = JSON.parse(carnet.medical_history); } catch (_) {}
      }
    }

    res.json({ success: true, data: carnets });
  } catch (err) {
    console.error('List carnets error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch carnets' });
  }
});

// GET /:id — get carnet detail (public)
router.get('/:id', (req, res) => {
  try {
    const carnet = queryOne('SELECT * FROM carnets WHERE id = ?', [req.params.id]);
    if (!carnet) {
      return res.status(404).json({ success: false, error: 'Carnet not found' });
    }

    // Parse JSON fields if they are stored as strings
    if (carnet.vaccinations && typeof carnet.vaccinations === 'string') {
      try { carnet.vaccinations = JSON.parse(carnet.vaccinations); } catch (_) {}
    }
    if (carnet.medical_history && typeof carnet.medical_history === 'string') {
      try { carnet.medical_history = JSON.parse(carnet.medical_history); } catch (_) {}
    }

    res.json({ success: true, data: carnet });
  } catch (err) {
    console.error('Get carnet error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch carnet' });
  }
});

module.exports = router;
