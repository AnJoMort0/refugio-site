# Production Migration and Deployment

Last reviewed: 2026-08-30

## Purpose

The current project is an **owner-approved browser-only prototype already published in static GitHub Pages form**. It demonstrates the intended public, guest, owner, and employee workflows, but its `localStorage` data, demo login, and client-side permissions are not a security boundary.

The design/workflow review stage is therefore complete. This document starts from that approved prototype and describes the lowest-cost practical route to a real production system while preserving the existing UI and replacing infrastructure in controlled stages. A separate private prototype-review deployment is not required.

## Recommended low-cost stack

| Need | Recommended service | Why |
| --- | --- | --- |
| Static pages and API | Cloudflare Workers with Static Assets | One deployment for `public/` plus API routes; edge caching; custom 404 support |
| Relational business data | Cloudflare D1 | Reservations, guests, prices, services, consent, staff, expenses, work, and audit need relational constraints plus atomic writes |
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
- [D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/) and [Workers Binding API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/), [data location](https://developers.cloudflare.com/r2/reference/data-location/), and [presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/)
- [Cloudflare Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/choose-application-type/), [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), and [independent MFA](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/independent-mfa/)
- [Resend pricing](https://resend.com/pricing) and [domain verification](https://resend.com/docs/dashboard/domains/introduction)
- [Leaflet quick start](https://leafletjs.com/examples/quick-start/)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)

The prototype may use the public OpenStreetMap raster tile endpoint for ordinary, human-driven interactive viewing. If it does, use the current HTTPS endpoint (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`), keep visible OpenStreetMap attribution, allow the browser to send a normal `Referer`, respect HTTP cache headers, and do not implement bulk prefetching or offline tile downloads. The service is best-effort with no SLA and can block non-compliant use. Keep the tile URL configurable and switch `SITE_CONFIG.map.tileUrl` to a production OSM-compatible tile provider if traffic, reliability, offline use, or support requirements exceed the public service policy.

At the prototype's expected traffic, the free tiers may cover normal operation. As of 2026-08-30, Workers Free allows 100,000 Worker requests per day; D1 Free includes 5 million rows read and 100,000 rows written per day, with a 500 MB maximum per database; R2 Standard includes 10 GB-month of storage plus monthly operation allowances; Cloudflare Zero Trust Free is intended for teams under 50 users; and Resend Free includes 3,000 emails per month with a 100-per-day limit. Workers Paid currently starts at a $5 USD monthly minimum. Verify provider pricing and limits again immediately before launch, and do not design the system so exceeding a free limit silently loses bookings.

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

This allows the already-approved interface to remain recognisable while persistence and security move server-side. The existing GitHub Pages build may remain available as a demo/reference during implementation, but it must stay disconnected from production secrets, databases, and real personal/business data.

## Recommended D1 model

Use migrations and foreign keys. Keep the stable IDs already used by the prototype.

### Core tables

- `users`: external identity, display name, role, active state, timestamps.
- `guests`: contact details, preferred language, structured postal address (street/number, postal code, city, ISO country code), optional NIF and identification-document type/number, normalised lookup fields, retention state.
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

On every booking/contact submission, update these records atomically using a single SQL statement where practical or a D1 `batch()` when multiple independent statements must succeed or fail together. D1 runs in auto-commit mode; do not design this as an application-controlled `BEGIN`/`COMMIT` read-then-write transaction. Never infer consent from a reservation or pre-tick the option. Deduplicate by a normalised email while preserving the consent history. A withdrawal or provider suppression must override later list generation until fresh valid consent is recorded.

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
5. Require MFA for owner/dev accounts. Cloudflare Access can now enforce independent MFA (TOTP, WebAuthn security keys, or device biometrics) even when the primary login method is email OTP.
6. Record the verified actor on every business-changing audit event.
7. Support immediate account deactivation without a code deployment.

The seven prototype names may become initial records, but demo password hashes and browser sessions must not migrate.

## Availability and payment holds

Use half-open reservation ranges: `[check_in, check_out)`. This permits checkout and another check-in on the same date while rejecting overlapping occupied nights.

Create or confirm reservations with a database-enforced atomic write that rechecks conflicts at write time. Prefer one conditional `INSERT ... SELECT ... WHERE NOT EXISTS (...)`, an equivalent constraint-backed statement, or a carefully designed D1 `batch()`; do not perform a JavaScript `SELECT` followed later by an unconditional `INSERT`. Do not trust an availability result fetched earlier by the browser.

For website requests awaiting transfer:

1. Set `payment_deadline_at` to 48 hours after acceptance.
2. Keep the dates held while the request is valid.
3. A scheduled Worker identifies overdue candidates and performs a conditional write such as `UPDATE ... WHERE status = 'awaiting_payment' AND payment_deadline_at <= ? AND paid_at IS NULL`.
4. Treat the dates as released only when that conditional write actually changes the record. If availability is derived from active reservation status, no separate “release” row is needed.
5. Keep the cancellation and audit change atomic where possible (for example with a database trigger, or a `batch()` of statements designed to roll back together). Send cancellation email only after the database write succeeds.
6. A payment webhook or owner action must also use conditional/idempotent writes so it cannot race an expiry into an inconsistent state.

The current admin-load expiry is demonstration behaviour only.

## Email delivery

Configure a Resend sending subdomain. SPF and DKIM are required for domain verification; add DMARC as a separate deliverability/security policy, beginning cautiously (for example `p=none`) until all legitimate senders are confirmed. Store API keys as Worker secrets.

Transactional flow:

1. Validate and persist the request.
2. Queue or send the owner notification and guest acknowledgement.
3. Store provider message IDs and delivery status.
4. Retry temporary failures with a bounded queue or scheduled retry.
5. Show the guest a success reference once persistence succeeds; do not claim delivery if only client navigation occurred.

Keep operational templates in `messages.json` during migration, then decide whether owners need database-managed versions and version history.

Marketing messages need clear sender identity, consent basis, unsubscribe, suppression handling, and local legal review. Do not use transactional endpoints to bypass provider marketing rules.

## Attachments and private files

- Keep R2 buckets private; do not enable a public `r2.dev` URL for sensitive files.
- Upload contact attachments either through a size-limited Worker endpoint or with short-lived R2 S3 presigned `PUT` URLs generated server-side. Browser use of presigned URLs requires an R2 CORS policy limited to the expected origin and methods.
- Treat every presigned URL as a bearer token. Use short expiries and random object keys; presigned URLs use the R2 S3 API hostname and do not work on R2 custom domains.
- Store only object keys and necessary metadata in D1.
- Validate MIME type, magic bytes where practical, and size; never trust filename extensions. Add malware scanning if the risk and file types justify it.
- For downloads, authorise the admin first, then either stream the object through the Worker or issue a short-lived presigned `GET` URL.
- Apply documented retention/deletion periods.
- Do not place identity documents, receipts, or attachments under `public/`.

## Secure Guest Stay links

Generate at least 128 bits of random token entropy. Store only a hash in D1, with reservation link, expiry, and revocation timestamp.

The guest endpoint should return only what the page needs: first/display name, stay dates/times, party count, selected services, preferred language, approved hosts, approved property instructions, and Wi-Fi only if that policy is accepted. Never return owner notes, payment records, other guests, full admin entities, or raw IDs that reveal sequencing.

Keep a generic no-token QR page useful for non-personal property information.

## Static deployment configuration

The approved GitHub Pages deployment is only the static prototype/reference. The production target is Cloudflare Workers so the same static interface and the new API can share the required production boundary. There is no need to reproduce the current prototype on a separate private Worker first.

`wrangler.toml` uses the `public/` directory as Worker static assets and `not_found_handling = "404-page"`. Once API code exists, add a Worker entry point. For explicit API-first routing, give the assets a binding and set `run_worker_first = ["/api/*"]`; the Worker can then handle `/api/*` while other requests continue to use static assets. Do not advance `compatibility_date` merely because the calendar moved: update it deliberately and test the resulting runtime changes.

Before creating D1 or R2, make the data-residency decision. If the legal/privacy decision is to guarantee EU storage/processing for these resources, create them with `--jurisdiction eu`; jurisdiction cannot be added or changed later. A location such as `weur` is only a best-effort placement hint, not a residency guarantee. D1/R2 jurisdiction does not by itself make the entire application EU-only: separately review where Worker request processing, logs, Access identity data, email delivery, analytics, and any other providers process data.

Typical initial commands after the database/file code exists, **if the chosen policy is the Western Europe location hint**:

```powershell
npx wrangler login
npx wrangler --version
npx wrangler d1 create refugio-staging --location weur
npx wrangler d1 create refugio-production --location weur
npx wrangler r2 bucket create refugio-staging-private --location weur
npx wrangler r2 bucket create refugio-production-private --location weur
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
npx wrangler secret put TURNSTILE_SECRET_KEY --env production
```

If EU jurisdiction is required, replace the four resource-creation commands above with the corresponding `--jurisdiction eu` commands and include `jurisdiction = "eu"` on each R2 Worker binding.

Store binding IDs in environment-specific Wrangler configuration. D1/R2 bindings and `vars` are non-inheritable Wrangler environment keys, so declare them explicitly under every named environment. Use separate staging and production databases/buckets. Never commit `.dev.vars`, API keys, Access credentials, or production exports.

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

The manifest follows the current [W3C Web Application Manifest specification](https://www.w3.org/TR/appmanifest/) (a W3C Working Draft as of this review). Browser-specific installation behavior and icon handling should be rechecked against current platform documentation during production acceptance.

## Environments

- Approved GitHub Pages prototype/reference: static demo only; no production credentials, D1/R2 bindings, real guest data, or production admin authentication. This is not a production environment and does not need to be redeployed for owner review.
- Local development: demo seed or local D1, fake recipients, no real personal data.
- Staging: the new production-capable code with separate D1/R2, Access restricted to the project team, fake data, and a test-mail recipient allow-list. Its purpose is technical/operational validation, not re-approval of the already accepted prototype UI.
- Production: production domain, production D1/R2, final Access policy, real mail DNS, monitoring, backups, and real business data.

Never point the GitHub Pages prototype, local development, or staging at production data or production secrets.

## Backups, audit, and portability

- Use timestamped D1 migrations committed to the repository.
- Use D1 Time Travel for short-window recovery. As of this review the recovery window is 7 days on Workers Free and 30 days on Workers Paid; it is not a substitute for longer-retention exports.
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

### Starting point: approved static prototype — already complete

- Owners have approved the current UI and intended workflows through the GitHub Pages prototype.
- Keep that deployment as a demo/reference only while production work is underway.
- Do not spend time creating a second private prototype-review deployment.
- Prototype approval does **not** replace the later production-content, legal, security, data-migration, and staging checks.

### Stage 1: production foundations, public submissions, and mail

- Confirm final production contacts, prices, rules, placeholders, images, and legally reviewed public/privacy/marketing wording before launch.
- Add the Worker entry point and environment-specific bindings.
- Add D1 migrations and public read/form APIs.
- Add server validation, Turnstile, request limits, and idempotency.
- Send/store transactional mail status only after persistence succeeds.
- Populate website requests and marketing consent server-side.
- Deploy these changes to staging with fake data and test them there.

### Stage 2: secure admin persistence

- Add Cloudflare Access and D1 user/role mapping.
- Replace `admin-store.js` with authenticated API calls by module.
- Migrate reservations/pricing/services first, then expenses/staff/work/reports.
- Move audit generation server-side.
- Test owner/employee/dev role boundaries and account deactivation in staging.

### Stage 3: guest links and private files

- Add stay-token issuance/revocation.
- Replace the guest provider with the minimal API.
- Add private R2 uploads only if the business confirms the need.
- Test token isolation, expiry, file authorisation, retention, and failure paths in staging.

### Stage 4: automation, recovery, and hardening

- Add 48-hour expiry/reminder Cron.
- Add queues/retries where delivery risk justifies them.
- Complete backup/export and restore drills, retention jobs, monitoring, and incident notes.
- Run the full staging acceptance checklist with production-like configuration and fake data.

### Stage 5: controlled production cutover

- Prepare/import production data only after the staging checks pass.
- Deploy the production Worker and attach the final domain.
- Verify Access, forms, mail, availability, audit, guest links, backups, redirects, and the PWA using controlled launch tests.
- Retire or clearly label the old GitHub Pages prototype once the production site is confirmed stable so visitors cannot confuse the demo with the live system.

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
- [ ] D1/R2 location or jurisdiction was chosen deliberately before resource creation, and any EU-residency requirement is documented.
- [ ] Backups can be restored into a clean staging/restore-drill environment.
- [ ] Mobile and desktop workflows tested with production configuration.
- [ ] Real-data seed/export files and secrets are absent from the public bundle and Git history.
- [ ] The old GitHub Pages prototype is removed, redirected, access-limited, or clearly labelled so it cannot be mistaken for the live production system.
