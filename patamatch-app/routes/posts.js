const router = require('express').Router();
const { queryAll, queryOne, runQuery } = require('../db/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// GET / — list posts with author info, like counts, optional filtering/sorting
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, sort = 'recent' } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      conditions.push('p.category = ?');
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderClause = sort === 'popular' ? 'ORDER BY like_count DESC' : 'ORDER BY p.created_at DESC';

    const sql = `
      SELECT
        p.*,
        u.name AS author_name,
        u.email AS author_email,
        COUNT(pl.id) AS like_count,
        0 AS comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      ${whereClause}
      GROUP BY p.id
      ${orderClause}
    `;

    const posts = queryAll(sql, params);

    if (req.user) {
      const userLikes = queryAll('SELECT post_id FROM post_likes WHERE user_id = ?', [req.user.id]);
      const likedSet = new Set(userLikes.map(l => l.post_id));
      posts.forEach(post => {
        post.is_liked = likedSet.has(post.id);
      });
    }

    res.json({ success: true, data: posts });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch posts' });
  }
});

// POST / — create post
router.post('/', requireAuth, (req, res) => {
  try {
    const { title, body, category, tags } = req.body;

    if (!title || !body) {
      return res.status(400).json({ success: false, error: 'Title and body are required' });
    }

    const tagsValue = Array.isArray(tags) ? JSON.stringify(tags) : (tags || null);

    const result = runQuery(
      'INSERT INTO posts (title, body, category, tags, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, body, category || null, tagsValue, req.user.id]
    );

    const post = queryOne('SELECT * FROM posts WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// POST /:id/like — toggle like
router.post('/:id/like', requireAuth, (req, res) => {
  try {
    const postId = req.params.id;

    const post = queryOne('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const existingLike = queryOne(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.id]
    );

    let is_liked;
    if (existingLike) {
      runQuery('DELETE FROM post_likes WHERE id = ?', [existingLike.id]);
      is_liked = false;
    } else {
      runQuery('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, req.user.id]);
      is_liked = true;
    }

    const countRow = queryOne('SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id = ?', [postId]);
    res.json({ success: true, data: { like_count: countRow.like_count, is_liked } });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

module.exports = router;
