/* ==========================================================================
   Studio Reservations (examples/reservations.html) — External CSP-safe Script
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    var calGrid = document.querySelector('.stone-calendar__grid');
    var slotList = document.querySelector('.stone-slot-list');
    var selectedReadout = document.getElementById('cal-selected-readout');
    var slotHeading = document.getElementById('slot-date-heading');
    var dlgDate = document.getElementById('booking-dialog-date');
    var dlgSlot = document.getElementById('booking-dialog-slot');
    var currentDay = '16';
    var currentSlotLabel = '09:00 \u2013 10:30';

    if (calGrid) {
      calGrid.addEventListener('click', function (e) {
        var cell = e.target.closest('.stone-calendar__cell[data-day]');
        if (!cell || cell.disabled || cell.getAttribute('aria-disabled') === 'true') return;
        calGrid.querySelectorAll('.stone-calendar__cell[data-day]').forEach(function (c) {
          c.removeAttribute('data-selected');
          c.removeAttribute('data-range');
          c.setAttribute('aria-pressed', 'false');
        });
        cell.setAttribute('data-selected', 'true');
        cell.setAttribute('aria-pressed', 'true');
        currentDay = cell.getAttribute('data-day');
        if (selectedReadout) selectedReadout.textContent = 'Nov ' + currentDay;
        if (slotHeading) slotHeading.textContent = 'Nov ' + currentDay;
        if (dlgDate) dlgDate.textContent = 'Nov ' + currentDay + ', 2026';
      });
    }

    if (slotList) {
      slotList.addEventListener('click', function (e) {
        var resolveBtn = e.target.closest('[data-resolve-conflict]');
        if (resolveBtn) {
          var conflictRow = resolveBtn.closest('.stone-slot');
          if (conflictRow) {
            conflictRow.setAttribute('data-state', 'available');
            var badge = document.createElement('span');
            badge.className = 'stone-badge';
            badge.setAttribute('data-tone', 'accent');
            badge.setAttribute('data-shape', 'pill');
            badge.textContent = 'Resolved · Available';
            resolveBtn.replaceWith(badge);
            if (window.StoneUI) {
              window.StoneUI.toast({
                title: 'Scheduling conflict cleared',
                description: 'Rig B reassigned; 14:30 window is now available.',
                tone: 'success'
              });
            }
          }
          return;
        }

        var slot = e.target.closest('button.stone-slot');
        if (!slot || slot.disabled || slot.getAttribute('data-state') === 'unavailable') return;
        slotList.querySelectorAll('button.stone-slot').forEach(function (s) {
          s.removeAttribute('data-selected');
          s.setAttribute('aria-pressed', 'false');
        });
        slot.setAttribute('data-selected', 'true');
        slot.setAttribute('aria-pressed', 'true');
        currentSlotLabel = slot.getAttribute('data-slot-label') || currentSlotLabel;
        if (dlgSlot) dlgSlot.textContent = currentSlotLabel;
      });
    }

    document.addEventListener('click', function (e) {
      var prev = e.target.closest('#cal-prev-month');
      var next = e.target.closest('#cal-next-month');
      if ((prev || next) && window.StoneUI) {
        window.StoneUI.toast({
          title: prev ? 'Showing October 2026 preview' : 'Showing December 2026 preview',
          description: 'Keyboard & RTL calendar chevrons stay logically mirrored.',
          tone: 'neutral',
          duration: 2400
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
