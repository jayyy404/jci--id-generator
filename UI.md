# UI/UX Rebuild Plan — Kit Confirmation Portal

## 0. Context

The backend (search, confirm, admin list, CSV export) is done and correct — this plan only covers
visual design. Today every screen uses raw inline `style={}` props and default browser styling
(`system-ui`). The goal is to reskin the existing flows using the brand identity of the main JCI
Regatta Iloilo site (`C:\Users\jepoy\Desktop\JCIRegattaIloiloAstro`), ported to React/Next.js —
**not** to copy that site's marketing-page complexity (GSAP intro overlays, custom cursor,
carousels, magazine flipbook, etc.). This app is a focused, single-purpose form flow used on
phones at a registration desk, so the bar is: on-brand, calm, fast, thumb-friendly.

## 1. What the reference project actually gives us

Analyzed `Header.astro`, `Footer.astro`, `BaseLayout.astro`, `index.astro`, `areacon.astro`.
Key finding: the reference site has **no single source of truth for color** — Header, Footer,
homepage, and the Areacon sub-page each declare their own separate `:root` token set with
different blues/navies. We will not port that inconsistency; we consolidate into one palette
below, keeping the values that actually appear in the screenshot (Areacon page) since that's the
closest visual sibling to a "conference" flow like ours.

### Palette (consolidated, values traced to source)
| Token | Hex | Source / use |
|---|---|---|
| `--navy` | `#1E3A5F` | headings, header text |
| `--navy-dark` | `#0F172A` | "Join Us" pill, footer background family |
| `--footer-bg` | `#120F2D` | Footer.astro `--footer-primary` |
| `--amber-50` | `#FFFBEB` | hero/background gradient stop |
| `--amber-100` | `#FEF3C7` | hero/background gradient stop |
| `--gold` | `#F59E0B` | Areacon badge, accent |
| `--gold-light` | `#FCD34D` | Areacon badge gradient |
| `--green` | `#16A34A` → `#4ADE80` | TOSIA-style badge (not used here, kept for reference) |
| `--red` | `#DC2626` | primary CTA ("Join the Rhythm" equivalent → our "Confirm" CTA) |
| `--red-dark` | `#B91C1C` | CTA hover/active |
| `--sky` | `#38BDF8` | secondary accent, links |
| `--white` | `#FFFFFF` | cards, surfaces |
| `--slate-600` | `#475569` | body text |
| `--slate-800` | `#1E293B` | strong body text |

### Typography
Reference project *intends* `Outfit` (display/headings) + `Source Sans 3`/`Inter` (body) but never
actually loads them (missing `<link>` tags — a bug in the source project). We will do this
properly with `next/font/google`:
- **Headings / brand wordmark:** `Outfit` (600/700)
- **Body / form text:** `Inter` (400/500/600)

### Shape & elevation language (traced to `index.astro` design tokens)
- Radius scale: `12px` (inputs/cards), `20px` (panels), `9999px` (pills/buttons — the dominant
  shape for every CTA and badge across the site)
- Shadows: `0 2px 8px rgba(0,0,0,.08)` (sm), `0 8px 24px rgba(0,0,0,.12)` (md)
- Buttons are consistently pill-shaped, with a `translateY(-2px)` hover lift

### Logo & footer assets to port
Source files to copy into this project's new `public/brand/` folder:
- `src/assets/compressed/JCILocalLogoPhilippines.png` → JCI Philippines logo
- `src/assets/compressed/JCIRegattaLogo.png` → JCI Regatta logo
- `public/src/assets/logosjci/78 Logo-01.png`, `Sustain the Future Gradient.png`,
  `Masarig 2026 LO Presidents Logo.png`, `INNOVATE 4 IMPACT LOGO.png`, `jci-regatta-2026.png`
  → the small campaign-logo strip shown in the footer
- Footer copy/structure (org blurb, address, email, social links, "Powered by" line, dynamic
  `{currentYear}`) is reused near-verbatim, simplified to a single column set (no need for the
  full 4-column marketing footer — see §3.3).

