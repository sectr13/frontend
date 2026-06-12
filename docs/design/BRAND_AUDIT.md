# Amraa Nets — Brand Audit

**Scope:** `apps/user` — all source files, public assets, locale files, SEO metadata, PWA manifest, favicons, OAuth callbacks  
**Date:** 2026-06-12  
**Method:** Full-text search for `Outline365`, `Outline`, `Hiddi`, `PPanel`, `ppanel`, `perfect-panel`, `Loading...`, and related legacy strings across `.tsx`, `.ts`, `.html`, `.json`, `.svg`, `.md`

---

## Summary

| Severity | Count | Status |
|---|---|---|
| Critical | 4 | Needs fix |
| Medium | 5 | Needs fix |
| Low | 3 | Informational |

**"Outline365" / "Outline" / "Hiddi"** — Zero occurrences. These legacy names are fully absent from both source and locale files.

**"PPanel" / "ppanel"** — 7 live occurrences (not counting dev-only README files).

**Hardcoded product names in user-facing src/** — None. All brand display in components uses `site.site_name` / `site.site_desc` / `site.site_logo` from the backend config store. Brand text is clean in components.

---

## CRITICAL — User-Visible Branding

### C-1 · PWA Manifest — `public/site.webmanifest`

```json
{
  "name": "PPanel",
  "short_name": "PPanel",
  ...
}
```

**Impact:** Visible to every user who installs the PWA or triggers the "Add to Home Screen" prompt. Android/Chrome shows `name` in the install dialog and `short_name` on the home screen icon. This is the highest-visibility brand surface outside the app itself.

**Fix:** Set `name` to `"Amraa Nets"` and `short_name` to `"Amraa Nets"`.

---

### C-2 · HTML Shell — `index.html` (title + description)

```html
<title>Loading...</title>
<meta name="description" content="Loading...">
```

**Impact:** The browser tab shows "Loading..." during the initial JS bundle load — visible for 1–3 seconds on every page load, every session. Screen readers and low-JS crawlers read this text. The fallback in `__root.tsx` also reads `site.site_name || "Loading..."`, so the static HTML and the JS fallback are both wrong.

**Fix:** Set `<title>Amraa Nets</title>` and a real description in `index.html`. Update the `__root.tsx` fallback from `"Loading..."` to `"Amraa Nets"`.

---

### C-3 · Favicon & PWA Icons — `public/`

```
public/favicon.svg          — PPanel geometric logo (blue gradient, complex polygon shape)
public/favicon.ico          — PPanel logo (48×48, 32×32 embedded PNGs)
public/apple-touch-icon.png — 180×180 PNG
public/pwa-192x192.png      — 192×192 PNG
public/pwa-512x512.png      — 512×512 PNG
public/pwa-maskable-192x192.png — 192×192 PNG (maskable)
public/pwa-maskable-512x512.png — 512×512 PNG (maskable)
```

**Impact:** `favicon.svg`/`favicon.ico` appear in every browser tab. PWA icons appear on every install screen, home screen, and splash screen. The `__root.tsx` overrides the favicon dynamically with `site.site_logo`, but only after JS loads; until then the static PPanel favicon shows.

**Note:** The `favicon.svg` was inspected — it is a complex blue/purple gradient geometric shape that is the PPanel upstream logo. It is not Amraa Nets branding.

**Fix:** Replace all 7 icon files with Amraa Nets branded versions.

---

### C-4 · Auth Page Heading Locale — `public/assets/locales/en-US/auth.json`

```json
"verifyAccount": "Verify Your Account",
"verifyAccountDesc": "Please login or register to continue"
```

**Impact:** "Verify Your Account" is the visible `<h1>` on the login page (rendered via `t("verifyAccount")`). "Please login or register to continue" is the subtitle. Both read like the original PPanel template and do not match the Amraa Nets tone established on the homepage.

**Fix:** Update to `"Welcome back"` / `"Sign in or create an account to continue"` (matching the fallback strings already in `auth/index.tsx`).

---

## MEDIUM — Metadata & SEO

### M-1 · PWA Manifest (duplicate of C-1, SEO angle)

The manifest is fetched by Google Search Console, Bing, and app store crawlers. The `name: "PPanel"` will appear in any PWA-related search indexing or app store listing that references this manifest.

---

### M-2 · Tutorial Content Source URL — `src/sections/user/document/tutorial.ts:4`

```ts
const BASE_URL = `${CDN_URL}/gh/perfect-panel/ppanel-tutorial`;
```

**Impact:** The Guides section (`/document`) loads tutorial markdown directly from `perfect-panel/ppanel-tutorial` on GitHub via jsDelivr CDN. Users who read the guides see content authored for PPanel/upstream. Tutorial titles, screenshots, and text may refer to PPanel features, commands, or branding.

**Hardcoded URL:** `https://cdn.jsdmirror.com/gh/perfect-panel/ppanel-tutorial@latest/...`

**Fix (two options):**
1. Fork `perfect-panel/ppanel-tutorial` to an `amraanet` org, update `BASE_URL`.
2. Disable the Tutorial/Guides feature entirely via `VITE_TUTORIAL_DOCUMENT=false` if Amraa Nets does not maintain separate documentation.

---

### M-3 · OAuth Callback Page Titles — `public/oauth/google/index.html`, `public/oauth/telegram/index.html`

```html
<title>OAuth Redirect</title>
```

**Impact:** Briefly visible in the browser tab during OAuth redirect (before JS rewrites the route). Low dwell time but nonzero. Page `<body>` text is `"Redirecting…"` with no brand context.

**Fix:** Change `<title>` to `"Amraa Nets — Signing in…"` and body to `"Redirecting to Amraa Nets…"`.

---

### M-4 · Default CDN Fallback — `src/config/index.ts:5` / `.env`

```ts
export const CDN_URL = import.meta.env.VITE_CDN_URL || "https://cdn.jsdmirror.com";
```

**Impact:** `cdn.jsdmirror.com` is a third-party Chinese CDN mirror for jsDelivr. If `VITE_CDN_URL` is unset in production, tutorial assets are fetched from this domain. No brand impact, but a reliability and trust concern: users see requests to an unknown third-party domain.

**Fix:** Set `VITE_CDN_URL` explicitly in the production `.env`, or set `VITE_TUTORIAL_DOCUMENT=false`.

---

### M-5 · `index.html` Static Apple Touch Icon — Stays PPanel Until JS Hydrates

```html
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

`__root.tsx` overrides this with `<link href={logo} rel="apple-touch-icon" sizes="180x180" />` after the API call completes. But during cold load (including any offline/cached view), the static `apple-touch-icon.png` (PPanel logo) is used.

Covered by C-3 fix, but worth noting separately as it has a different trigger path.

---

## LOW — Internal / Dev Only

### L-1 · README files — `README.md`, `README.zh-CN.md`

Both files are authored for the upstream PPanel open-source project. They contain:
- `<h1>PPanel user web</h1>`
- `https://raw.githubusercontent.com/perfect-panel/ppanel-assets/...logo.svg`
- Multiple GitHub shields pointing to `perfect-panel/ppanel-web`
- Vercel deploy button for the upstream repo
- Copyright `© 2024 PPanel`

**Impact:** Developer-facing only. Not served to users. No action required for user-facing brand fix.

---

### L-2 · Commented-out code — `src/sections/user/document/tutorial.ts:9`

```ts
//     'https://data.jsdelivr.com/v1/stats/packages/gh/perfect-panel/ppanel-tutorial/versions',
```

Dead code comment. Not executed, not visible to users. Can be removed for cleanliness.

---

### L-3 · `src/routes/__root.tsx` fallback string

```ts
const title = site.site_name || "Loading...";
```

The `"Loading..."` fallback is surfaced when `site.site_name` is empty (first render or API failure). This is covered by C-2 but isolated here as a separate code location — two places need updating (the HTML shell and this JS fallback).

---

## Hardcoded Items Index

| Type | Location | Value | Severity |
|---|---|---|---|
| Product name | `public/site.webmanifest:2-3` | `"PPanel"` | Critical |
| Product name | `index.html:26,29` | `"Loading..."` | Critical |
| Product name | `src/routes/__root.tsx:40` | `"Loading..."` fallback | Critical |
| Logo asset | `public/favicon.svg` | PPanel upstream logo | Critical |
| Logo asset | `public/favicon.ico` | PPanel upstream logo | Critical |
| Logo asset | `public/pwa-*.png` (×5) | PPanel upstream logo | Critical |
| Auth heading | `locales/en-US/auth.json` | `"Verify Your Account"` | Critical |
| URL | `src/sections/user/document/tutorial.ts:4` | `perfect-panel/ppanel-tutorial` GitHub | Medium |
| URL | `src/config/index.ts:5` | `cdn.jsdmirror.com` CDN | Medium |
| Page title | `public/oauth/google/index.html` | `"OAuth Redirect"` | Medium |
| Page title | `public/oauth/telegram/index.html` | `"OAuth Redirect"` | Medium |
| Support email | — | None found | — |
| Support URL | — | None found | — |

---

## What Is Already Clean

- All component-level brand display uses `site.site_name` / `site.site_logo` / `site.site_desc` — fully dynamic, no hardcodes.
- No occurrences of "Outline365", "Outline", or "Hiddi" anywhere in the codebase.
- Locale files for `en-US` and `zh-CN` (Mongolian Cyrillic): no upstream branding leakage in user-visible strings.
- Nav labels, menu items, sidebar, dashboard, AmraaNet page, ticket/support page — all clean.
- Footer renders `{site.site_name}` dynamically.
- The `emailInputTitle` locale key correctly uses the `{{siteName}}` interpolation token (not a hardcoded string).
- OAuth callback pages contain no hardcoded brand text (only generic "OAuth Redirect").

---

## Fix Priority Order

1. **`public/site.webmanifest`** — 2-line change, highest visibility (C-1)
2. **`index.html` title + description** — 2-line change, every page load (C-2)
3. **`src/routes/__root.tsx` fallback** — 1-line change (L-3 / C-2)
4. **Auth page locale strings** — 2-line change in `auth.json` ×2 locales (C-4)
5. **Favicon + PWA icons** — requires design assets, coordinate separately (C-3)
6. **OAuth page titles** — 2-file change, 1 line each (M-3)
7. **Tutorial URL / feature flag** — decide whether to fork or disable (M-2)
