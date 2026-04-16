/**
 * ============================================================
 * VIDEOS ROUTES — CRUD API for Video Management
 * ============================================================
 * Endpoints:
 *   GET    /api/playlists/:playlistId/videos           - List videos in a playlist
 *   POST   /api/playlists/:playlistId/videos           - Add video (fetches metadata)
 *   POST   /api/playlists/:playlistId/import-playlist  - Import YouTube playlist
 *   PUT    /api/videos/:id/watched                      - Toggle watched state
 *   DELETE /api/videos/:id                              - Remove a video
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { fetchVideoMetadata, extractPlaylistId, fetchPlaylistVideos } = require('../services/youtube');

// -------------------------------------------------------
// GET /api/playlists/:playlistId/videos — List all videos
// -------------------------------------------------------
router.get('/playlists/:playlistId/videos', (req, res) => {
  const { playlistId } = req.params;

  try {
    const videos = db.prepare(`
      SELECT * FROM videos 
      WHERE playlist_id = ? 
      ORDER BY added_at DESC
    `).all(playlistId);

    res.json(videos);
  } catch (err) {
    console.error('Error fetching videos:', err.message);
    res.status(500).json({ error: 'Failed to fetch videos.' });
  }
});

// -------------------------------------------------------
// POST /api/playlists/:playlistId/videos — Add a video
// Fetches YouTube metadata automatically.
// -------------------------------------------------------
router.post('/playlists/:playlistId/videos', async (req, res) => {
  const { playlistId } = req.params;
  const { youtube_url } = req.body;

  // Validate URL
  if (!youtube_url || !youtube_url.trim()) {
    return res.status(400).json({ error: 'YouTube URL is required.' });
  }

  // Check that the playlist exists
  const playlist = db.prepare('SELECT id FROM playlists WHERE id = ?').get(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found.' });
  }

  try {
    // Fetch metadata from YouTube
    const metadata = await fetchVideoMetadata(youtube_url.trim());

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO videos (playlist_id, youtube_url, title, description, thumbnail_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      playlistId,
      metadata.youtube_url,
      metadata.title,
      metadata.description,
      metadata.thumbnail_url
    );

    // Return the newly created video
    const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(video);
  } catch (err) {
    console.error('Error adding video:', err.message);
    res.status(400).json({ error: err.message || 'Failed to add video.' });
  }
});

// -------------------------------------------------------
// POST /api/playlists/:playlistId/import-playlist
// Import all videos from a YouTube playlist URL.
// -------------------------------------------------------
router.post('/playlists/:playlistId/import-playlist', async (req, res) => {
  const { playlistId } = req.params;
  const { playlist_url } = req.body;

  // Validate URL
  if (!playlist_url || !playlist_url.trim()) {
    return res.status(400).json({ error: 'YouTube playlist URL is required.' });
  }

  // Check that the local playlist exists
  const playlist = db.prepare('SELECT id FROM playlists WHERE id = ?').get(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found.' });
  }

  // Extract the YouTube playlist ID from URL
  const ytPlaylistId = extractPlaylistId(playlist_url.trim());
  if (!ytPlaylistId) {
    return res.status(400).json({ error: 'Invalid YouTube playlist URL. Could not extract playlist ID.' });
  }

  try {
    // Fetch all videos from the YouTube playlist
    const ytVideos = await fetchPlaylistVideos(ytPlaylistId);

    if (ytVideos.length === 0) {
      return res.status(400).json({ error: 'No videos found in this playlist.' });
    }

    // Bulk insert into database
    const stmt = db.prepare(`
      INSERT INTO videos (playlist_id, youtube_url, title, description, thumbnail_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((videos) => {
      let count = 0;
      for (const v of videos) {
        stmt.run(playlistId, v.youtube_url, v.title, v.description, v.thumbnail_url);
        count++;
      }
      return count;
    });

    const insertedCount = insertMany(ytVideos);

    res.status(201).json({
      message: `Successfully imported ${insertedCount} video(s).`,
      count: insertedCount,
    });
  } catch (err) {
    console.error('Error importing playlist:', err.message);
    res.status(400).json({ error: err.message || 'Failed to import playlist.' });
  }
});

// -------------------------------------------------------
// PUT /api/videos/:id/watched — Toggle watched status
// -------------------------------------------------------
router.put('/videos/:id/watched', (req, res) => {
  const { id } = req.params;

  try {
    // Get current state
    const video = db.prepare('SELECT is_watched FROM videos WHERE id = ?').get(id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    // Toggle: 0 → 1 or 1 → 0
    const newState = video.is_watched ? 0 : 1;
    db.prepare('UPDATE videos SET is_watched = ? WHERE id = ?').run(newState, id);

    // Return updated video
    const updated = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    console.error('Error toggling watched:', err.message);
    res.status(500).json({ error: 'Failed to update watched status.' });
  }
});

// -------------------------------------------------------
// DELETE /api/videos/:id — Remove a video
// -------------------------------------------------------
router.delete('/videos/:id', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    res.json({ message: 'Video deleted successfully.' });
  } catch (err) {
    console.error('Error deleting video:', err.message);
    res.status(500).json({ error: 'Failed to delete video.' });
  }
});

module.exports = router;
