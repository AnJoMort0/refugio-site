# Admin Prototype Architecture

## Scope

`public/admin.html` is a Portuguese-only single-page administration prototype. It is deliberately separate from the public shell and locale system.

The interface currently demonstrates owners' and employees' workflows using local browser persistence. Its permission checks improve prototype usability but do not protect real data.

## Modules

- `admin-auth.js`: named demo users, local session, login/logout, remembered identity.
- `admin-permissions.js`: role and permission catalogue for owner, employee, and dev.
- `admin-seed.js`: comprehensive deterministic demo business state.
- `admin-store.js`: state normalisation, migration, local persistence, export/import/reset boundary.
- `admin-logic.js`: dates, pricing, conflict, messaging, reporting, and shared domain calculations.
- `pwa.js`: install prompt state, update consent, online/offline status, and service-worker registration.
- `main.js`: view state, rendering, forms, interactions, responsive navigation, and audit calls.
- `admin.css`: desktop sidebar, compact mobile shell, forms, records, calendars, reports, disclosures, and dialogs.
- `admin.webmanifest` and `admin-sw.js`: standalone installation metadata and a static admin-shell cache that explicitly excludes future APIs.
- `locales/messages.json`: multilingual operational and marketing message catalogue.

## Data domains

The prototype uses stable IDs and timestamps for:

- property settings and services;
- reservations, extra-guest adjustments, guests, and website requests;
- base/season/override pricing, group reductions, and discount codes;
- expenses;
- employees, rate/cost history, work sessions, task selections, and voluntary work;
- audit events;
- marketing consent flags present in local reservation/request data.

## State flow

1. Authentication resolves a sanitised local demo user.
2. `admin-store.js` loads state, normalises older browser snapshots, and seeds absent domains.
3. `main.js` renders the active view from state plus transient `ui` state.
4. Form/action handlers validate, mutate state, add concise audit records, and persist through the store.
5. Renders are deterministic from current state; filters and expanded rows live only in UI state.

Submitting `reservas.html` on the same origin adds a demonstration website request through the shared browser store. This is testing convenience, not cross-device persistence.

## Prototype security boundary

Do not store real guest identity documents, payment details, employee salaries, private notes, attachments, or production credentials in this app.

- Demo password hashes and local sessions are visible to any visitor who downloads the static JavaScript.
- `localStorage` can be read or changed by the browser user.
- Client-side permissions can be bypassed.
- Client-generated audit events can be altered.
- Different devices do not share changes.

## PWA boundary

The service worker improves launch and static-shell availability only. It never acts as an authentication or data-persistence layer and deliberately ignores `/api/`, non-GET requests, public navigation, and cross-origin resources. The app waits for explicit update consent so a new worker cannot reload over unsaved admin forms.

## Production repository boundary

Preserve the concept of a store/repository while replacing implementation:

```text
Admin UI
  -> authenticated JSON API repository
  -> Cloudflare Worker permission/service layer
  -> D1 transactions and queries
  -> server-authored audit events
```

The browser should request only records its verified role may use. Writes must use optimistic/version checks where simultaneous edits matter, especially reservations, payment state, pricing, work sessions, and services.

## Production permissions

- Cloudflare Access authenticates the individual at the perimeter.
- The Worker verifies the Access token.
- A D1 user record supplies active state and role.
- Every endpoint checks a permission equivalent to the prototype catalogue.
- Owner/dev-only operations include conflict override, pricing, services, staff/rates, broad financial reports, exports, and account management.
- Employee access remains limited to operational reservation fields and allowed work records.

## Production consistency rules

- Reservation nights use `[check-in, checkout)` and conflict checks run inside the write transaction.
- Payment deadline expiry runs server-side on schedule.
- Prices and totals are recalculated server-side from versioned rules.
- Audit details contain only meaningful before/after fields plus actor/entity/time.
- Marketing consent changes append evidence and update the current audience state transactionally.
- Private files remain in R2 and are never exposed as public URLs.
- Stable IDs, relationships, historical records, and timestamps survive migration/export.

See [`deployment.md`](./deployment.md) for the target schema, APIs, authentication, marketing list, email, storage, backup, and migration sequence.
