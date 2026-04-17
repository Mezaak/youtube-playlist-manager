# youtube-playlist-manager
Manage your Youtube Playlists with ease
Easy Starting

First use "npm install"  for installing the node modules
and for starting the app "npm start"

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</p>

<h1 align="center">🎬 YouTube Playlist Manager</h1>

<p align="center">
  A lightweight, self-hosted web application for creating and managing custom YouTube playlists with checklist functionality. Track what you've watched, organize videos into playlists, and import entire YouTube playlists — all from a beautiful dark-mode interface.
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📋 **Playlist Management** | Create, rename, and delete custom playlists |
| 🎥 **Add Videos by URL** | Paste any YouTube URL and metadata is fetched automatically |
| 📥 **Import YouTube Playlists** | Import all videos from a public YouTube playlist in one click |
| ✅ **Watch Tracking** | Mark videos as watched with a satisfying animated checkbox |
| 📊 **Progress Bar** | Visual progress indicator showing completion percentage per playlist |
| 🖼️ **Grid & List Views** | Switch between grid and list layouts for your video library |
| 🔠 **UI Scaling** | Choose between Small, Medium, and Large UI sizes |
| 🌙 **Dark Mode** | Beautiful dark theme designed for long viewing sessions |
| 💾 **Local Storage** | All data stored locally in SQLite — no cloud, no account needed |
| 🎞️ **Smooth Animations** | Anime.js-powered transitions for adding, removing, and marking videos |

---

## 🖥️ Screenshots

> The app features a two-panel layout: a sidebar for playlists and a main content area for videos.

**Main Interface:**
- **Left Panel** — Playlist sidebar with create, rename, and delete controls
- **Right Panel** — Video grid/list with thumbnails, titles, watched status, and quick actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (no frameworks) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) (CDN) + custom CSS |
| **Icons** | [Font Awesome 6](https://fontawesome.com/) |
| **Typography** | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |
| **Animations** | [Anime.js](https://animejs.com/) |
| **Backend** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| **Database** | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **HTTP Client** | [Axios](https://axios-http.com/) (for YouTube API/oEmbed requests) |

---

## 📦 Prerequisites

- **[Node.js](https://nodejs.org/)** v18 or higher (LTS recommended)
- **npm** (comes bundled with Node.js)

Verify your installation:

```bash
node --version   # e.g. v20.x.x
npm --version    # e.g. 10.x.x
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/youtube-playlist-manager.git
cd youtube-playlist-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

The app works **without** a YouTube API key — it uses YouTube's free oEmbed service to fetch video titles and thumbnails. However, if you want **full video descriptions** and **playlist import support**, you can add a YouTube Data API v3 key:

```env
# Server port (default: 3000)
PORT=3000

# Optional: YouTube Data API v3 Key
YOUTUBE_API_KEY=your_api_key_here
```

<details>
<summary>📌 How to get a YouTube API Key</summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select an existing one)
3. Enable the **YouTube Data API v3**
4. Navigate to **Credentials** → **Create Credentials** → **API Key**
5. Copy the key and paste it into your `.env` file

</details>

### 4. Start the Server

```bash
npm start
```

You should see:

```
╔══════════════════════════════════════════════════╗
║   🎬 YouTube Playlist Manager is running!       ║
║   🌐 http://localhost:3000                      ║
╚══════════════════════════════════════════════════╝
```

### 5. Open in Browser

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

> **Windows Quick Start:** You can also double-click `start.bat` to launch the server and open the app automatically.

---

## 📖 Usage

### Playlist Management

| Action | How |
|--------|-----|
| **Create a playlist** | Type a name in the sidebar input and click the **+** button |
| **Select a playlist** | Click on any playlist in the sidebar |
| **Rename a playlist** | Hover over a playlist and click the ✏️ icon |
| **Delete a playlist** | Hover over a playlist and click the 🗑️ icon |

### Video Management

| Action | How |
|--------|-----|
| **Add a video** | Paste a YouTube URL in the input field and click **Add Video** |
| **Import a playlist** | Switch to the **Import Playlist** tab, paste a YouTube playlist URL, and click **Import All** |
| **Mark as watched** | Click the checkbox on a video card |
| **Watch on YouTube** | Click the play button on the thumbnail or the URL link |
| **Remove a video** | Click the 🗑️ icon on the video card |

### View Options

| Option | Description |
|--------|-------------|
| **Grid / List** | Toggle between grid and list view layouts |
| **S / M / L** | Adjust the UI scale: Small, Medium, or Large |

---

## 📁 Project Structure

```
youtube-playlist-manager/
├── server.js                # Express server entry point
├── db.js                    # SQLite database setup & initialization
├── package.json             # Dependencies & scripts
├── start.bat                # Windows quick-start launcher
├── .env                     # Environment config (port, API key)
├── .env.example             # Environment config template
├── database.sqlite          # SQLite database (auto-created at runtime)
│
├── routes/
│   ├── playlists.js         # REST API routes for playlist CRUD
│   └── videos.js            # REST API routes for video CRUD
│
├── services/
│   └── youtube.js           # YouTube metadata fetching (API v3 + oEmbed fallback)
│
└── public/                  # Static frontend files
    ├── index.html           # Main HTML page
    ├── css/
    │   └── styles.css       # Custom styles & scrollbar theming
    └── js/
        ├── api.js           # Frontend API client (fetch wrappers)
        ├── animations.js    # Anime.js animation definitions
        ├── ui.js            # DOM manipulation, event handlers, rendering
        └── app.js           # App initialization & bootstrapping
```

---

## 🗄️ Database Schema

The app uses two SQLite tables:

### `playlists`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `name` | TEXT | Playlist name |
| `created_at` | TIMESTAMP | Creation timestamp |

### `videos`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER (PK) | Auto-incrementing primary key |
| `playlist_id` | INTEGER (FK) | References `playlists.id` (cascade delete) |
| `youtube_url` | TEXT | Full YouTube video URL |
| `title` | TEXT | Video title (auto-fetched) |
| `description` | TEXT | Video description (requires API key) |
| `thumbnail_url` | TEXT | Thumbnail image URL (auto-fetched) |
| `is_watched` | INTEGER | Watch status: `0` = unwatched, `1` = watched |
| `added_at` | TIMESTAMP | Timestamp when the video was added |

---

## 🔌 API Endpoints

### Playlists

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/playlists` | Get all playlists |
| `POST` | `/api/playlists` | Create a new playlist |
| `PUT` | `/api/playlists/:id` | Rename a playlist |
| `DELETE` | `/api/playlists/:id` | Delete a playlist and all its videos |

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/playlists/:id/videos` | Get all videos in a playlist |
| `POST` | `/api/playlists/:id/videos` | Add a video to a playlist |
| `PUT` | `/api/videos/:id/watched` | Toggle watched status |
| `DELETE` | `/api/videos/:id` | Remove a video |
| `POST` | `/api/playlists/:id/import` | Import a YouTube playlist |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `'node' is not recognized` | Node.js is not installed. Download it from [nodejs.org](https://nodejs.org) |
| `npm install` fails | Make sure you're in the correct project folder. Try running the terminal as Administrator |
| Port 3000 is in use | Change `PORT=3000` to another port (e.g., `3001`) in your `.env` file |
| Videos don't load metadata | Check your internet connection — the app needs to reach YouTube servers |
| `better-sqlite3` install error | You may need C++ build tools. Run: `npm install -g windows-build-tools` (as Admin) |
| Playlist import doesn't work | Playlist import with full metadata requires a YouTube API key. See [Configuration](#3-configure-environment-optional) |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for YouTube enthusiasts who like to stay organized.
</p>

