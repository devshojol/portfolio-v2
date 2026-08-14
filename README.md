# Shojol Islam — Portfolio

A dark, 3D portfolio site built with **Next.js 16 (App Router)**, **React Three Fiber**, **Framer Motion** and **Tailwind CSS v4**.

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
```

---

## What's inside

| Area | Notes |
| --- | --- |
| **Hero** | Live WebGL scene — morphing metallic core, counter-rotating wireframe shells, orbital rings, floating shards, 1 800-particle starfield, bloom + vignette. Camera eases toward the pointer. |
| **Motion** | Framer Motion reveals, magnetic buttons, 3D tilt cards, Lenis smooth scrolling, scroll-lit About paragraph, scroll progress bar, custom two-part cursor. |
| **Projects** | Gonit and Chintu, each with a pure-CSS phone mockup of the real app screen. |
| **Contact** | Working form → `/api/contact`, with validation, honeypot, rate limiting, and a mailto fallback. |
| **Résumé** | One-page PDF at `public/Shojol-Islam-Resume.pdf`, linked from the nav and contact section. |
| **Performance** | Self-hosted variable fonts (no Google Fonts request), WebGL paused when the hero scrolls out of view, adaptive DPR, `prefers-reduced-motion` respected throughout. |

---

## Editing your content

**Everything text-based lives in one file: [`src/lib/data.ts`](src/lib/data.ts).**
Name, summary, stats, experience, projects, skills, education, certifications, nav links, marquee words — edit there and the whole site updates.

### Changing colours

All design tokens are at the top of [`src/app/globals.css`](src/app/globals.css) in the `@theme` block:

```css
--color-night:   #060a12;   /* page background   */
--color-surface: #0a1120;   /* cards             */
--color-accent:  #22d3ee;   /* cyan accent       */
--color-indigo:  #4f7dff;   /* secondary accent  */
```

> ⚠️ Don't name a colour token `base`, `sm`, `lg`, `xl` etc. — those collide with Tailwind's font-size scale and `text-base` would set a colour instead of a size.

The 3D scene colours are in `src/components/three/Core.tsx`, `Starfield.tsx` and `Shards.tsx`.

### Swapping in real app screenshots

`src/components/ui/PhoneMock.tsx` draws the phone screens in CSS. To use real screenshots, drop images into `public/` and replace `<GonitScreen />` / `<ChintuScreen />` with:

```tsx
<Image src="/gonit-screen.png" alt="Gonit app" fill className="object-cover" />
```

### Store links

The Play Store / App Store URLs in `src/lib/data.ts` are placeholder searches — replace them with your real listing URLs.

---

## Enabling the contact form

Out of the box the form falls back to opening the visitor's mail client. To receive real email:

1. Create a free account at [resend.com](https://resend.com) and generate an API key.
2. Copy `.env.example` to `.env.local` and fill it in:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_TO=shojolislam3231@gmail.com
CONTACT_FROM=Portfolio <onboarding@resend.dev>
```

3. Restart the dev server. `onboarding@resend.dev` works for testing; use your own verified domain in production.

The route (`src/app/api/contact/route.ts`) already handles validation, a hidden honeypot field, HTML escaping, and a 5-messages-per-minute rate limit per IP.

---

## Deploying

**Vercel** (recommended — zero config):

```bash
npx vercel
```

Add `RESEND_API_KEY`, `CONTACT_TO` and `CONTACT_FROM` under Project → Settings → Environment Variables.

**Firebase Hosting** (your current `shojol-islam.web.app`): the contact route needs a Node runtime, so use the Firebase **web frameworks** integration:

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
│  ├─ layout.tsx           # fonts, metadata, smooth scroll, cursor
│  ├─ page.tsx             # section composition + JSON-LD schema
│  ├─ globals.css          # design tokens, utilities, keyframes
│  └─ api/contact/route.ts # contact endpoint
├─ components/
│  ├─ three/               # Scene, Core, Starfield, Shards
│  ├─ sections/            # Nav, Hero, Marquee, About, Experience,
│  │                       # Projects, Skills, Contact, Footer
│  ├─ ui/                  # Reveal, TiltCard, Magnetic, PhoneMock, SectionHeading
│  ├─ Cursor.tsx
│  ├─ ScrollProgress.tsx
│  └─ SmoothScroll.tsx
├─ fonts/                  # self-hosted Inter, JetBrains Mono, Noto Sans Bengali
└─ lib/data.ts             # ← all your content
```

---

Built for Shojol Islam · [github.com/devshojol](https://github.com/devshojol)
