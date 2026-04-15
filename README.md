# Alojamento Local / Rural Website — Master README & Build Guide

> Production-ready roadmap and working guide for a **mobile-first family rural accommodation website** built with **Cloudflare Pages + Functions + Resend**, designed to start as a **clickable prototype/demo for the owners** and evolve into a real deployed booking-information platform.

---

# 1) Project Vision

This project is a **lightweight, affordable, highly maintainable hospitality website** for a small family-owned **Alojamento Local / Turismo Rural**.

The website must support:

- Public information pages
- Photo galleries
- Booking request form
- Contact form
- Availability calendar
- Simple owner dashboard
- Guest-only local guide
- Sponsored local businesses/restaurants
- Multiple languages
- Excellent mobile usability
- Cheap deployment
- Easy future growth

The first milestone is a **prototype/demo version** to present to the owners **before purchasing domain/services**.

That prototype should already communicate the full vision, even if some backend features are still placeholders.

---

# 2) Core Product Goals

## Business goals
- Showcase the accommodation professionally
- Increase direct bookings
- Reduce dependency on third-party platforms
- Improve guest experience
- Promote local partner businesses
- Keep owner management extremely simple

## Technical goals
- Very cheap to run
- Easy to maintain
- No traditional server needed
- Safe architecture for future growth
- Mobile-first UX
- Easy owner dashboard for non-tech-savvy users

---

# 3) Recommended Stack

## Hosting + Backend
- **Cloudflare Pages** → static hosting
- **Cloudflare Functions** → API endpoints
- **Resend** → contact + booking emails
- **GitHub** → version control + deployment
- **JSON-based data** → prototype and early production
- **Cloudflare KV / D1 later** → persistent admin editing without redeploy

## Frontend
- HTML
- CSS
- JavaScript modules
- JSON-driven content

## Why this stack
This keeps:
- cost near zero
- performance excellent
- backend simple
- deployment modern
- frontend freedom high

---

# 4) Project Phases (IMPORTANT ORDER)

This is the recommended order of work.

---

# Phase 0 — Prototype First (Show the Owners Fast)

## Goal
Build a **beautiful fake-but-real-feeling prototype**.

At this stage, **most features can be visual only**.

The objective is:
> show the owners exactly what the future site will feel like.

## Must include visually
- Homepage hero section
- Accommodation page
- Image gallery
- Booking page with visible fake calendar
- Contact page
- Guest guide page
- Sponsor section with placeholders
- Owner dashboard mockup
- Mobile version polished

## Backend can be placeholders
For the demo, these can be fake:
- contact email send
- booking email send
- real admin save
- authentication

Buttons can:
- show toast
- simulate success
- update temporary localStorage
- use fake JSON data

This is perfect for validation.

---

# Phase 1 — MVP (First Real Deployable Version)

After owner approval:

## Build real features
- Real contact form API
- Real booking request API
- Real blocked dates JSON source
- Real mobile responsiveness
- Real language switching
- Real guest guide content
- Real owner dashboard editing local data source

---

# Phase 2 — Better Owner Dashboard

## Upgrade the admin flow
Owners are not tech-savvy.

So the dashboard must feel like:
> add reservation → save → calendar updates.

No JSON editing manually.

### Owner actions
- Add reserved date range
- Remove reservation
- Choose booking source
- Select room/unit
- Save

## Persistence strategy
### Prototype + early MVP
Use:
- local JSON mock
- localStorage in demo

### Real production
Upgrade to:
- Cloudflare KV
- or D1

This avoids redeploying the site for every booking update.

---

# 5) Final Recommended Repo Structure

```txt
alojamento-rural-site/
│
├─ README.md
├─ package.json
├─ wrangler.toml
├─ .gitignore
├─ .dev.vars.example
│
├─ public/
│  ├─ index.html
│  ├─ alojamento.html
│  ├─ galeria.html
│  ├─ reservas.html
│  ├─ contacto.html
│  ├─ guest-guide.html
│  ├─ admin.html
│  ├─ obrigado.html
│  ├─ reserva-enviada.html
│  │
│  ├─ assets/
│  │  ├─ images/
│  │  ├─ icons/
│  │  └─ docs/
│  │
│  ├─ css/
│  │  ├─ reset.css
│  │  ├─ variables.css
│  │  ├─ base.css
│  │  ├─ layout.css
│  │  ├─ components.css
│  │  ├─ mobile.css
│  │  └─ pages/
│  │
│  ├─ js/
│  │  ├─ main.js
│  │  ├─ core/
│  │  ├─ ui/
│  │  ├─ pages/
│  │  ├─ services/
│  │  └─ data/
│  │
│  └─ partials/
│
├─ functions/
│  ├─ api/
│  ├─ utils/
│  └─ templates/
│
├─ docs/
│  ├─ roadmap.md
│  ├─ deployment.md
│  ├─ owner-workflow.md
│  ├─ content-guide.md
│  └─ design-system.md
│
└─ .github/
```

