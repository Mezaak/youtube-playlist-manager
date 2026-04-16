# Project Rules & Specifications: YouTube Playlist Manager

## 1. Project Overview
Build a lightweight, highly responsive Web Application for creating and managing custom YouTube playlists. The app must allow users to create playlists, add/remove YouTube videos, mark videos as "watched" (like a checklist), and dynamically fetch and display video metadata (thumbnails, titles, descriptions).

## 2. Tech Stack
* **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (No frontend frameworks like React or Vue).
* **Styling:** Tailwind CSS (via CDN or simple CLI build).
* **Icons & Typography:** FontAwesome (via CDN) and Google Fonts.
* **Animations:** Anime.js (for smooth UI transitions, adding/removing items, marking as watched).
* **Backend:** Lightweight Node.js with Express.js (to serve the frontend and provide API endpoints).
* **Database:** SQLite (using `sqlite3` or `better-sqlite3` package).

## 3. Core Features & Requirements

### 3.1. Playlist Management
* **Create:** User can create a new playlist by providing a name.
* **Edit:** User can rename an existing playlist.
* **Delete:** User can delete a playlist (which cascades and deletes all videos inside it).
* **View:** Clicking a playlist loads its contained videos.

### 3.2. Video Management
* **Add Video:** User pastes a valid YouTube URL into an input field to add it to the active playlist.
* **Dynamic Metadata (CRITICAL):** When a video is added via URL, the system MUST fetch the video's details (Thumbnail image, Title, Description) using the YouTube Data API v3 (or a fallback oEmbed method).
* **Display:** Each video card in the playlist must cleanly display:
    * The fetched Thumbnail.
    * The fetched Video Title.
    * A truncated version of the Description.
    * The clickable original YouTube URL.
* **Checklist Functionality:** Every video must have a "Mark as Watched" checkbox/toggle. When checked, the UI should visually reflect this (e.g., lower opacity, strikethrough title) using an Anime.js animation, and the state must be saved to the SQLite database.
* **Delete Video:** User can remove a video from the playlist.

## 4. UI/UX & Animation Guidelines
* **Design:** Clean, modern, and dark-mode friendly using Tailwind CSS.
* **Typography:** Choose a modern sans-serif Google Font (e.g., Inter or Roboto). Use FontAwesome for icons (trash cans, edit pens, checkmarks, play buttons).
* **Animations (Anime.js):**
    * Fade-in and stagger effects when a playlist or list of videos loads.
    * Smooth slide-out/fade-out when a video or playlist is deleted.
    * A satisfying visual pop or color transition when a video is marked as "watched".

## 5. Database Schema (SQLite)
Create two simple tables:

**Table 1: `playlists`**
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `name` (TEXT NOT NULL)
* `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**Table 2: `videos`**
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `playlist_id` (INTEGER FOREIGN KEY references playlists.id)
* `youtube_url` (TEXT NOT NULL)
* `title` (TEXT)
* `description` (TEXT)
* `thumbnail_url` (TEXT)
* `is_watched` (BOOLEAN DEFAULT 0)
* `added_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## 6. Implementation Steps for AI
1.  Initialize a Node.js project and install necessary backend dependencies (`express`, `sqlite3`, `cors`, `dotenv`, `axios`).
2.  Set up the SQLite database and create the required tables.
3.  Create REST API endpoints (`GET`, `POST`, `PUT`, `DELETE` for both playlists and videos).
4.  Implement the YouTube metadata fetching logic on the backend (to avoid CORS issues and keep API keys secure).
5.  Build the Vanilla HTML/JS frontend. Connect CSS via Tailwind CDN and include Anime.js/FontAwesome.
6.  Implement the frontend JavaScript API calls using `fetch()` to interact with the backend.
7.  Apply Anime.js animations to DOM insertions and state changes.

## 7. Constraints & Rules
* DO NOT use React, Vue, Angular, or jQuery. Stick absolutely to Vanilla JS for the DOM manipulation.
* Write modular, heavily commented JavaScript (e.g., separate files for api calls, ui-logic, and animations if possible, or cleanly separated sections in one file).
* Ensure the SQLite database file is created locally (e.g., `database.sqlite`) and handles basic errors gracefully.
* Provide a `.env.example` file if a YouTube API key is required.