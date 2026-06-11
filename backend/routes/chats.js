const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

// GET /api/chats - Get all chats for the logged in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    // Get chats where user is either adopter or owner
    const chats = await queryAll(`
      SELECT c.*, 
             p.name as pet_name, p.image_url as pet_image,
             u_adopter.name as adopter_name, u_adopter.avatar_url as adopter_avatar,
             u_owner.name as owner_name, u_owner.avatar_url as owner_avatar
      FROM chats c
      JOIN pets p ON c.pet_id = p.id
      JOIN users u_adopter ON c.adopter_id = u_adopter.id
      JOIN users u_owner ON c.owner_id = u_owner.id
      WHERE c.adopter_id = ? OR c.owner_id = ?
      ORDER BY c.created_at DESC
    `, [userId, userId]);
    
    // Include the latest message for preview
    for (let chat of chats) {
      const latestMsg = await queryOne('SELECT body, created_at FROM messages WHERE chat_id = ? ORDER BY created_at DESC LIMIT 1', [chat.id]);
      chat.latest_message = latestMsg ? latestMsg.body : 'Sin mensajes aún';
      chat.updated_at = latestMsg ? latestMsg.created_at : chat.created_at;
      
      // Compute the 'other_user' info for the frontend
      if (chat.adopter_id === userId) {
        chat.other_user = { id: chat.owner_id, name: chat.owner_name, avatar: chat.owner_avatar };
      } else {
        chat.other_user = { id: chat.adopter_id, name: chat.adopter_name, avatar: chat.adopter_avatar };
      }
    }

    res.json({ success: true, data: chats });
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch chats' });
  }
});

// GET /api/chats/:id/messages - Get messages for a specific chat
router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Verify chat exists and user is part of it
    const chat = await queryOne('SELECT * FROM chats WHERE id = ?', [chatId]);
    if (!chat) return res.status(404).json({ success: false, error: 'Chat not found' });
    if (chat.adopter_id !== userId && chat.owner_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const messages = await queryAll(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC
    `, [chatId]);

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// POST /api/chats/:id/messages - Send a message
router.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, error: 'Message body is required' });
    }

    // Verify chat exists and user is part of it
    const chat = await queryOne('SELECT * FROM chats WHERE id = ?', [chatId]);
    if (!chat) return res.status(404).json({ success: false, error: 'Chat not found' });
    if (chat.adopter_id !== userId && chat.owner_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Insert message
    const result = await runQuery(
      'INSERT INTO messages (chat_id, sender_id, body) VALUES (?, ?, ?)',
      [chatId, userId, body.trim()]
    );
    
    const message = await queryOne(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.id = ?
    `, [result.lastInsertRowid]);

    // Create notification for the other user
    const otherUserId = (chat.adopter_id === userId) ? chat.owner_id : chat.adopter_id;
    const notificationText = `Nuevo mensaje de ${req.user.name}`;
    await runQuery(
      'INSERT INTO notifications (user_id, type, related_id, text) VALUES (?, ?, ?, ?)',
      [otherUserId, 'new_message', chatId, notificationText]
    );

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

module.exports = router;
