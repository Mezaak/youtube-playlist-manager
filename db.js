/**
 * ============================================================
 * DATABASE MODULE — SQLite Connection & Table Initialization
 * ============================================================
 * Uses better-sqlite3 for synchronous, fast SQLite operations.
 * Creates 'playlists' and 'videos' tables if they don't exist.
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file lives in the project root
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Open (or create) the database
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Enable foreign key enforcement (OFF by default in SQLite)
db.pragma('foreign_keys = ON');

/**
 * Initialize the database tables.
 * Called once on server startup.
 */
function initializeDatabase() {
  // ------- PLAYLISTS TABLE -------
  db.exec(`
    CREATE TABLE IF NOT EXISTS playlists (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ------- VIDEOS TABLE -------
  db.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id   INTEGER NOT NULL,
      youtube_url   TEXT NOT NULL,
      title         TEXT,
      description   TEXT,
      thumbnail_url TEXT,
      is_watched    INTEGER DEFAULT 0,
      added_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database initialized successfully.');
}

module.exports = { db, initializeDatabase };
