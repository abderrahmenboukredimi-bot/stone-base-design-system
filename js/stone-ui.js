/* ==========================================================================
   Stone Base v1.1.2 — Zero-Dependency Interactive Core Runtime
   Architecture:
   - Lifecycle-managed via StoneUI.mount(root, options) / destroy()
   - Namespaced localStorage (<meta name="stone-storage-prefix"> or "stone")
   - Pure interactive primitives + CustomEvents (zero showcase/demo routes)
   - CSP-safe: no inline script injection, no inline style attributes
   ========================================================================== */

(function (global) {
  'use strict';

  var activeMount = null;
  var lastTooltipClosedAt = 0;

  function prefersReducedMotion() {
    return Boolean(
      global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function isEditableTarget(target) {
    if (!target || target.nodeType !== 1) return false;
    if (target.isContentEditable) return true;
    return Boolean(
      target.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]')
    );
  }

  function formatSelectionCount(count, locale) {
    var lang = locale || document.documentElement.lang || 'en';
    try {
      var pr = new Intl.PluralRules(lang);
      var rule = pr.select(count);
      if (rule === 'one' && count === 1) return '1 item selected';
      return count + ' items selected';
    } catch (e) {
      return count === 1 ? '1 item selected' : count + ' items selected';
    }
  }

  function mount(rootEl, options) {
    if (activeMount) {
      activeMount.destroy();
    }

    var root = rootEl || document;
    var opts = options || {};
    var docEl = document.documentElement;
    var controller = new AbortController();
    var sig = controller.signal;

    var metaPrefix = document.querySelector('meta[name="stone-storage-prefix"]');
    var storagePrefix =
      opts.storagePrefix ||
      (metaPrefix && metaPrefix.content ? metaPrefix.content.trim() : '') ||
      'stone';

    var activeTimers = new Set();
    var scrollSpyObserver = null;

    function addTimer(id) {
      activeTimers.add(id);
      return id;
    }

    function clearTimer(id) {
      if (id !== null && id !== undefined) {
        global.clearTimeout(id);
        activeTimers.delete(id);
      }
    }

    function getStored(key) {
      try {
        return global.localStorage.getItem(storagePrefix + '-' + key);
      } catch (e) {
        return null;
      }
    }

    function setStored(key, value) {
      try {
        if (value === null || value === undefined) {
          global.localStorage.removeItem(storagePrefix + '-' + key);
        } else {
          global.localStorage.setItem(storagePrefix + '-' + key, String(value));
        }
      } catch (e) {
        /* Ignore storage errors under restricted sandbox/file policies */
      }
    }

    /* ----------------------------------------------------------------------
       1. Live Regions & Top-Layer Toast Container
       ---------------------------------------------------------------------- */
    function ensureLiveRegions() {
      var polite = document.getElementById('stone-live-polite');
      if (!polite) {
        polite = document.createElement('div');
        polite.id = 'stone-live-polite';
        polite.className = 'visually-hidden';
        polite.setAttribute('aria-live', 'polite');
        polite.setAttribute('aria-atomic', 'true');
        document.body.appendChild(polite);
      }
      var assertive = document.getElementById('stone-live-assertive');
      if (!assertive) {
        assertive = document.createElement('div');
        assertive.id = 'stone-live-assertive';
        assertive.className = 'visually-hidden';
        assertive.setAttribute('aria-live', 'assertive');
        assertive.setAttribute('aria-atomic', 'true');
        document.body.appendChild(assertive);
      }
      return { polite: polite, assertive: assertive };
    }

    function announce(message, priority) {
      if (!message) return;
      var regions = ensureLiveRegions();
      var target = priority === 'assertive' ? regions.assertive : regions.polite;
      target.textContent = '';
      global.requestAnimationFrame(function () {
        if (!sig.aborted) target.textContent = message;
      });
    }

    function ensureToastRegion() {
      var region = document.getElementById('stone-toast-region');
      if (!region) {
        region = document.createElement('div');
        region.id = 'stone-toast-region';
        region.className = 'stone-toast-region';
        region.setAttribute('popover', 'manual');
        region.setAttribute('role', 'region');
        region.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(region);
      } else if (!region.hasAttribute('popover')) {
        region.setAttribute('popover', 'manual');
      }
      return region;
    }

    function openToastRegionPopover(region) {
      if (typeof region.showPopover === 'function') {
        try {
          if (!region.matches(':popover-open')) {
            region.showPopover();
          }
        } catch (e) {
          /* Ignore if already open or top-layer disallowed */
        }
      }
    }

    function hideToastRegionIfEmpty(region) {
      if (!region || region.children.length > 0) return;
      if (typeof region.hidePopover === 'function') {
        try {
          if (region.matches(':popover-open')) {
            region.hidePopover();
          }
        } catch (e) {
          /* Ignore */
        }
      }
    }

    function toast(cfg) {
      var optsToast = cfg || {};
      var tone = optsToast.tone || 'neutral';
      var title = optsToast.title || '';
      var desc = optsToast.description || '';
      var duration = typeof optsToast.duration === 'number' ? optsToast.duration : 4500;

      var region = ensureToastRegion();
      openToastRegionPopover(region);

      var card = document.createElement('div');
      card.className = 'stone-toast stone-overlay pad-sm';
      card.setAttribute('data-tone', tone);
      card.setAttribute('role', tone === 'danger' ? 'alert' : 'status');

      var content = document.createElement('div');
      content.className = 'stone-stack';
      content.style.gap = 'var(--space-1)';

      if (title) {
        var titleEl = document.createElement('div');
        titleEl.className = 'text-body-sm';
        titleEl.style.fontWeight = '600';
        titleEl.textContent = title;
        content.appendChild(titleEl);
      }
      if (desc) {
        var descEl = document.createElement('div');
        descEl.className = 'text-caption';
        descEl.textContent = desc;
        content.appendChild(descEl);
      }
      card.appendChild(content);

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'stone-btn stone-btn--icon';
      closeBtn.setAttribute('data-variant', 'ghost');
      closeBtn.setAttribute('data-size', 'xs');
      closeBtn.setAttribute('aria-label', 'Dismiss notification');
      closeBtn.innerHTML =
        '<svg class="stone-icon icon-w-regular" viewBox="0 0 24 24" aria-hidden="true">' +
        '<use href="#stone-i-x"></use></svg>';

      var leaveTimer = null;
      var dismissed = false;

      function dismiss() {
        if (dismissed) return;
        dismissed = true;
        clearTimer(leaveTimer);
        card.setAttribute('data-leaving', 'true');
        card.removeAttribute('data-visible');
        var wait = prefersReducedMotion() ? 0 : 160;
        addTimer(
          global.setTimeout(function () {
            card.remove();
            hideToastRegionIfEmpty(region);
          }, wait)
        );
      }

      var trailing = document.createElement('div');
      trailing.className = 'stone-cluster';
      trailing.style.gap = 'var(--space-1)';
      if (optsToast.actionLabel) {
        var actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'stone-btn';
        actionBtn.setAttribute('data-variant', 'surface');
        actionBtn.setAttribute('data-size', 'xs');
        actionBtn.textContent = optsToast.actionLabel;
        actionBtn.addEventListener(
          'click',
          function () {
            if (typeof optsToast.onAction === 'function') optsToast.onAction();
            dismiss();
          },
          { signal: sig }
        );
        trailing.appendChild(actionBtn);
      }
      closeBtn.addEventListener('click', dismiss, { signal: sig });
      trailing.appendChild(closeBtn);
      card.appendChild(trailing);
      region.appendChild(card);

      global.requestAnimationFrame(function () {
        if (!sig.aborted) card.setAttribute('data-visible', 'true');
      });

      if (!optsToast.persistent && duration > 0) {
        var startTimer = function () {
          clearTimer(leaveTimer);
          leaveTimer = addTimer(global.setTimeout(dismiss, duration));
        };
        var pauseTimer = function () {
          clearTimer(leaveTimer);
        };
        card.addEventListener('pointerenter', pauseTimer, { signal: sig });
        card.addEventListener('pointerleave', startTimer, { signal: sig });
        card.addEventListener('focusin', pauseTimer, { signal: sig });
        card.addEventListener('focusout', startTimer, { signal: sig });
        startTimer();
      }

      announce((title ? title + '. ' : '') + desc, tone === 'danger' ? 'assertive' : 'polite');
      return { element: card, dismiss: dismiss };
    }

    /* ----------------------------------------------------------------------
       2. Theme, Direction & Sidebar State
       ---------------------------------------------------------------------- */
    function isDarkActive() {
      return docEl.classList.contains('dark');
    }

    function syncThemeControls(mode) {
      var dark = isDarkActive();
      var storedMode = mode || getStored('theme') || 'system';
      root.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(dark));
      });
      root.querySelectorAll('[data-theme-label]').forEach(function (el) {
        el.textContent = dark ? 'Dark' : 'Light';
      });
      root.querySelectorAll('[data-segmented-theme] .stone-segmented__btn').forEach(function (btn) {
        var target = btn.getAttribute('data-theme-value');
        btn.setAttribute('aria-pressed', String(target === storedMode));
      });
    }

    function setTheme(mode, animate) {
      var shouldAnimate = animate !== false;
      var resolvedDark =
        mode === 'dark' ||
        (mode !== 'light' &&
          global.matchMedia &&
          global.matchMedia('(prefers-color-scheme: dark)').matches);

      if (shouldAnimate) {
        docEl.setAttribute('data-theme-switching', 'true');
      }

      if (resolvedDark) docEl.classList.add('dark');
      else docEl.classList.remove('dark');

      if (mode === 'system') setStored('theme', null);
      else setStored('theme', mode);

      syncThemeControls(mode);

      if (shouldAnimate) {
        global.requestAnimationFrame(function () {
          global.requestAnimationFrame(function () {
            docEl.removeAttribute('data-theme-switching');
          });
        });
      }

      docEl.dispatchEvent(
        new CustomEvent('stone:theme-change', {
          bubbles: true,
          detail: { mode: mode, dark: resolvedDark }
        })
      );
    }

    function toggleTheme() {
      setTheme(isDarkActive() ? 'light' : 'dark', true);
    }

    function syncDirControls() {
      var isRtl = docEl.dir === 'rtl';
      root.querySelectorAll('[data-dir-toggle]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(isRtl));
        var label = btn.querySelector('[data-dir-label]');
        if (label) label.textContent = isRtl ? 'RTL' : 'LTR';
      });
    }

    function setDirection(dir) {
      var next = dir === 'rtl' ? 'rtl' : 'ltr';
      docEl.dir = next;
      setStored('dir', next);
      syncDirControls();
      docEl.dispatchEvent(
        new CustomEvent('stone:dir-change', { bubbles: true, detail: { dir: next } })
      );
    }

    function syncSidebarState() {
      var collapsed = docEl.dataset.sidebarCollapsed === 'true';
      root.querySelectorAll('.stone-shell--workspace').forEach(function (shell) {
        shell.setAttribute('data-sidebar-collapsed', String(collapsed));
      });
      root.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    }

    function toggleSidebar() {
      var next = docEl.dataset.sidebarCollapsed !== 'true';
      if (next) docEl.dataset.sidebarCollapsed = 'true';
      else delete docEl.dataset.sidebarCollapsed;
      setStored('sidebar', String(next));
      syncSidebarState();
    }

    /* ----------------------------------------------------------------------
       3. Dialogs, Mobile Drawer & Promise-returning closeTopLayer()
       ---------------------------------------------------------------------- */
    function hasOpenModalDialog() {
      return Boolean(document.querySelector('dialog[open]:not([data-closing])'));
    }

    function openDialog(dialog) {
      if (!dialog || typeof dialog.showModal !== 'function') return;
      if (dialog.open) return;
      delete dialog.dataset.closing;
      dialog.showModal();
      syncSelectionAll();
    }

    function closeDialog(dialog) {
      return new Promise(function (resolve) {
        if (!dialog || !dialog.open) {
          syncSelectionAll();
          resolve();
          return;
        }
        var isInstant = dialog.classList.contains('stone-dialog--instant');
        var isDrawer = dialog.classList.contains('stone-drawer');
        var wait = prefersReducedMotion() || isInstant ? 0 : isDrawer ? 240 : 160;
        if (wait === 0) {
          delete dialog.dataset.closing;
          dialog.close();
          syncSelectionAll();
          resolve();
          return;
        }
        dialog.dataset.closing = 'true';
        syncSelectionAll();
        addTimer(
          global.setTimeout(function () {
            delete dialog.dataset.closing;
            if (dialog.open) dialog.close();
            syncSelectionAll();
            resolve();
          }, wait)
        );
      });
    }

    function closeTopLayer() {
      var tasks = [];
      document.querySelectorAll('.stone-popover:popover-open').forEach(function (pop) {
        if (typeof pop.hidePopover === 'function') {
          try {
            pop.hidePopover();
          } catch (e) {
            /* Ignore */
          }
        }
      });
      hideTooltip(true);
      document.querySelectorAll('dialog[open]').forEach(function (dlg) {
        tasks.push(closeDialog(dlg));
      });
      return Promise.all(tasks).then(function () {});
    }

    /* ----------------------------------------------------------------------
       4. Popovers (aria-expanded sync + JS Anchor Fallback)
       ---------------------------------------------------------------------- */
    function positionPopoverToAnchor(popover, trigger) {
      if (!popover || !trigger) return;
      if (
        !popover.classList.contains('is-js-anchored') &&
        global.CSS &&
        global.CSS.supports &&
        global.CSS.supports('position-anchor', '--stone-test')
      ) {
        return;
      }
      popover.classList.add('is-js-anchored');
      var r = trigger.getBoundingClientRect();
      var popRect = popover.getBoundingClientRect();
      var vw = global.innerWidth;
      var vh = global.innerHeight;
      var isRtl = docEl.dir === 'rtl';

      var top = r.bottom + 6;
      if (top + popRect.height > vh - 8 && r.top - popRect.height - 6 >= 8) {
        top = r.top - popRect.height - 6;
      }
      var left = isRtl ? r.right - popRect.width : r.left;
      if (left + popRect.width > vw - 8) left = vw - popRect.width - 8;
      if (left < 8) left = 8;

      popover.style.position = 'fixed';
      popover.style.margin = '0';
      popover.style.inset = 'auto';
      popover.style.top = Math.round(top) + 'px';
      popover.style.left = Math.round(left) + 'px';
    }

    function updateOpenPopovers() {
      document.querySelectorAll('.stone-popover:popover-open').forEach(function (pop) {
        if (!pop.id) return;
        var trigger = document.querySelector('[popovertarget="' + pop.id + '"]');
        if (trigger) positionPopoverToAnchor(pop, trigger);
      });
    }

    /* ----------------------------------------------------------------------
       5. WCAG 1.4.13 Hoverable, Dismissible, Viewport-Clamped Tooltip
       ---------------------------------------------------------------------- */
    var tooltipEl = null;
    var tooltipHideTimer = null;
    var tooltipCurrentTrigger = null;

    function ensureTooltipEl() {
      if (tooltipEl && document.body.contains(tooltipEl)) return tooltipEl;
      tooltipEl = document.getElementById('stone-tooltip-singleton');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'stone-tooltip-singleton';
        tooltipEl.className = 'stone-tooltip';
        tooltipEl.setAttribute('popover', 'manual');
        tooltipEl.setAttribute('role', 'tooltip');
        document.body.appendChild(tooltipEl);
      }
      tooltipEl.addEventListener(
        'pointerenter',
        function () {
          clearTimer(tooltipHideTimer);
        },
        { signal: sig }
      );
      tooltipEl.addEventListener(
        'pointerleave',
        function () {
          scheduleHideTooltip();
        },
        { signal: sig }
      );
      return tooltipEl;
    }

    function getTooltipText(trigger) {
      if (!trigger) return '';
      var explicit = trigger.getAttribute('data-tooltip');
      if (explicit) return explicit;
      if (
        docEl.dataset.sidebarCollapsed === 'true' &&
        trigger.matches('.stone-sidebar__link, .stone-suite-trigger')
      ) {
        var lbl = trigger.querySelector('.stone-sidebar__label');
        if (lbl) return lbl.textContent.trim();
      }
      return '';
    }

    function showTooltip(trigger) {
      var text = getTooltipText(trigger);
      if (!text) return;
      clearTimer(tooltipHideTimer);
      var tip = ensureTooltipEl();
      tooltipCurrentTrigger = trigger;
      tip.textContent = text;
      var instant = Date.now() - lastTooltipClosedAt < 400;
      if (instant) tip.setAttribute('data-instant', 'true');
      else tip.removeAttribute('data-instant');

      if (typeof tip.showPopover === 'function') {
        try {
          if (!tip.matches(':popover-open')) tip.showPopover();
        } catch (e) {
          /* Ignore */
        }
      }

      var r = trigger.getBoundingClientRect();
      var tr = tip.getBoundingClientRect();
      var vw = global.innerWidth;
      var vh = global.innerHeight;
      var isCollapsedRail =
        docEl.dataset.sidebarCollapsed === 'true' &&
        trigger.closest('.stone-sidebar') !== null;

      var top;
      var left;
      if (isCollapsedRail) {
        top = r.top + (r.height - tr.height) / 2;
        left = docEl.dir === 'rtl' ? r.left - tr.width - 8 : r.right + 8;
      } else {
        top = r.top - tr.height - 6;
        if (top < 8) top = r.bottom + 6;
        left = r.left + (r.width - tr.width) / 2;
      }

      if (left + tr.width > vw - 8) left = vw - tr.width - 8;
      if (left < 8) left = 8;
      if (top + tr.height > vh - 8) top = vh - tr.height - 8;
      if (top < 8) top = 8;

      tip.style.position = 'fixed';
      tip.style.margin = '0';
      tip.style.inset = 'auto';
      tip.style.top = Math.round(top) + 'px';
      tip.style.left = Math.round(left) + 'px';
    }

    function hideTooltip(immediate) {
      clearTimer(tooltipHideTimer);
      if (!tooltipEl) return;
      if (typeof tooltipEl.hidePopover === 'function') {
        try {
          if (tooltipEl.matches(':popover-open')) {
            tooltipEl.hidePopover();
            lastTooltipClosedAt = Date.now();
          }
        } catch (e) {
          /* Ignore */
        }
      }
      if (immediate) tooltipCurrentTrigger = null;
    }

    function scheduleHideTooltip() {
      clearTimer(tooltipHideTimer);
      tooltipHideTimer = addTimer(
        global.setTimeout(function () {
          hideTooltip(true);
        }, 120)
      );
    }

    /* ----------------------------------------------------------------------
       6. Table Selection, Visible-Row Scoping & Floating Bar Sync
       ---------------------------------------------------------------------- */
    function syncSelection(tableOrContainer) {
      var wrap = tableOrContainer || root;
      var rows = Array.from(wrap.querySelectorAll('tbody tr:not([hidden])'));
      var checkboxes = [];
      var checkedCount = 0;

      rows.forEach(function (row) {
        var cb = row.querySelector('[data-row-select], [data-select-row]');
        if (!cb || cb.disabled) return;
        checkboxes.push(cb);
        row.setAttribute('data-selected', String(cb.checked));
        if (cb.checked) checkedCount += 1;
      });

      var selectAlls = wrap.querySelectorAll('[data-select-all]');
      selectAlls.forEach(function (sa) {
        sa.checked = checkboxes.length > 0 && checkedCount === checkboxes.length;
        sa.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
      });

      var barId = wrap.getAttribute ? wrap.getAttribute('data-floating-bar-target') : null;
      var scopeAttr = wrap.getAttribute ? wrap.getAttribute('data-selection-scope') : null;
      var bar =
        (barId && document.getElementById(barId)) ||
        (scopeAttr && document.querySelector('[data-floating-bar="' + scopeAttr + '"]')) ||
        document.querySelector('[data-floating-bar]:not(.stone-floating-bar--static)');

      if (bar) {
        var hideBar = checkedCount === 0 || hasOpenModalDialog();
        bar.hidden = hideBar;
        var countEl = bar.querySelector('[data-floating-count], [data-selection-count]');
        if (countEl) {
          countEl.textContent = formatSelectionCount(checkedCount);
        }
      }

      if (wrap && wrap.dispatchEvent) {
        wrap.dispatchEvent(
          new CustomEvent('stone:selection-change', {
            bubbles: true,
            detail: { count: checkedCount, totalVisible: checkboxes.length }
          })
        );
      }
    }

    function syncSelectionAll() {
      var containers = root.querySelectorAll('[data-selection-scope]');
      if (containers.length > 0) {
        containers.forEach(function (c) {
          syncSelection(c);
        });
      } else if (root.querySelector('[data-row-select], [data-select-row]')) {
        syncSelection(root);
      }
    }

    /* ----------------------------------------------------------------------
       7. Hold-to-Confirm ([data-hold-confirm])
       ---------------------------------------------------------------------- */
    function initHoldButtons() {
      root.querySelectorAll('[data-hold-confirm]').forEach(function (btn) {
        var duration = parseInt(btn.getAttribute('data-hold-ms') || '900', 10);
        var holdTimer = null;
        var active = false;

        function cancelHold() {
          if (!active) return;
          active = false;
          clearTimer(holdTimer);
          holdTimer = null;
          btn.removeAttribute('data-holding');
        }

        function startHold(e) {
          if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
          if (e.type === 'pointerdown' && e.button !== 0) return;
          if (active) return;
          active = true;
          btn.setAttribute('data-holding', 'true');
          holdTimer = addTimer(
            global.setTimeout(function () {
              active = false;
              btn.removeAttribute('data-holding');
              btn.dispatchEvent(
                new CustomEvent('stone:hold-confirm', {
                  bubbles: true,
                  detail: {
                    trigger: btn,
                    action: btn.getAttribute('data-hold-confirm') || 'confirm'
                  }
                })
              );
            }, duration)
          );
        }

        btn.addEventListener('pointerdown', startHold, { signal: sig });
        btn.addEventListener('pointerup', cancelHold, { signal: sig });
        btn.addEventListener('pointercancel', cancelHold, { signal: sig });
        btn.addEventListener('pointerleave', cancelHold, { signal: sig });
        btn.addEventListener('blur', cancelHold, { signal: sig });
        btn.addEventListener(
          'keydown',
          function (e) {
            if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
              e.preventDefault();
              startHold(e);
            } else if (e.key === 'Escape') {
              cancelHold();
            }
          },
          { signal: sig }
        );
        btn.addEventListener(
          'keyup',
          function (e) {
            if (e.key === ' ' || e.key === 'Enter') {
              cancelHold();
            }
          },
          { signal: sig }
        );
      });
    }

    /* ----------------------------------------------------------------------
       8. Tabs, Segmented Controls, Single Select & ScrollSpy
       ---------------------------------------------------------------------- */
    function activateTab(tablist, tab) {
      if (!tablist || !tab || tab.disabled || tab.getAttribute('aria-disabled') === 'true') return;
      var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.setAttribute('tabindex', selected ? '0' : '-1');
        var panelId = t.getAttribute('aria-controls');
        if (panelId) {
          var panel = document.getElementById(panelId);
          if (panel) panel.hidden = !selected;
        }
      });

      var tabValue = tab.getAttribute('data-tab-value') || tab.getAttribute('aria-controls') || '';
      if (tablist.hasAttribute('data-sync-url') && tabValue && global.history && global.history.replaceState) {
        try {
          var url = new URL(global.location.href);
          url.searchParams.set('tab', tabValue);
          global.history.replaceState(null, '', url.toString());
        } catch (e) {
          /* Ignore on restricted file:// origins if malformed */
        }
      }

      tablist.dispatchEvent(
        new CustomEvent('stone:tab-change', {
          bubbles: true,
          detail: { tab: tab, value: tabValue }
        })
      );
    }

    function initTabsFromUrl() {
      var params = null;
      try {
        params = new URLSearchParams(global.location.search);
      } catch (e) {
        params = null;
      }
      var requested = params ? params.get('tab') : null;
      if (!requested) return;
      root.querySelectorAll('[role="tablist"][data-sync-url]').forEach(function (list) {
        var match = list.querySelector(
          '[role="tab"][data-tab-value="' + requested + '"], [role="tab"][aria-controls="' + requested + '"]'
        );
        if (match) activateTab(list, match);
      });
    }

    function initScrollSpy() {
      var nav = root.querySelector('[data-scrollspy]');
      if (!nav || typeof global.IntersectionObserver !== 'function') return;
      var links = Array.from(nav.querySelectorAll('a[href^="#"]'));
      var sectionMap = new Map();
      links.forEach(function (link) {
        var id = link.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (section) sectionMap.set(section, link);
      });
      if (sectionMap.size === 0) return;

      scrollSpyObserver = new global.IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var activeLink = sectionMap.get(entry.target);
            if (!activeLink) return;
            links.forEach(function (l) {
              if (l === activeLink) l.setAttribute('aria-current', 'location');
              else l.removeAttribute('aria-current');
            });
          });
        },
        { rootMargin: '-20% 0px -65% 0px', threshold: 0.01 }
      );
      sectionMap.forEach(function (_link, section) {
        scrollSpyObserver.observe(section);
      });
    }

    /* ----------------------------------------------------------------------
       9. Delegated Event Wiring (CSP-safe, Signal-bound)
       ---------------------------------------------------------------------- */
    root.addEventListener(
      'click',
      function (e) {
        var target = e.target;
        if (!target || target.nodeType !== 1) return;

        var themeBtn = target.closest('[data-theme-toggle]');
        if (themeBtn) {
          toggleTheme();
          return;
        }

        var segThemeBtn = target.closest('[data-segmented-theme] .stone-segmented__btn');
        if (segThemeBtn) {
          setTheme(segThemeBtn.getAttribute('data-theme-value') || 'system', true);
          return;
        }

        var dirBtn = target.closest('[data-dir-toggle]');
        if (dirBtn) {
          setDirection(docEl.dir === 'rtl' ? 'ltr' : 'rtl');
          return;
        }

        var sidebarBtn = target.closest('[data-sidebar-toggle], [data-sidebar-collapse]');
        if (sidebarBtn) {
          toggleSidebar();
          return;
        }

        var dlgOpen = target.closest('[data-dialog-open], [data-open-dialog]');
        if (dlgOpen) {
          var dlgId = dlgOpen.getAttribute('data-dialog-open') || dlgOpen.getAttribute('data-open-dialog');
          closeTopLayer().then(function () {
            openDialog(document.getElementById(dlgId));
          });
          return;
        }

        var cmdkOpen = target.closest('[data-cmdk-open]');
        if (cmdkOpen) {
          var cmdkId = cmdkOpen.getAttribute('data-cmdk-open') || 'stone-cmdk-dialog';
          closeTopLayer().then(function () {
            openDialog(document.getElementById(cmdkId));
          });
          return;
        }

        var drawerOpen = target.closest('[data-drawer-open]');
        if (drawerOpen) {
          var drwId = drawerOpen.getAttribute('data-drawer-open') || 'stone-mobile-drawer';
          closeTopLayer().then(function () {
            openDialog(document.getElementById(drwId));
          });
          return;
        }

        var dlgClose = target.closest('[data-dialog-close], [data-close-dialog], [data-drawer-close]');
        if (dlgClose) {
          var parentDlg = dlgClose.closest('dialog');
          if (parentDlg) closeDialog(parentDlg);
          return;
        }

        var dlgAction = target.closest('[data-dialog-action]');
        if (dlgAction) {
          var hostDlg = dlgAction.closest('dialog');
          var actionName = dlgAction.getAttribute('data-dialog-action') || 'confirm';
          dlgAction.dispatchEvent(
            new CustomEvent('stone:dialog-action', {
              bubbles: true,
              detail: { action: actionName, dialog: hostDlg, trigger: dlgAction }
            })
          );
          if (hostDlg && !dlgAction.hasAttribute('data-keep-open')) {
            closeDialog(hostDlg);
          }
          return;
        }

        var toastBtn = target.closest('[data-toast-trigger]');
        if (toastBtn) {
          toast({
            title: toastBtn.getAttribute('data-toast-title') || 'Update complete',
            description: toastBtn.getAttribute('data-toast-desc') || '',
            tone: toastBtn.getAttribute('data-toast-tone') || 'neutral'
          });
          return;
        }

        var copyBtn = target.closest('[data-copy-text]');
        if (copyBtn) {
          var txt = copyBtn.getAttribute('data-copy-text');
          var labelText = copyBtn.getAttribute('data-copy-label') || 'Copied to clipboard';
          if (global.navigator && global.navigator.clipboard && global.navigator.clipboard.writeText) {
            global.navigator.clipboard.writeText(txt).then(
              function () {
                toast({ title: labelText, description: txt, tone: 'success', duration: 2400 });
              },
              function () {
                toast({ title: 'Copy unavailable', description: txt, tone: 'neutral', duration: 2400 });
              }
            );
          } else {
            toast({ title: labelText, description: txt, tone: 'neutral', duration: 2400 });
          }
          return;
        }

        var tabEl = target.closest('[role="tablist"] [role="tab"]');
        if (tabEl) {
          activateTab(tabEl.closest('[role="tablist"]'), tabEl);
          return;
        }

        var segBtn = target.closest('[data-segmented]:not([data-segmented-theme]) .stone-segmented__btn');
        if (segBtn && !segBtn.disabled && segBtn.getAttribute('aria-disabled') !== 'true') {
          var segGroup = segBtn.closest('[data-segmented]');
          segGroup.querySelectorAll('.stone-segmented__btn').forEach(function (b) {
            b.setAttribute('aria-pressed', String(b === segBtn));
          });
          segGroup.dispatchEvent(
            new CustomEvent('stone:select', {
              bubbles: true,
              detail: {
                value: segBtn.getAttribute('data-value') || segBtn.textContent.trim(),
                button: segBtn
              }
            })
          );
          return;
        }

        var singleOpt = target.closest('[data-single-select] [data-option], [data-single-select] [role="radio"]');
        if (singleOpt && !singleOpt.disabled && singleOpt.getAttribute('aria-disabled') !== 'true') {
          var ssGroup = singleOpt.closest('[data-single-select]');
          ssGroup.querySelectorAll('[data-option], [role="radio"]').forEach(function (opt) {
            var isSel = opt === singleOpt;
            if (opt.getAttribute('role') === 'radio') opt.setAttribute('aria-checked', String(isSel));
            else opt.setAttribute('aria-pressed', String(isSel));
            opt.setAttribute('data-selected', String(isSel));
          });
          ssGroup.dispatchEvent(
            new CustomEvent('stone:select', {
              bubbles: true,
              detail: {
                value: singleOpt.getAttribute('data-value') || singleOpt.textContent.trim(),
                option: singleOpt
              }
            })
          );
          return;
        }

        var expandBtn = target.closest('[data-row-expand]');
        if (expandBtn) {
          var expanded = expandBtn.getAttribute('aria-expanded') === 'true';
          var nextState = !expanded;
          expandBtn.setAttribute('aria-expanded', String(nextState));
          var ctrlId = expandBtn.getAttribute('aria-controls');
          var detailRow = ctrlId
            ? document.getElementById(ctrlId)
            : expandBtn.closest('tr') && expandBtn.closest('tr').nextElementSibling;
          if (detailRow && detailRow.classList.contains('stone-table__detail')) {
            detailRow.hidden = !nextState;
          }
          return;
        }

        var chipRemove = target.closest('.stone-chip__remove');
        if (chipRemove) {
          var chip = chipRemove.closest('.stone-chip');
          var chipGroup = chipRemove.closest('[data-chip-group]');
          if (chip) chip.hidden = true;
          if (chipGroup) {
            var resetBtn = chipGroup.querySelector('[data-chip-reset]');
            var anyHidden = Array.from(chipGroup.querySelectorAll('.stone-chip')).some(function (c) {
              return c.hidden;
            });
            if (resetBtn) resetBtn.hidden = !anyHidden;
            chipGroup.dispatchEvent(new CustomEvent('stone:chip-change', { bubbles: true }));
          }
          return;
        }

        var chipReset = target.closest('[data-chip-reset]');
        if (chipReset) {
          var grp = chipReset.closest('[data-chip-group]');
          if (grp) {
            grp.querySelectorAll('.stone-chip').forEach(function (c) {
              c.hidden = false;
            });
            chipReset.hidden = true;
            grp.dispatchEvent(new CustomEvent('stone:chip-change', { bubbles: true }));
          }
          return;
        }

        var clearSelBtn = target.closest('[data-clear-selection], [data-selection-clear]');
        if (clearSelBtn) {
          var targetSel = clearSelBtn.getAttribute('data-clear-selection');
          var barParent = clearSelBtn.closest('[data-floating-bar]');
          var barScope = barParent ? barParent.getAttribute('data-floating-bar') : null;
          var scope =
            (targetSel && document.getElementById(targetSel)) ||
            (barScope && root.querySelector('[data-selection-scope="' + barScope + '"]')) ||
            root;
          scope.querySelectorAll('[data-row-select], [data-select-row], [data-select-all]').forEach(function (cb) {
            cb.checked = false;
            cb.indeterminate = false;
          });
          syncSelection(scope);
          return;
        }

        var closeInspBtn = target.closest('[data-inspector-close]');
        if (closeInspBtn) {
          var wsBody = closeInspBtn.closest('.stone-workspace-body') || root.querySelector('.stone-workspace-body');
          if (wsBody) wsBody.setAttribute('data-inspector-open', 'false');
          root.querySelectorAll('tr[data-inspected="true"]').forEach(function (r) {
            r.removeAttribute('data-inspected');
          });
          return;
        }

        var inspectRow = target.closest('tr[data-inspect-row]');
        if (inspectRow && !target.closest('button, a, input, label, select')) {
          var tbody = inspectRow.closest('tbody');
          if (tbody) {
            tbody.querySelectorAll('tr[data-inspected="true"]').forEach(function (r) {
              r.removeAttribute('data-inspected');
            });
          }
          inspectRow.setAttribute('data-inspected', 'true');
          var bodyEl = root.querySelector('.stone-workspace-body');
          if (bodyEl) bodyEl.setAttribute('data-inspector-open', 'true');
          inspectRow.dispatchEvent(
            new CustomEvent('stone:inspect', {
              bubbles: true,
              detail: { row: inspectRow, id: inspectRow.getAttribute('data-inspect-row') }
            })
          );
          return;
        }

        /* Toggle standalone aria-pressed buttons not already handled above */
        var toggleBtn = target.closest('.stone-btn[aria-pressed]:not([data-theme-toggle]):not([data-dir-toggle])');
        if (toggleBtn && !toggleBtn.closest('[data-segmented], [data-single-select]')) {
          var pressed = toggleBtn.getAttribute('aria-pressed') === 'true';
          toggleBtn.setAttribute('aria-pressed', String(!pressed));
        }
      },
      { signal: sig }
    );

    root.addEventListener(
      'change',
      function (e) {
        var target = e.target;
        if (!target || target.nodeType !== 1) return;

        if (target.matches('[data-select-all]')) {
          var scope = target.closest('[data-selection-scope]') || target.closest('.stone-table-wrap') || root;
          var checked = target.checked;
          scope.querySelectorAll('tbody tr:not([hidden]) [data-row-select], tbody tr:not([hidden]) [data-select-row]').forEach(function (cb) {
            if (!cb.disabled) cb.checked = checked;
          });
          syncSelection(scope);
          return;
        }

        if (target.matches('[data-row-select], [data-select-row]')) {
          var rowScope = target.closest('[data-selection-scope]') || target.closest('.stone-table-wrap') || root;
          syncSelection(rowScope);
        }
      },
      { signal: sig }
    );

    /* Dialog backdrop click (outside card bounds + primary pointer button) & Escape close */
    document.addEventListener(
      'click',
      function (e) {
        var dlg = e.target;
        if (!dlg || dlg.tagName !== 'DIALOG' || !dlg.open || e.button !== 0) return;
        var rect = dlg.getBoundingClientRect();
        var outside =
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom;
        if (outside) {
          closeDialog(dlg);
        }
      },
      { signal: sig }
    );

    document.addEventListener(
      'cancel',
      function (e) {
        var dlg = e.target;
        if (dlg && dlg.tagName === 'DIALOG') {
          e.preventDefault();
          closeDialog(dlg);
        }
      },
      { signal: sig, capture: true }
    );

    /* Popover aria-expanded + positioning + modal backdrop restore */
    document.addEventListener(
      'toggle',
      function (e) {
        var pop = e.target;
        if (!pop || !pop.classList || !pop.classList.contains('stone-popover')) return;
        var isOpen = e.newState === 'open';
        if (pop.id) {
          document.querySelectorAll('[popovertarget="' + pop.id + '"]').forEach(function (btn) {
            btn.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) positionPopoverToAnchor(pop, btn);
          });
        }
      },
      { signal: sig, capture: true }
    );

    /* Keyboard navigation for tabs, menu items, global shortcuts, and Escape tooltip dismiss */
    document.addEventListener(
      'keydown',
      function (e) {
        if (e.key === 'Escape') {
          hideTooltip(true);
          return;
        }

        if ((e.metaKey || e.ctrlKey) && !e.altKey) {
          var key = e.key.toLowerCase();
          if (key === 'k' && !isEditableTarget(e.target)) {
            var cmdkDlg = document.getElementById('stone-cmdk-dialog');
            if (cmdkDlg) {
              e.preventDefault();
              closeTopLayer().then(function () {
                openDialog(cmdkDlg);
              });
            }
            return;
          }
          if (key === 'b' && !isEditableTarget(e.target)) {
            if (root.querySelector('.stone-shell--workspace .stone-sidebar')) {
              e.preventDefault();
              toggleSidebar();
            }
            return;
          }
        }

        var activeTab = e.target && e.target.closest ? e.target.closest('[role="tablist"] [role="tab"]') : null;
        if (activeTab) {
          var tablist = activeTab.closest('[role="tablist"]');
          var tabs = Array.from(tablist.querySelectorAll('[role="tab"]:not(:disabled):not([aria-disabled="true"])'));
          var idx = tabs.indexOf(activeTab);
          if (idx === -1) return;
          var rtl = docEl.dir === 'rtl';
          var nextIdx = idx;
          if (e.key === 'ArrowRight') nextIdx = (idx + (rtl ? -1 : 1) + tabs.length) % tabs.length;
          else if (e.key === 'ArrowLeft') nextIdx = (idx + (rtl ? 1 : -1) + tabs.length) % tabs.length;
          else if (e.key === 'Home') nextIdx = 0;
          else if (e.key === 'End') nextIdx = tabs.length - 1;
          else return;
          e.preventDefault();
          tabs[nextIdx].focus();
          activateTab(tablist, tabs[nextIdx]);
          return;
        }

        var rowInspect = e.target && e.target.closest ? e.target.closest('tr[data-inspect-row]') : null;
        if (rowInspect && (e.key === 'Enter' || e.key === ' ') && e.target === rowInspect) {
          e.preventDefault();
          rowInspect.click();
          return;
        }

        var menuItem = e.target && e.target.closest ? e.target.closest('[role="menu"] [role="menuitem"], .stone-popover .stone-menu-item') : null;
        if (menuItem) {
          var menu = menuItem.closest('[role="menu"], .stone-popover');
          var items = Array.from(menu.querySelectorAll('[role="menuitem"], .stone-menu-item')).filter(function (el) {
            return !el.disabled && el.getAttribute('aria-disabled') !== 'true';
          });
          var mIdx = items.indexOf(menuItem);
          if (mIdx !== -1 && items.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              items[(mIdx + 1) % items.length].focus();
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              items[(mIdx - 1 + items.length) % items.length].focus();
            } else if (e.key === 'Home') {
              e.preventDefault();
              items[0].focus();
            } else if (e.key === 'End') {
              e.preventDefault();
              items[items.length - 1].focus();
            }
          }
        }
      },
      { signal: sig }
    );

    /* Hover/focus delegation for WCAG 1.4.13 tooltips */
    root.addEventListener(
      'pointerenter',
      function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-tooltip], .stone-sidebar__link, .stone-suite-trigger') : null;
        if (trigger && getTooltipText(trigger)) showTooltip(trigger);
      },
      { signal: sig, capture: true }
    );
    root.addEventListener(
      'pointerleave',
      function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-tooltip], .stone-sidebar__link, .stone-suite-trigger') : null;
        if (trigger && trigger === tooltipCurrentTrigger) scheduleHideTooltip();
      },
      { signal: sig, capture: true }
    );
    root.addEventListener(
      'focusin',
      function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-tooltip], .stone-sidebar__link, .stone-suite-trigger') : null;
        if (trigger && getTooltipText(trigger)) showTooltip(trigger);
      },
      { signal: sig }
    );
    root.addEventListener(
      'focusout',
      function (e) {
        var trigger = e.target && e.target.closest ? e.target.closest('[data-tooltip], .stone-sidebar__link, .stone-suite-trigger') : null;
        if (trigger && trigger === tooltipCurrentTrigger) hideTooltip(true);
      },
      { signal: sig }
    );

    /* Reposition anchored popovers & notify floating bars on custom sync */
    global.addEventListener('resize', updateOpenPopovers, { signal: sig, passive: true });
    global.addEventListener('scroll', updateOpenPopovers, { signal: sig, capture: true, passive: true });

    root.addEventListener(
      'stone:selection-sync',
      function (e) {
        syncSelection(e.target && e.target.closest ? e.target.closest('[data-selection-scope]') || root : root);
      },
      { signal: sig }
    );

    /* Cross-tab storage sync strictly scoped to storagePrefix */
    global.addEventListener(
      'storage',
      function (e) {
        if (!e.key || e.key.indexOf(storagePrefix + '-') !== 0) return;
        var suffix = e.key.slice(storagePrefix.length + 1);
        if (suffix === 'theme') setTheme(e.newValue || 'system', false);
        else if (suffix === 'dir') setDirection(e.newValue === 'rtl' ? 'rtl' : 'ltr');
        else if (suffix === 'sidebar') {
          if (e.newValue === 'true') docEl.dataset.sidebarCollapsed = 'true';
          else delete docEl.dataset.sidebarCollapsed;
          syncSidebarState();
        }
      },
      { signal: sig }
    );

    /* Initial runtime boot inside mount() */
    ensureLiveRegions();
    syncThemeControls();
    syncDirControls();
    syncSidebarState();
    initHoldButtons();
    initTabsFromUrl();
    initScrollSpy();
    syncSelectionAll();

    var instance = {
      toast: toast,
      announce: announce,
      closeTopLayer: closeTopLayer,
      openDialog: openDialog,
      closeDialog: closeDialog,
      toggleTheme: toggleTheme,
      setTheme: setTheme,
      setDirection: setDirection,
      toggleSidebar: toggleSidebar,
      syncSelection: syncSelectionAll,
      destroy: function () {
        controller.abort();
        activeTimers.forEach(function (id) {
          global.clearTimeout(id);
        });
        activeTimers.clear();
        if (scrollSpyObserver) {
          scrollSpyObserver.disconnect();
          scrollSpyObserver = null;
        }
        if (activeMount === instance) activeMount = null;
      }
    };

    activeMount = instance;
    return instance;
  }

  function ensureMounted() {
    if (!activeMount) mount(document);
    return activeMount;
  }

  function destroy() {
    if (activeMount) activeMount.destroy();
  }

  global.StoneUI = {
    mount: mount,
    destroy: destroy,
    formatSelectionCount: formatSelectionCount,
    toast: function (cfg) {
      return ensureMounted().toast(cfg);
    },
    announce: function (msg, priority) {
      return ensureMounted().announce(msg, priority);
    },
    closeTopLayer: function () {
      return ensureMounted().closeTopLayer();
    },
    openDialog: function (dlg) {
      return ensureMounted().openDialog(dlg);
    },
    closeDialog: function (dlg) {
      return ensureMounted().closeDialog(dlg);
    },
    toggleTheme: function () {
      return ensureMounted().toggleTheme();
    },
    setTheme: function (mode, animate) {
      return ensureMounted().setTheme(mode, animate);
    },
    setDirection: function (dir) {
      return ensureMounted().setDirection(dir);
    },
    toggleSidebar: function () {
      return ensureMounted().toggleSidebar();
    }
  };

  function autoMount() {
    if (document.documentElement.hasAttribute('data-stone-manual')) return;
    mount(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount, { once: true });
  } else {
    autoMount();
  }
})(window);
