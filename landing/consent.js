/**
 * Cookie consent (RGPD / LSSI).
 *
 * Non-essential trackers (the Meta Pixel) must not load until the visitor
 * agrees. Trackers call `leoraConsent.require(load)`:
 *   - choice already stored as "granted" → load runs immediately;
 *   - "denied" → never runs;
 *   - no choice yet → the banner is shown, and load runs if they accept.
 * Accept and reject are given equal weight, as the Spanish DPA (AEPD) requires.
 * Nothing is shown when no tracker is configured.
 */
(function () {
  var KEY = 'leora:consent';
  var pending = [];

  function read() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function write(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* private mode: the choice lasts for this visit only */
    }
  }

  var banner;

  function hide() {
    if (banner) banner.hidden = true;
  }

  function decide(value) {
    write(value);
    hide();
    if (value === 'granted') {
      pending.splice(0).forEach(function (fn) {
        fn();
      });
    }
    document.dispatchEvent(new CustomEvent('leora:consent', { detail: value }));
  }

  function show() {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookies');
      banner.innerHTML =
        '<p>Usamos cookies de Meta para medir nuestros anuncios. Solo se activan si aceptas. ' +
        '<a href="privacidad.html">Más información</a></p>' +
        '<div class="consent-actions">' +
        '<button type="button" data-consent="denied">Rechazar</button>' +
        '<button type="button" data-consent="granted">Aceptar</button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var choice = e.target && e.target.getAttribute('data-consent');
        if (choice) decide(choice);
      });
      document.body.appendChild(banner);
    }
    banner.hidden = false;
  }

  window.leoraConsent = {
    require: function (load) {
      var choice = read();
      if (choice === 'granted') return load();
      // Keep it queued even if denied, so accepting later from "preferences" applies at once.
      pending.push(load);
      if (choice === 'denied') return;
      if (document.body) show();
      else document.addEventListener('DOMContentLoaded', show);
    },
    /** Re-open the banner (footer link). Withdrawing consent takes effect on the next page load. */
    reopen: function () {
      show();
    },
  };

  document.addEventListener('click', function (e) {
    if (e.target && e.target.matches && e.target.matches('[data-consent-open]')) {
      e.preventDefault();
      window.leoraConsent.reopen();
    }
  });
})();
