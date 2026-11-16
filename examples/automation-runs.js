/* ==========================================================================
   Automation Runs (examples/automation-runs.html) — External CSP-safe Script
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var pollBtn = document.getElementById('toggle-polling-btn');
    var pollText = document.getElementById('sync-banner-text');
    var paused = false;

    if (pollBtn && pollText) {
      pollBtn.addEventListener('click', function () {
        paused = !paused;
        pollBtn.setAttribute('aria-pressed', String(paused));
        pollBtn.textContent = paused ? 'Resume Polling' : 'Pause Polling';
        pollText.innerHTML = paused
          ? 'Live queue polling paused · Last check <bdi>12:05:19</bdi>'
          : 'Polling queue every <bdi>15s</bdi> · 6 states monitored';
      });
    }

    function updateRunInspector(row) {
      if (!row) return;
      var id = row.getAttribute('data-inspect-row') || '';
      var name = row.getAttribute('data-run-name') || '';
      var state = row.getAttribute('data-run-state') || '';
      var tone = row.getAttribute('data-run-tone') || 'neutral';
      var total = row.getAttribute('data-run-total') || '';
      var queuePct = row.getAttribute('data-run-queue') || '10';
      var execPct = row.getAttribute('data-run-exec') || '50';
      var payload = row.getAttribute('data-run-payload') || '{}';

      document.querySelectorAll('[data-run-field="id"]').forEach(function (el) { el.textContent = id; });
      document.querySelectorAll('[data-run-field="name"]').forEach(function (el) { el.textContent = name; });
      document.querySelectorAll('[data-run-field="total"]').forEach(function (el) { el.textContent = total; });
      document.querySelectorAll('[data-run-field="queue-pct"]').forEach(function (el) { el.textContent = queuePct + '%'; });
      document.querySelectorAll('[data-run-field="exec-pct"]').forEach(function (el) { el.textContent = execPct + '%'; });

      document.querySelectorAll('[data-run-badge]').forEach(function (badge) {
        badge.setAttribute('data-tone', tone);
        var label = badge.querySelector('span:last-child');
        if (label) label.textContent = state;
      });

      var wfQueue = document.getElementById('wf-queue-bar');
      var wfExec = document.getElementById('wf-exec-bar');
      if (wfQueue) wfQueue.style.inlineSize = queuePct + '%';
      if (wfExec) {
        wfExec.style.inlineSize = execPct + '%';
        wfExec.setAttribute('data-tone', tone === 'neutral' ? 'accent' : tone);
      }
      var pre = document.getElementById('run-payload-pre');
      if (pre) {
        try {
          pre.textContent = JSON.stringify(JSON.parse(payload), null, 2);
        } catch (err) {
          pre.textContent = payload;
        }
      }
    }

    document.addEventListener('stone:inspect', function (e) {
      if (e.detail && e.detail.row) updateRunInspector(e.detail.row);
    });

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open-run]');
      if (!btn) return;
      var row = btn.closest('tr[data-inspect-row]');
      if (!row) return;
      document.querySelectorAll('tr[data-inspected="true"]').forEach(function (r) {
        r.removeAttribute('data-inspected');
      });
      row.setAttribute('data-inspected', 'true');
      var wsBody = document.getElementById('auto-workspace-body');
      if (wsBody) wsBody.setAttribute('data-inspector-open', 'true');
      updateRunInspector(row);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
