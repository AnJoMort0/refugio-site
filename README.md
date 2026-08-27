# O Refúgio Website and Admin Prototype

Responsive, multilingual public website and browser-based administration prototype for the O Refúgio holiday home in Pedorido, Portugal.

## Current state

This repository contains a feature-rich static prototype rather than an empty scaffold:

- Public pages for the property, gallery, booking requests, contact, local guide, guest stay, confirmations, and errors.
- Portuguese, English, French, and Spanish public content.
- Availability, seasonal/date pricing, discounts, guest pricing, services, and booking-request simulation.
- A Portuguese admin application for reservations, requests, calendar, prices, services, expenses, staff, work time, messages, marketing consent, statistics, exports, and audit history.
- Responsive desktop and phone layouts, including touch calendars and compact admin navigation.

The admin data and login are demonstrations stored in the current browser's `localStorage`. Do not use the prototype for real guest, identity, employment, payment, or financial data.

## Run locally

Install Node.js, then run:

```powershell
npm install
npm run dev
```

The project is static, so any local HTTP server rooted at `public/` also works:

```powershell
python -m http.server 3000 --directory public
```

Open `http://127.0.0.1:3000/`. The administration prototype is at `/admin.html`.

## Quality commands

```powershell
npm run check
npm run locales:sync
npm run gallery:manifest
npm run qa:capture -- --url=http://127.0.0.1:3000/index.html --output=temp/home.png --width=390 --height=844 --locale=pt
```

- `check` validates JavaScript, JSON, page assets, locale parity, supported languages, translation references, message templates, and gallery data.
- `locales:sync` makes EN/FR/ES follow the structure and ordering of PT. It removes translations whose Portuguese key was deleted and stops if a new key still needs translation.
- `gallery:manifest` rebuilds the image manifest.
- `qa:capture` creates a repeatable Edge/CDP screenshot and reports viewport overflow metrics. Add `--admin --view=calendar` for an authenticated admin view.

## Content sources

- `public/locales/pt.json` is the structural source of truth for public UI copy.
- `public/locales/en.json`, `fr.json`, and `es.json` must have exactly the same schema.
- `public/locales/messages.json` is the single multilingual catalogue for admin guest-message and marketing templates.
- `public/js/config/site-config.js` centralises address, maps, public contact details, social links, creator credit, hosts, Wi-Fi, and guest-stay map links.
- `public/assets/images/manifest.json` drives the gallery.

Deleting a key from `pt.json` means deleting that content from the public product. Page HTML and public scripts must not contain Portuguese fallback copy that could bring it back.

## Repository map

```text
public/
  *.html                  Public and admin entry pages
  assets/images/          Property, guide, and partner media
  css/                    Shared foundations and page-specific styles
  js/admin/               Admin auth, permissions, state, logic, and UI
  js/config/              Replaceable site-wide values
  js/pages/               Page controllers
  js/services/            i18n, pricing, and guest-stay data boundaries
  js/ui/                  Shared shell and interaction components
  js/utils/               Small domain-independent helpers
  locales/                Public UI and message catalogues
scripts/                  Validation, locale sync, manifests, and visual QA
docs/                     Roadmap, architecture, workflow, design, deployment
```

Tracked design experiments live under `docs/design-explorations/`; `temp/` is reserved for disposable local QA output.

## Documentation

- [Living roadmap](docs/roadmap.md)
- [Archived long-form roadmap](docs/roadmap-archive.md)
- [Production migration and deployment](docs/deployment.md)
- [Owner and employee workflows](docs/owner-workflow.md)
- [Admin architecture](docs/admin-architecture.md)
- [Design system](docs/design-system.md)

## Production boundary

The static UI can be deployed for review, but real operation requires server-side authentication, D1 persistence, protected APIs, transactional email, private file storage, scheduled payment expiry, secure guest links, and compliant consent/unsubscribe handling. The recommended low-cost migration sequence is documented in `docs/deployment.md`.
