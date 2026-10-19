/**
 * Meta Pixel for paid-traffic validation.
 * Set META_PIXEL_ID to enable it; with an empty ID nothing is loaded.
 * It only loads after the visitor accepts cookies (see consent.js).
 *
 * Events: PageView on load, Lead on every successful waitlist signup — use
 * Lead as the optimisation event in Meta Ads.
 */
const META_PIXEL_ID = '';

(function () {
  if (!META_PIXEL_ID) return;
  window.leoraConsent.require(loadPixel);

  function loadPixel() {
    /* Standard Meta Pixel base code */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');

    document.addEventListener('leora:signup', () => window.fbq('track', 'Lead'));
  }
})();