---

# 6) Mobile-First Requirements (NON-NEGOTIABLE)

Most hospitality traffic is mobile.

So the project must be built **mobile-first from day one**.

## Layout rules
- Start CSS at 360px width
- Expand upward with breakpoints
- Large tap areas
- Sticky CTA buttons
- Fast image loading
- Swipeable galleries
- Mobile-friendly date picker
- Bottom sticky booking CTA
- Click-to-call buttons
- WhatsApp quick contact

## Required breakpoints
- 360px
- 480px
- 768px
- 1024px
- 1440px

## Mobile UX priorities
### Homepage
- hero visible instantly
- reservation CTA above fold
- swipe gallery cards

### Booking
- calendar usable with thumb
- no tiny date cells
- obvious unavailable days

### Guest guide
- maps links open native apps
- restaurant cards big enough to tap
- emergency numbers one-tap call

### Admin
- owners must update dates from phone
- giant buttons
- simple save flow
- minimal text

---

# 7) Page-by-Page Build Order

This is the exact recommended order.

## 1. Homepage
Build first.

Includes:
- hero image
- accommodation summary
- CTA to reserve
- mini gallery
- local highlights
- testimonials placeholder
- sponsor teaser

## 2. Gallery
Second.

This sells the property emotionally.

## 3. Booking page
Third.

Even fake first.

Needs:
- visible calendar
- blocked dates
- booking form
- CTA feedback

## 4. Contact page
Fourth.

## 5. Guest guide
Fifth.

## 6. Admin dashboard
Sixth.

Important because owners need to immediately understand the usefulness.

---

# 8) Admin Dashboard (VERY IMPORTANT)

This is one of the highest-value features.

## UX philosophy
The owners should feel like they are editing a paper planner.

## Dashboard sections
### A) Add reservation
Fields:
- room/unit
- check-in
- check-out
- source
- guest name optional
- notes optional

### B) Existing reservations
List cards:
- room
- dates
- source
- delete button

### C) Calendar preview
Visual monthly calendar.

## Prototype implementation
For prototype:
- save to localStorage
- update visible calendar immediately

This is PERFECT for owner validation.

## Production implementation
Move storage to:
- `/api/owner-update-availability`
- KV/D1

---

# 9) Data Structure Recommendation

## Availability data
```json
{
  "units": [
    {
      "id": "casa-principal",
      "name": "Casa Principal",
      "blockedDates": [
        {
          "start": "2026-06-03",
          "end": "2026-06-07",
          "source": "booking"
        }
      ]
    }
  ]
}
```

## Local places
```json
[
  {
    "id": "restaurant-1",
    "name": "Restaurante Sol",
    "category": "restaurant",
    "mapsUrl": "",
    "sponsored": true
  }
]
```

---

# 10) Visual Style & Design System

A dedicated `docs/design-system.md` should be maintained.

The website must visually communicate the exact feeling shown in the property photos:

- handcrafted stone architecture
- mountain serenity
- warm evening hospitality
- premium countryside privacy
- authentic Portuguese rural elegance
- boutique retreat atmosphere

The visual language should feel **high-end but emotionally warm**, closer to a **private luxury refuge in the mountains** than a modern hotel.

---

## Mood direction
Aim for:

- warm stone luxury
- mountain calm
- handcrafted authenticity
- premium privacy
- sunset hospitality
- intimate boutique retreat
- rural sophistication
- family-owned trust
- peaceful exclusivity

The emotional target is:

> “a hidden premium refuge in the Portuguese mountains.”

---

## Palette recommendation

### Stone & architecture
Directly inspired by the granite walls, stone facades, and mountain surroundings.

- Granite light `#D8CBB8`
- Weathered stone `#B8A58D`
- Deep schist `#5A4B3F`

### Wood & warmth
Inspired by gates, doors, roof tiles, and interior wood.

- Terracotta roof `#B85F3B`
- Walnut wood `#8A5A3C`
- Honey wood `#C28B5A`

### Nature & mountain
Inspired by the forest, eucalyptus hills, and distant mountain views.

- Pine green `#5B6A4D`
- Mountain forest `#394534`
- Mist blue `#AFC3D1`

### Luxury accent
Used sparingly for premium highlights, pricing, CTA glow, and sunset mood.

- Sunset gold `#C89A4B`
- Warm amber `#D6A15C`

### Pool & freshness
A secondary freshness accent taken from the pool and sky.

- Pool blue `#4FA3C8`

### Text
- Charcoal earth `#2B2622`
- Soft ivory `#FAF8F4`

