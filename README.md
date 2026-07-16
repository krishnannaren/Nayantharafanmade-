# Nayantharafanmade

An unofficial, fan-made tribute website celebrating actress Nayanthara — built as a fast, accessible, installable static site with no build step and no backend dependency by default.

> **This is not the official website of Nayanthara.** It is an independent fan project and is not affiliated with, endorsed by, or operated by Nayanthara or her representatives. See `terms.html` and `privacy.html` for details.

---

## Project structure

```
/
├── index.html              Main single-page experience (hero, gallery, videos, movies, awards, news, fan zone, about, contact)
├── gallery.html            Standalone SEO-indexable gallery page
├── movies.html             Standalone filmography timeline page
├── videos.html             Standalone video highlights page
├── news.html                Standalone fan news page
├── fanzone.html             Standalone Fan Zone (wallpapers/posters/quotes/fan art) page
├── about.html               About + FAQ page
├── contact.html             Contact form page
├── search.html               Site-wide search page
├── privacy.html / terms.html Legal pages
├── 404.html                 Custom not-found page
├── offline.html              Service worker offline fallback page
│
├── style.css                 All site styling (theme system, glassmorphism, animations, responsive)
├── script.js                  Main app logic for index.html (gallery, lightbox, videos, movies, search, AI widget, theme, cursor, etc.)
├── assets/js/pages.js         Shared lightweight logic for the standalone content pages (fetches JSON data)
│
├── assets/data/               Editable JSON content (no code changes needed to update text)
│   ├── movies.json
│   ├── gallery.json
│   ├── news.json
│   └── awards.json
│
├── assets/icons/               Real generated PNG icons (16–512px, incl. maskable variants)
├── favicon.ico / favicon.svg   Site favicons
├── browserconfig.xml           Windows tile config
│
├── manifest.json                PWA manifest
├── service-worker.js             Offline cache + background-sync stub
│
├── robots.txt / sitemap.xml / feed.xml   Crawling, indexing and RSS
├── netlify.toml / vercel.json    Deployment configs (real HTTP security headers + caching)
└── README.md                     This file
```

## Running locally

No build step is required — it's plain HTML/CSS/JS. Serve the folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

> Opening `index.html` directly via `file://` will work for basic browsing, but the service worker, `fetch()` calls to `assets/data/*.json`, and some PWA features require an actual HTTP server (even a local one).

## Deploying

- **Netlify**: drag-and-drop the folder, or connect the repo — `netlify.toml` already defines security headers, caching rules and the 404 page.
- **Vercel**: `vercel deploy` — `vercel.json` mirrors the same headers and caching config.
- **Any static host** (GitHub Pages, S3 + CloudFront, Cloudflare Pages, etc.) works too; just make sure to replicate the security headers from `netlify.toml`/`vercel.json` at the host/CDN level, since the `<meta>`-tag CSP in `index.html` is a fallback only.

After deploying to your real domain, update:
1. All `https://www.nayantharafanmade.com/...` URLs in the `<head>` of every page (canonical, Open Graph, schema).
2. `sitemap.xml` and `feed.xml`.
3. `google-site-verification` / `msvalidate.01` meta tags in `index.html` once you register with Search Console / Bing Webmaster Tools.

## Enabling optional live features

These are built and wired up, but intentionally **off by default** since they need credentials only you should hold:

| Feature | Where to configure | Notes |
|---|---|---|
| Live "Latest Uploads" video grid | `CONFIG.YT_API_KEY` / `CONFIG.YT_CHANNEL_ID` at the top of `script.js` | Uses the YouTube Data API v3. Falls back to curated cards until set. |
| Google Analytics 4 | `window.__ANALYTICS_CONFIG__.GA4_MEASUREMENT_ID` in `index.html` `<head>` | Only loads after the visitor accepts the cookie consent banner. |
| Microsoft Clarity | `window.__ANALYTICS_CONFIG__.CLARITY_PROJECT_ID` in `index.html` `<head>` | Same consent gating as GA4. |
| Google Search Console / Bing Webmaster | `google-site-verification` / `msvalidate.01` meta tags in `index.html` | Paste the verification code issued by each service. |
| Live social follower counts | `initSocialCounts()` in `script.js` | Needs your own backend/proxy — public API keys for Instagram/Facebook/TikTok follower counts cannot be safely called from client-side code. Currently shows a static "Fan Community" label. |
| Contact form submissions | `contact.html` | No backend is wired up — the form is currently a UI-only demo. `service-worker.js` includes a documented Background Sync stub for once a real endpoint exists. |

## Editing content

Most content lives in editable JSON rather than buried in markup:

- **Movies** → `assets/data/movies.json`
- **Gallery captions/categories** → `assets/data/gallery.json` (images are generated SVG placeholders — swap in real licensed fan photos when available, see below)
- **News** → `assets/data/news.json` (also reflected in `feed.xml` — update both when adding an article)
- **Awards** → `assets/data/awards.json`

`index.html`'s own gallery/movies/news rendering (in `script.js`) currently uses its own inline copies of this data for the interactive single-page experience — keep the two in sync, or refactor `script.js` to `fetch()` the same JSON files if you want a single source of truth.

## Known limitations (by design, not oversights)

- **Gallery/poster images are placeholders.** They're generated on the fly as colored SVGs so the layout, lightbox and filters are fully functional without needing licensed photography. Replace the `colors`/`caption` fields in `assets/data/gallery.json` (and the matching array in `script.js`) with real image URLs once you have rights-cleared fan photos.
- **"Ask About Nayanthara" assistant** is a rule-based search helper over this site's own data — not a live LLM. It says so in its own UI.
- **CSP/security headers** are set properly via `netlify.toml`/`vercel.json` (real HTTP headers) — the `<meta http-equiv="Content-Security-Policy">` in `index.html` is a best-effort fallback for hosts that ignore those config files, and doesn't fully replace real headers.
- **Lighthouse scores** depend on your actual hosting, image weights and network — the code is written with performance in mind (vanilla JS, lazy loading, no heavy frameworks, deferred fonts) but no static site can *guarantee* 100/100 without being measured on its final deployment.

## Accessibility & performance notes

- Semantic HTML5, ARIA labels, visible focus states, skip-to-content link, `prefers-reduced-motion` support throughout.
- Dark/light/auto theme, respecting `prefers-color-scheme` until the visitor overrides it (persisted in `localStorage`).
- All images use `loading="lazy"` and `decoding="async"`.
- Fonts are loaded via `<link rel="preconnect">` + `display=swap`.

## License

Site code: free to reuse/adapt for your own fan project. Any Nayanthara-related names, likeness and film titles referenced belong to their respective rights holders — see `terms.html`.
