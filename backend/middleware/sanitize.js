// Simple HTML sanitizer to prevent XSS attacks
// Escapes dangerous characters in user-submitted text
function sanitizeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize an object's string values (shallow, one level)
function sanitizeObject(obj, keys) {
  const sanitized = { ...obj };
  for (const key of keys) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeHTML(sanitized[key]);
    }
  }
  return sanitized;
}

module.exports = { sanitizeHTML, sanitizeObject };
