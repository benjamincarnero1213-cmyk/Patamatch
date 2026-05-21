const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'patamatch-secret-key-2024';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token inválido o expirado' });
  }
}

// Optional auth — sets req.user if token present, but doesn't fail
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (e) { /* ignore */ }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
