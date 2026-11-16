/* ==========================================================================
   Worker Operations & Analytics (examples/workspace-app.html)
   Interactive 100% sRGB SVG Chart + Visible-Row Filter + Dual Inspector Parity
   ========================================================================== */
(function () {
  'use strict';

  var CHART_DATA = {
    utilization: {
      unit: '%',
      s1Label: 'Field Techs',
      s2Label: 'Dispatchers',
      legend1: 'Field Tech Utilization',
      legend2: 'Dispatcher Load',
      legend3: 'SLA Baseline (80%)',
      baseline: 80,
      max: 100,
      ticks: [100, 75, 50, 25],
      days: [
        { day: 'Mon', s1: 82, s2: 76 },
        { day: 'Tue', s1: 88, s2: 81 },
        { day: 'Wed', s1: 91, s2: 84 },
        { day: 'Thu', s1: 87, s2: 79 },
        { day: 'Fri', s1: 93, s2: 85 },
        { day: 'Sat', s1: 78, s2: 68 },
        { day: 'Sun', s1: 72, s2: 64 }
      ]
    },
    completed: {
      unit: '',
      s1Label: 'Field Orders',
      s2Label: 'Remote Triage',
      legend1: 'Field Work Orders',
      legend2: 'Remote Triage Tasks',
      legend3: 'Daily Quota (42)',
      baseline: 42,
      max: 60,
      ticks: [60, 45, 30, 15],
      days: [
        { day: 'Mon', s1: 44, s2: 18 },
        { day: 'Tue', s1: 49, s2: 22 },
        { day: 'Wed', s1: 53, s2: 24 },
        { day: 'Thu', s1: 47, s2: 21 },
        { day: 'Fri', s1: 55, s2: 25 },
        { day: 'Sat', s1: 36, s2: 14 },
        { day: 'Sun', s1: 28, s2: 11 }
      ]
    },
    overtime: {
      unit: 'h',
      s1Label: 'Emergency',
      s2Label: 'Planned Handoff',
      legend1: 'Emergency Overtime',
      legend2: 'Planned Handoff',
      legend3: 'Alert Cap (1.5h)',
      baseline: 1.5,
      max: 3.0,
      ticks: [3.0, 2.25, 1.5, 0.75],
      days: [
        { day: 'Mon', s1: 0.9, s2: 0.4 },
        { day: 'Tue', s1: 1.1, s2: 0.6 },
        { day: 'Wed', s1: 0.8, s2: 0.5 },
        { day: 'Thu', s1: 1.2, s2: 0.7 },
        { day: 'Fri', s1: 1.4, s2: 0.6 },
        { day: 'Sat', s1: 0.6, s2: 0.3 },
        { day: 'Sun', s1: 0.5, s2: 0.2 }
      ]
    }
  };

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        el.setAttribute(k, attrs[k]);
      });
    }
    return el;
  }

  function initChart() {
    var gridG = document.getElementById('worker-chart-grid');
    var seriesG = document.getElementById('worker-chart-series');
    var axesG = document.getElementById('worker-chart-axes');
    var tip = document.getElementById('worker-chart-tooltip');
    var frame = document.getElementById('worker-chart-frame');
    if (!gridG || !seriesG || !axesG) return;

    var tabs = document.querySelectorAll('[data-chart-metric]');
    var currentMetric = 'utilization';

    function showTip(entry, cfg, anchorRect) {
      if (!tip || !frame) return;
      document.getElementById('chart-tip-day').textContent = entry.day + ' · ' + cfg.s1Label;
      document.getElementById('chart-tip-s1-label').textContent = cfg.s1Label;
      document.getElementById('chart-tip-s1-val').textContent = entry.s1 + cfg.unit;
      document.getElementById('chart-tip-s2-label').textContent = cfg.s2Label;
      document.getElementById('chart-tip-s2-val').textContent = entry.s2 + cfg.unit;
      tip.hidden = false;

      var fr = frame.getBoundingClientRect();
      var tr = tip.getBoundingClientRect();
      var x = anchorRect.left - fr.left + anchorRect.width / 2 - tr.width / 2;
      if (x < 8) x = 8;
      if (x + tr.width > fr.width - 8) x = fr.width - tr.width - 8;
      tip.style.left = Math.round(x) + 'px';
      tip.style.top = '8px';
    }

    function hideTip() {
      if (tip) tip.hidden = true;
    }

    function render(metricKey) {
      currentMetric = metricKey;
      var cfg = CHART_DATA[metricKey] || CHART_DATA.utilization;
      var padLeft = 44;
      var padRight = 18;
      var padTop = 18;
      var padBottom = 32;
      var W = 640 - padLeft - padRight;
      var H = 240 - padTop - padBottom;

      gridG.innerHTML = '';
      seriesG.innerHTML = '';
      axesG.innerHTML = '';

      document.getElementById('legend-s1').textContent = cfg.legend1;
      document.getElementById('legend-s2').textContent = cfg.legend2;
      document.getElementById('legend-s3').textContent = cfg.legend3;

      cfg.ticks.forEach(function (t) {
        var y = padTop + H - (t / cfg.max) * H;
        gridG.appendChild(
          svgEl('line', {
            x1: padLeft,
            y1: y.toFixed(1),
            x2: padLeft + W,
            y2: y.toFixed(1),
            class: 'stone-chart-gridline'
          })
        );
        var txt = svgEl('text', {
          x: padLeft - 8,
          y: (y + 3).toFixed(1),
          'text-anchor': 'end',
          class: 'stone-chart-axis-text'
        });
        txt.textContent = t + cfg.unit;
        axesG.appendChild(txt);
      });

      var baseLineY = padTop + H - (cfg.baseline / cfg.max) * H;
      var slotW = W / cfg.days.length;
      var barW = 20;
      var linePoints = [];

      cfg.days.forEach(function (d, i) {
        var cx = padLeft + slotW * i + slotW / 2;
        var h1 = (d.s1 / cfg.max) * H;
        var h2 = (d.s2 / cfg.max) * H;
        var y1 = padTop + H - h1;
        var y2 = padTop + H - h2;

        linePoints.push(cx.toFixed(1) + ',' + y1.toFixed(1));

        var grp = svgEl('g', {
          tabindex: '0',
          role: 'graphics-symbol',
          'aria-label': d.day + ': ' + d.s1 + cfg.unit + ' and ' + d.s2 + cfg.unit
        });
        grp.style.cursor = 'pointer';

        var rect1 = svgEl('rect', {
          x: (cx - barW - 1).toFixed(1),
          y: y1.toFixed(1),
          width: barW,
          height: Math.max(h1, 2).toFixed(1),
          rx: '3',
          fill: 'var(--color-chart-1)',
          class: 'stone-chart-series-bar'
        });
        var rect2 = svgEl('rect', {
          x: (cx + 1).toFixed(1),
          y: y2.toFixed(1),
          width: barW,
          height: Math.max(h2, 2).toFixed(1),
          rx: '3',
          fill: 'var(--color-chart-2)',
          class: 'stone-chart-series-bar'
        });

        grp.appendChild(rect1);
        grp.appendChild(rect2);

        grp.addEventListener('pointerenter', function () {
          showTip(d, cfg, grp.getBoundingClientRect());
        });
        grp.addEventListener('focus', function () {
          showTip(d, cfg, grp.getBoundingClientRect());
        });
        grp.addEventListener('pointerleave', hideTip);
        grp.addEventListener('blur', hideTip);
        seriesG.appendChild(grp);

        var dayLabel = svgEl('text', {
          x: cx.toFixed(1),
          y: padTop + H + 20,
          'text-anchor': 'middle',
          class: 'stone-chart-axis-text'
        });
        dayLabel.textContent = d.day;
        axesG.appendChild(dayLabel);
      });

      /* Trend + SLA Reference Line */
      seriesG.appendChild(
        svgEl('line', {
          x1: padLeft,
          y1: baseLineY.toFixed(1),
          x2: padLeft + W,
          y2: baseLineY.toFixed(1),
          stroke: 'var(--color-chart-3)',
          'stroke-width': '1.5',
          'stroke-dasharray': '5 4'
        })
      );
      seriesG.appendChild(
        svgEl('polyline', {
          points: linePoints.join(' '),
          fill: 'none',
          stroke: 'var(--color-chart-4)',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      );
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });
        render(tab.getAttribute('data-chart-metric'));
      });
    });

    render(currentMetric);
  }

  function initRosterAndInspector() {
    var filterGroup = document.getElementById('worker-role-filter');
    var tbody = document.getElementById('worker-table-body');
    var tableWrap = document.querySelector('[data-selection-scope="worker-roster"]');
    var wsBody = document.getElementById('ops-workspace-body');
    var mobileDlg = document.getElementById('ops-inspector-dialog');

    if (filterGroup && tbody) {
      filterGroup.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-role-filter]');
        if (!btn) return;
        var role = btn.getAttribute('data-role-filter');
        filterGroup.querySelectorAll('[data-role-filter]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        tbody.querySelectorAll('tr').forEach(function (row) {
          row.hidden = role !== 'all' && row.getAttribute('data-role') !== role;
        });
        if (tableWrap) {
          tableWrap.dispatchEvent(new CustomEvent('stone:selection-sync', { bubbles: true }));
        }
      });
    }

    function populateInspector(row, openMobile) {
      if (!row) return;
      var id = (row.getAttribute('data-inspect-row') || '').toUpperCase();
      var name = row.getAttribute('data-worker-name') || '';
      var role = row.getAttribute('data-worker-role') || '';
      var presence = row.getAttribute('data-worker-presence') || '';
      var tone = row.getAttribute('data-worker-tone') || 'neutral';
      var shift = row.getAttribute('data-worker-shift') || '';
      var load = row.getAttribute('data-worker-load') || '';
      var notes = row.getAttribute('data-worker-notes') || '';

      document.querySelectorAll('[data-worker-field="id"]').forEach(function (el) { el.textContent = id; });
      document.querySelectorAll('[data-worker-field="name"]').forEach(function (el) { el.textContent = name; });
      document.querySelectorAll('[data-worker-field="role"]').forEach(function (el) { el.textContent = role; });
      document.querySelectorAll('[data-worker-field="shift"]').forEach(function (el) { el.textContent = shift; });
      document.querySelectorAll('[data-worker-field="load"]').forEach(function (el) { el.textContent = load; });
      document.querySelectorAll('[data-worker-field="notes"]').forEach(function (el) { el.textContent = notes; });
      document.querySelectorAll('[data-worker-badge]').forEach(function (badge) {
        badge.setAttribute('data-tone', tone);
        var labelSpan = badge.querySelector('span:last-child');
        if (labelSpan) labelSpan.textContent = presence;
      });

      if (openMobile && mobileDlg && window.matchMedia && !window.matchMedia('(min-width: 64rem)').matches) {
        if (window.StoneUI) window.StoneUI.openDialog(mobileDlg);
        else if (typeof mobileDlg.showModal === 'function') mobileDlg.showModal();
      }
    }

    document.addEventListener('stone:inspect', function (e) {
      if (e.detail && e.detail.row) {
        populateInspector(e.detail.row, true);
      }
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-trigger-inspect]');
      if (!trigger) return;
      var row = trigger.closest('tr[data-inspect-row]');
      if (!row) return;
      if (tbody) {
        tbody.querySelectorAll('tr[data-inspected="true"]').forEach(function (r) {
          r.removeAttribute('data-inspected');
        });
      }
      row.setAttribute('data-inspected', 'true');
      if (wsBody) wsBody.setAttribute('data-inspector-open', 'true');
      populateInspector(row, true);
    });
  }

  function init() {
    initChart();
    initRosterAndInspector();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
