# Production Migration and Deployment

Last reviewed: 2026-08-26

## Purpose

The current project is a browser-only prototype. It demonstrates the intended public, guest, owner, and employee workflows, but its `localStorage` data, demo login, and client-side permissions are not a security boundary.

This document describes the lowest-cost practical route to a real website while preserving the existing UI and replacing infrastructure in controlled stages.

## Recommended low-cost stack

| Need | Recommended service | Why |
| --- | --- | --- |
| Static pages and API | Cloudflare Workers with Static Assets | One deployment for `public/` plus API routes; edge caching; custom 404 support |
| Relational business data | Cloudflare D1 | Reservations, guests, prices, services, consent, staff, expenses, work, and audit need transactions and relationships |
| Admin perimeter | Cloudflare Access | Individual identities can protect `/admin.html` and `/api/admin/*` before application role checks |
| Public-form protection | Cloudflare Turnstile | Server-validated bot protection without a traditional CAPTCHA |
| Transactional email | Resend | Simple API for booking/contact confirmations and operational messages |
| Private files | Cloudflare R2 | Contact attachments, receipts, or identity files can remain outside public assets |
| Scheduled work | Workers Cron Triggers | Expire unpaid holds, send reminders, and run retention/maintenance jobs |
| Local Guide map | Leaflet plus an OSM-compatible tile provider | Saved coordinates support filtered multi-marker maps without live geocoding or a Google Maps API key |
| Source and CI | GitHub | Reviewable changes and automatic deployments |

