/**
 * ============================================================
 * API MODULE — Centralized API Call Functions
 * ============================================================
 * All communication with the Express backend goes through
 * these functions. Uses the native fetch() API.
 *
 * Base URL defaults to current origin (e.g. http://localhost:3000).
 */

const API = (() => {
  const BASE = '/api';

  // ------- HELPER: Generic fetch wrapper -------
  async function request(endpoint, options = {}) {
    const url = `${BASE}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // =============================================
  // PLAYLIST ENDPOINTS
  // =============================================

  /**
   * Fetch all playlists.
   * @returns {Promise<Array>} Array of playlist objects
   */
  function getPlaylists() {
    return request('/playlists');
  }

  /**
   * Create a new playlist.
   * @param {string} name - Playlist name
   * @returns {Promise<Object>} Created playlist object
   */
  function createPlaylist(name) {
    return request('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Rename an existing playlist.
   * @param {number} id - Playlist ID
   * @param {string} name - New name
   * @returns {Promise<Object>} Updated playlist object
   */
  function updatePlaylist(id, name) {
    return request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Delete a playlist and all its videos.
   * @param {number} id - Playlist ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  function deletePlaylist(id) {
    return request(`/playlists/${id}`, {
      method: 'DELETE',
    });
  }

  // =============================================
  // VIDEO ENDPOINTS
  // =============================================

  /**
   * Fetch all videos in a playlist.
   * @param {number} playlistId - Playlist ID
   * @returns {Promise<Array>} Array of video objects
   */
  function getVideos(playlistId) {
    return request(`/playlists/${playlistId}/videos`);
  }

  /**
   * Add a video to a playlist. Metadata is fetched server-side.
   * @param {number} playlistId - Playlist ID
   * @param {string} youtubeUrl - YouTube URL
   * @returns {Promise<Object>} Created video object
   */
  function addVideo(playlistId, youtubeUrl) {
    return request(`/playlists/${playlistId}/videos`, {
      method: 'POST',
      body: JSON.stringify({ youtube_url: youtubeUrl }),
    });
  }

  /**
   * Toggle the watched status of a video.
   * @param {number} videoId - Video ID
   * @returns {Promise<Object>} Updated video object
   */
  function toggleWatched(videoId) {
    return request(`/videos/${videoId}/watched`, {
      method: 'PUT',
    });
  }

  /**
   * Delete a video.
   * @param {number} videoId - Video ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  function deleteVideo(videoId) {
    return request(`/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Import all videos from a YouTube playlist URL into a local playlist.
   * @param {number} playlistId - Local playlist ID
   * @param {string} playlistUrl - YouTube playlist URL
   * @returns {Promise<Object>} { message, count }
   */
  function importPlaylist(playlistId, playlistUrl) {
    return request(`/playlists/${playlistId}/import-playlist`, {
      method: 'POST',
      body: JSON.stringify({ playlist_url: playlistUrl }),
    });
  }

  // Expose public API
  return {
    getPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getVideos,
    addVideo,
    toggleWatched,
    deleteVideo,
    importPlaylist,
  };
})();
