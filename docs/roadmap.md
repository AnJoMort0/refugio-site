# O Refúgio - Living Product Roadmap

Last reviewed: 2026-08-27

This file is the current source of truth for product status and remaining work. The previous long-form roadmap, including old prompts and reversion notes, is preserved in [`roadmap-archive.md`](./roadmap-archive.md).

## Status legend

- [x] Complete in the current prototype
- [~] Partly complete, or complete as a prototype with a known limitation
- [!] Needs owner content, a product decision, or an external dependency
- [>] Belongs to the production version rather than the browser-only prototype
- [ ] Planned and not yet implemented

`[c]` is retired. A change made by Codex is marked by its actual product status instead.

## Product position

The public website, guest-stay page, and administration area are substantial working prototypes. Public content is translated into Portuguese, English, French, and Spanish. The admin prototype is intentionally Portuguese-only and stores demonstration data in `localStorage`.

The prototype is suitable for owner review and workflow testing. It is not suitable for real personal, financial, employment, or identity data until authentication, server-side storage, APIs, and operational safeguards described in [`deployment.md`](./deployment.md) are implemented.

## 1. Current review batch

### 1.1 Repository, content, and documentation

- [x] Review and reclassify the roadmap with `[x]`, `[~]`, `[!]`, and `[>]`.
  - Note: The working roadmap was condensed by capability; the original 54 KB document remains in `roadmap-archive.md` for traceability.
- [x] Reorganise the roadmap into public, admin, responsive, production, and decision sections.
- [x] Make `pt.json` the structural source of truth for public locales.
  - Note: `npm run locales:sync` preserves the order of `pt.json`, removes target-language keys removed from Portuguese, and refuses to write when a new Portuguese key has not yet been translated.
- [x] Limit available and preferred languages throughout the public site, admin prototype, seed data, and message templates to Portuguese, English, French, and Spanish.
- [x] Align English, French, and Spanish locale structure and current copy with `pt.json`.
- [x] Remove public page-script Portuguese fallback copy.
  - Note: Missing locale keys now render empty and fail project checks instead of silently reviving hardcoded Portuguese.
- [x] Review repository hierarchy.
  - Note: Runtime modules already have clear `admin`, `config`, `pages`, `services`, `ui`, and `utils` boundaries. Tracked map concepts moved from `temp/` to `docs/design-explorations/local-map/`; unused empty Pages Functions/partials placeholders were removed.
- [x] Update project documentation to describe the current prototype and cheapest production route.
- [>] Automatically collect every marketing opt-in in a private production admin list.
  - Note: The local prototype can list consent already present in its demo reservations and requests. Production must also ingest contact/booking APIs, store consent evidence, and support unsubscribe and suppression records.

### 1.2 Shared public shell

- [x] Keep the floating reservation sale label inside desktop and phone viewports.
- [~] Add a compact floating WhatsApp action beside the reservation action using the official white WhatsApp glyph and brand green.
  - Note: The action and translated default message work. Add the final WhatsApp number in `public/js/config/site-config.js` before launch.
- [~] Rebuild the footer with grouped navigation, Google Maps address, click-to-email, click-to-call, social links, review link, and creator credit.
  - Note: Layout is complete and verified at 390px and 1440px. Email, phone, Facebook, and Instagram still use intentionally obvious replaceable values in `site-config.js`.
- [x] Centralise property, contact, social, creator, host, Wi-Fi, and map values in `public/js/config/site-config.js`.
- [x] Replace native dropdown presentation with one shared rounded select menu across public and dynamically rendered admin forms.
  - Note: Native `<select>` values, validation, form submission, and change events remain underneath; the shared visual menu adds the same caret, typography, focus treatment, rounded options, and keyboard controls used by the language selector.
- [x] Keep the header, language control, menu button, and floating actions inside mobile safe areas.
- [x] Use PT/EN/FR/ES initials in the compact language trigger while retaining full language names in its menu.
- [x] Remove full-page horizontal overflow at narrow widths.

### 1.3 Homepage

- [x] Replace the old hero copy with a premium dictionary-style presentation of "O Refúgio".
- [x] Translate the dictionary treatment appropriately in all four public languages.
- [x] Deep-link homepage partner cards to the matching expanded partner entry in Guia Local.
- [x] Restyle homepage gallery previews as restrained white print/polaroid cards.
- [x] Give the homepage reservation section the distinct coloured-band treatment used by the accommodation page.
- [x] Keep the promotional announcement and sale badge driven by lower limited-date prices from the admin pricing data.

