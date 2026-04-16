/**
 * ============================================================
 * ANIMATIONS MODULE — Anime.js Powered Transitions
 * ============================================================
 * Contains all animation functions used throughout the UI.
 * Uses Anime.js for smooth, performant animations.
 */

const Animations = (() => {

  /**
   * Stagger fade-in effect for a list of elements.
   * Used when loading playlists or video cards.
   *
   * @param {string} selector - CSS selector for the elements
   * @param {number} delay - Base delay before animation starts (ms)
   */
  function staggerIn(selector, delay = 0) {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    // Set initial state
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
    });

    anime({
      targets: selector,
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      easing: 'easeOutCubic',
      delay: anime.stagger(60, { start: delay }),
    });
  }

  /**
   * Fade-in a single element.
   *
   * @param {HTMLElement} el - The DOM element to animate
   * @param {number} duration - Animation duration in ms
   */
  function fadeIn(el, duration = 300) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';

    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: duration,
      easing: 'easeOutCubic',
    });
  }

  /**
   * Slide out and fade an element, then remove it from DOM.
   * Used for deleting video cards or playlist items.
   *
   * @param {HTMLElement} el - The DOM element to animate out
   * @returns {Promise} Resolves when animation completes
   */
  function slideOut(el) {
    return new Promise(resolve => {
      if (!el) { resolve(); return; }

      anime({
        targets: el,
        opacity: [1, 0],
        translateX: [0, -30],
        scale: [1, 0.95],
        duration: 350,
        easing: 'easeInCubic',
        complete: () => {
          // Collapse height smoothly
          anime({
            targets: el,
            height: [el.offsetHeight, 0],
            marginBottom: [parseInt(getComputedStyle(el).marginBottom) || 0, 0],
            paddingTop: 0,
            paddingBottom: 0,
            duration: 200,
            easing: 'easeInCubic',
            complete: () => {
              el.remove();
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   * "Pop" animation when a video is marked as watched.
   * Creates a satisfying visual feedback.
   *
   * @param {HTMLElement} el - The video card element
   * @param {boolean} isWatched - The new watched state
   */
  function watchedToggle(el, isWatched) {
    if (!el) return;

    if (isWatched) {
      // Animate to watched state: gentle scale pop + opacity drop
      anime({
        targets: el,
        scale: [1, 1.03, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .6)',
      });

      // Add a small green flash to the checkbox area
      const checkbox = el.querySelector('.watch-checkbox');
      if (checkbox) {
        anime({
          targets: checkbox,
          scale: [1, 1.4, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .5)',
        });
      }
    } else {
      // Animate back to unwatched: slight bounce
      anime({
        targets: el,
        scale: [1, 0.98, 1],
        duration: 300,
        easing: 'easeOutCubic',
      });
    }
  }

  /**
   * Modal open animation.
   *
   * @param {HTMLElement} modal - The modal backdrop element
   */
  function modalOpen(modal) {
    if (!modal) return;
    const inner = modal.querySelector('div');

    modal.classList.add('modal-show');

    anime({
      targets: inner,
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 250,
      easing: 'easeOutCubic',
    });
  }

  /**
   * Modal close animation.
   *
   * @param {HTMLElement} modal - The modal backdrop element
   * @returns {Promise} Resolves when animation completes
   */
  function modalClose(modal) {
    return new Promise(resolve => {
      if (!modal) { resolve(); return; }
      const inner = modal.querySelector('div');

      anime({
        targets: inner,
        scale: [1, 0.9],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInCubic',
        complete: () => {
          modal.classList.remove('modal-show');
          resolve();
        }
      });
    });
  }

  /**
   * Toast notification entrance animation.
   *
   * @param {HTMLElement} toast - The toast element
   */
  function toastIn(toast) {
    if (!toast) return;

    anime({
      targets: toast,
      translateX: [80, 0],
      opacity: [0, 1],
      duration: 350,
      easing: 'easeOutCubic',
    });
  }

  /**
   * Toast notification exit animation.
   *
   * @param {HTMLElement} toast - The toast element
   * @returns {Promise} Resolves when animation completes
   */
  function toastOut(toast) {
    return new Promise(resolve => {
      if (!toast) { resolve(); return; }

      anime({
        targets: toast,
        translateX: [0, 80],
        opacity: [1, 0],
        duration: 250,
        easing: 'easeInCubic',
        complete: () => {
          toast.remove();
          resolve();
        }
      });
    });
  }

  // Expose public API
  return {
    staggerIn,
    fadeIn,
    slideOut,
    watchedToggle,
    modalOpen,
    modalClose,
    toastIn,
    toastOut,
  };
})();
