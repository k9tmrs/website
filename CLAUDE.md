# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A marketing site for **K9 TMRS** (a smartphone-based timing system for dog sports / Hoopers), deployed to GitHub Pages at `k9tmrs.com` (see `CNAME`). There is no framework, package manager, bundler, or test suite — it is hand-written HTML/CSS/JS. Two pages: `index.html` (single-page sections) and `privacy.html`.

## Develop / preview

No build step. Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`, which uploads the repo root as-is (no build) and publishes to GitHub Pages. A `.nojekyll` file disables GitHub's default Jekyll processing. **Active development happens on the `neon` branch** — merge to `main` to deploy.

## Architecture notes

- **Fully static, two pages sharing one stylesheet/script.** `index.html` and `privacy.html` both load `style.css` and `script.js`.

- **The header/navbar and footer are shared, not duplicated.** Both pages contain only `<div id="site-header"></div>` and `<div id="site-footer"></div>` placeholders; `script.js` (`initLayout` → `buildHeader`/`buildFooter`) injects the real markup at runtime, driven by the `NAV_ITEMS` array. **To change the nav or footer, edit `script.js`, not the HTML.** Each page identifies itself via `<body data-page="home|privacy">`: on `home`, nav links are same-page `#section` anchors with `data-nav-target` (for scroll-spy); elsewhere they become `index.html#section`, and the link matching the current standalone page (e.g. Privacy) gets `.active`. Injection is client-side, so the nav/footer require JS to appear.

- **`script.js` is a single IIFE** with init functions run on `DOMContentLoaded`, starting with `initLayout` (which must run first, since the others query the injected header). The rest — `initMobileNav`, `initScrollReveal`, `initNavHighlight`, `initSmoothScroll`, `initContactForm` — each bail early if their target elements are absent, so sections can be added/removed without breaking JS.

- **HTML/JS/CSS are coupled through specific hooks** — preserve these names when editing:
  - Nav highlighting pairs `data-nav-target="X"` on `.nav-link` with a section `id="X"`; `initNavHighlight` bails when no such sections exist (so a server-set `.active`, e.g. on the privacy page, is left alone).
  - Scroll-in animations require the `.scroll-reveal` class (JS toggles `.visible` via `IntersectionObserver`).
  - The contact form is **front-end only**: it validates and shows a fake success after a `setTimeout`; it does not POST anywhere. Wiring it to a real backend is unimplemented.

- **All images live in `images/`** — the hero photo (`tmrs-show.jpg`) plus hand-authored, on-brand SVG illustrations (`setup-flow.svg`, `features-diagram.svg`, `show-processor-dashboard.svg`). There is no `assets/` directory. `show-processor-dashboard.svg` is only referenced from the commented-out Show Processors section.

- **Removed-but-not-deleted "Show Processors" section.** It lives as a large HTML comment in `index.html`. Re-enabling means uncommenting that section and adding a `{ id: 'show-processors', label: 'For Show Processors' }` entry to `NAV_ITEMS` in `script.js` (the nav links are no longer in the HTML).
