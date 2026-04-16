/**
 * ============================================================
 * SERVER — YouTube Playlist Manager
 * ============================================================
 * Express server that:
 *   1. Serves the static frontend from /public
 *   2. Provides REST API endpoints for playlists & videos
 *   3. Initializes the SQLite database on startup
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db');

// Import route modules
const playlistRoutes = require('./routes/playlists');
const videoRoutes = require('./routes/videos');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------
// MIDDLEWARE
// -------------------------------------------------------
app.use(cors());                                    // Allow cross-origin requests
app.use(express.json());                            // Parse JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static frontend files

// -------------------------------------------------------
// API ROUTES
// -------------------------------------------------------
app.use('/api/playlists', playlistRoutes);  // Playlist CRUD
app.use('/api', videoRoutes);               // Video CRUD (mixed paths)

// -------------------------------------------------------
// CATCH-ALL — Serve index.html for any non-API route
// -------------------------------------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
initializeDatabase(); // Create tables if they don't exist

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🎬 YouTube Playlist Manager is running!       ║
  ║   🌐 http://localhost:${PORT}                      ║
  ╚══════════════════════════════════════════════════╝
  `);
});
