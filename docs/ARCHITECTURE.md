# Architecture

## Overview

```
┌──────────────────────┐        ┌───────────────────────────────┐
│  Mobile app (Expo)   │  HTTPS │           Supabase            │
│  iOS · Android · Web │◀──────▶│  Auth · Postgres (RLS) · Storage │
└──────────┬───────────┘        │  Edge Functions               │
           │                    └───────┬───────────────┬───────┘
           │ deep links                 │               │
           ▼                            ▼               ▼
   Public profile (web)        Catalog APIs        LLM provider
                               Google Books ·      (ranking +
                               Open Library        explanations)
```

## Key decisions

### The AI never invents books
Recommendation is a two-step pipeline running in an Edge Function:

1. **Candidate retrieval** — query the catalog (Google Books / Open Library) by genre, mood keywords and authors/subjects from the user's top-rated books. Exclude anything already in the library.
2. **LLM ranking** — the model receives the user's library (titles, ratings, reviews) plus the candidate list and returns the 3 best IDs with a one-line explanation each. Output is validated against the candidate set; anything else is discarded.

Store links are generated server-side from the ISBN, so they can never be hallucinated.

### Live catalog and covers (implemented)
- **Search** uses Open Library (`search.json`) — free, no API key, CORS-enabled. Results are de-duplicated (Open Library often has several work records per book) and their free-form subjects are mapped to Leora genres and moods so they feed the recommender. If `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` is set, search uses Google Books instead (unauthenticated Google Books requests have no quota).
- **Synopses** are fetched lazily from the work record the first time a book is opened.
- **Covers**: catalog books carry their cover URL. Books without one (the bundled sample library) are resolved by title + author — exact title first (series/subtitles ignored), then a broad search restricted to the same author — preferring Spanish editions, then English, never other languages. Every lookup is cached on the device. The generated colour cover is always rendered underneath, so loading, missing or broken images never leave an empty box.

### Barcode scanning (implemented)
- `expo-camera` (included in Expo Go; iOS, Android and web) reads EAN-13 / EAN-8 / UPC-A.
- Codes are validated client-side: an ISBN-13 must start with 978/979 and pass the check digit; ISBN-10 (incl. `X`) is converted. Other barcodes are ignored with a one-time hint, and duplicate scan events are guarded.
- The edition is looked up with `search.json?isbn=` and shown with the cover of that exact edition (`covers.openlibrary.org/b/isbn/…`), falling back to the work cover and then to the generated cover.
- Devices without a camera (or with permission denied) can type the ISBN.

### On-device persistence (implemented)
The library, profile, quota and recommendation feedback are stored with AsyncStorage (localStorage on web) together with the live-catalog books they reference, and restored on launch. Supabase sync will replace this as the source of truth once accounts exist.

### Shelf-photo recognition
Vision model extracts `(title, author)` pairs from spines → each is matched against the catalog → the user confirms in a checklist before anything is saved.

### Data model (initial)

| Table | Purpose |
|---|---|
| `profiles` | user id, username, display name, avatar, locale, yearly goal, is_public |
| `books` | catalog cache: id, isbn13, title, authors, cover_url, page_count, genres, language |
| `library_entries` | user_id, book_id, status, rating, review, read_at |
| `recommendations` | user_id, request (genre/mood/seed), book_ids, created_at |
| `recommendation_feedback` | recommendation_id, book_id, reason |
| `badges` / `user_badges` | achievements |

All user tables protected with row-level security (`auth.uid() = user_id`); public profiles exposed through a read-only view.

### Monetization
- Subscriptions via **RevenueCat** (wraps App Store / Google Play billing).
- Free-tier quota enforced server-side in the recommendation function.

## App structure (`app/`)

```
app/
├── app/                # expo-router routes
│   ├── (tabs)/         # Library · Discover · Profile
│   ├── book/[id].tsx   # Book detail
│   └── add.tsx         # Add book (modal)
└── src/
    ├── components/     # UI building blocks
    ├── data/           # Sample data (prototype)
    ├── i18n/           # ES / EN strings
    ├── store/          # App state
    └── theme/          # Design tokens
```
