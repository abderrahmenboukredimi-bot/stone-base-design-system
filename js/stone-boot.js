/* ==========================================================================
   Stone Base v1.1.2 — Pre-Paint Anti-FOUC Boot Script (CSP-safe)
   Reads <meta name="stone-storage-prefix"> (default: "stone") and restores
   theme, direction, and sidebar collapse state before first paint.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document.documentElement;
  var metaPrefix = document.querySelector('meta[name="stone-storage-prefix"]');
  var prefix = metaPrefix && metaPrefix.content ? metaPrefix.content.trim() : 'stone';

  function getStored(key) {
    try {
      var val = window.localStorage.getItem(prefix + '-' + key);
      if (val === null && prefix === 'stone') {
        val = window.localStorage.getItem('stone-' + key);
      }
      return val;
    } catch (e) {
      return null;
    }
  }

  var theme = getStored('theme');
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = theme === 'dark' || (theme !== 'light' && systemDark);
  if (isDark) doc.classList.add('dark');

  var dir = getStored('dir');
  if (dir === 'rtl' || dir === 'ltr') doc.dir = dir;

  if (getStored('sidebar') === 'true') {
    doc.dataset.sidebarCollapsed = 'true';
  }

  var corner = getStored('corner');
  if (corner === 'squircle' || corner === 'rounded') {
    doc.dataset.corner = corner;
  }
})();
