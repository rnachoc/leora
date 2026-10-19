# Leora — Landing page

Static waitlist landing used to validate demand with paid traffic before the app launches. Plain HTML/CSS/JS, no build step.

## Run locally

```bash
cd landing
python3 -m http.server 8080   # → http://localhost:8080
```

## 1. Connect the waitlist

Edit `WAITLIST_ENDPOINT` at the top of [`main.js`](main.js). Two options:

**Formspree (2 minutes, free tier)**
1. Create a form at formspree.io.
2. Paste its URL: `const WAITLIST_ENDPOINT = 'https://formspree.io/f/xxxxxx';`

**Supabase (keeps leads next to the app's data)**

```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reader_type text,
  locale text,
  utm_source text, utm_medium text, utm_campaign text, utm_content text, utm_term text,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
create policy "anyone can join the waitlist" on public.waitlist for insert to anon with check (true);
```

Then set:

```js
const WAITLIST_ENDPOINT = 'https://<project>.supabase.co/rest/v1/waitlist';
const EXTRA_HEADERS = { apikey: '<anon-key>', Authorization: 'Bearer <anon-key>' };
```

Until an endpoint is set, the form shows an error instead of a fake success, so no lead is lost.

## 2. Meta Pixel (optional)

Set `META_PIXEL_ID` in [`pixel.js`](pixel.js). It tracks `PageView` and a `Lead` event per signup — use **Lead** as the campaign optimisation event.

> ⚠️ EU/GDPR: in Spain a cookie-consent banner is required before loading the pixel.

## 3. Measure

Use `utm_*` parameters in every ad URL (e.g. `?utm_source=meta&utm_campaign=launch&utm_content=shelf-video`); they are saved with each signup.
Validation target from the roadmap: **≥ 15 % landing → waitlist**.

## 4. Deploy

Any static host works:
- **GitHub Pages**: Settings → Pages → deploy from `main`, folder `/landing` (or move it to `/docs`).
- **Netlify / Vercel / Cloudflare Pages**: drag-and-drop the `landing/` folder or set it as the publish directory.
