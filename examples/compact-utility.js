/* ==========================================================================
   Stone Converter (examples/compact-utility.html) — External CSP-safe Script
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var input = document.getElementById('conv-input');
    var output = document.getElementById('conv-output');
    var swapBtn = document.getElementById('conv-swap-btn');
    var dirLabel = document.getElementById('conv-direction-label');
    var cssSnippet = document.getElementById('conv-css-snippet');
    var copyBtn = document.getElementById('conv-copy-btn');
    var compactBtn = document.getElementById('toggle-compact-table');
    var spacingTable = document.getElementById('conv-spacing-table');
    var pxToRem = true;

    function compute() {
      if (!input || !output) return;
      var val = parseFloat(input.value);
      if (isNaN(val)) val = 0;
      if (pxToRem) {
        var rem = (val / 16).toFixed(3).replace(/\.?0+$/, '') || '0';
        if (rem.indexOf('.') === -1) rem += '.000';
        output.value = rem + 'rem';
        if (dirLabel) dirLabel.textContent = 'Converting Pixels (px) \u2192 Root EMs (rem)';
        if (cssSnippet) cssSnippet.textContent = 'font-size: ' + rem + 'rem; /* ' + val + 'px */';
        if (copyBtn) copyBtn.setAttribute('data-copy-text', 'font-size: ' + rem + 'rem;');
      } else {
        var px = Math.round(val * 16 * 100) / 100;
        output.value = px + 'px';
        if (dirLabel) dirLabel.textContent = 'Converting Root EMs (rem) \u2192 Pixels (px)';
        if (cssSnippet) cssSnippet.textContent = '/* ' + val + 'rem equals ' + px + 'px at 16px root */';
        if (copyBtn) copyBtn.setAttribute('data-copy-text', px + 'px');
      }
    }

    if (input) input.addEventListener('input', compute);
    if (swapBtn) {
      swapBtn.addEventListener('click', function () {
        pxToRem = !pxToRem;
        if (input) input.value = pxToRem ? '24' : '1.5';
        compute();
      });
    }

    if (compactBtn && spacingTable) {
      compactBtn.addEventListener('click', function () {
        var next = !spacingTable.classList.contains('stone-table--compact');
        spacingTable.classList.toggle('stone-table--compact', next);
        compactBtn.setAttribute('aria-pressed', String(next));
      });
    }

    compute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
