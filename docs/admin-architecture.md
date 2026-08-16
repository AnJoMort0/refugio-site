# Admin Management Prototype

The admin area is a Portuguese-only owner/employee prototype, separate from the public website i18n files.

## Current Prototype

- `public/admin.html` is a standalone admin app and does not render the public site header, footer, language switcher, or sticky booking CTA.
- `public/js/admin/admin-auth.js` gates the UI with individual demo users and hashed demo passwords.
- The prototype account names reflect the intended real users, but the passwords are still demonstration credentials and must be replaced by a real onboarding/reset flow.
- `public/js/admin/admin-permissions.js` centralizes role permissions for owners and employees.
- `public/js/admin/admin-store.js` is the persistence boundary used by the UI.
- The current repository implementation stores demonstration data in `localStorage`.
- The data model uses stable IDs for reservations, guests, requests, employees, work sessions, expenses, discounts, and audit entries.

This is enough for an owner demonstration, but it is not a production security model. Do not place real guest documents, ID photographs, financial records, salaries, or private messages in the static/local demo store.

## Future Cloudflare Direction

The UI should keep using a replaceable repository/service layer. A production Cloudflare version can replace the local repository with authenticated calls to `/api/admin/*`.

Recommended split:

- Cloudflare Pages Functions for protected admin API routes.
- HTTP-only signed sessions or an external login/access product for authentication.
- D1 for reservations, guests, pricing, discounts, expenses, employees, work records, audit records, and reporting queries.
- R2 for private documents such as guest IDs and receipts, served only through authenticated authorization checks.
- KV only for lightweight configuration, short-lived sessions, or cache-like data where eventual consistency is acceptable.

Authentication options still need a final decision. Evaluate the simplest low-cost option that supports individual owner and employee identities, easy account removal, and stronger protection for owners. Avoid SMS-only 2FA unless cost, deliverability, and maintenance are acceptable.

## Prototype Limitations To Remove Before Production

- Demo credentials exist only to try the interface.
- Client-side localStorage permissions prevent accidental UI access but do not protect real data.
- Real admin data must not be bundled into public JavaScript.
- Admin writes must eventually happen through protected server-side APIs.
- File uploads for ID documents and receipts require private storage and authorization checks.
- Audit records should be written server-side so users cannot tamper with them.
