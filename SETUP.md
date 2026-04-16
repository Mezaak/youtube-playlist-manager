# 🎬 YouTube Playlist Manager — Setup Guide (Windows)

This guide will help you get the YouTube Playlist Manager running on your Windows PC.

---

## Prerequisites

### 1. Install Node.js

1. Go to **https://nodejs.org**
2. Download the **LTS (Long Term Support)** version (recommended)
3. Run the installer — use all the default options
4. When the installation finishes, verify it works:
   - Press `Win + R`, type `cmd`, press Enter
   - Type the following commands:
   ```
   node --version
   npm --version
   ```
   - Both should print a version number (e.g., `v20.x.x` and `10.x.x`)

---

## Installation

### 1. Open a Terminal

- Press `Win + R`, type `cmd`, and press Enter  
  **OR**
- Open the folder `cehcklist` in File Explorer, click the address bar, type `cmd`, and press Enter

### 2. Navigate to the Project Folder

```bash
cd C:\Users\Brian\Desktop\Programlar\cehcklist
```

### 3. Install Dependencies

Run this command to install all required packages:

```bash
npm install
```

This will create a `node_modules/` folder with all the libraries the app needs. It may take a minute or two.

---

## Configuration (Optional)

### YouTube API Key

The app works **without** a YouTube API key — it uses YouTube's oEmbed service to fetch video titles and thumbnails.

If you want **full video descriptions**, you can optionally add a YouTube Data API v3 key:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project and enable the **YouTube Data API v3**
3. Create an **API Key**
4. Open the `.env` file in the project folder and paste your key:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

---

## Running the App

### Start the Server

```bash
npm start
```

You should see this message in the terminal:

```
╔══════════════════════════════════════════════════╗
║   🎬 YouTube Playlist Manager is running!       ║
║   🌐 http://localhost:3000                      ║
╚══════════════════════════════════════════════════╝
```

### Open the App

Open your web browser (Chrome, Edge, Firefox, etc.) and go to:

```
http://localhost:3000
```

That's it! The app is now running. 🎉

---

## Using the App

| Action | How |
|--------|-----|
| **Create a playlist** | Type a name in the sidebar input and click the `+` button |
| **Select a playlist** | Click on any playlist in the sidebar |
| **Rename a playlist** | Hover over a playlist and click the ✏️ pen icon |
| **Delete a playlist** | Hover over a playlist and click the 🗑️ trash icon |
| **Add a video** | Paste a YouTube URL in the input field and click "Add Video" |
| **Mark as watched** | Click the checkbox next to a video |
| **Watch on YouTube** | Click the play button on the thumbnail or the URL link |
| **Remove a video** | Click the 🗑️ trash icon on the video card |

---

## Stopping the App

To stop the server, go to the terminal where it's running and press:

```
Ctrl + C
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `'node' is not recognized` | Node.js is not installed. Install it from https://nodejs.org |
| `npm install` fails | Make sure you're in the correct folder. Try running the terminal as Administrator. |
| Port 3000 is in use | Open `.env` and change `PORT=3000` to another port like `PORT=3001` |
| Videos don't load metadata | Check your internet connection. The app needs to reach YouTube's servers. |
| `better-sqlite3` install error | You may need to install build tools. Run: `npm install -g windows-build-tools` (as Admin) |

---

## Project Structure

```
cehcklist/
├── server.js              # Express server (entry point)
├── db.js                  # SQLite database setup
├── package.json           # Dependencies & scripts
├── .env                   # Configuration (port, API key)
├── .env.example           # Configuration template
├── database.sqlite        # SQLite database (auto-created)
├── routes/
│   ├── playlists.js       # Playlist API routes
│   └── videos.js          # Video API routes
├── services/
│   └── youtube.js         # YouTube metadata fetching
└── public/
    ├── index.html         # Main HTML page
    ├── css/
    │   └── styles.css     # Custom styles
    └── js/
        ├── api.js         # Frontend API calls
        ├── animations.js  # Anime.js animations
        ├── ui.js          # DOM manipulation & events
        └── app.js         # App initialization
```
