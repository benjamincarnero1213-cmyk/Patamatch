const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'js', 'css'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Initialize DB then start server
async function start() {
  await initDatabase();
  console.log('📦 Database initialized');

  // API Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/pets', require('./routes/pets'));
  app.use('/api/lost-pets', require('./routes/lost-pets'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/stories', require('./routes/stories'));
  app.use('/api/favorites', require('./routes/favorites'));
  app.use('/api/carnets', require('./routes/carnets'));

  // SPA fallback — serve index.html for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  });

  app.listen(PORT, () => {
    console.log(`\n🐾 PataMatch server running at http://localhost:${PORT}\n`);
    console.log('   Demo accounts:');
    console.log('   📧 sarah@patamatch.com / demo123');
    console.log('   📧 david@patamatch.com / demo123');
    console.log('   📧 demo@patamatch.com  / demo123\n');
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