Do **not** port: custom cursor, wave SVG header animation, glassmorphism blur navbar-on-scroll
logic, intro overlay, GSAP. These are marketing-site flourishes with no place in a transactional
form flow, and porting them would add complexity for zero benefit to a delegate confirming a kit
receipt on their phone.

## 2. New shared UI primitives

Currently there's no shared component layer — every screen hand-rolls inline styles. Introduce:

| File | Purpose |
|---|---|
| `app/globals.css` | CSS custom properties (palette above), base resets, typography |
| `components/ui/Button.tsx` | Pill button, variants: `primary` (red/gold gradient), `secondary` (outline navy), `ghost` (text-only back link) |
| `components/ui/Card.tsx` | White rounded surface (`--radius-lg`, `shadow-sm`), used for the registration-details card and admin login card |
| `components/ui/Badge.tsx` | Small pill for status (e.g. "Kit Confirmed" / "Pending") — reuses the AREACON/TOSIA badge visual language (gradient pill, small dot) |
| `components/Header.tsx` | Slim header: JCI Philippines + JCI Regatta logos left, event name ("46th Visayas Area Con") center/right. No nav links (this app has one job), no mobile hamburger needed beyond simple responsive stacking |
| `components/Footer.tsx` | Condensed single-row footer: logo strip + "© {year} JCI Regatta Iloilo" + contact email. Ported from `Footer.astro`'s bottom bar + logo strip, dropping the 4-column link grid (Quick Links/Projects nav doesn't apply to a standalone confirmation portal) |
| `app/layout.tsx` | Wrap `children` with `<Header />` … `<Footer />`, load `Outfit`/`Inter` via `next/font/google`, apply the amber-50→amber-100 gradient background site-wide (matches the reference hero background, gives the whole app a consistent "event" feel instead of a stark white form) |

This mirrors the reference project's actual pattern: `BaseLayout.astro` injects `<Header/>` and
`<Footer/>` once around a `<slot/>`, rather than every page composing them individually.

## 3. Screen-by-screen plan

### 3.1 Root layout (`app/layout.tsx` + `globals.css`)
- Background: soft amber gradient (`linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 50%, #FEF3C7 100%)`), fixed, full height — same recipe as the Areacon page hero.
- Content column: centered, `max-width: 480px` on the participant flow (keep it — this is correct for a single-column mobile-first form), `max-width: 960px` for `/admin`.
- Header pinned at top (static, not the reference's scroll-hide/blur navbar — unnecessary here since there's no long page to scroll past).
- Footer at the bottom, `margin-top: auto` via a flex column shell so it never floats mid-page on short content.

