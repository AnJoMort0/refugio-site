# Beginner Deployment Guide

Last reviewed: 2026-08-30

This guide starts from the **owner-approved static prototype already hosted on GitHub Pages** and takes it to a real production system. It assumes no production domain, Cloudflare backend, database, authentication, or deployment experience yet. Follow it in order. Keep [`deployment.md`](./deployment.md) open as the technical companion; that document explains the architecture, while this one explains what to click, type, check, and record.

## 1. Read this before publishing anything

The owners have already approved the current browser prototype through its static GitHub Pages deployment. That approval is the starting point for this guide, so **do not create another private review deployment just to review the same prototype again**.

The approved prototype is still **not a production reservation system**. It stores admin data and demo login state in each browser's `localStorage`. That means:

- another computer does not automatically see the same reservations;
- clearing browser storage removes that browser's prototype data;
- the demo login is not a secure login;
- client-side permissions do not protect real personal or financial data;
- submitting a form simulates the workflow locally instead of reliably storing and emailing it on a server.

The remaining path has two phases:

1. **Production implementation and staging validation:** keep the approved interface, replace the browser-only storage/security boundaries with the Worker API, D1, Access, Resend, R2 where needed, Turnstile, backups, and other production controls; then test that implementation in a separate staging environment using fake data.
2. **Production launch:** only after staging passes the production test checklist, deploy the production environment, connect the final domain, and introduce real business data in a controlled way.

The existing GitHub Pages prototype may remain available as the approved visual/workflow reference while implementation is underway, but keep it demo-only. Do not connect it to production secrets or databases, and do not enter real guest, identity, payment, employment, or financial data there.

## 2. Recommended low-cost setup

Use these services unless a later business decision changes the architecture:

| Purpose | Service | Account owner |
| --- | --- | --- |
| Domain, DNS, website, API, database, private files, admin perimeter | Cloudflare | O Refúgio owners |
| Source code and deployment history | GitHub | O Refúgio organisation or owner-controlled account |
| Transactional email sending | Resend | O Refúgio owners |
| Passwords and recovery codes | A shared business password manager | O Refúgio owners |
| Incoming mailbox | Existing mailbox through Cloudflare Email Routing, or a paid mailbox provider | O Refúgio owners |

Cloudflare Workers, D1, R2, Access, Turnstile, and Resend have low-volume/free allowances, but prices and limits change. As of this review, Workers Free allows 100,000 Worker requests per day, the Zero Trust Free plan is intended for teams under 50 users, and Resend Free allows 3,000 emails per month with a 100-per-day limit. Check the provider's current pricing immediately before launch. The domain is the main unavoidable recurring purchase; a paid mailbox may also be needed if staff must manually send as `@YOUR_DOMAIN`.

## 3. Words used in this guide

- **Domain:** the name people type, such as `example.pt`.
- **Registrar:** the company that sells and renews the domain.
- **DNS:** records that connect the domain to the website and email services.
- **Hosting:** the service that serves the site to visitors. Here it is Cloudflare Workers.
- **Worker:** Cloudflare code that serves pages and handles API requests.
- **D1:** the production SQL database for reservations, guests, pricing, work, and audit records.
- **R2:** private file storage for contact attachments or approved documents.
- **Access:** the login gate in front of the private admin.
- **Turnstile:** bot protection for public forms. Its token must be checked by the server.
- **Staging:** a private test copy with a separate database and fake data.
- **Production:** the real public system with real business data.
- **Secret:** a password/API key stored by Cloudflare, never in source code.

## 4. Create a deployment record

Before opening accounts, create a private document in the business password manager. Call it `O Refúgio website deployment record` and add these empty fields:

```text
Chosen domain:
Domain registrar:
Domain renewal date:
Cloudflare account email:
Cloudflare account ID:
GitHub account/organisation:
GitHub repository URL:
Approved GitHub Pages prototype URL:
Production Worker name:
Staging Worker name:
Production D1 name and ID:
Staging D1 name and ID:
Production R2 bucket:
Staging R2 bucket:
Public website URL:
Admin URL:
Reservations sender address:
Reservations receiving address:
Resend account email:
Turnstile production site key:
Turnstile staging site key:
Cloudflare Zero Trust team name:
Access application AUD tag:
D1/R2 data-location decision (automatic, weur hint, or EU jurisdiction):
Wrangler version last tested:
Last backup test:
Last restore test:
```

