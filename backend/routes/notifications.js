const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET /api/notifications - Get user notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await queryAll(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [req.user.id]);
    
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Verify notification belongs to user
    const notification = await queryOne('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [notificationId, userId]);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await runQuery('UPDATE notifications SET is_read = 1 WHERE id = ?', [notificationId]);

    res.json({ success: true, data: { ...notification, is_read: 1 } });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    await runQuery('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
