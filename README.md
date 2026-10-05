# Shojol Islam — Portfolio

Personal site built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, **GSAP** and **React Three Fiber**.

Live: [devshojol.vercel.app](https://devshojol.vercel.app)

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
npm run lint
```

---

## Routes

| Route | What it is |
| --- | --- |
| **`/`** | The current portfolio. Editorial, full-bleed layout: oversized condensed wordmark, hand-drawn looping hero figure, diagonal section cuts, work grid, skills diagram and a pinned contact panel the page slides up off. Indexed, canonical. |
| **`/v1`** | The previous homepage — live WebGL hero (morphing metallic core, wireframe shells, orbital rings, starfield, bloom), marquee, tilt cards. Kept reachable, but `noindex` so the site has one canonical portfolio. |
| **`/design`** | Design Lab. A desktop-style playground: aurora gradient backdrop, draggable folder windows, analog clock, custom cursor, and three.js set pieces (`office.glb`, `sword.glb` with blade trail, GSAP animation demos). |
| **`/avengers`** | Scroll-driven experiment. Three all-intra MP4 clips scrubbed frame-by-frame against the section rail, with a HUD readout. `noindex, nofollow`. |
| **`/api/contact`** | Contact endpoint — shared by all three contact forms. |

---

## What's on the main page

| Area | Notes |
| --- | --- |
| **Hero** | Four original line-art moods (Sleeping / Working / Football / Gaming) drawn as inline SVG — click to cycle. Stacked wordmark on narrow screens so the lower half never reads empty. |
| **Accent picker** | The corner FAB fans out six accents on a quarter arc. Picking writes `--v2-accent-pick` on `<html>`; one variable repaints the hero field, the contact panel, the skills diagram and every small accent. Saved to `localStorage` (`v2-accent`) and synced across tabs. |
| **Slant system** | `SlantFloor` writes the wedge angle per frame, so the dark block's bottom edge opens as it rides up to uncover the pinned contact panel. |
| **Motion** | Framer Motion reveals, Lenis smooth scrolling, a custom two-part cursor, scroll progress, word-by-word fades. `prefers-reduced-motion` respected throughout. |
| **Work** | Gonit, Chintu, CTX Feed and the Design Lab, each with its own card image in `public/v2/work/`. |
| **Contact** | Posts to `/api/contact` with validation, honeypot, rate limiting, and a mailto fallback. |
| **Résumé** | One-page PDF at `public/Shojol-Islam-Resume.pdf`, linked from the nav and the contact lockup. |
| **SEO** | Metadata in `layout.tsx`, a single linked JSON-LD `@graph` (Person / WebSite / ProfilePage / MobileApplication) in `page.tsx` whose skill list is derived from `skillGroups`, plus `sitemap.ts`, `robots.ts` and a generated 1200×630 `opengraph-image.tsx`. Every route declares its own canonical — metadata merges shallowly, so anything a route leaves unset it inherits from the root. |
| **Performance** | Self-hosted variable fonts (no Google Fonts request), WebGL gated behind `useCanRenderScene()` so the three.js chunk is never requested on phones, adaptive DPR. |

---

## Editing your content

**Everything personal lives in [`src/lib/data.ts`](src/lib/data.ts)** — name, summary, stats, experience, projects, skills, education, certifications, socials, résumé link and `siteUrl`. Both page versions read from it, so they can't drift.

Copy that exists only to serve the main layout — statement lines, bio, keywords, work-card categories, skill clusters, nav links — is in [`src/components/v2/data.ts`](src/components/v2/data.ts), which re-exports from `lib/data.ts` rather than duplicating it.

### Changing colours

The main page's palette is scoped to `.v2` in [`src/app/v2.css`](src/app/v2.css):

```css
--v2-accent: var(--v2-accent-pick, #a7c957);  /* default lime, overridden by the picker */
--v2-ink:    #000000;
--v2-paper:  #05060a;
--v2-muted:  #8b93a1;
```

The six selectable accents are the `ACCENTS` array in [`src/components/v2/ThemeFab.tsx`](src/components/v2/ThemeFab.tsx) — keep them light enough that black display type stays legible on a full-bleed field.

Site-wide tokens (used by `/v1`, `/design` and the shared chrome) are in the `@theme` block at the top of [`src/app/globals.css`](src/app/globals.css):

```css
--color-night:   #060a12;   /* page background   */
--color-surface: #0a1120;   /* cards             */
--color-accent:  #22d3ee;   /* cyan accent       */
--color-indigo:  #4f7dff;   /* secondary accent  */
```

> ⚠️ Don't name a colour token `base`, `sm`, `lg`, `xl` etc. — those collide with Tailwind's font-size scale and `text-base` would set a colour instead of a size.

The `/v1` 3D scene colours live in `src/components/three/Core.tsx`, `Starfield.tsx` and `Shards.tsx`.

### Swapping work images

Cards read their image path from `works` in `src/components/v2/data.ts`. Drop a replacement into `public/v2/work/` at the same filename and nothing else needs to change.

### Store links

Some Play Store / App Store URLs in `src/lib/data.ts` are placeholder searches. The JSON-LD graph deliberately filters those out (`sameAs` only takes canonical listing URLs) — replace them with the real listings and they'll be asserted.

---

## Enabling the contact form

Out of the box the form falls back to opening the visitor's mail client; without `RESEND_API_KEY` the route answers `503 { configured: false }`. To receive real email:

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. Copy `.env.example` to `.env.local` and fill it in:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO=shojolislam3231@gmail.com
CONTACT_FROM=Portfolio <onboarding@resend.dev>
```

3. Restart the dev server. `onboarding@resend.dev` works for testing; use your own verified domain in production.

The route (`src/app/api/contact/route.ts`) runs on the Node runtime and handles validation, a hidden honeypot field, HTML escaping, and a 5-messages-per-minute rate limit per IP.

---

## Deploying

**Vercel** (recommended — zero config):

```bash
npx vercel
```

Add `RESEND_API_KEY`, `CONTACT_TO` and `CONTACT_FROM` under Project → Settings → Environment Variables.

**Firebase Hosting**: the contact route needs a Node runtime, so use the Firebase **web frameworks** integration:

```bash
npm i -g firebase-tools
firebase experiments:enable webframeworks
firebase init hosting     # choose this directory as the source
firebase deploy
```

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            # fonts, metadata, smooth scroll, cursor
│  ├─ page.tsx              # current portfolio + JSON-LD @graph
│  ├─ v2.css                # palette & type scale for the main page
│  ├─ globals.css           # site-wide design tokens, utilities, keyframes
│  ├─ v1/page.tsx           # previous 3D homepage (noindex)
│  ├─ design/              # Design Lab playground + its metadata & OG card
│  ├─ avengers/             # scroll-scrubbed video experiment (noindex)
│  ├─ opengraph-image.tsx   # generated 1200x630 OG / Twitter card
│  ├─ sitemap.ts · robots.ts
│  └─ api/contact/route.ts  # contact endpoint
├─ components/
│  ├─ v2/                   # Hero, HeroMood, About, Works, Skills, Contact,
│  │                        # SlantFloor, ThemeFab, Reveal, data.ts
│  ├─ sections/             # /v1 sections — Nav, Hero, Marquee, About,
│  │                        # Experience, Projects, Skills, Contact, Footer
│  ├─ three/                # Scene, Core, Starfield, Shards
│  ├─ design/               # Design Lab — Aurora, folders, Office, Sword, GSAP demos
│  ├─ avengers/             # experience shell, choreography, sections
│  ├─ ui/                   # Reveal, TiltCard, Magnetic, PhoneMock, SectionHeading
│  ├─ Cursor.tsx · ScrollProgress.tsx · SmoothScroll.tsx
├─ fonts/                   # self-hosted Inter, JetBrains Mono, Noto Sans Bengali
├─ lib/
│  ├─ data.ts               # ← all your content
│  ├─ media.ts              # reduced-motion / pointer / can-render-scene hooks
│  └─ rng.ts
└─ utils/cn.ts
```

---

Built for Shojol Islam · [github.com/devshojol](https://github.com/devshojol)