Official references:

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [limits](https://developers.cloudflare.com/d1/platform/limits/)
- [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/choose-application-type/)
- [Resend pricing](https://resend.com/docs/knowledge-base/what-is-resend-pricing)
- [Leaflet quick start](https://leafletjs.com/examples/quick-start/)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)

The prototype uses the public OpenStreetMap raster tile endpoint for ordinary interactive viewing with visible attribution. It is a best-effort community service with no SLA. Before launch, keep the tile URL configurable and review traffic expectations; switch `SITE_CONFIG.map.tileUrl` to a production tile provider if usage or reliability requirements exceed the public service policy.

At the prototype's expected traffic, Cloudflare's free allowances and Resend's free transactional tier may cover normal operation. As of this review, Workers Free includes 100,000 requests per day, R2 includes a 10 GB-month Standard Storage allowance, and Resend Free includes 3,000 transactional emails per month with a 100-per-day limit. Verify current pricing before launch. The custom domain remains the main unavoidable recurring cost; Workers Paid currently starts at a $5 monthly minimum if the free tier is outgrown.

## Target architecture

```text
Public browser
  -> Worker Static Assets
  -> /api/public/availability, prices, services, guide
  -> /api/forms/booking and /api/forms/contact

Admin browser
  -> Cloudflare Access
  -> /admin.html
  -> /api/admin/*
  -> application role check (owner, employee, dev)

Guest stay link
  -> /qr.html?token=...
  -> /api/guest/stay/:token
  -> minimal guest projection only

Worker
  -> D1 for structured records
  -> R2 for private uploads
  -> Resend for email
  -> append-only audit events
  -> Cron for payment expiry/reminders
```

The public bundle must never include the admin seed, real guest directory, employee costs, private notes, payment details, Wi-Fi password, or reusable guest access tokens.

## Migration principle

Keep the existing page controllers and replace their storage boundaries:

- `public/js/admin/admin-store.js` becomes an HTTP repository using `/api/admin/*`.
- `public/js/services/guest-stay-provider.js` reads a minimal authenticated guest endpoint.
- Public pricing/availability reads come from `/api/public/*`.
- Booking and contact forms POST JSON or `multipart/form-data` to `/api/forms/*`.
- Seed data remains available only in local/demo mode and is never deployed as live business state.

This allows the interface to remain recognisable while persistence and security move server-side.

## Recommended D1 model

Use migrations and foreign keys. Keep the stable IDs already used by the prototype.

### Core tables

- `users`: external identity, display name, role, active state, timestamps.
- `guests`: contact details, preferred language, nationality, optional NIF and identification-document type/number, normalised lookup fields, retention state.
- `reservations`: source, lifecycle status, overall payment status/deadline, security-deposit receipt, dates/times, guest counts, totals, currency, notes, timestamps.
- `reservation_guests`: reservation-to-guest relationship and party role.
- `reservation_children`: child age at booking without unnecessary identity data.
- `reservation_adjustments`: later-arriving guests, dates, counts, discounts, amount, payment status.
- `website_requests`: original request payload, review state, conflict state, conversion link, timestamps.
- `pricing_base`, `pricing_seasons`, `pricing_overrides`, `group_discounts`, `discount_codes`.
- `services` and `reservation_services`: enabled state, pricing unit, quantity/date rules, reservation selections.
- `expenses` and `expense_categories`.
- `employees`, `employee_rates`, `work_sessions`, and `work_session_tasks`.
- `message_deliveries`: template, language, recipient, provider ID, result, timestamps; avoid storing unnecessary full message bodies forever.
- `audit_events`: actor, action, entity, concise JSON changes, request ID, timestamp.

### Marketing consent tables

The production admin needs a private Marketing area populated automatically from every valid opt-in.

- `marketing_contacts`: normalised email, display name, current language, active/subscribed/suppressed state, first/last consent timestamps.
- `marketing_consent_events`: contact ID, granted or withdrawn, exact consent text/version, source form, source record ID, IP/user-agent only if legally justified, timestamp.
- `marketing_unsubscribe_tokens`: hashed single-purpose token, expiry/use timestamp.
- `marketing_deliveries`: campaign, recipient, provider result, unsubscribe event, bounce/complaint state.

On every booking/contact submission, update these tables transactionally. Never infer consent from a reservation or pre-tick the option. Deduplicate by a normalised email while preserving the consent history. A withdrawal or provider suppression must override later list generation until fresh valid consent is recorded.

The admin should provide language filters, counts, CSV export where appropriate, and a server-side send action. A BCC copy button may remain as a manual fallback, but production campaigns should normally send individual messages or use a provider marketing feature so each recipient receives an unsubscribe link and no addresses leak.

## API surface

Start small and version the response contracts.

### Public read APIs

- `GET /api/public/availability?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/public/pricing?from=...&to=...&adults=...&children=...`
- `GET /api/public/services`
- `GET /api/public/guide?lang=pt`

Return availability and calculated totals, never reservation identities.

### Public form APIs

- `POST /api/forms/booking`
- `POST /api/forms/contact`
- `POST /api/marketing/unsubscribe`

Validate everything server-side even when the browser already validates it. Use Turnstile, request-size limits, idempotency keys, and clear translated error codes. Store the request before sending email so a temporary mail failure cannot silently lose it.

### Admin APIs

- `/api/admin/reservations/*`
- `/api/admin/requests/*`
- `/api/admin/pricing/*`
- `/api/admin/services/*`
- `/api/admin/expenses/*`
- `/api/admin/employees/*`
- `/api/admin/work-sessions/*`
- `/api/admin/messages/*`
- `/api/admin/marketing/*`
- `/api/admin/reports/*`
- `/api/admin/audit/*`

Every write checks the authenticated identity and application permission server-side. Client-side hidden buttons are usability only.

## Authentication and roles

1. Put `/admin.html` and `/api/admin/*` behind Cloudflare Access.
2. Validate the Access JWT in the Worker, not only at the page boundary.
3. Match the verified email/subject to an active D1 `users` record.
4. Apply owner, employee, and dev permissions in every endpoint.
5. Require stronger authentication for owner/dev accounts if the chosen identity provider supports it.
6. Record the verified actor on every business-changing audit event.
7. Support immediate account deactivation without a code deployment.

The seven prototype names may become initial records, but demo password hashes and browser sessions must not migrate.

## Availability and payment holds

Use half-open reservation ranges: `[check_in, check_out)`. This permits checkout and another check-in on the same date while rejecting overlapping occupied nights.

Create or confirm reservations in a D1 transaction that rechecks conflicts. Do not trust an availability result fetched earlier by the browser.

For website requests awaiting transfer:

1. Set `payment_deadline_at` to 48 hours after acceptance.
2. Keep the dates held while the request is valid.
3. A scheduled Worker marks overdue unpaid records cancelled with reason `payment_deadline_expired`.
4. Release the dates in the same transaction.
5. Record an audit event and optionally send a cancellation notice.
6. A payment webhook or owner action clears the deadline and confirms payment.

The current admin-load expiry is demonstration behaviour only.

## Email delivery

Configure a sending subdomain and complete SPF, DKIM, and DMARC before using real guests. Store API keys as Worker secrets.

Transactional flow:

1. Validate and persist the request.
2. Queue or send the owner notification and guest acknowledgement.
3. Store provider message IDs and delivery status.
4. Retry temporary failures with a bounded queue or scheduled retry.
5. Show the guest a success reference once persistence succeeds; do not claim delivery if only client navigation occurred.

Keep operational templates in `messages.json` during migration, then decide whether owners need database-managed versions and version history.

Marketing messages need clear sender identity, consent basis, unsubscribe, suppression handling, and local legal review. Do not use transactional endpoints to bypass provider marketing rules.

## Attachments and private files

- Upload contact attachments directly to a private R2 bucket using short-lived authorised upload URLs or through a size-limited Worker endpoint.
- Store only object keys and metadata in D1.
- Scan or restrict file types and sizes; never trust extensions.
- Serve files only after admin authorisation through short-lived signed responses.
- Apply documented retention/deletion periods.
- Do not place identity documents, receipts, or attachments under `public/`.

## Secure Guest Stay links

Generate at least 128 bits of random token entropy. Store only a hash in D1, with reservation link, expiry, and revocation timestamp.

The guest endpoint should return only what the page needs: first/display name, stay dates/times, party count, selected services, preferred language, approved hosts, approved property instructions, and Wi-Fi only if that policy is accepted. Never return owner notes, payment records, other guests, full admin entities, or raw IDs that reveal sequencing.

Keep a generic no-token QR page useful for non-personal property information.

## Static deployment configuration

`wrangler.toml` uses the `public/` directory as Worker static assets and `not_found_handling = "404-page"`. Once API code exists, add a Worker entry point and route `/api/*` through it while static files continue to be served as assets.

Typical initial commands:

```powershell
npx wrangler login
npx wrangler d1 create refugio-production
npx wrangler r2 bucket create refugio-private-files
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler deploy
```

Store binding IDs in environment-specific Wrangler configuration. Use separate preview and production databases/buckets. Never commit `.dev.vars`, API keys, Access secrets, or production exports.

## Admin PWA

The prototype admin is installable as `O Refúgio Gestão` through `admin.webmanifest`. Its service worker is intentionally conservative:

- it precaches only the admin HTML shell, its CSS/JavaScript modules, message catalogue, manifest, and icons;
- it uses the network first for the admin document and static assets, falling back to the cache when offline;
- it does not intercept `/api/`, non-GET requests, cross-origin requests, public-page navigation, attachments, or future server data;
- updates wait for the owner/employee to choose `Atualizar aplicação`, so an active form is not silently replaced;
- installed layouts account for top and bottom device safe areas.

Production requirements:

1. Serve the app over HTTPS; localhost is only the development exception.
2. Serve `admin.webmanifest` as `application/manifest+json` and `admin-sw.js` as JavaScript without a long immutable cache lifetime.
3. Keep the manifest, service worker, icons, admin shell, and authenticated admin APIs on the same final origin.
4. Protect `admin.html` and `/api/admin/*` with Cloudflare Access and server-side role checks. The service worker is an availability layer, never an authentication boundary.
5. Keep API responses, guest records, identity data, uploads, and secrets out of Cache Storage. The existing worker explicitly passes `/api/` through to the network.
6. Test install, launch, update, offline shell, logout/session expiry, and uninstall on at least one Android/Chromium device and one current iPhone/iPad before launch.
7. If the admin later moves to `/admin/` or a dedicated admin subdomain, move the manifest and service worker with it and reduce their scope accordingly.

The manifest follows the current [W3C Web Application Manifest specification](https://www.w3.org/TR/appmanifest/). Browser-specific installation behavior and icon handling should be rechecked against current platform documentation during production acceptance.

## Environments

- Local: demo seed or local D1, fake recipients, no real personal data.
- Preview: separate D1/R2, Access restricted to the project team, test mail domain/recipient allow-list.
- Production: production domain, production D1/R2, final Access policy, real mail DNS, monitoring, and backups.

Do not point preview deployments at production data.

## Backups, audit, and portability

- Use timestamped D1 migrations committed to the repository.
- Use D1 Time Travel for short-window recovery, while recognising that it is not the only backup strategy.
- Export encrypted periodic snapshots to a separate controlled location and test restoration.
- Export stable IDs, relationships, timestamps, and historical records in documented formats.
- Keep audit writes server-side and concise; normal users should not edit/delete audit events.
- Record backup, restore, and migration operations themselves.
- Define retention and deletion rules before collecting real data.

## Monitoring

At minimum monitor:

- failed booking/contact submissions;
- email send/retry failures;
- Cron expiry failures;
- API exceptions and elevated 4xx/5xx rates;
- D1 migration status;
- R2 upload rejection/failure;
- Access/authentication failures where useful;
- upcoming service limits or billing changes.

Use request/correlation IDs from form submission through email and audit records without exposing sensitive values in logs.

## Migration order

### Stage 1: owner-approved static site

- Replace contact/social/host/Wi-Fi and partner placeholders.
- Complete content/legal review and final images.
- Deploy static assets behind the final domain.
- Verify production 404, redirects, accessibility, and performance.

### Stage 2: public submissions and mail

- Add D1 migrations and public form APIs.
- Add Turnstile and idempotency.
- Send/store transactional mail status.
- Populate website requests and marketing consent server-side.

### Stage 3: secure admin persistence

- Add Access and D1 user/role mapping.
- Replace `admin-store.js` with API calls by module.
- Migrate reservations/pricing/services first, then expenses/staff/work/reports.
- Move audit generation server-side.

### Stage 4: guest links and private files

- Add stay-token issuance/revocation.
- Replace guest provider with the minimal API.
- Add private R2 uploads only if the business confirms the need.

### Stage 5: automation and hardening

- Add 48-hour expiry/reminder Cron.
- Add queues/retries where delivery risk justifies them.
- Complete backup/restore tests, retention jobs, monitoring, and incident notes.

## Launch checklist

- [ ] Owner-approved copy, prices, rules, contacts, partners, and images.
- [ ] Domain, DNS, TLS, canonical URLs, sitemap, robots, and production 404 verified.
- [ ] Privacy, terms, cancellation, complaint, accessibility, and marketing wording approved.
- [ ] Access identity and role tests for every owner/employee/dev account.
- [ ] Public APIs reject invalid dates, overlaps, invalid totals, oversized files, bots, and duplicate submissions.
- [ ] Booking availability and admin conflict rules match on turnover dates.
- [ ] Transactional and marketing email authentication/delivery/unsubscribe tested.
- [ ] Marketing consent appears privately and withdrawal suppresses future sends.
- [ ] Guest tokens are unguessable, minimal, expiring, and revocable.
- [ ] Backups can be restored into a clean preview environment.
- [ ] Mobile and desktop workflows tested with production configuration.
- [ ] Real-data seed/export files and secrets are absent from the public bundle and Git history.
