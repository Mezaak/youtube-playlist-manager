/**
 * ============================================================
 * UI MODULE — DOM Manipulation & Event Handling
 * ============================================================
 * Handles all rendering, user interactions, and state updates.
 * References:
 *   - API module (api.js) for backend communication
 *   - Animations module (animations.js) for visual effects
 */

const UI = (() => {
  // ------- STATE -------
  let activePlaylistId = null;    // Currently selected playlist ID
  let editingPlaylistId = null;   // Playlist being edited (for modal)
  let deletingPlaylistId = null;  // Playlist being deleted (for modal)
  let viewMode = localStorage.getItem('viewMode') || 'grid';   // 'grid' or 'list'
  let uiSize = localStorage.getItem('uiSize') || 'md';         // 'sm', 'md', or 'lg'

  // ------- DOM REFERENCES -------
  const elements = {
    // Sidebar
    playlistList:       document.getElementById('playlist-list'),
    playlistForm:       document.getElementById('create-playlist-form'),
    playlistNameInput:  document.getElementById('playlist-name-input'),

    // Header
    headerEmpty:        document.getElementById('header-empty'),
    headerActive:       document.getElementById('header-active'),
    activePlaylistName: document.getElementById('active-playlist-name'),
    activePlaylistStats:document.getElementById('active-playlist-stats'),
    progressContainer:  document.getElementById('progress-bar-container'),
    progressFill:       document.getElementById('progress-bar-fill'),
    progressText:       document.getElementById('progress-text'),

    // Video section
    addVideoSection:    document.getElementById('add-video-section'),
    addVideoForm:       document.getElementById('add-video-form'),
    videoUrlInput:      document.getElementById('video-url-input'),
    addVideoBtn:        document.getElementById('add-video-btn'),
    addVideoError:      document.getElementById('add-video-error'),
    addVideoErrorText:  document.getElementById('add-video-error-text'),
    addVideoLoading:    document.getElementById('add-video-loading'),

    // Tab switcher
    tabAddVideo:        document.getElementById('tab-add-video'),
    tabImportPlaylist:  document.getElementById('tab-import-playlist'),
    tabContentAddVideo: document.getElementById('tab-content-add-video'),
    tabContentImport:   document.getElementById('tab-content-import-playlist'),

    // Import playlist section
    importForm:         document.getElementById('import-playlist-form'),
    importUrlInput:     document.getElementById('import-playlist-url-input'),
    importBtn:          document.getElementById('import-playlist-btn'),
    importError:        document.getElementById('import-playlist-error'),
    importErrorText:    document.getElementById('import-playlist-error-text'),
    importLoading:      document.getElementById('import-playlist-loading'),

    // Content areas
    emptyState:         document.getElementById('empty-state'),
    emptyPlaylistState: document.getElementById('empty-playlist-state'),
    videoGrid:          document.getElementById('video-grid'),

    // View & Size toggles
    viewGridBtn:        document.getElementById('view-grid-btn'),
    viewListBtn:        document.getElementById('view-list-btn'),
    sizeToggle:         document.getElementById('size-toggle'),

    // Edit modal
    editModal:          document.getElementById('edit-modal'),
    editForm:           document.getElementById('edit-playlist-form'),
    editInput:          document.getElementById('edit-playlist-input'),
    editCancelBtn:      document.getElementById('edit-cancel-btn'),

    // Delete modal
    deleteModal:        document.getElementById('delete-modal'),
    deleteConfirmBtn:   document.getElementById('delete-confirm-btn'),
    deleteCancelBtn:    document.getElementById('delete-cancel-btn'),
    deleteModalText:    document.getElementById('delete-modal-text'),

    // Toast
    toastContainer:     document.getElementById('toast-container'),
  };

  // =============================================
  // TOAST NOTIFICATIONS
  // =============================================

  /**
   * Show a toast notification.
   * @param {string} message - Text to display
   * @param {string} type - 'success', 'error', or 'info'
   */
  function showToast(message, type = 'info') {
    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      info: 'fa-circle-info',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);
    Animations.toastIn(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      Animations.toastOut(toast);
    }, 3500);
  }

  // =============================================
  // PLAYLIST RENDERING
  // =============================================

  /**
   * Render the playlist list in the sidebar.
   * @param {Array} playlists - Array of playlist objects
   */
  function renderPlaylists(playlists) {
    elements.playlistList.innerHTML = '';

    if (playlists.length === 0) {
      elements.playlistList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <i class="fa-solid fa-folder-open text-2xl text-gray-700 mb-3"></i>
          <p class="text-sm text-gray-600">No playlists yet</p>
          <p class="text-xs text-gray-700 mt-1">Create one above to get started</p>
        </div>
      `;
      return;
    }

    playlists.forEach(pl => {
      const isActive = pl.id === activePlaylistId;
      const watchedCount = pl.watched_count || 0;
      const videoCount = pl.video_count || 0;

      const item = document.createElement('div');
      item.className = `playlist-item group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent cursor-pointer ${isActive ? 'active' : ''}`;
      item.dataset.id = pl.id;

      item.innerHTML = `
        <div class="w-8 h-8 rounded-lg ${isActive 
          ? 'bg-gradient-to-br from-accent-500/30 to-pink-500/30' 
          : 'bg-white/5'
        } flex items-center justify-center flex-shrink-0">
          <i class="fa-solid fa-music text-xs ${isActive ? 'text-accent-400' : 'text-gray-600'}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate ${isActive ? 'text-gray-100' : 'text-gray-400'}">${escapeHtml(pl.name)}</p>
          <p class="text-[11px] ${isActive ? 'text-gray-400' : 'text-gray-600'}">${videoCount} video${videoCount !== 1 ? 's' : ''}${videoCount > 0 ? ` · ${watchedCount} watched` : ''}</p>
        </div>
        <div class="action-btns flex items-center gap-1 flex-shrink-0">
          <button class="edit-playlist-btn w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-accent-400 transition-all" title="Rename" data-id="${pl.id}">
            <i class="fa-solid fa-pen text-[10px]"></i>
          </button>
          <button class="delete-playlist-btn w-7 h-7 rounded-md hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all" title="Delete" data-id="${pl.id}" data-name="${escapeHtml(pl.name)}">
            <i class="fa-solid fa-trash text-[10px]"></i>
          </button>
        </div>
      `;

      // Click to select playlist
      item.addEventListener('click', (e) => {
        // Don't trigger if clicking action buttons
        if (e.target.closest('.edit-playlist-btn') || e.target.closest('.delete-playlist-btn')) return;
        selectPlaylist(pl.id, pl.name);
      });

      elements.playlistList.appendChild(item);
    });

    // Attach edit/delete handlers
    document.querySelectorAll('.edit-playlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(parseInt(btn.dataset.id));
      });
    });

    document.querySelectorAll('.delete-playlist-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDeleteModal(parseInt(btn.dataset.id), btn.dataset.name);
      });
    });

    // Animate the list in
    Animations.staggerIn('.playlist-item', 50);
  }

  // =============================================
  // VIDEO RENDERING
  // =============================================

  /**
   * Render the video grid for the active playlist.
   * @param {Array} videos - Array of video objects
   */
  function renderVideos(videos) {
    elements.videoGrid.innerHTML = '';

    if (videos.length === 0) {
      // Show empty playlist state
      elements.emptyState.classList.add('hidden');
      elements.emptyState.classList.remove('flex');
      elements.emptyPlaylistState.classList.remove('hidden');
      elements.emptyPlaylistState.classList.add('flex');
      elements.videoGrid.classList.add('hidden');
      return;
    }

    // Show video grid
    elements.emptyState.classList.add('hidden');
    elements.emptyState.classList.remove('flex');
    elements.emptyPlaylistState.classList.add('hidden');
    elements.emptyPlaylistState.classList.remove('flex');
    elements.videoGrid.classList.remove('hidden');

    // Apply current view mode
    applyViewMode();

    // Calculate stats
    const watchedCount = videos.filter(v => v.is_watched).length;
    updateProgress(watchedCount, videos.length);

    videos.forEach(video => {
      const card = createVideoCard(video);
      elements.videoGrid.appendChild(card);
    });

    // Animate cards in with stagger
    Animations.staggerIn('.video-card', 100);
  }

  /**
   * Create a single video card DOM element.
   * @param {Object} video - Video object from the API
   * @returns {HTMLElement} The video card element
   */
  function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = `video-card bg-surface-800 border border-white/5 rounded-xl overflow-hidden ${video.is_watched ? 'watched' : ''}`;
    card.dataset.id = video.id;

    const truncatedDesc = video.description
      ? (video.description.length > 100 ? video.description.substring(0, 100) + '...' : video.description)
      : 'No description available.';

    card.innerHTML = `
      <!-- Thumbnail -->
      <div class="thumb-wrapper relative overflow-hidden aspect-video bg-surface-900">
        <img
          src="${escapeHtml(video.thumbnail_url || '')}"
          alt="${escapeHtml(video.title || 'Video thumbnail')}"
          class="video-thumbnail w-full h-full object-cover"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 180%22><rect fill=%22%231e2030%22 width=%22320%22 height=%22180%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23555%22 font-size=%2214%22>No Thumbnail</text></svg>'"
        />
        <a href="${escapeHtml(video.youtube_url)}" target="_blank" rel="noopener noreferrer"
           class="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group/play">
          <div class="w-12 h-12 rounded-full bg-youtube-500/90 flex items-center justify-center opacity-0 group-hover/play:opacity-100 scale-75 group-hover/play:scale-100 transition-all shadow-xl">
            <i class="fa-solid fa-play text-white text-sm ml-0.5"></i>
          </div>
        </a>
        ${video.is_watched ? `
          <div class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
            Watched
          </div>
        ` : ''}
      </div>

      <!-- Info -->
      <div class="card-info p-4">
        <div class="flex items-start gap-3 w-full">
          <input
            type="checkbox"
            class="watch-checkbox mt-0.5"
            ${video.is_watched ? 'checked' : ''}
            data-id="${video.id}"
            title="${video.is_watched ? 'Mark as unwatched' : 'Mark as watched'}"
          />
          <div class="flex-1 min-w-0">
            <h4 class="video-title text-sm font-semibold text-gray-200 leading-snug mb-1 line-clamp-2">
              ${escapeHtml(video.title || 'Untitled Video')}
            </h4>
            <p class="video-desc text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
              ${escapeHtml(truncatedDesc)}
            </p>
            <div class="flex items-center justify-between">
              <a href="${escapeHtml(video.youtube_url)}" target="_blank" rel="noopener noreferrer"
                 class="text-[11px] text-accent-400/70 hover:text-accent-400 font-medium transition-colors truncate max-w-[150px]">
                <i class="fa-brands fa-youtube mr-1"></i>${escapeHtml(video.youtube_url)}
              </a>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button class="copy-link-btn action-btn rounded-lg hover:bg-accent-500/10 flex items-center justify-center text-gray-500 hover:text-accent-400 transition-all" data-url="${escapeHtml(video.youtube_url)}" title="Copy link">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button class="delete-video-btn action-btn rounded-lg hover:bg-red-500/10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all" data-id="${video.id}" title="Remove video">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // --- Event: Toggle watched ---
    const checkbox = card.querySelector('.watch-checkbox');
    checkbox.addEventListener('change', async () => {
      try {
        const updated = await API.toggleWatched(video.id);
        const isWatched = !!updated.is_watched;

        // Update visual state
        if (isWatched) {
          card.classList.add('watched');
        } else {
          card.classList.remove('watched');
        }

        // Update badge
        const badge = card.querySelector('.absolute.top-2.right-2');
        if (isWatched && !badge) {
          const thumbArea = card.querySelector('.relative');
          const newBadge = document.createElement('div');
          newBadge.className = 'absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider';
          newBadge.textContent = 'Watched';
          thumbArea.appendChild(newBadge);
        } else if (!isWatched && badge) {
          badge.remove();
        }

        checkbox.title = isWatched ? 'Mark as unwatched' : 'Mark as watched';

        // Animate
        Animations.watchedToggle(card, isWatched);

        // Update progress
        updateProgressFromDOM();

        // Refresh playlist sidebar to update counts
        refreshPlaylists();

        showToast(isWatched ? 'Marked as watched!' : 'Unmarked as watched', 'success');
      } catch (err) {
        checkbox.checked = !checkbox.checked; // Revert
        showToast(err.message, 'error');
      }
    });

    // --- Event: Copy link ---
    const copyBtn = card.querySelector('.copy-link-btn');
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(video.youtube_url);
        // Temporarily change icon to checkmark
        const icon = copyBtn.querySelector('i');
        icon.className = 'fa-solid fa-check';
        copyBtn.classList.add('text-emerald-400');
        showToast('Link copied to clipboard!', 'success');
        setTimeout(() => {
          icon.className = 'fa-solid fa-copy';
          copyBtn.classList.remove('text-emerald-400');
        }, 2000);
      } catch (err) {
        showToast('Failed to copy link', 'error');
      }
    });

    // --- Event: Delete video ---
    const deleteBtn = card.querySelector('.delete-video-btn');
    deleteBtn.addEventListener('click', async () => {
      try {
        await API.deleteVideo(video.id);
        await Animations.slideOut(card);

        // Check if grid is now empty
        if (elements.videoGrid.children.length === 0) {
          elements.videoGrid.classList.add('hidden');
          elements.emptyPlaylistState.classList.remove('hidden');
          elements.emptyPlaylistState.classList.add('flex');
          elements.progressContainer.classList.add('hidden');
          elements.progressContainer.classList.remove('flex');
        } else {
          updateProgressFromDOM();
        }

        refreshPlaylists();
        showToast('Video removed', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    return card;
  }

  // =============================================
  // PLAYLIST SELECTION & LOADING
  // =============================================

  /**
   * Select a playlist and load its videos.
   * @param {number} id - Playlist ID
   * @param {string} name - Playlist name (for header)
   */
  async function selectPlaylist(id, name) {
    activePlaylistId = id;

    // Update header
    elements.headerEmpty.classList.add('hidden');
    elements.headerActive.classList.remove('hidden');
    elements.activePlaylistName.textContent = name;

    // Show add video section
    elements.addVideoSection.classList.remove('hidden');

    // Highlight active playlist in sidebar
    document.querySelectorAll('.playlist-item').forEach(item => {
      item.classList.toggle('active', parseInt(item.dataset.id) === id);
    });

    // Load videos
    try {
      const videos = await API.getVideos(id);
      renderVideos(videos);
    } catch (err) {
      showToast('Failed to load videos: ' + err.message, 'error');
    }
  }

  // =============================================
  // PROGRESS BAR
  // =============================================

  /**
   * Update the progress bar with watched/total counts.
   */
  function updateProgress(watched, total) {
    if (total === 0) {
      elements.progressContainer.classList.add('hidden');
      elements.progressContainer.classList.remove('flex');
      elements.activePlaylistStats.textContent = 'No videos yet';
      return;
    }

    elements.progressContainer.classList.remove('hidden');
    elements.progressContainer.classList.add('flex');

    const pct = Math.round((watched / total) * 100);
    elements.progressFill.style.width = `${pct}%`;
    elements.progressText.textContent = `${pct}%`;
    elements.activePlaylistStats.textContent = `${total} video${total !== 1 ? 's' : ''} · ${watched} watched`;
  }

  /**
   * Recalculate progress from current DOM state.
   */
  function updateProgressFromDOM() {
    const cards = elements.videoGrid.querySelectorAll('.video-card');
    const total = cards.length;
    const watched = elements.videoGrid.querySelectorAll('.video-card.watched').length;
    updateProgress(watched, total);
  }

  // =============================================
  // VIEW MODE & UI SIZE
  // =============================================

  /**
   * Apply the current view mode (grid or list) to the video grid.
   */
  function applyViewMode() {
    if (viewMode === 'list') {
      elements.videoGrid.classList.add('list-view');
      // Remove grid columns for list mode
      elements.videoGrid.classList.remove('grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3');
    } else {
      elements.videoGrid.classList.remove('list-view');
      // Re-add grid columns
      elements.videoGrid.classList.add('grid-cols-1', 'lg:grid-cols-2', 'xl:grid-cols-3');
    }

    // Update toggle buttons
    if (elements.viewGridBtn && elements.viewListBtn) {
      elements.viewGridBtn.classList.toggle('active', viewMode === 'grid');
      elements.viewListBtn.classList.toggle('active', viewMode === 'list');
    }
  }

  /**
   * Apply the current UI size to the body.
   */
  function applyUISize() {
    document.body.classList.remove('ui-size-sm', 'ui-size-md', 'ui-size-lg');
    document.body.classList.add(`ui-size-${uiSize}`);

    // Update toggle buttons
    if (elements.sizeToggle) {
      elements.sizeToggle.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === uiSize);
      });
    }
  }

  // =============================================
  // MODALS
  // =============================================

  /** Open the edit playlist modal */
  function openEditModal(id) {
    editingPlaylistId = id;
    const item = document.querySelector(`.playlist-item[data-id="${id}"]`);
    const name = item ? item.querySelector('p').textContent : '';
    elements.editInput.value = name;
    Animations.modalOpen(elements.editModal);
    elements.editInput.focus();
    elements.editInput.select();
  }

  /** Open the delete confirmation modal */
  function openDeleteModal(id, name) {
    deletingPlaylistId = id;
    elements.deleteModalText.textContent = `Are you sure you want to delete "${name}"? All videos inside will also be deleted. This action cannot be undone.`;
    Animations.modalOpen(elements.deleteModal);
  }

  // =============================================
  // REFRESH HELPERS
  // =============================================

  /** Refresh the playlist sidebar */
  async function refreshPlaylists() {
    try {
      const playlists = await API.getPlaylists();
      renderPlaylists(playlists);
    } catch (err) {
      console.error('Failed to refresh playlists:', err);
    }
  }

  // =============================================
  // UTILITY
  // =============================================

  /** Escape HTML to prevent XSS */
  function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  // =============================================
  // EVENT BINDINGS (called once on init)
  // =============================================

  function bindEvents() {
    // --- View mode toggle ---
    if (elements.viewGridBtn) {
      elements.viewGridBtn.addEventListener('click', () => {
        viewMode = 'grid';
        localStorage.setItem('viewMode', 'grid');
        applyViewMode();
      });
    }
    if (elements.viewListBtn) {
      elements.viewListBtn.addEventListener('click', () => {
        viewMode = 'list';
        localStorage.setItem('viewMode', 'list');
        applyViewMode();
      });
    }

    // --- UI Size toggle ---
    if (elements.sizeToggle) {
      elements.sizeToggle.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          uiSize = btn.dataset.size;
          localStorage.setItem('uiSize', uiSize);
          applyUISize();
        });
      });
    }

    // --- Create playlist ---
    elements.playlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = elements.playlistNameInput.value.trim();
      if (!name) return;

      try {
        const playlist = await API.createPlaylist(name);
        elements.playlistNameInput.value = '';
        await refreshPlaylists();
        selectPlaylist(playlist.id, playlist.name);
        showToast(`Playlist "${name}" created!`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // --- Add video ---
    elements.addVideoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activePlaylistId) return;

      const url = elements.videoUrlInput.value.trim();
      if (!url) return;

      // UI feedback
      elements.addVideoError.classList.add('hidden');
      elements.addVideoLoading.classList.remove('hidden');
      elements.addVideoBtn.disabled = true;

      try {
        const video = await API.addVideo(activePlaylistId, url);
        elements.videoUrlInput.value = '';
        elements.addVideoLoading.classList.add('hidden');
        elements.addVideoBtn.disabled = false;

        // Show grid if it was hidden
        elements.emptyPlaylistState.classList.add('hidden');
        elements.emptyPlaylistState.classList.remove('flex');
        elements.videoGrid.classList.remove('hidden');

        // Prepend the new card
        const card = createVideoCard(video);
        elements.videoGrid.prepend(card);
        Animations.fadeIn(card);

        updateProgressFromDOM();
        refreshPlaylists();
        showToast(`Added "${video.title}"`, 'success');
      } catch (err) {
        elements.addVideoLoading.classList.add('hidden');
        elements.addVideoBtn.disabled = false;
        elements.addVideoError.classList.remove('hidden');
        elements.addVideoErrorText.textContent = err.message;
        showToast(err.message, 'error');
      }
    });

    // --- Tab switching ---
    function switchTab(tabName) {
      // Update tab buttons
      [elements.tabAddVideo, elements.tabImportPlaylist].forEach(btn => {
        btn.classList.remove('active', 'bg-accent-600/20', 'text-accent-400', 'border-accent-500/20');
        btn.classList.add('bg-white/5', 'text-gray-500', 'border-transparent');
      });

      const activeBtn = tabName === 'add-video' ? elements.tabAddVideo : elements.tabImportPlaylist;
      activeBtn.classList.add('active', 'bg-accent-600/20', 'text-accent-400', 'border-accent-500/20');
      activeBtn.classList.remove('bg-white/5', 'text-gray-500', 'border-transparent');

      // Show/hide tab content
      elements.tabContentAddVideo.classList.toggle('hidden', tabName !== 'add-video');
      elements.tabContentImport.classList.toggle('hidden', tabName !== 'import-playlist');
    }

    elements.tabAddVideo.addEventListener('click', () => switchTab('add-video'));
    elements.tabImportPlaylist.addEventListener('click', () => switchTab('import-playlist'));

    // --- Import playlist ---
    elements.importForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activePlaylistId) return;

      const url = elements.importUrlInput.value.trim();
      if (!url) return;

      // UI feedback
      elements.importError.classList.add('hidden');
      elements.importLoading.classList.remove('hidden');
      elements.importBtn.disabled = true;

      try {
        const result = await API.importPlaylist(activePlaylistId, url);
        elements.importUrlInput.value = '';
        elements.importLoading.classList.add('hidden');
        elements.importBtn.disabled = false;

        // Reload the video list
        const videos = await API.getVideos(activePlaylistId);
        renderVideos(videos);
        refreshPlaylists();

        showToast(`${result.message}`, 'success');
      } catch (err) {
        elements.importLoading.classList.add('hidden');
        elements.importBtn.disabled = false;
        elements.importError.classList.remove('hidden');
        elements.importErrorText.textContent = err.message;
        showToast(err.message, 'error');
      }
    });

    // --- Edit modal save ---
    elements.editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = elements.editInput.value.trim();
      if (!name || !editingPlaylistId) return;

      try {
        await API.updatePlaylist(editingPlaylistId, name);
        await Animations.modalClose(elements.editModal);
        await refreshPlaylists();

        // Update header if editing the active playlist
        if (editingPlaylistId === activePlaylistId) {
          elements.activePlaylistName.textContent = name;
        }

        showToast('Playlist renamed!', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // --- Edit modal cancel ---
    elements.editCancelBtn.addEventListener('click', () => {
      Animations.modalClose(elements.editModal);
    });

    // --- Delete modal confirm ---
    elements.deleteConfirmBtn.addEventListener('click', async () => {
      if (!deletingPlaylistId) return;

      try {
        await API.deletePlaylist(deletingPlaylistId);
        await Animations.modalClose(elements.deleteModal);

        // If we deleted the active playlist, reset the view
        if (deletingPlaylistId === activePlaylistId) {
          activePlaylistId = null;
          elements.headerActive.classList.add('hidden');
          elements.headerEmpty.classList.remove('hidden');
          elements.addVideoSection.classList.add('hidden');
          elements.videoGrid.classList.add('hidden');
          elements.emptyPlaylistState.classList.add('hidden');
          elements.emptyPlaylistState.classList.remove('flex');
          elements.emptyState.classList.remove('hidden');
          elements.emptyState.classList.add('flex');
          elements.progressContainer.classList.add('hidden');
          elements.progressContainer.classList.remove('flex');
        }

        await refreshPlaylists();
        showToast('Playlist deleted', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // --- Delete modal cancel ---
    elements.deleteCancelBtn.addEventListener('click', () => {
      Animations.modalClose(elements.deleteModal);
    });

    // --- Close modals on backdrop click ---
    [elements.editModal, elements.deleteModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          Animations.modalClose(modal);
        }
      });
    });

    // --- Close modals on Escape ---
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (elements.editModal.classList.contains('modal-show')) {
          Animations.modalClose(elements.editModal);
        }
        if (elements.deleteModal.classList.contains('modal-show')) {
          Animations.modalClose(elements.deleteModal);
        }
      }
    });
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  /**
   * Initialize the UI: load playlists and bind events.
   */
  async function init() {
    bindEvents();

    // Apply saved UI size on load
    applyUISize();

    try {
      const playlists = await API.getPlaylists();
      renderPlaylists(playlists);
    } catch (err) {
      showToast('Failed to connect to server. Is it running?', 'error');
      console.error('Initialization error:', err);
    }
  }

  // Expose public API
  return {
    init,
    showToast,
    refreshPlaylists,
    selectPlaylist,
  };
})();