Never put passwords, API keys, guest exports, or recovery codes in this repository.

## 5. Secure the owner accounts

Do this before buying the domain because losing the registrar or Cloudflare account can mean losing control of the site.

1. Decide which owner-controlled email address will own the infrastructure. Do not use a developer's personal address as the sole owner.
2. Create or choose a business password manager.
3. Generate a different long random password for Cloudflare, GitHub, Resend, and the registrar.
4. Enable two-factor authentication on every account.
5. Save recovery codes in the password manager and one separate owner-controlled backup location.
6. Add at least one second owner as an account member where the provider supports it.
7. Do not share one administrator password among all staff. Production users must have individual identities.

## 6. Choose and buy the domain

### 6.1 Choose the name

Prepare three to five choices because the first may already be taken. Prefer:

- a short name that is easy to say and type;
- no accents in the domain itself;
- no confusing spelling;
- a suitable extension such as `.pt` for the Portuguese market or `.com` for wider recognition.

Check that the same name is not impersonating another accommodation or registered brand. Also check the intended social usernames.

### 6.2 Buy through Cloudflare when supported

1. Go to [Cloudflare](https://dash.cloudflare.com/sign-up) and create the owner-controlled account.
2. Verify the account email.
3. Add the business payment method.
4. In the dashboard, open **Domain Registration > Register Domains**.
5. Search for the exact domain without `https://` or `www`.
6. Confirm the spelling and current renewal price, not only the first-year price.
7. Select the registration period.
8. Enter accurate registrant contact details using ordinary ASCII characters if the form requires it.
9. Keep auto-renew enabled.
10. Complete the purchase and save the invoice.
11. Verify any registrant email sent after purchase.
12. Record the domain and renewal date in the deployment record.

Cloudflare domains already use Cloudflare nameservers. No separate DNS transfer is needed.

### 6.3 If Cloudflare does not sell the chosen extension

For example, if the desired `.pt` option is not offered, use an accredited registrar shown by the `.PT` registry or another reputable registrar.

1. Buy the domain in an owner-controlled registrar account.
2. In Cloudflare, select **Add a domain** and enter only the root domain, for example `example.pt`.
3. Choose the Cloudflare Free plan unless a paid feature is genuinely needed.
4. Review the DNS records Cloudflare discovers. Do not delete existing email records without understanding them.
5. Cloudflare will show two assigned nameservers.
6. Return to the registrar and replace its current nameservers with the two Cloudflare nameservers exactly.
7. Wait for Cloudflare to mark the domain **Active**. This can take up to 24 hours.
8. Record both the registrar and Cloudflare ownership details.

Official references: [register a domain with Cloudflare](https://developers.cloudflare.com/registrar/get-started/register-domain/) and [connect an externally registered domain](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).

## 7. Prepare the Windows computer

These instructions use PowerShell.

### 7.1 Install Git

1. Open Windows Terminal or PowerShell.
2. Run:

```powershell
winget install --id Git.Git -e --source winget
```

3. Close and reopen PowerShell.
4. Confirm the installation:

```powershell
git --version
```

If `winget` is unavailable, use the installer from [Git for Windows](https://git-scm.com/install/windows).

### 7.2 Install Node.js

1. Download the current **LTS** release from [nodejs.org](https://nodejs.org/en/download). As of 2026-08-30, Node.js 24 is LTS; Node.js 20 is already end-of-life.
2. Run the installer with its normal recommended options.
3. Close and reopen PowerShell.
4. Confirm both Node and npm:

```powershell
node --version
npm --version
```

Use an LTS version supported by the current Wrangler release. Cloudflare currently supports Wrangler on Node.js versions that are in Node's Current, Active LTS, or Maintenance LTS lifecycle. Do not download Node from an advertisement or unofficial mirror.

### 7.3 Open the project

Navigate to the project folder. Quotes are important because paths may contain spaces or accents:

```powershell
cd "E:\André\Outros\refugio-site"
```

Install the project's development dependencies. If the repository contains `package-lock.json`, prefer the reproducible install:

```powershell
npm ci
```

If there is no lockfile yet, use `npm install` once and commit the resulting lockfile after review.

Confirm that the project uses a locally pinned Wrangler version (Cloudflare's recommended setup), then run the checks:

```powershell
npx wrangler --version
npm run check
```

If Wrangler is not listed in the project's development dependencies, add the current Wrangler v4 release with `npm install -D wrangler@latest`, rerun the checks, and commit the `package.json`/lockfile change.

Start the local site:

```powershell
npm run dev
```

Open the URL printed by the command. Keep this terminal open while testing. Press `Ctrl+C` to stop the server.

## 8. Verify the existing GitHub repository and ownership

Because the approved prototype is already hosted with GitHub Pages, there should already be a GitHub repository. **Do not create a second repository simply for this deployment.** First make sure the existing repository and account ownership are suitable for production development.

### 8.1 Confirm ownership and repository safety

1. Open the GitHub repository that currently publishes the approved GitHub Pages prototype.
2. Confirm the repository is owned by an owner-controlled account or, preferably, an organisation controlled by the business. A developer's personal account must not be the sole long-term owner.
3. Enable two-factor authentication for every account with write or administration access.
4. Record the repository URL and the current GitHub Pages prototype URL in the deployment record.
5. Review the repository and Git history for `.env`, `.dev.vars`, API keys, database exports, real guest data, attachments, or other secrets/private data before backend work begins.
6. If the repository is public because it currently serves GitHub Pages, remember that **all committed code and history are public**. Never rely on repository privacy to protect secrets. Consider moving ongoing production development to an owner-controlled private repository if the chosen GitHub plan/workflow supports that, but do not break the approved Pages reference until the production replacement is ready.
7. Demo passwords or seed credentials visible in the prototype must never become production credentials.

### 8.2 Confirm the local folder points to that repository

From the project folder, run:

```powershell
git status
git remote -v
git branch --show-current
```

Confirm `origin` is the expected owner-controlled repository before pushing anything. If it points somewhere unexpected, stop and verify ownership rather than replacing it blindly.

Before beginning production changes, create a working branch and run the existing checks:

```powershell
git switch -c production/backend-foundation
npm ci
npm run check
```

Commit reviewed changes normally. Before every commit, inspect `git status`. Never commit `.dev.vars`, `.env`, API keys, database exports, contact attachments, or real guest data.

GitHub's [repository security guidance](https://docs.github.com/en/code-security/getting-started/securing-your-repository) is a useful companion when preparing the existing repository for production work.

## 9. Production implementation checkpoint

Owner approval of the prototype is already complete. The next milestone is therefore **implementation**, not another visual review deployment. Creating Cloudflare resources alone will not connect the existing browser prototype to them; the production boundaries below must be built in the repository and tested.

Do not continue to production launch until all of these are implemented and reviewed:

- a Worker entry point handles `/api/*` routes;
- booking and contact forms POST to server endpoints;
- every public write is validated again on the server;
- reservations, requests, guests, addresses, prices, services, consent, staff, work, expenses, and audit use D1;
- `admin-store.js` uses authenticated API requests instead of `localStorage`;
- the demo seed and demo passwords are excluded from the production bundle;
- owner, employee, and dev permissions are checked by the server on every admin action;
- availability uses half-open stays `[check-in, check-out)` and performs a database-enforced atomic conflict check/write (not a browser or JavaScript `SELECT` followed by an unconditional insert);
- email is sent only after the request is stored;
- contact attachments use private R2 objects and authorised downloads;
- guest-stay pages use expiring, revocable, unguessable tokens;
- marketing opt-ins create private consent records with unsubscribe and suppression support;
- audit entries are append-only for normal admin users;
- staging and production have separate resources.

The target tables and API routes are listed in [`deployment.md`](./deployment.md). Treat completion of this checkpoint as a development milestone with tests, not as a dashboard setting.


## 10. Create separate staging and production resources

Only do this when the Worker/API code and migrations exist. The approved GitHub Pages prototype does not need its own Cloudflare Worker; these resources are for the new staging and production system.

### 10.1 Log Wrangler into the owner-controlled Cloudflare account

From the project folder, run:

```powershell
npx wrangler login
npx wrangler --version
```

A browser opens. Sign in to the owner-controlled Cloudflare account and approve Wrangler. Return to PowerShell and confirm the Wrangler version prints successfully. Do this before creating staging or production resources.

### 10.2 Choose data location, then create D1 databases

Make this decision **before** creating D1 or R2. A location hint such as Western Europe is best-effort placement. An EU jurisdiction is a data-residency restriction and cannot be added or changed after the resource is created. EU jurisdiction may be useful if the business/legal review wants D1/R2 data guaranteed to stay within the EU, but GDPR does not automatically mean every system must use EU-only storage. This setting covers those resources only; separately review Worker request processing/logs, Cloudflare Access, email, analytics, and any other providers.

If the decision is a Western Europe location hint:

```powershell
npx wrangler d1 create refugio-staging --location weur
npx wrangler d1 create refugio-production --location weur
```

If the decision is an EU jurisdiction instead:

```powershell
npx wrangler d1 create refugio-staging --jurisdiction eu
npx wrangler d1 create refugio-production --jurisdiction eu
```

Use the same policy for staging and production unless there is a documented reason not to. Save each database ID. Add the returned bindings to the correct Wrangler environments. Never point staging at the production database.

Create migrations in source control:

```powershell
npx wrangler d1 migrations create refugio-staging initial-schema
```

Edit the generated SQL migration, review it, and test locally before applying it remotely. Use the stable database name when applying migrations so a renamed binding cannot target the wrong database.

Typical sequence:

```powershell
npx wrangler d1 migrations apply refugio-staging --local
npm run check
npx wrangler d1 migrations apply refugio-staging --remote
npx wrangler d1 migrations apply refugio-production --remote
```

Always apply and test on staging first. Cloudflare's [D1 getting-started guide](https://developers.cloudflare.com/d1/get-started/) and [migration reference](https://developers.cloudflare.com/d1/reference/migrations/) are the command source of truth.

### 10.3 Create private R2 buckets

If you chose a Western Europe location hint:

```powershell
npx wrangler r2 bucket create refugio-staging-private --location weur
npx wrangler r2 bucket create refugio-production-private --location weur
```

If you chose EU jurisdiction:

```powershell
npx wrangler r2 bucket create refugio-staging-private --jurisdiction eu
npx wrangler r2 bucket create refugio-production-private --jurisdiction eu
```

Add separate R2 bindings for staging and production, including `jurisdiction = "eu"` in the Wrangler R2 binding when using an EU-jurisdiction bucket. Keep both buckets private and leave the public `r2.dev` URL disabled for sensitive content. Direct browser uploads may use short-lived S3 presigned `PUT` URLs, but those require an R2 CORS policy for the exact site origin and must be treated as bearer tokens. A browser must never receive a permanent public URL for an attachment or identity document. See the official [R2 CLI guide](https://developers.cloudflare.com/r2/get-started/cli/), [data-location guide](https://developers.cloudflare.com/r2/reference/data-location/), and [presigned-URL guide](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

### 10.4 Configure environments

Use at least `staging` and `production` Wrangler environments. Wrangler bindings and `vars` are **non-inheritable**, so do not define a D1/R2 binding only at the top level and assume named environments will receive it. Each environment needs its own:

- Worker name;
- D1 binding;
- R2 binding;
- Turnstile hostname/key;
- email recipient restrictions;
- secrets;
- domain or subdomain.

Recommended names:

```text
refugio-staging
refugio-production
refugio-staging-private
refugio-production-private
```

Use fake guests and a recipient allow-list in staging.

## 11. Protect the admin with Cloudflare Access

For the simplest bootstrap, email one-time PIN can be used as the primary Cloudflare Access login. New Zero Trust organisations no longer add OTP automatically, so enable it explicitly if you choose it. For production admin access, also require Cloudflare Access independent MFA (TOTP, a WebAuthn security key, or device biometrics), especially for owner/dev accounts. Each person must still have an individual identity.

1. In Cloudflare, open **Zero Trust** and create the organisation/team name if prompted.
2. Go to **Settings > Authentication > Login methods**.
3. Enable **One-time PIN**, or connect the business identity provider if one exists.
4. Go to **Access controls > Applications**.
5. Create a **Self-hosted** application. For the least migration work, initially protect the existing admin path and admin API paths on the same site origin, such as `YOUR_DOMAIN/admin.html` and `YOUR_DOMAIN/api/admin/*`. If you instead move the PWA to `gestao.YOUR_DOMAIN`, move its manifest, service worker, icons, and admin API to that origin together and retest service-worker scope.
6. Create an **Allow** policy containing only the exact approved individual email addresses. Do not use a rule that allows every address or an entire public email domain.
7. In the application configuration, open **Authentication > MFA**, choose **Custom MFA settings** (or deliberately inherit an organisation-wide MFA requirement), and select the allowed authenticator methods. A policy can override the application setting, so review the final Allow policy too.
8. Set an appropriate Access session duration and MFA authentication duration.
9. Test an allowed owner, an allowed employee, and a completely unlisted email.
10. Copy the Access application's **AUD tag** into the private deployment record/configuration.
11. The Worker must validate the `Cf-Access-Jwt-Assertion` header against Cloudflare's signing keys and the expected AUD, then map the verified identity to an active D1 user before returning admin data. Do not trust the browser cookie by itself.
12. Test deactivating a user without deploying new code.

Cloudflare documents [one-time PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/) and [Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/). Access is the outer gate; D1 role checks remain mandatory inside the API.

## 12. Configure incoming and outgoing email

Incoming mail and transactional sending are different services.

### 12.1 Receive replies

The cheapest setup can route addresses such as `reservas@YOUR_DOMAIN` and `contacto@YOUR_DOMAIN` to an existing owner mailbox.

1. In Cloudflare, go to **Email > Email Routing**.
2. Add the real destination mailbox.
3. Open the verification email at that destination and approve it.
4. Create routing addresses for reservations and contact.
5. Send a test from an unrelated email account to each routed address and confirm it arrives at the destination mailbox.

Cloudflare Email Routing is forwarding, not a normal outbound mailbox. Replying from the destination mailbox will normally send **from that destination address**, not automatically from `reservas@YOUR_DOMAIN`. Use a mailbox/SMTP provider (or a correctly configured “send as” feature backed by an SMTP service) if staff need to write manual replies from the custom-domain address, need a shared inbox/calendar, or need mailbox storage.

### 12.2 Send transactional messages with Resend

1. Create the owner-controlled Resend account.
2. Add a sending subdomain such as `updates.YOUR_DOMAIN`; isolating transactional sending protects the main domain's reputation.
3. Resend shows DNS records for SPF and DKIM.
4. Add those records in Cloudflare DNS exactly as shown.
5. Wait for Resend to mark the domain verified.
6. SPF and DKIM are required for Resend verification. Add DMARC separately with a cautious initial policy such as `p=none`, review reports and all legitimate senders, then tighten it only when safe.
7. Create a production API key and a separate staging key. On a free Resend plan, do not assume you can verify unlimited separate staging/production sending domains; if necessary, use the same verified sending subdomain with separate keys plus a strict staging recipient allow-list.
8. Put each key into the matching Worker as a secret:

```powershell
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put RESEND_API_KEY --env production
```

9. Never paste the key into JavaScript, JSON, `wrangler.toml`, GitHub, or screenshots.
10. Configure a real reply-to address that owners monitor. If `updates.YOUR_DOMAIN` is the verified Resend domain, use a From address on that verified subdomain (for example `bookings@updates.YOUR_DOMAIN`) and set `Reply-To: reservas@YOUR_DOMAIN` if replies should enter the routed owner mailbox.
11. Test acknowledgement, payment instructions, confirmation, pre-arrival, checkout, and feedback messages in every supported language.
12. Store provider message IDs and delivery results, but avoid retaining unnecessary full message bodies forever.

Resend's official guides cover [domain verification](https://resend.com/docs/dashboard/domains/introduction) and [sending email](https://resend.com/docs/api-reference/emails/send-email). Cloudflare's [secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/) explains encrypted Worker secrets.

## 13. Add Turnstile to public forms

1. In Cloudflare, open **Turnstile**.
2. Create one widget for staging and one for production.
3. Restrict each widget to its own hostname.
4. Put the public site key in the relevant frontend configuration.
5. Store the secret key as a Worker secret:

```powershell
npx wrangler secret put TURNSTILE_SECRET_KEY --env staging
npx wrangler secret put TURNSTILE_SECRET_KEY --env production
```

6. Include the Turnstile token in booking and contact submissions.
7. In the Worker, POST the token and secret to Cloudflare Siteverify.
8. Reject the form if verification fails, expires, or is reused.
9. Add request size limits, rate limits, and an idempotency key so retries do not create duplicate requests.
10. Test both successful submissions and deliberate failures.

The browser widget alone is not protection. Server validation is mandatory; tokens expire after five minutes and are single-use. Follow the official [Turnstile setup](https://developers.cloudflare.com/turnstile/get-started/) and [Siteverify validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) guides.

## 14. Add payment-hold automation

The server must hold an accepted website request for 48 hours, then release it if payment is not received. D1 uses auto-commit; design this with conditional/idempotent writes or `batch()`/database triggers rather than assuming an application-controlled `BEGIN`/`COMMIT` transaction.

1. Implement a Worker's `scheduled()` handler.
2. Query only overdue `awaiting_payment` candidates.
3. For each candidate, issue a conditional update that still requires `awaiting_payment`, an expired deadline, and no recorded payment. Only a row actually changed by that write is considered expired.
4. If availability is calculated from active reservation status, the successful cancellation itself releases the dates. Keep the audit write atomic with the state change where practical (for example with a database trigger or a rollback-safe `batch()`).
5. Send any cancellation notice only after the database write succeeds.
6. Make retries and payment-webhook handling idempotent so payment and expiry cannot race into contradictory states.
7. Configure a Cron Trigger in Wrangler. Cron times are UTC.
8. Test the scheduled handler locally with `wrangler dev` and `/cdn-cgi/handler/scheduled`, then on staging with deliberately short fake deadlines.
9. Confirm a paid reservation is never expired.

Use Cloudflare's [Cron Trigger guide](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for the current configuration syntax.

## 15. Deploy and test staging

This staging deployment is **not another prototype approval round**. It exists to test the newly implemented server, database, authentication, email, permissions, files, migrations, and production configuration without risking real data.

Before the first staging deployment, confirm the Worker/static-assets configuration has been updated from the browser-only prototype so `/api/*` is handled by the Worker while the approved static interface continues to be served as assets.

Deploy staging first:

```powershell
npm run check
npx wrangler deploy --env staging
```

Use a staging hostname such as `staging.YOUR_DOMAIN`, protected by Access. Complete this test sheet with fake data:

- [ ] Portuguese, English, French, and Spanish pages load without missing text.
- [ ] Booking request stores exactly once and appears in Website Requests.
- [ ] Mandatory address and phone validation works.
- [ ] Country search stores an ISO country code and displays the localized name.
- [ ] Contact request stores once, including permitted attachments.
- [ ] Turnstile rejects invalid/reused tokens.
- [ ] Owner and guest emails arrive with correct sender, reply-to, language, dates, and totals.
- [ ] Check-in on another reservation's checkout date is accepted.
- [ ] Overlapping occupied nights are rejected server-side.
- [ ] Owner can perform all owner actions.
- [ ] Employee can perform only allowed employee actions.
- [ ] Deactivated and unknown identities are denied.
- [ ] Audit identifies actor and concise change.
- [ ] Marketing opt-in is private, language-aware, and not preselected.
- [ ] Unsubscribe suppresses later marketing sends.
- [ ] Attachments cannot be opened without admin authorisation.
- [ ] Guest-stay tokens expire and cannot expose another reservation.
- [ ] 48-hour expiry releases availability.
- [ ] Custom 404 returns HTTP status 404.
- [ ] Admin PWA installs and updates on Android/Chromium and iPhone/iPad.
- [ ] Mobile and desktop screenshots show no horizontal overflow.

Fix staging failures before touching production data.

## 16. Prepare production data

1. Reconfirm the **production values** for public text, prices, rules, cancellation terms, contact details, images, partners, and map links. The earlier prototype approval confirms the interface/workflow direction, but launch still requires the actual production content and legal wording to be current.
2. Obtain appropriate Portuguese legal/privacy review for personal data, identity data, employment data, cookies, direct marketing, cancellation, complaints, and retention.
3. Replace every placeholder in `site-config.js` and owner-approved content files.
4. Create production users from verified individual emails. Do not migrate demo passwords.
5. Remove demo reservations, fake guests, fake staff costs, and seed-only audit entries from production.
6. Import real initial prices and future reservations through a reviewed migration/import tool, not browser `localStorage`.
7. Run a dry-run import into a fresh staging database.
8. Compare counts, IDs, totals, dates, services, payment states, and guest links.
9. Keep an encrypted export of the source data and an import report.
10. Only then import into production.

## 17. Connect the production domain

After production passes the staging checklist:

```powershell
npm run check
npx wrangler deploy --env production
```

In Cloudflare:

1. Open **Workers & Pages** and select the production Worker.
2. Open **Settings > Domains & Routes**.
3. Choose the canonical hostname (`YOUR_DOMAIN` or `www.YOUR_DOMAIN`) and add **that hostname** as the Worker **Custom Domain**. Cloudflare creates the necessary DNS record and certificate.
4. For the non-canonical hostname, create a proxied placeholder DNS record and a Cloudflare Single Redirect to the canonical hostname, following the Custom Domains guide. Do not create an origin server just for the redirect.
5. Add the separate protected admin hostname only if that architecture was intentionally chosen and its PWA/API were moved together.
6. Wait for the Custom Domain certificate to become active.
7. Test `https://`, the canonical hostname, the redirecting hostname, admin, APIs, email DNS, and 404 behavior.

Cloudflare's [Custom Domains guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) explains that Cloudflare creates DNS and certificates for the Worker hostname. Do not delete unrelated MX, SPF, DKIM, or DMARC records when adding the website.

## 18. Configure automatic deployments

Once manual production deployment is understood and tested, connect GitHub to Cloudflare Workers Builds.

For the beginner setup, automate production first and keep staging deployments manual until that pipeline is understood. Wrangler named environments create separate Worker deployments, so this avoids a preview branch accidentally targeting the wrong Worker.

1. Manually deploy both environments at least once with `npx wrangler deploy --env staging` and `npx wrangler deploy --env production`.
2. Open the **production environment Worker** in Cloudflare and go to **Settings > Builds**.
3. Connect the private GitHub repository and allow Cloudflare access only to the required repository.
4. Set `main` as the production branch.
5. Set the build command to run the required project checks (for example `npm run check`, plus any real build command if the project later has one).
6. Set the production deploy command to `npx wrangler deploy --env production`.
7. Initially leave **non-production branch builds disabled** on the production Worker. Continue deploying staging manually with `npx wrangler deploy --env staging` after local checks.
8. Make a harmless tested change, merge it to `main`, and verify that the build deploys only the production environment and uses the production bindings.
9. If you later want automatic staging/PR previews, follow Cloudflare's Wrangler-environments advanced setup and connect/configure the **staging environment Worker separately**. Use commands with `--env staging` (for example `npx wrangler versions upload --env staging` for preview uploads), and verify that preview builds cannot reach production D1/R2.

Cloudflare's [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) and [Workers Builds advanced setup](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/) are the source of truth. Bindings and secrets must still be configured per environment.

## 19. Backups and recovery

D1 Time Travel is automatic, but it is not the only backup. As of this review, the recovery window is 7 days on Workers Free and 30 days on Workers Paid.

### 19.1 Regular export

From a controlled computer, create an encrypted backup location outside the repository. Export production D1 with a dated filename:

```powershell
npx wrangler d1 export refugio-production --remote --output "D:\RefugioBackups\refugio-2026-08-30.sql"
```

Never put this file in Git, email, or an unencrypted shared folder. It contains personal and business data.

### 19.2 Restore drill

At least quarterly:

1. Create a fresh temporary/staging D1 database.
2. Restore/import the latest encrypted export into that non-production database with an explicit remote command, for example `npx wrangler d1 execute YOUR-RESTORE-DRILL-DB --remote --file "D:\RefugioBackups\refugio-YYYY-MM-DD.sql"`.
3. Run integrity checks and compare expected record counts.
4. Open the staging admin and verify representative reservations, prices, consent, work, and audit records.
5. Record the date, operator, backup used, result, and cleanup.
6. Delete the temporary database only after documenting success.

For an incident within the available window, D1 [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) can restore to a point in time. A production Time Travel restore overwrites the database, so record the current bookmark and obtain owner approval before using it.

## 20. Install the admin PWA

Only install the production admin after Access and the server-side API are working.

### Android or desktop Chromium

1. Sign into the protected admin URL.
2. Use the app's install action or the browser's **Install app** action.
3. Confirm it launches as `O Refúgio Gestão`.
4. Test logout, expired Access session, update prompt, and offline shell.

### iPhone or iPad

1. Open the admin URL in Safari.
2. Sign in.
3. Tap **Share** (or **More > Share**, depending on the Safari tab layout).
4. Choose **Add to Home Screen**.
5. Turn on **Open as Web App**, confirm the name, and tap **Add**.
6. Test launch, session expiry, safe areas, and update behavior.

The service worker caches only the static admin shell. It must never cache API responses, guest records, attachments, credentials, or secrets.

## 21. Launch-day sequence

1. Freeze content and code changes except launch fixes.
2. Run `npm run check`.
3. Confirm the latest staging test sheet is complete.
4. Export and secure a pre-launch database backup.
5. Confirm domain auto-renew, account recovery, and owner access.
6. Confirm production secrets and bindings point only to production resources.
7. Deploy production.
8. Submit one real controlled booking request and one contact request.
9. Confirm persistence, owner notification, guest acknowledgement, audit, and marketing consent behavior.
10. Delete or clearly label the controlled test records.
11. Test owner and employee accounts from separate devices.
12. Test the public site on mobile data, not only the property Wi-Fi.
13. Verify Search Console/analytics only after consent and privacy decisions are complete.
14. Record the deployed commit ID and launch time.

## 22. Routine updates after launch

For every normal change:

```powershell
git switch -c change/short-description
npm ci
npm run check
npm run dev
```

Test locally, commit, push, validate the change in staging, and merge only after the required code/business review. For a database change, create a migration and apply it to staging before production. Never edit production tables manually without a recorded, reviewed reason.

Monthly:

- verify booking/contact delivery failures;
- review Cloudflare and Resend usage/billing;
- export a backup;
- inspect Access users and deactivate leavers;
- review failed logins and API errors;
- verify domain and payment methods are current.

Quarterly:

- perform a restore drill;
- test all owner/employee role boundaries;
- test PWA install/update on current mobile browsers;
- review dependencies, the pinned Wrangler/Node versions, provider limits, retention, and legal text;
- verify marketing unsubscribe and suppression behavior.

Yearly:

- confirm domain renewal and registrant details;
- rotate appropriate API keys and recovery material;
- review account owners and emergency contacts;
- review whether the free tiers and architecture still fit actual traffic.

## 23. Stop and get help when

Do not improvise around these failures:

- the domain or Cloudflare account is not owner-controlled;
- a secret appears in Git history;
- staging can read or write production data;
- an unknown email can open the admin;
- an employee can perform an owner-only write;
- a public endpoint reveals guest names or reservation details;
- overlapping occupied nights can be confirmed;
- a form says success without a stored request;
- attachments have permanent public URLs;
- backup restoration has never been tested;
- marketing email lacks valid consent or unsubscribe handling;
- production contains demo accounts or browser-only authentication.

Pause launch, preserve logs and backups, and fix the underlying boundary. A visually working page is not evidence that the production system is secure or durable.