### 1.4 Alojamento and Galeria

- [x] Remove the empty desktop grid cell in "Antes de reservar".
- [x] Add washing-machine and dryer information to amenities.
- [x] Remove inline-image baseline gaps that appeared as unexplained white strips on phones.
- [x] Support panning around zoomed gallery images.
- [x] Use swipe navigation in the phone lightbox and hide redundant previous/next buttons there.

### 1.5 Reservas

- [x] Make today clearly recognisable in the availability calendar.
- [x] Show subtle per-day prices, including crossed-out comparison prices for active limited-date offers.
- [x] Keep prices out of the Summary until valid dates are selected.
- [x] Treat reservation ranges as half-open: another stay may check out on an existing check-in date or check in on an existing checkout date.
- [x] Keep turnover dates selectable and avoid presenting them as fully occupied.
- [x] Let a visitor recover after selecting a check-in that cannot fit the minimum stay.
- [x] Allow adult/child number inputs to be temporarily blank while typing, then validate and normalise on change/submit.
- [x] Enforce child ages from 0 through 12.
- [x] Require a valid telephone number with every website reservation request.
- [x] Keep the one-adult booking price equal to the two-adult minimum charge without displaying a redundant minimum-charge note.
- [x] Keep the Summary in the sticky right sidebar on desktop.
- [x] Move the Summary immediately before Details only on mobile.
- [x] Hide the bicycle booking control when the service is disabled in admin.
- [x] Keep all booking validation and pricing copy in locale files.
- [ ] Add new mandatory fields sorted in their appropriate place: address with [street nr] [postal code] [city] [country (is a a drop-down menu from an imported from some ressource/public database/API possible here? with the possibility of searching by typing in the field?]. In this case the Nationality field in admin becomes useless, so remove it from owner and employee. Add the address fields to the owner reservation page

### 1.6 Contact, confirmation, thanks, and errors

- [x] Contact context and topic remain visually encouraged but are not submission blockers.
- [x] Contact attachments use a custom translated picker instead of browser-native English file text.
- [x] Feedback links preselect "Já tive reserva" and the past-stay feedback topic.
- [x] Reservation-sent summaries avoid duplicate list markers and duplicate bicycle detail.
- [x] Reservation-sent contact links use translated prefilled context.
- [x] Add complete translated `obrigado.html` and useful `404.html` pages.
- [>] Deliver contact attachments and messages through a real backend, private storage, and transactional email.
- [x] Route unknown preview URLs to `404.html` and declare the same production static-asset behaviour.
  - Note: The dependency-free `npm run dev` server returns the custom page with status 404; `wrangler.toml` declares Cloudflare `404-page` handling, which must still be verified after the first real deployment.

### 1.7 Guia Local

- [x] Keep desktop search, sorting, location, category filters, and view controls in two stable rows.
- [x] Preserve the compact horizontal category rail and progressive results on phones.
- [x] Place favourites at the top-right of cards.
- [x] Keep partner previews in an aligned side-by-side grid and animate one selection into a full-width, image-led feature with translated highlights and visit actions.
- [x] Open and scroll to a partner from homepage and Guest Stay deep links.
- [x] Preserve list/map views, search, category filtering, favourites, directions, geolocation, expiry dates, and map fallback links.
- [x] Replace the single-place Google iframe with a free multi-marker Leaflet map using saved coordinates and category-coded OpenStreetMap markers.
  - Note: Pins react immediately to search, category, and favourite filters. Categories now use distinct colours and silhouettes, with a complete wrapping legend beside the directions action below the map instead of a clipped map overlay. Marker popups and cards retain Google Maps direction links; no live geocoding or paid Google API key is required.
- [!] Replace demonstration partner descriptions, menus, websites, images, commercial terms, coordinates, and expiry dates with owner-approved content.
- [>] Make guide listings editable through the production admin API instead of bundled JavaScript data.

### 1.8 Guest Stay (`qr.html`)

- [x] Remove the demonstration label and generic filler paragraphs.
- [x] Make top stay facts and bicycle facts scroll to their related sections.
- [x] Translate emergency contacts and all other guest-facing UI.
- [x] Place the hospital before firefighters and consolidate pharmacies/medical options beneath Emergencies.
- [x] Remove the separate Health section.
- [x] Open Food first in "Perto de mim", use optional real images, and remove laundromat recommendations.
- [x] Deep-link partner entries to Guia Local.
- [x] Add exact checkout guidance for keys, the mapped green waste container, and washed/stored dishes or dishwasher loading.
- [x] Reuse the complete translated booking rules and provide an expand-all route.
- [x] Prefill WhatsApp with the current guest name when reservation context is available.
- [x] Respect admin bicycle-service visibility and price in the guest projection.
- [!] Replace host, phone, WhatsApp, and Wi-Fi placeholders with approved operational values.
- [>] Issue unguessable, expiring, revocable stay tokens and return only a minimal guest-facing server projection.

### 1.9 Admin application

- [x] Add a dedicated Services tab and move bicycle enablement/price out of Pricing.
- [~] Keep the service model extensible for future breakfast or other services.
  - Note: Owners can add generic service records now. Each future service still needs a decision about how its booking controls, quantities, dates, and guest-page presentation behave.
- [x] Keep the security deposit with base property pricing rather than seasonal service pricing.
- [~] Add call, WhatsApp, and email quick actions to the current-guest dashboard card.
  - Note: Email works with seeded data; phone actions become live once final numbers exist.
- [x] Make Dashboard "Iniciar trabalho" open a compact task/type chooser before starting the timer.
- [x] Open Reservations with a pending-payment filter when its dashboard alert is selected.
- [x] Separate reservation lifecycle status, overall reservation payment, and security-deposit receipt throughout Reservations.
  - Note: The dashboard alert and payment filter now use `unpaid`/`awaiting transfer`, while the caução is an independent yes/no detail editable by owners and employees. Existing prototype records using the old ambiguous deposit payment state migrate automatically.
- [x] Add optional NIF and CC/BI/Passaporte number to guest details and both owner and employee reservation editors.
- [x] Group reservation fields by guest identity, stay, commercial state/payment, services/discounts, and notes.
- [x] Route newly created reservations by source and state.
  - Note: Booking.com, Abritel.fr, and owner reservations finish in Reservations. Website and private-contact reservations open payment instructions while payment is pending, or the reservation confirmation when already paid/confirmed. Editing an existing reservation never opens Messages automatically.
- [x] Standardise automatic admin navigation on desktop and mobile.
  - Note: Tab changes return to the view heading, forms open at their own heading below the fixed mobile header, message actions start at the top of Messages, and collapsed records return to their summary instead of the middle of the page.
- [~] Expire unpaid reservation requests after 48 hours, mark the payment failure reason, release dates, and mention the deadline in payment messages.
  - Note: The prototype performs expiry when admin state loads. Reliable production expiry needs a scheduled server task.
- [x] Gray past calendar days while keeping them selectable.
- [x] Include guest names on checkout days and distinguish check-in/check-out calendar markers.
- [x] Warn on impossible website requests and manual reservation conflicts while allowing authorised overrides.
- [x] Add a bottom close action to expanded admin disclosures and past-reservation cards, then scroll back to the collapsed record.
- [x] Reset filters and expanded rows when the already-active admin tab is selected again.
- [~] Add a private-looking Marketing area in Messages with consent contacts grouped by language, BCC copy, offer/news templates, and one-click email launch.
  - Note: It reflects local prototype reservations/requests only; full production ingestion is listed separately.
- [x] Add an explicit chevron to treated website-request history.
- [x] Align boxed Pricing and Expense list columns.
- [x] Resolve overlapping current pricing rules into exactly one `Ativa hoje` rule, with lower-priority current rules labelled `Sobreposta hoje` and all others `Inativa`.
- [x] Keep Pricing/Discount disclosure titles, values or statuses, and expand controls aligned in a stable mobile grid.
- [x] Keep disclosure actions padded inside Pricing cards, including the automatically added bottom close action.
- [x] Extend discount codes with configurable gifts as well as percentage and fixed-value reductions.
  - Note: A code can offer any number of nights for any number of people, independently of adult/child status, any number of bicycles for any number of days, or both benefits together. Gifts are capped by the actual request, use the least expensive eligible nights when nightly prices vary, preserve the one-adult minimum-charge rule, and are recorded on website requests with their calculated euro value.
- [x] Organise dense admin editors into named groups matching the reservation editor.
  - Note: Discount codes now separate identity, benefit, and validity; seasonal prices separate calendar, values, and notes; services separate identity, price, and availability; and expenses separate the core record from additional notes. Small forms remain compact.
- [x] Show all Expenses and combine month/year periods in one filter.
- [x] Regenerate message drafts immediately when reservation, template, or no-reservation language changes.
- [x] Put report exports in their relevant Statistics sections and apply current filters.
- [x] Keep audit entries concise: entity identity plus only fields that actually changed.
- [x] Remove the duplicate desktop account/logout block and give the public-site action a stable sidebar row.
- [x] Keep the desktop sidebar navigation and public-site footer in separate rows at short window heights and browser zoom levels.
- [x] Keep the mobile admin drawer brand, scrollable navigation, account controls, and public-site action in separate non-overlapping rows at iPhone SE heights.
- [x] Make the phone calendar Create Reservation action a full, readable row.
- [x] Make the admin installable as a PWA for owners and employees.
  - Note: Added a standalone admin manifest, 180/192/512 px house-mark icons, maskable icon support, a deliberately admin-only static cache strategy, offline shell fallback, safe-area layout, install/update controls, and automated integrity checks. Installation requires HTTPS in production; iPhone/iPad installation continues through Safari's Add to Home Screen action because iOS does not expose the custom browser install prompt.

## 2. Implemented prototype inventory

### 2.1 Public website

- [x] Static pages: Homepage, Alojamento, Galeria, Reservas, Reserva Enviada, Contacto, Obrigado, Guia Local, Guest Stay, and 404.
- [x] Shared responsive header, navigation, language menu, footer, WhatsApp, promotional booking action, scroll reveals, and carousel controls.
- [x] Four-language public i18n using `pt.json`, `en.json`, `fr.json`, and `es.json`.
- [x] Data-driven gallery manifest and accessible zoom/lightbox controls.
- [x] Booking calendar, availability, turnover rules, minimum stay, guest/child validation, seasonal/daily pricing, discounts, deposit, bicycles, bed setup, marketing consent, and local request handoff to admin.
- [x] Contact contexts/topics, reply-method rules, Portuguese phone handling, attachments UI, marketing consent, social links, and success routing.
- [x] Local guide list/map views, filters, location, favourites, partner content, seasonal expiry, and deep links.
- [x] Mobile-first Guest Stay hub with emergencies, hosts, Wi-Fi, nearby places, partners, rules, checkout, services, and personalised stay projection.

### 2.2 Admin operations

- [x] Named demo accounts for Jorge, Paula, Bárbara, Marlene, André, Dulce, and Fábio with owner/employee/dev permissions.
- [x] Remember the last selected admin login account locally.
- [x] Owner and employee dashboards with role-appropriate information and work timer access.
- [x] Limited employee reservation operations include check-in/check-out times, preferred language, NIF, identification document, overall payment, and caução receipt.
- [x] Calendar with today, turnover markers, guest names, selected-day operations, messaging, and reservation management links.
- [x] Reservation creation/editing, grouped contact/language/identity/caução/payment data, source including Abritel, conflicts, extra guests, cancellation/restoration, and past reservations.
- [x] Require a structured guest postal address in public booking requests and owner reservation creation/editing, with a locally searchable ISO country list; show the address in request/reservation details and replace nationality reporting with country of residence.
- [x] Website request inbox/history, request-to-reservation conversion, deposit choice, conflicts, and local booking-form ingestion.
- [x] Base, seasonal, date-specific, group, percentage, fixed-value, and configurable gift-code management with `dd/mm/yyyy` entry and native date-picker buttons.
- [x] Services catalogue with enablement and pricing.
- [x] Expenses with notes, filters, add/edit/remove, and complete visible history.
- [x] Employee profiles, normal compensation mode, job rates/costs, work history, voluntary work, active timer task editing, and manual time.
- [x] Localised message templates driven by `public/locales/messages.json`, editable drafts, email/WhatsApp/copy shortcuts, source-aware wording, payment breakdowns, and Google review links.
- [x] Statistics for reservations, guests, revenue, expenses, labour, profit, periods, comparisons, and scoped CSV exports.
- [x] Lightweight audit, unsaved-change warning, stable IDs, demo export/restore, and broad validation.
- [x] Comprehensive demonstration seed covering current, future, past, cancelled, no-show, source, language, payment, request, discount, service, expense, and work scenarios.
- [x] Installable `O Refúgio Gestão` PWA with platform icons, standalone safe areas, explicit updates, and offline access to the static admin shell.

## 3. Responsive verification

- [x] Verify public and admin layouts with a repeatable Edge/CDP capture script at `scripts/capture-page.mjs`.
- [x] Verify 390px pages have `scrollWidth === clientWidth` for Homepage, Reservas, Alojamento, Guia Local, QR, and Admin views.
- [x] Verify 1440px Homepage, Reservas, Guia Local, Dashboard, Pricing, Services, and Messages compositions.
- [x] Preserve phone-only calendar swipes, lightbox swipes, admin bottom navigation, and touch-sized actions.
- [x] Keep fixed-format calendar cells, controls, cards, and labels from resizing or colliding at narrow widths.

## 4. Production migration

- [x] Write a very detailed step-by-step deployment tutorial for a first-time owner starting without a domain, accounts, or local tooling.
  - Note: Added [`deployment-beginner-guide.md`](./deployment-beginner-guide.md), separating a private static review deployment from the production migration and covering account security, domain purchase/DNS, local setup, GitHub, Workers, D1, R2, Access, email, Turnstile, staging, launch, backups, PWA installation, and routine operation.

The architecture and production boundary live in [`deployment.md`](./deployment.md); the beginner click-by-click route lives in [`deployment-beginner-guide.md`](./deployment-beginner-guide.md).

- [>] Replace demo authentication with Cloudflare Access plus server-validated individual accounts and role mapping.
- [>] Replace `localStorage` business state with D1 and protected `/api/admin/*` repositories.
- [>] Move reservation availability and pricing reads to public server endpoints with no private data exposure.
- [>] Send booking/contact transactional email through Resend or an approved equivalent.
- [>] Store contact attachments and private documents in private R2 buckets with authorised access only.
- [>] Add Turnstile, request throttling, idempotency, and delivery/error monitoring to public forms.
- [>] Run 48-hour payment expiry and reminders with scheduled Workers.
- [>] Store marketing consent evidence, language, source, unsubscribe status, suppression status, and timestamps in D1.
- [>] Provide a private admin marketing audience grouped by language and compliant one-click unsubscribe.
- [>] Add secure guest-stay tokens, revocation, expiry, and minimal response projections.
- [>] Write audit events server-side and make them append-only to normal admin roles.
- [>] Add database migrations, encrypted backups/exports, restore drills, retention rules, and portability documentation.
- [>] Add privacy, cookies, terms, cancellation, complaints-book, accessibility, and marketing-compliance content approved for the real business.
- [>] Test production mail DNS, domain routing, 404s, backups, alerting, role boundaries, and mobile workflows before launch.

## 5. Decisions and owner content

- [!] Final public domain and production Cloudflare account/project ownership.
- [!] Final reservations email, public telephone, and WhatsApp number.
- [!] Final Facebook and Instagram URLs.
- [!] Final host names, responsibilities, languages, call numbers, and WhatsApp numbers for Guest Stay.
- [!] Final Wi-Fi network/password and whether the password may appear behind a guest token.
- [!] Owner-approved partner list, descriptions, menus, websites, images, offers, sponsorship labels, and expiry dates.
- [!] Owner-approved nearby medical, pharmacy, food, transport, fuel, and emergency details.
- [!] Bank-transfer instructions, payment reference format, cancellation wording, and reminder cadence.
- [!] Privacy retention periods for enquiries, reservations, guest data, work records, expenses, attachments, and audit logs.
- [!] Whether future services are per stay, per person, per unit, per day, or selectable by date.
- [!] Whether contact attachments are retained in admin, forwarded by email, or both.
- [!] Final creator-credit URL.

## 6. Current batch reversion map

- Shared configuration and shell: `public/js/config/site-config.js`, `public/js/ui/site-shell.js`, `public/js/main.js`, `public/css/{base,layout,components,variables}.css`.
- Homepage: `public/index.html`, `public/css/pages/home.css`, and the `home` locale blocks.
- Alojamento/Galeria/Contacto: their matching HTML, page JS, and page CSS files.
- Reservas: `public/reservas.html`, `public/js/pages/booking.js`, `public/css/pages/reservas.css`, pricing services, and booking locale blocks.
- Guia Local: `public/guia-local.html`, `public/js/pages/guide.js`, `public/css/pages/guia-local.css`, and `guidePage` locale blocks.
- Guest Stay: `public/qr.html`, `public/js/pages/qr.js`, `public/js/services/guest-stay-provider.js`, `public/css/pages/qr.css`, and `guestStay` locale blocks.
- Admin: `public/js/admin/{main,admin-store,admin-seed,admin-logic}.js` and `public/css/pages/admin.css`.
- Message catalogue: `public/locales/messages.json`.
- Locale governance: `public/locales/{pt,en,fr,es}.json`, `scripts/sync-locales.mjs`, and `scripts/check-project.mjs`.
- QA and docs: `scripts/capture-page.mjs`, `docs/*.md`, `README.md`, and `wrangler.toml`.