---

## Typography direction

### Headings
The stone house aesthetic calls for **heritage elegance**, not overly fashion-luxury typography.

Recommended serif:

- Cormorant Garamond
- Playfair Display
- Libre Baskerville

Use:
- generous line height
- elegant uppercase section labels
- refined spacing
- slightly wider tracking

This should evoke:
> estate, refuge, retreat, heritage

### Body
Readable but soft and modern.

Recommended sans:

- Inter
- Source Sans 3
- Nunito Sans

For Portuguese hospitality copy, slightly softer body typography works beautifully.

---

## UI feel

The UI should mimic the architecture and materials of the property.

### Core principles
- large immersive hero photography
- stone-texture inspired section backgrounds
- warm white content surfaces
- dark overlay on mountain night photos
- premium gallery-first layout
- spacious breathing room
- soft but grounded shadows
- rounded corners inspired by arched doorways
- subtle ironwork decorative dividers
- wood-toned CTA buttons

### Component styling

#### Cards
- 20–24px radius
- subtle deep shadow
- image-first layouts
- warm neutral surfaces
- strong photo prominence

#### Buttons
Primary:
- honey wood / sunset gold
- dark text
- medium rounded corners
- subtle hover glow

Secondary:
- transparent with dark stone border
- refined serif label optional for premium sections

#### Forms
The booking flow should feel trustworthy and premium:

- large touch-friendly fields
- stone-light background
- olive or forest focus rings
- warm labels
- clear mobile spacing
- simple step progression

---

## Imagery direction

Photography is one of the strongest assets of this property.

The site should lean heavily on:

- full-width exterior stone facade shots
- pool with mountain panorama
- dusk/night pool lighting
- warm interior bedroom ambiance
- detail crops of gate wood + iron
- mountain mist mornings if available

Best order for emotional conversion:

1. exterior hero
2. panoramic pool
3. warm suite interior
4. night luxury atmosphere
5. local mountain surroundings

This sequence sells:
> authenticity → relaxation → comfort → exclusivity → destination

---

## Motion & microinteractions
Luxury should feel calm, never flashy.

Use:
- slow fade-ins
- soft image zoom on hover
- parallax mountain hero
- smooth gallery transitions
- ambient button glow
- elegant loading skeletons
- soft section reveal on scroll

Avoid:
- aggressive animations
- bright flashy hover effects
- excessive bouncing
- fast carousels

---

## Mobile-first feel
Most users will book on phone, so the luxury feel must survive mobile.

Prioritize:

- edge-to-edge photography
- sticky booking CTA
- thumb-friendly availability selector
- premium card stacking
- large readable typography
- visible WhatsApp / call CTA
- smooth gallery swipes
- minimal clutter

The mobile experience should feel:
> boutique hotel app quality

---

# 11) Suggested Future Enhancements

After MVP:

## High value
- WhatsApp integration
- direct Google Maps routes
- check-in code access
- PDF house manual
- local weather widget
- local events section
- promo codes
- seasonal offers

## Business growth
- sponsor analytics
- featured restaurant placement
- upsell breakfast / tours
- QR code in rooms linking to guest guide

---

# 12) Deployment Order

Only do this after prototype approval.

## Step 1
Push prototype to GitHub.

## Step 2
Deploy free preview on Cloudflare Pages.

## Step 3
Show mobile demo to owners.

## Step 4
Collect:
- branding preferences
- colors
- photos
- family story
- room info
- nearby places

## Step 5
Buy domain only after approval.

Recommended:
- Cloudflare Registrar

---

# 13) Immediate Next Actions Checklist

## Week 1 — Prototype
- [ ] Setup repo
- [ ] Create homepage
- [ ] Create gallery
- [ ] Create booking page
- [ ] Create fake calendar
- [ ] Create contact page
- [ ] Create guest guide
- [ ] Create fake sponsor cards
- [ ] Create admin dashboard mockup
- [ ] Test on mobile

## Week 2 — Owner validation
- [ ] Demo on phone
- [ ] Demo on desktop
- [ ] Collect feedback
- [ ] Validate admin simplicity
- [ ] Validate guest guide usefulness

## Week 3 — MVP backend
- [ ] Add Cloudflare Functions
- [ ] Add Resend
- [ ] Add real availability API
- [ ] Add real admin save flow

---

# 14) Final Strategic Recommendation

The smartest route is:

1. **Prototype everything visually first**
2. Validate with owners
3. Prioritize mobile
4. Make admin dead simple
5. Only then implement backend
6. Only buy domain after approval

This minimizes cost, avoids wasted effort, and gives the family something concrete to react to quickly.

---

# 15) Project Principle

> The website must feel premium for guests and effortless for the family.

That principle should guide every technical and design decision.

