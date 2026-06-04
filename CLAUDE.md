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

- **Fully static, two pages sharing one stylesheet/script.** `index.html` and `privacy.html` both load `style.css` and `script.js` and repeat the same `<header>`/navbar and `<footer>` markup inline (there is no templating). If you change the nav or footer, update **both** files. Cross-page nav links use `index.html#section` form; same-page anchors use `#section`.

- **`script.js` is a single IIFE** with five independently-guarded init functions (`initMobileNav`, `initScrollReveal`, `initNavHighlight`, `initSmoothScroll`, `initContactForm`), all run on `DOMContentLoaded`. Each bails early if its target elements are absent, so sections can be added/removed from the HTML without breaking JS.

- **HTML/JS/CSS are coupled through specific hooks** — preserve these names when editing:
  - Nav highlighting pairs `data-nav-target="X"` on `.nav-link` with a section `id="X"`.
  - Scroll-in animations require the `.scroll-reveal` class (JS toggles `.visible` via `IntersectionObserver`).
  - The contact form is **front-end only**: it validates and shows a fake success after a `setTimeout`; it does not POST anywhere. Wiring it to a real backend is unimplemented.

- **Missing assets.** Several `<img>` tags reference `assets/*.svg` placeholders, but there is no `assets/` directory (only `images/tmrs-show.jpg` exists). These render broken by design until real assets are added.

- **Removed-but-not-deleted "Show Processors" section.** It lives as a large HTML comment in `index.html` and commented-out nav links. Re-enabling means uncommenting both the section and its nav entries, not rewriting from scratch.
