/**
 * ============================================================
 * YOUTUBE SERVICE — Metadata Fetching
 * ============================================================
 * Extracts video ID from various YouTube URL formats and
 * fetches metadata (title, thumbnail, description).
 *
 * Strategy:
 *   1. If YOUTUBE_API_KEY is set → use YouTube Data API v3
 *   2. Fallback → use YouTube oEmbed (no key needed, but no description)
 */

const axios = require('axios');

/**
 * Extract the YouTube video ID from a URL.
 * Supports formats like:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://www.youtube.com/v/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 *
 * @param {string} url - The YouTube URL
 * @returns {string|null} The video ID, or null if not found
 */
function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    // Standard watch URL: youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    // Short URL: youtu.be/ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // Embed URL: youtube.com/embed/ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // Old embed: youtube.com/v/ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // Shorts: youtube.com/shorts/ID
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch video metadata using YouTube Data API v3.
 * Requires YOUTUBE_API_KEY environment variable.
 *
 * @param {string} videoId - The YouTube video ID
 * @returns {object|null} { title, description, thumbnail_url } or null on failure
 */
async function fetchFromDataAPI(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        id: videoId,
        key: apiKey,
      },
      timeout: 8000,
    });

    const items = response.data.items;
    if (!items || items.length === 0) return null;

    const snippet = items[0].snippet;
    return {
      title: snippet.title || 'Untitled Video',
      description: snippet.description || '',
      thumbnail_url: snippet.thumbnails?.high?.url
        || snippet.thumbnails?.medium?.url
        || snippet.thumbnails?.default?.url
        || '',
    };
  } catch (err) {
    console.warn('⚠️  YouTube Data API request failed:', err.message);
    return null;
  }
}

/**
 * Fetch video metadata using YouTube oEmbed (no API key required).
 * Returns title and thumbnail but NOT a description.
 *
 * @param {string} videoUrl - The full YouTube URL
 * @param {string} videoId - The YouTube video ID (for thumbnail fallback)
 * @returns {object} { title, description, thumbnail_url }
 */
async function fetchFromOEmbed(videoUrl, videoId) {
  try {
    const response = await axios.get('https://www.youtube.com/oembed', {
      params: {
        url: videoUrl,
        format: 'json',
      },
      timeout: 8000,
    });

    return {
      title: response.data.title || 'Untitled Video',
      description: '', // oEmbed doesn't provide descriptions
      thumbnail_url: response.data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch (err) {
    console.warn('⚠️  oEmbed request failed:', err.message);
    // Last resort: construct thumbnail URL manually
    return {
      title: 'YouTube Video',
      description: '',
      thumbnail_url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}

/**
 * Main function: fetch video metadata.
 * Tries Data API first, then falls back to oEmbed.
 *
 * @param {string} url - The YouTube URL
 * @returns {object} { title, description, thumbnail_url, youtube_url }
 */
async function fetchVideoMetadata(url) {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error('Invalid YouTube URL. Could not extract video ID.');
  }

  // Try YouTube Data API v3 first (if key is available)
  let metadata = await fetchFromDataAPI(videoId);

  // Fallback to oEmbed
  if (!metadata) {
    metadata = await fetchFromOEmbed(url, videoId);
  }

  return {
    ...metadata,
    youtube_url: url,
  };
}

/**
 * Extract the YouTube playlist ID from a URL.
 * Supports formats like:
 *   - https://www.youtube.com/playlist?list=PLAYLIST_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 *
 * @param {string} url - The YouTube URL
 * @returns {string|null} The playlist ID, or null if not found
 */
function extractPlaylistId(url) {
  if (!url) return null;

  const patterns = [
    // playlist?list=ID or watch?v=...&list=ID
    /[?&]list=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch all video URLs from a YouTube playlist using the Data API v3.
 * Requires YOUTUBE_API_KEY environment variable.
 *
 * @param {string} playlistId - The YouTube playlist ID
 * @returns {Array<object>} Array of { youtube_url, title, description, thumbnail_url }
 */
async function fetchPlaylistVideos(playlistId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const videos = [];

  if (apiKey) {
    // Use Data API — can get all items with pagination
    try {
      let nextPageToken = '';
      let page = 0;
      const maxPages = 10; // Safety limit (500 videos max)

      do {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          params: {
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken || undefined,
            key: apiKey,
          },
          timeout: 15000,
        });

        const items = response.data.items || [];
        for (const item of items) {
          const snippet = item.snippet;
          const videoId = snippet.resourceId?.videoId;
          if (!videoId) continue;

          videos.push({
            youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
            title: snippet.title || 'Untitled Video',
            description: snippet.description || '',
            thumbnail_url: snippet.thumbnails?.high?.url
              || snippet.thumbnails?.medium?.url
              || snippet.thumbnails?.default?.url
              || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          });
        }

        nextPageToken = response.data.nextPageToken || '';
        page++;
      } while (nextPageToken && page < maxPages);

      return videos;
    } catch (err) {
      console.warn('⚠️  Playlist Data API request failed:', err.message);
      throw new Error('Failed to fetch playlist. Check your API key and playlist URL.');
    }
  } else {
    // No API key — try to scrape basic info from the playlist page
    // We'll use a workaround: fetch the playlist page HTML and extract video IDs
    try {
      const response = await axios.get(`https://www.youtube.com/playlist?list=${playlistId}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      const html = response.data;
      // Extract video IDs from the playlist page HTML
      const videoIdPattern = /\"videoId\":\"([a-zA-Z0-9_-]{11})\"/g;
      const foundIds = new Set();
      let match;

      while ((match = videoIdPattern.exec(html)) !== null) {
        foundIds.add(match[1]);
      }

      if (foundIds.size === 0) {
        throw new Error('Could not find any videos in this playlist. The playlist may be private or the URL is invalid.');
      }

      // Fetch metadata for each video via oEmbed (limited to avoid rate limits)
      const videoIds = Array.from(foundIds);
      for (const vid of videoIds) {
        const url = `https://www.youtube.com/watch?v=${vid}`;
        try {
          const meta = await fetchFromOEmbed(url, vid);
          videos.push({
            youtube_url: url,
            title: meta.title,
            description: meta.description,
            thumbnail_url: meta.thumbnail_url,
          });
        } catch (e) {
          // If oEmbed fails for one video, still add it with defaults
          videos.push({
            youtube_url: url,
            title: 'YouTube Video',
            description: '',
            thumbnail_url: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
          });
        }
      }

      return videos;
    } catch (err) {
      if (err.message.includes('Could not find')) throw err;
      console.warn('⚠️  Playlist scraping failed:', err.message);
      throw new Error('Failed to fetch playlist. Make sure the playlist is public and the URL is correct.');
    }
  }
}

module.exports = { fetchVideoMetadata, extractVideoId, extractPlaylistId, fetchPlaylistVideos };
