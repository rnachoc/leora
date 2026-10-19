/**
 * Waitlist form.
 *
 * Set WAITLIST_ENDPOINT to any URL that accepts a JSON POST, e.g.
 *   - Formspree:  https://formspree.io/f/<form-id>
 *   - Supabase:   https://<project>.supabase.co/rest/v1/waitlist  (+ apikey header below)
 * See landing/README.md.
 */
const WAITLIST_ENDPOINT = '';
const EXTRA_HEADERS = {}; // e.g. { apikey: '<supabase-anon-key>', Authorization: 'Bearer <supabase-anon-key>' }

const form = document.getElementById('waitlist-form');
const msg = form.querySelector('.form-msg');
const button = form.querySelector('button');

/** Keep campaign attribution (utm_*) so we know which ad brought each signup. */
function utmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const [k, v] of params) if (k.startsWith('utm_')) utm[k] = v;
  return utm;
}

function show(text, kind) {
  msg.textContent = text;
  msg.className = `form-msg ${kind}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const email = String(data.get('email') || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    show('Revisa tu email, parece que falta algo.', 'error');
    return;
  }

  if (!WAITLIST_ENDPOINT) {
    console.warn('[Leora] WAITLIST_ENDPOINT is not configured — see landing/README.md');
    show('La lista de espera aún no está activa. Vuelve a intentarlo pronto.', 'error');
    return;
  }

  button.disabled = true;
  show('Apuntándote…', '');

  try {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...EXTRA_HEADERS },
      body: JSON.stringify({
        email,
        reader_type: data.get('readerType') || null,
        locale: navigator.language,
        ...utmParams(),
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    show('¡Listo! Te avisaremos en cuanto Leora esté disponible. 📚', 'ok');
    document.dispatchEvent(new CustomEvent('leora:signup', { detail: { email } }));
  } catch (err) {
    console.error('[Leora] waitlist error', err);
    show('No hemos podido apuntarte. Inténtalo de nuevo en un momento.', 'error');
  } finally {
    button.disabled = false;
  }
});
