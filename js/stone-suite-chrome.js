/* ==========================================================================
   Stone Base v1.1.2 — Unified Showcase Chrome, Sprite & Demo Wiring
   Injects for index.html and all examples/*.html (zero-build & file:// safe):
   - Canonical hidden SVG <symbol> sprite (Core UI + Domain icons)
   - Synchronized 5-app Suite Switcher (#stone-suite-popover)
   - Settings Popover (#stone-settings-popover: Theme, RTL, Corner Profile)
   - Command Palette Dialog (#stone-cmdk-dialog: Cmd+K filter & jump)
   - Synchronized Mobile Navigation Drawer (#stone-mobile-drawer)
   - CSP-safe declarative demo feedback listeners (CustomEvents, zero onclick)
   ========================================================================== */

(function () {
  'use strict';

  var SPRITE_SYMBOLS = {
    brand: '<path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3z"></path><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"></path>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"></path>',
    sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M9 4v16"></path>',
    search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
    x: '<path d="M18 6 6 18M6 6l12 12"></path>',
    plus: '<path d="M12 5v14M5 12h14"></path>',
    minus: '<path d="M5 12h14"></path>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"></path>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"></path>',
    play: '<polygon points="6 4 20 12 6 20 6 4"></polygon>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.12-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.56C21.97 6.01 17.46 2 12 2z"></path>',
    type: '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18M9 21V9"></path>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"></path>',
    'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"></path>',
    'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"></path>',
    'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"></path>',
    'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"></path>',
    'arrow-left-right': '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"></path>',
    'chevron-right': '<path d="m9 6 6 6-6 6"></path>',
    'chevron-left': '<path d="m15 6-6 6 6 6"></path>',
    'chevron-up': '<path d="m6 15 6-6 6 6"></path>',
    'chevron-down': '<path d="m6 9 6 6 6-6"></path>',
    'chevrons-up-down': '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"></path>',
    'corner-down-right': '<polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>',
    'trending-down': '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline>',
    'panel-right': '<rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M15 4v16"></path>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path>',
    chart: '<path d="M3 3v18h18"></path><path d="M18 17V9M13 17V5M8 17v-3"></path>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>',
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    'alert-triangle': '<path d="m10.29 3.86-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.71-3l-8-14a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path><path d="M8 16H3v5"></path>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
  };

  var SUITE_APPS = [
    { id: 'catalog', name: 'Stone Base Catalog', badge: 'Reference', path: '/index.html', icon: 'brand' },
    { id: 'compact', name: 'Stone Converter', badge: 'Compact', path: '/examples/compact-utility.html', icon: 'sliders' },
    { id: 'workspace', name: 'Worker Operations', badge: 'Workspace', path: '/examples/workspace-app.html', icon: 'users' },
    { id: 'reservations', name: 'Studio Reservations', badge: 'Slots', path: '/examples/reservations.html', icon: 'calendar' },
    { id: 'automation', name: 'Automation Runs', badge: 'Queue', path: '/examples/automation-runs.html', icon: 'bolt' }
  ];

  function getContext() {
    var body = document.body;
    var rootPrefix = (body && body.getAttribute('data-root-prefix')) || '.';
    rootPrefix = rootPrefix.replace(/\/+$/, '');
    var appId = (body && body.getAttribute('data-stone-app')) || 'catalog';
    return { rootPrefix: rootPrefix, appId: appId };
  }

  function resolveAppUrl(path) {
    return getContext().rootPrefix + path;
  }

  function injectSvgSprite() {
    if (document.getElementById('stone-icon-sprite')) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'stone-icon-sprite';
    svg.setAttribute('hidden', '');
    svg.setAttribute('aria-hidden', 'true');

    var defs = document.createElementNS(svgNS, 'defs');
    Object.keys(SPRITE_SYMBOLS).forEach(function (key) {
      if (document.getElementById('stone-i-' + key)) return;
      var sym = document.createElementNS(svgNS, 'symbol');
      sym.id = 'stone-i-' + key;
      sym.setAttribute('viewBox', '0 0 24 24');
      sym.innerHTML = SPRITE_SYMBOLS[key];
      defs.appendChild(sym);
    });
    svg.appendChild(defs);
    document.body.insertBefore(svg, document.body.firstChild);
  }

  function buildSuitePopover() {
    var pop = document.getElementById('stone-suite-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'stone-suite-popover';
      document.body.appendChild(pop);
    }
    pop.className = 'stone-overlay stone-popover';
    pop.setAttribute('popover', 'auto');
    pop.setAttribute('data-anchored', 'true');

    var currentId = getContext().appId;
    var itemsHtml = SUITE_APPS.map(function (app) {
      var active = app.id === currentId;
      return (
        '<a href="' + resolveAppUrl(app.path) + '" class="stone-menu-item" role="menuitem"' +
        (active ? ' aria-current="page" data-active="true"' : '') + '>' +
        '<span class="stone-cluster" style="gap: var(--space-2);">' +
        '<svg class="stone-icon icon-w-regular" viewBox="0 0 24 24" aria-hidden="true">' +
        '<use href="#stone-i-' + app.icon + '"></use></svg>' +
        '<span>' + app.name + '</span></span>' +
        (active
          ? '<span class="stone-badge" data-tone="accent">Active</span>'
          : '<span class="text-caption">' + app.badge + '</span>') +
        '</a>'
      );
    }).join('');

    pop.innerHTML =
      '<div class="stone-menu-list" role="menu" aria-label="Stone Suite applications">' +
      '<div class="stone-cmdk__group-label">Stone Suite v1.1.2 Apps</div>' +
      itemsHtml +
      '<hr class="stone-divider">' +
      '<button type="button" class="stone-menu-item" role="menuitem" data-cmdk-open="stone-cmdk-dialog">' +
      '<span class="stone-cluster" style="gap: var(--space-2);">' +
      '<svg class="stone-icon icon-w-regular" viewBox="0 0 24 24" aria-hidden="true"><use href="#stone-i-search"></use></svg>' +
      '<span>Command palette</span></span>' +
      '<kbd class="stone-kbd">Ctrl+K</kbd>' +
      '</button>' +
      '</div>';
  }

  function syncSettingsState() {
    var pop = document.getElementById('stone-settings-popover');
    if (!pop) return;
    var metaPrefix = document.querySelector('meta[name="stone-storage-prefix"]');
    var prefix = metaPrefix && metaPrefix.content ? metaPrefix.content.trim() : 'stone';
    var storedTheme = 'system';
    try {
      storedTheme = window.localStorage.getItem(prefix + '-theme') || 'system';
    } catch (e) {}
    var corner = document.documentElement.dataset.corner || 'squircle';
    var dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      btn.setAttribute('data-active', String(btn.getAttribute('data-theme-choice') === storedTheme));
    });
    document.querySelectorAll('[data-corner-choice]').forEach(function (btn) {
      var active = btn.getAttribute('data-corner-choice') === corner;
      btn.setAttribute('data-active', String(active));
      if (btn.classList.contains('stone-segmented__btn')) {
        btn.setAttribute('aria-pressed', String(active));
      }
    });
    document.querySelectorAll('[data-corner-readout]').forEach(function (el) {
      el.textContent = corner === 'rounded' ? 'Rounded (classic)' : 'Squircle (smooth)';
    });
    document.querySelectorAll('[data-dir-choice]').forEach(function (btn) {
      btn.setAttribute('data-active', String(btn.getAttribute('data-dir-choice') === dir));
    });
  }

  function buildSettingsPopover() {
    var pop = document.getElementById('stone-settings-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'stone-settings-popover';
      document.body.appendChild(pop);
    }
    pop.className = 'stone-overlay stone-popover';
    pop.setAttribute('popover', 'auto');
    pop.setAttribute('data-anchored', 'true');

    pop.innerHTML =
      '<div class="stone-stack pad-xs">' +
      '<div class="stone-cmdk__group-label">Appearance</div>' +
      '<div class="stone-menu-list">' +
      '<button type="button" class="stone-menu-item" data-theme-choice="system"><span>System</span><span class="text-caption">Auto</span></button>' +
      '<button type="button" class="stone-menu-item" data-theme-choice="light"><span>Light \u00b7 Warm Chalk</span><span class="text-caption">72\u00b0</span></button>' +
      '<button type="button" class="stone-menu-item" data-theme-choice="dark"><span>Dark \u00b7 Obsidian</span><span class="text-caption">AA</span></button>' +
      '</div>' +
      '<hr class="stone-divider">' +
      '<div class="stone-cmdk__group-label">Direction</div>' +
      '<div class="stone-menu-list">' +
      '<button type="button" class="stone-menu-item" data-dir-choice="ltr"><span>Left-to-Right (LTR)</span><span class="text-caption">Default</span></button>' +
      '<button type="button" class="stone-menu-item" data-dir-choice="rtl"><span>Right-to-Left (RTL)</span><span class="text-caption">Arabic</span></button>' +
      '</div>' +
      '<hr class="stone-divider">' +
      '<div class="stone-cmdk__group-label">Corner Profile</div>' +
      '<div class="stone-menu-list">' +
      '<button type="button" class="stone-menu-item" data-corner-choice="squircle"><span>Squircle</span><span class="text-caption">Smooth</span></button>' +
      '<button type="button" class="stone-menu-item" data-corner-choice="rounded"><span>Rounded</span><span class="text-caption">Classic</span></button>' +
      '</div>' +
      '</div>';

    pop.addEventListener('click', function (e) {
      var themeBtn = e.target.closest('[data-theme-choice]');
      if (themeBtn && window.StoneUI) {
        window.StoneUI.setTheme(themeBtn.getAttribute('data-theme-choice'), true);
        syncSettingsState();
        return;
      }
      var dirBtn = e.target.closest('[data-dir-choice]');
      if (dirBtn && window.StoneUI) {
        window.StoneUI.setDirection(dirBtn.getAttribute('data-dir-choice'));
        syncSettingsState();
        return;
      }
      var cornerBtn = e.target.closest('[data-corner-choice]');
      if (cornerBtn) {
        var val = cornerBtn.getAttribute('data-corner-choice');
        document.documentElement.dataset.corner = val;
        try {
          window.localStorage.setItem('stone-corner', val);
        } catch (err) {}
        syncSettingsState();
      }
    });

    syncSettingsState();
    document.addEventListener('stone:theme-change', syncSettingsState);
    document.addEventListener('stone:dir-change', syncSettingsState);
  }

  function buildCmdkDialog() {
    var dlg = document.getElementById('stone-cmdk-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.id = 'stone-cmdk-dialog';
      document.body.appendChild(dlg);
    }
    dlg.className = 'stone-modal stone-dialog stone-dialog--instant';
    dlg.setAttribute('data-width', 'md');
    dlg.setAttribute('closedby', 'any');
    dlg.setAttribute('aria-label', 'Suite command launcher');

    var sectionLinks = Array.from(document.querySelectorAll('.stone-sidebar__link[href^="#"], main h2[id]')).map(
      function (el) {
        if (el.tagName === 'A') {
          var lbl = el.querySelector('.stone-sidebar__label');
          return { label: lbl ? lbl.textContent.trim() : el.textContent.trim(), href: el.getAttribute('href') };
        }
        return { label: el.textContent.trim(), href: '#' + el.id };
      }
    );

    dlg.innerHTML =
      '<div class="stone-cmdk__search-bar">' +
      '<svg class="stone-icon icon-w-medium text-secondary" viewBox="0 0 24 24" aria-hidden="true"><use href="#stone-i-search"></use></svg>' +
      '<input type="search" class="stone-cmdk__input" placeholder="Search Stone Suite apps or sections\u2026" aria-label="Filter suite commands">' +
      '<button type="button" class="stone-btn stone-btn--icon" data-variant="ghost" data-size="xs" data-dialog-close aria-label="Close command palette">' +
      '<svg class="stone-icon icon-w-medium" viewBox="0 0 24 24" aria-hidden="true"><use href="#stone-i-x"></use></svg>' +
      '</button></div>' +
      '<div class="stone-cmdk__list" role="listbox" aria-label="Command results"></div>' +
      '<p class="text-caption" data-cmdk-empty style="padding: var(--box-pad-md);" hidden>No matching sections or commands.</p>' +
      '<div class="stone-cmdk__footer">' +
      '<span>Use Up/Down + Enter to jump</span>' +
      '<span><kbd class="stone-kbd">Esc</kbd> to close</span>' +
      '</div>';

    var input = dlg.querySelector('.stone-cmdk__input');
    var listEl = dlg.querySelector('.stone-cmdk__list');
    var emptyEl = dlg.querySelector('[data-cmdk-empty]');
    var activeIdx = 0;

    function getCommands(query) {
      var q = (query || '').trim().toLowerCase();
      var currentId = getContext().appId;
      var cmds = [];
      SUITE_APPS.forEach(function (app) {
        cmds.push({
          group: 'Suite Applications',
          label: app.name + (app.id === currentId ? ' (Current)' : ''),
          meta: app.badge,
          href: resolveAppUrl(app.path)
        });
      });
      sectionLinks.forEach(function (sec) {
        cmds.push({
          group: 'On This Page',
          label: sec.label,
          meta: sec.href,
          href: sec.href
        });
      });
      cmds.push({
        group: 'Preferences',
        label: 'Toggle Light / Dark theme',
        meta: 'Theme',
        run: function () {
          if (window.StoneUI) window.StoneUI.toggleTheme();
        }
      });
      cmds.push({
        group: 'Preferences',
        label: 'Toggle LTR / RTL reading direction',
        meta: 'Direction',
        run: function () {
          if (window.StoneUI) window.StoneUI.setDirection(document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl');
        }
      });

      if (!q) return cmds;
      return cmds.filter(function (c) {
        return c.label.toLowerCase().indexOf(q) !== -1 || c.group.toLowerCase().indexOf(q) !== -1;
      });
    }

    function render(query) {
      var cmds = getCommands(query);
      listEl.innerHTML = '';
      if (cmds.length === 0) {
        emptyEl.hidden = false;
        return;
      }
      emptyEl.hidden = true;
      if (activeIdx >= cmds.length) activeIdx = 0;

      var lastGroup = '';
      cmds.forEach(function (cmd, idx) {
        if (cmd.group !== lastGroup) {
          lastGroup = cmd.group;
          var gl = document.createElement('div');
          gl.className = 'stone-cmdk__group-label';
          gl.textContent = cmd.group;
          listEl.appendChild(gl);
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'stone-cmdk__item';
        btn.setAttribute('role', 'option');
        btn.setAttribute('data-highlighted', String(idx === activeIdx));
        btn.innerHTML =
          '<span>' + cmd.label + '</span>' +
          '<span class="text-caption">' + cmd.meta + '</span>';
        btn.addEventListener('click', function () {
          execute(cmd);
        });
        listEl.appendChild(btn);
      });
    }

    function execute(cmd) {
      var closeFn = window.StoneUI ? window.StoneUI.closeDialog(dlg) : Promise.resolve(dlg.close());
      closeFn.then(function () {
        if (cmd.run) cmd.run();
        else if (cmd.href && cmd.href.charAt(0) === '#') {
          var target = document.getElementById(cmd.href.slice(1));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (cmd.href) {
          window.location.href = cmd.href;
        }
      });
    }

    input.addEventListener('input', function () {
      activeIdx = 0;
      render(input.value);
    });

    dlg.addEventListener('keydown', function (e) {
      var cmds = getCommands(input.value);
      if (cmds.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = (activeIdx + 1) % cmds.length;
        render(input.value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = (activeIdx - 1 + cmds.length) % cmds.length;
        render(input.value);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(cmds[activeIdx] || cmds[0]);
      }
    });

    /* Reset query when opened */
    var observer = new MutationObserver(function () {
      if (dlg.open) {
        input.value = '';
        activeIdx = 0;
        render('');
        window.requestAnimationFrame(function () {
          input.focus();
        });
      }
    });
    observer.observe(dlg, { attributes: true, attributeFilter: ['open'] });
    render('');
  }

  function syncMobileDrawer() {
    var drawer = document.getElementById('stone-mobile-drawer');
    if (!drawer) {
      drawer = document.createElement('dialog');
      drawer.id = 'stone-mobile-drawer';
      document.body.appendChild(drawer);
    }
    drawer.className = 'stone-drawer';
    drawer.setAttribute('closedby', 'any');
    drawer.setAttribute('aria-label', 'Mobile navigation');

    var currentId = getContext().appId;
    var activeApp = SUITE_APPS.find(function (a) { return a.id === currentId; }) || SUITE_APPS[0];

    var sidebarGroups = Array.from(document.querySelectorAll('.stone-sidebar .stone-sidebar__group'));
    var navHtml = sidebarGroups
      .map(function (group) {
        var title = group.querySelector('.stone-sidebar__group-title');
        var links = Array.from(group.querySelectorAll('.stone-sidebar__link'));
        var heading = title ? '<div class="stone-sidebar__group-title">' + title.textContent + '</div>' : '';
        var items = links
          .map(function (a) {
            var clone = a.cloneNode(true);
            clone.setAttribute('data-drawer-link', 'true');
            return clone.outerHTML;
          })
          .join('');
        return '<nav class="stone-sidebar__group" aria-label="Mobile sections">' + heading + items + '</nav>';
      })
      .join('');

    var suiteHtml = SUITE_APPS.map(function (app) {
      var active = app.id === currentId;
      return (
        '<a href="' + resolveAppUrl(app.path) + '" class="stone-sidebar__link"' +
        (active ? ' aria-current="page"' : '') + '>' +
        '<svg class="stone-icon icon-w-medium" viewBox="0 0 24 24" aria-hidden="true"><use href="#stone-i-' + app.icon + '"></use></svg>' +
        '<span class="stone-sidebar__label">' + app.name + '</span>' +
        '</a>'
      );
    }).join('');

    drawer.innerHTML =
      '<div class="stone-drawer__inner">' +
      '<div class="stone-row-baseline">' +
      '<span class="text-body-sm text-semibold">' + activeApp.name + '</span>' +
      '<button type="button" class="stone-btn stone-btn--icon" data-variant="ghost" data-size="xs" data-dialog-close aria-label="Close navigation menu">' +
      '<svg class="stone-icon icon-w-medium" viewBox="0 0 24 24" aria-hidden="true"><use href="#stone-i-x"></use></svg>' +
      '</button></div>' +
      navHtml +
      '<div class="stone-sidebar__footer">' +
      '<div class="stone-sidebar__group-title">Stone Suite Apps</div>' +
      suiteHtml +
      '</div></div>';

    drawer.addEventListener('click', function (e) {
      var link = e.target.closest('a[data-drawer-link]');
      if (link && window.StoneUI) {
        window.StoneUI.closeDialog(drawer);
      }
    });
  }

  function wireDemoEvents() {
    document.addEventListener('stone:hold-confirm', function () {
      if (window.StoneUI) {
        window.StoneUI.toast({
          title: 'Hold confirmed',
          description: 'Hold duration reached without releasing focus.',
          tone: 'danger'
        });
      }
    });

    document.addEventListener('stone:dialog-action', function (e) {
      if (!window.StoneUI || !e.detail) return;
      var action = e.detail.action;
      if (action === 'archive-demo') {
        window.StoneUI.toast({ title: 'Demo project archived', tone: 'danger', duration: 3600 });
      } else if (action === 'confirm-booking') {
        window.StoneUI.toast({
          title: 'Reservation confirmed',
          description: 'Slot hold transitioned to Confirmed.',
          tone: 'success'
        });
      }
    });

    document.addEventListener('click', function (e) {
      var dockBtn = e.target.closest('[data-demo-dock-toggle]');
      if (dockBtn) {
        var id = dockBtn.getAttribute('data-demo-dock-toggle');
        var bar = document.getElementById(id);
        if (bar) {
          bar.hidden = !bar.hidden;
          if (bar.id === 'index-floating-dock-demo') {
            var countEl = bar.querySelector('.stone-floating-bar__count');
            if (countEl) countEl.textContent = '3 tokens selected';
          }
        }
        return;
      }

      var cornerChoice = e.target.closest('[data-corner-choice]:not(#stone-settings-popover [data-corner-choice])');
      if (cornerChoice) {
        var nextCorner = cornerChoice.getAttribute('data-corner-choice');
        document.documentElement.dataset.corner = nextCorner;
        try { window.localStorage.setItem('stone-corner', nextCorner); } catch (err) {}
        syncSettingsState();
        return;
      }

      var actionMenuBtn = e.target.closest('[data-demo-action]');
      if (actionMenuBtn) {
        var pop = actionMenuBtn.closest('.stone-popover');
        if (pop && typeof pop.hidePopover === 'function') {
          try { pop.hidePopover(); } catch (err) {}
        }
        var kind = actionMenuBtn.getAttribute('data-demo-action');
        if (window.StoneUI) {
          if (kind === 'publish') {
            window.StoneUI.toast({ title: 'Published immediately', tone: 'success' });
          } else if (kind === 'export-json') {
            window.StoneUI.toast({ title: 'Specification JSON exported', tone: 'neutral' });
          } else if (kind === 'export-tokens') {
            window.StoneUI.toast({ title: 'Token snapshot exported', description: '3 selected tokens verified.', tone: 'success' });
          }
        }
      }
    });
  }

  function initSuiteChrome() {
    injectSvgSprite();
    buildSuitePopover();
    buildSettingsPopover();
    buildCmdkDialog();
    syncMobileDrawer();
    wireDemoEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuiteChrome);
  } else {
    initSuiteChrome();
  }
})();
