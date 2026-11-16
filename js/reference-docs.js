/* ==========================================================================
   Stone Base v1.1.2 — Living Reference Showcase Helpers (Documentation Only)
   - Auto-extracts clean semantic HTML snippets (strips internal .docs-* wrappers)
   - Concentric radius calculator using Stone Box variables
   - Live form validation with recovery on input & reset
   - Exact pagination total sync, formatted numeric ticker & squircle telemetry
   ========================================================================== */

(function () {
  'use strict';

  function stripDocsArtifacts(sourceEl) {
    var clone = sourceEl.cloneNode(true);
    clone.querySelectorAll('*').forEach(function (el) {
      if (!el.classList) return;
      var toRemove = [];
      el.classList.forEach(function (cls) {
        if (cls.indexOf('docs-') === 0) toRemove.push(cls);
      });
      toRemove.forEach(function (cls) {
        el.classList.remove(cls);
      });
      if (el.getAttribute('class') === '') el.removeAttribute('class');
    });
    /* Unwrap bare <div> wrappers that previously only held a .docs-* layout class */
    Array.from(clone.querySelectorAll('div:not([class]):not([id]):not([data-variant])')).forEach(
      function (bareDiv) {
        if (bareDiv.attributes.length === 0 && bareDiv.parentNode) {
          while (bareDiv.firstChild) {
            bareDiv.parentNode.insertBefore(bareDiv.firstChild, bareDiv);
          }
          bareDiv.remove();
        }
      }
    );
    return clone.innerHTML;
  }

  function formatHtmlSnippet(rawHtml) {
    var lines = rawHtml
      .replace(/^\s*\n/, '')
      .replace(/\n\s*$/, '')
      .split('\n');

    var minIndent = lines.reduce(function (min, line) {
      if (!line.trim()) return min;
      var match = line.match(/^\s*/);
      var len = match ? match[0].length : 0;
      return min === null ? len : Math.min(min, len);
    }, null);

    if (!minIndent) return lines.join('\n').trim();
    return lines
      .map(function (line) {
        return line.length >= minIndent ? line.slice(minIndent) : line;
      })
      .join('\n')
      .trim();
  }

  function initAutoSnippets() {
    document.querySelectorAll('[data-specimen]').forEach(function (card) {
      var source = card.querySelector('[data-specimen-source]');
      if (!source || card.querySelector('.docs-code-disclosure')) return;

      var customNote = card.getAttribute('data-specimen-note') || '';
      var formatted = formatHtmlSnippet(stripDocsArtifacts(source));
      if (customNote) {
        formatted = '<!-- ' + customNote + ' -->\n' + formatted;
      }

      var details = document.createElement('details');
      details.className = 'docs-code-disclosure';

      var summary = document.createElement('summary');
      var sumLabel = document.createElement('span');
      sumLabel.textContent = 'View HTML reference code';
      var sumRight = document.createElement('span');
      sumRight.className = 'stone-cluster';
      sumRight.style.gap = 'var(--space-2)';

      var langBadge = document.createElement('span');
      langBadge.className = 'stone-badge';
      langBadge.textContent = 'HTML';

      var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      chev.setAttribute('class', 'stone-icon icon-w-medium stone-details__chevron');
      chev.setAttribute('viewBox', '0 0 24 24');
      chev.setAttribute('aria-hidden', 'true');
      var useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useEl.setAttribute('href', '#stone-i-chevron-down');
      chev.appendChild(useEl);

      sumRight.appendChild(langBadge);
      sumRight.appendChild(chev);
      summary.appendChild(sumLabel);
      summary.appendChild(sumRight);

      var toolbar = document.createElement('div');
      toolbar.className = 'docs-code-toolbar';
      var hint = document.createElement('span');
      hint.className = 'text-caption';
      hint.textContent = 'Copy semantic markup directly into any Stone Base app';

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'stone-btn stone-btn--icon-start';
      copyBtn.setAttribute('data-variant', 'surface');
      copyBtn.setAttribute('data-size', 'xs');
      copyBtn.setAttribute('data-copy-text', formatted);
      copyBtn.innerHTML =
        '<svg class="stone-icon icon-w-regular" viewBox="0 0 24 24" aria-hidden="true">' +
        '<use href="#stone-i-copy"></use></svg><span>Copy HTML</span>';

      toolbar.appendChild(hint);
      toolbar.appendChild(copyBtn);

      var pre = document.createElement('pre');
      pre.className = 'docs-code-pre';
      pre.setAttribute('tabindex', '0');
      pre.setAttribute('role', 'region');
      pre.setAttribute('aria-label', 'HTML reference snippet');
      var code = document.createElement('code');
      code.textContent = formatted;
      pre.appendChild(code);

      details.appendChild(summary);
      details.appendChild(toolbar);
      details.appendChild(pre);
      card.appendChild(details);
    });
  }

  function initConcentricPlayground() {
    var outerSel = document.getElementById('concentric-outer');
    var padSel = document.getElementById('concentric-pad');
    var previewOuter = document.getElementById('concentric-preview-outer');
    var formulaReadout = document.getElementById('concentric-formula');

    if (!outerSel || !padSel || !previewOuter) return;

    function update() {
      var outer = parseInt(outerSel.value, 10);
      var pad = parseInt(padSel.value, 10);
      var border = 1;
      var inner = pad > 24 ? 8 : Math.max(4, outer - pad - border);

      previewOuter.style.setProperty('--box-radius', outer + 'px');
      previewOuter.style.setProperty('--box-pad', pad + 'px');
      previewOuter.style.setProperty('--demo-outer-r', outer + 'px');
      previewOuter.style.setProperty('--demo-pad', pad + 'px');
      if (previewOuter.firstElementChild) {
        previewOuter.firstElementChild.style.setProperty('--demo-inner-r', inner + 'px');
      }

      if (formulaReadout) {
        if (pad > 24) {
          formulaReadout.textContent =
            'padding (' + pad + 'px) > 24px: layers separate visually \u2192 inner uses 8px';
        } else {
          formulaReadout.textContent =
            'max(4px, ' + outer + 'px - ' + pad + 'px - 1px) = ' + inner + 'px inner radius';
        }
      }
    }

    outerSel.addEventListener('change', update);
    padSel.addEventListener('change', update);
    update();
  }

  function initValidationDemo() {
    var form = document.getElementById('stone-demo-form');
    if (!form) return;

    var nameInput = document.getElementById('demo-project-name');
    var nameError = document.getElementById('demo-project-error');
    var nameErrorText = document.getElementById('demo-project-error-text');
    var emailInput = document.getElementById('demo-owner-email');
    var emailError = document.getElementById('demo-email-error');
    var emailErrorText = document.getElementById('demo-email-error-text');

    function clearFieldError(inputEl, errorRow) {
      if (inputEl) inputEl.removeAttribute('aria-invalid');
      if (errorRow) errorRow.hidden = true;
    }

    function clearAllErrors() {
      clearFieldError(nameInput, nameError);
      clearFieldError(emailInput, emailError);
    }

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (nameInput.value.trim().length >= 3) clearFieldError(nameInput, nameError);
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        if (emailInput.value.trim() && emailInput.checkValidity()) clearFieldError(emailInput, emailError);
      });
    }
    form.addEventListener('reset', function () {
      window.requestAnimationFrame(clearAllErrors);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors();

      var firstBad = null;
      if (nameInput && nameInput.value.trim().length < 3) {
        nameInput.setAttribute('aria-invalid', 'true');
        if (nameErrorText) nameErrorText.textContent = 'Enter a project name with at least 3 characters.';
        if (nameError) nameError.hidden = false;
        firstBad = nameInput;
      }

      if (emailInput && (!emailInput.value.trim() || !emailInput.checkValidity())) {
        emailInput.setAttribute('aria-invalid', 'true');
        if (emailErrorText) emailErrorText.textContent = 'Enter a valid team email address such as alex@stone.dev.';
        if (emailError) emailError.hidden = false;
        if (!firstBad) firstBad = emailInput;
      }

      if (firstBad) {
        firstBad.focus();
        return;
      }

      if (window.StoneUI) {
        window.StoneUI.toast({
          title: 'Project settings saved',
          description: nameInput.value.trim() + ' validated using inline field recovery.',
          tone: 'success'
        });
      }
    });
  }

  function initPaginationDemo() {
    var nav = document.getElementById('demo-pagination');
    if (!nav) return;

    var pageBtns = Array.from(nav.querySelectorAll('[data-page]'));
    var total = Math.max(pageBtns.length, 1);
    var current = Math.min(2, total);
    var prevBtn = nav.querySelector('[data-page-nav="prev"]');
    var nextBtn = nav.querySelector('[data-page-nav="next"]');
    var status = document.getElementById('demo-page-status');

    function render() {
      pageBtns.forEach(function (btn) {
        var n = parseInt(btn.getAttribute('data-page'), 10);
        if (n === current) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
      });
      if (prevBtn) prevBtn.disabled = current <= 1;
      if (nextBtn) nextBtn.disabled = current >= total;
      if (status) status.textContent = 'Page ' + current + ' of ' + total;
    }

    nav.addEventListener('click', function (e) {
      var p = e.target.closest('[data-page]');
      if (p) {
        current = parseInt(p.getAttribute('data-page'), 10);
        render();
        return;
      }
      var dir = e.target.closest('[data-page-nav]');
      if (dir && !dir.disabled) {
        current += dir.getAttribute('data-page-nav') === 'next' ? 1 : -1;
        render();
      }
    });

    render();
  }

  function initTabularTicker() {
    var btn = document.getElementById('demo-ticker-toggle');
    var metric = document.getElementById('demo-ticker-value');
    if (!btn || !metric) return;

    var timer = null;
    var parsed = parseFloat(metric.textContent.replace(/,/g, ''));
    var count = isNaN(parsed) ? 12840.25 : parsed;
    var formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    btn.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
        btn.setAttribute('aria-pressed', 'false');
        btn.querySelector('[data-ticker-label]').textContent = 'Start numeric ticker';
      } else {
        btn.setAttribute('aria-pressed', 'true');
        btn.querySelector('[data-ticker-label]').textContent = 'Pause numeric ticker';
        timer = window.setInterval(function () {
          count += 0.30;
          metric.textContent = formatter.format(count);
        }, 120);
      }
    });
  }

  function initCornerSupportReadout() {
    var els = document.querySelectorAll('[data-corner-support]');
    if (!els.length) return;
    var supported = Boolean(window.CSS && window.CSS.supports && window.CSS.supports('corner-shape', 'squircle'));
    var text = supported
      ? 'Native CSS corner-shape: squircle active'
      : 'Clean border-radius fallback active (squircle progressive enhancement)';
    els.forEach(function (el) {
      el.textContent = text;
    });
  }

  function initReferenceDocs() {
    initAutoSnippets();
    initConcentricPlayground();
    initValidationDemo();
    initPaginationDemo();
    initTabularTicker();
    initCornerSupportReadout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReferenceDocs);
  } else {
    initReferenceDocs();
  }
})();
