/**
 * ============================================================
 * PLAYLISTS ROUTES — CRUD API for Playlist Management
 * ============================================================
 * Endpoints:
 *   GET    /api/playlists       - List all playlists
 *   POST   /api/playlists       - Create a new playlist
 *   PUT    /api/playlists/:id   - Rename a playlist
 *   DELETE /api/playlists/:id   - Delete playlist + cascade videos
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db');

// -------------------------------------------------------
// GET /api/playlists — Retrieve all playlists
// -------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const playlists = db.prepare(`
      SELECT p.*, 
             COUNT(v.id) as video_count,
             SUM(CASE WHEN v.is_watched = 1 THEN 1 ELSE 0 END) as watched_count
      FROM playlists p
      LEFT JOIN videos v ON v.playlist_id = p.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all();

    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err.message);
    res.status(500).json({ error: 'Failed to fetch playlists.' });
  }
});

// -------------------------------------------------------
// POST /api/playlists — Create a new playlist
// -------------------------------------------------------
router.post('/', (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name is required.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO playlists (name) VALUES (?)');
    const result = stmt.run(name.trim());

    // Return the newly created playlist
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(playlist);
  } catch (err) {
    console.error('Error creating playlist:', err.message);
    res.status(500).json({ error: 'Failed to create playlist.' });
  }
});

// -------------------------------------------------------
// PUT /api/playlists/:id — Rename a playlist
// -------------------------------------------------------
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name is required.' });
  }

  try {
    const stmt = db.prepare('UPDATE playlists SET name = ? WHERE id = ?');
    const result = stmt.run(name.trim(), id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
    res.json(playlist);
  } catch (err) {
    console.error('Error updating playlist:', err.message);
    res.status(500).json({ error: 'Failed to update playlist.' });
  }
});

// -------------------------------------------------------
// DELETE /api/playlists/:id — Delete a playlist (cascades)
// -------------------------------------------------------
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM playlists WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    res.json({ message: 'Playlist deleted successfully.' });
  } catch (err) {
    console.error('Error deleting playlist:', err.message);
    res.status(500).json({ error: 'Failed to delete playlist.' });
  }
});

module.exports = router;
