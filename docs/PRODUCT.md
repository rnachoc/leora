# Product spec — Leora v1 (MVP)

## Vision

The most beautiful place to keep your reading life, with recommendations that feel like a friend who has read everything you have. Bilingual (Spanish/English) from day one.

## Target user

Readers who finish 1–4 books a month, are active on BookTok/Bookstagram, and want (a) to see and share what they've read and (b) a confident answer to *"what do I read next?"*.

## Core flows

### 1. Library
- Two views, switchable with one tap: **bookshelf** (spines on wooden shelves) and **cover grid**.
- Filter by status: read · reading · want to read · did not finish.
- Each book stores: star rating (required for "read"), short review, read date, status.

### 2. Add a book
| Method | v1 | Notes |
|---|---|---|
| Search by title/author | ✅ | Google Books + Open Library |
| ISBN barcode scan | ✅ | expo-camera barcode scanner |
| Shelf photo (AI) | ✅ | Vision model reads spines → user confirms matches |
| Goodreads import | ❌ | Later |

### 3. Discover (AI recommendations)
- Inputs: **genre**, **mood** and/or **"like this book"**.
- Output: **3 picks**, each with cover, short synopsis, *why it fits you* (referencing books in the user's library) and buy buttons.
- Dismiss → one-tap reason ("already read", "not for me", "too long") feeds future picks.
- Never recommends a book already in the library.

### 4. Progress & sharing
- Yearly reading goal with progress ring.
- Achievement badges.
- **Wrapped**: year-in-review cards designed to be shared to Instagram/TikTok stories.
- Public profile reachable by link.

## Monetization
- **Free**: unlimited library, 3 AI recommendations/month.
- **Premium**: €2.99/month or €19.99/year — unlimited recommendations, advanced stats, extra themes.
- **Affiliate links**: Amazon, Casa del Libro, Fnac/Kobo, audiobooks (Audible, Storytel).
- No banner ads.

## Non-goals for v1
- Social graph (following, feeds, author profiles) — see roadmap.
- Built-in e-reader.
- Goodreads import.

## Success metrics
- Activation: ≥10 books added in the first session.
- Recommendation click-through to a store: ≥25%.
- Free → Premium conversion: ≥3% at day 30.