### 3.2 Header
- Left: JCI Philippines logo + JCI Regatta logo, small vertical divider between them (as in `Header.astro`), each ~40px tall (much smaller than the reference's 110px — this is a compact utility header, not a hero navbar).
- Right (or centered below on mobile): event wordmark "46th Visayas Area Con" in `Outfit` semibold, `--navy`.
- No nav links, no "Join Us"/AREACON/TOSIA badges — those are marketing-site navigation, irrelevant to a delegate mid-confirmation.

### 3.3 Footer (condensed)
- Row 1: small logo strip (JCI Philippines, JCI Regatta, 78th Anniversary mark) at reduced opacity, centered, wraps on mobile.
- Row 2: `© {new Date().getFullYear()} JCI Regatta Iloilo. All rights reserved.` + contact email link, centered, `--footer-bg` background, white/muted text — same bottom-bar recipe as `Footer.astro`, just without the 4-column link grid above it.

### 3.4 Participant flow (`app/page.tsx` + its 4 components)
Current step machine (`search → details → confirm → success`) is good UX and stays as-is; only
presentation changes.

- **Search step** (`SearchInput.tsx`): input becomes a large pill-shaped field (`--radius-full`,
  white surface, subtle shadow, `--sky` focus ring) with a search icon. Result list becomes a
  `Card`-based dropdown: each result row shows the existing circular photo, name, chapter, with
  hover/tap background tint in `--amber-50`. Duplicate-name warning keeps its amber tone but
  becomes a proper inline alert banner (icon + text) instead of a plain colored `<p>`.
- **Details step** (`RegistrationDetails.tsx`): the info box becomes a `Card` component —
  centered photo (larger, ringed border in `--gold`), name in `Outfit` bold, chapter as a small
  pill badge, fields laid out as a clean label/value list. Primary action "Confirm Registration"
  becomes the `Button variant="primary"` pill (red→gold, matching the reference's CTA style);
  "Not me, go back" becomes `Button variant="ghost"`.
- **Confirm step** (`KitConfirmationForm.tsx`): acknowledgement text in a highlighted `Card` with
  a left accent border (`--gold`); checkbox restyled as a large tappable row (checkbox + label
  both clickable, per touch-target best practice). `SignaturePad` canvas gets a card wrapper with
  a dashed `--slate-600` border and a "Sign above" placeholder centered when empty; Clear button
  becomes `Button variant="secondary" size="sm"`. Submit becomes the primary pill button, full
  width, disabled state visibly greyed rather than just `disabled` attribute styling.
- **Success step**: full-width `Card` with a large checkmark badge (green circle, not just an
  emoji glyph), heading in `Outfit`, celebratory but calm — reuse the amber/gold gradient
  background already established by the layout so this doesn't need its own treatment. "Done"
  button returns to search.

### 3.5 Admin (`app/admin/page.tsx`)
Kept intentionally plainer/denser than the participant flow — this is a working tool for the
Secretariat, not attendee-facing branding, but should still feel like the same product:
- Login screen: centered `Card`, password input styled to match the participant search input,
  primary pill button for "Log in".
- Dashboard: header row with page title + "Log out" as `Button variant="ghost"`.
- Search/filter input: same pill style as participant search, paired with the CSV export button
  as `Button variant="secondary"`.
- Table: keep as an HTML table (no need for a data-grid library) but restyle — `--navy` header
  row with white text, zebra-striped body rows, status column rendered as the `Badge` component
  (green "Confirmed" / neutral grey "Pending") instead of plain "Yes"/"No" text, monospace-free
  clean `Inter` throughout.

## 4. Implementation order

1. Add `public/brand/` and copy the logo files listed in §1.
2. Build `globals.css` tokens + `next/font/google` setup in `app/layout.tsx`.
3. Build shared primitives: `Button`, `Card`, `Badge`.
4. Build `Header` and `Footer`, wire into `app/layout.tsx`.
5. Restyle participant flow components in order: `SearchInput` → `RegistrationDetails` →
   `KitConfirmationForm` → `SignaturePad` → success state in `app/page.tsx`.
6. Restyle `app/admin/page.tsx` (login + dashboard + table).
7. Pass over responsive check at 360px (small phone) and 768px (tablet/secretariat desk device)
   widths; verify tap targets ≥ 44px on checkbox/buttons.
8. Verify the signature canvas still functions correctly after wrapping it in styled containers
   (pointer coordinate math in `SignaturePad.tsx` depends on `getBoundingClientRect()`, so padding
   must be on a wrapper, not the canvas element itself).

## 5. Explicitly out of scope

- No Tailwind/CSS framework addition — plain CSS with custom properties keeps this dependency-light,
  matching the project's current minimal `package.json` (only `next`/`react`).
- No animation libraries (GSAP, Framer Motion), custom cursor, or scroll-triggered effects.
- No navigation menu, marketing sections, or additional pages beyond the existing two routes.
- No changes to backend/API routes, `lib/`, or data flow — this is presentation-only.



## NEW UI

- Copy the assets of the main project and screen of users from this project should exactly the same for main page see the photo atttached, find the assets which have red box should display on my main screen both admin and user (background image or the main content is in front)

- Copy exactly the same footer showing in main project

- remove the redundant logo in the nav bar part, scale it a little bigger

- make the texts showing in pages one sentence - justify with UI heirarchy for better readability

- 