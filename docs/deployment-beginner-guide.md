# Beginner Deployment Guide

Last reviewed: 2026-08-30

This guide starts from zero: no domain, no hosting account, no command-line setup, and no previous deployment experience. Follow it in order. Keep [`deployment.md`](./deployment.md) open as the technical companion; that document explains the architecture, while this one explains what to click, type, check, and record.

## 1. Read this before publishing anything

The repository currently contains a polished browser prototype. It is suitable for testing screens and workflows, but it is **not yet a production reservation system**.

The current prototype stores admin data and demo login state in each browser's `localStorage`. That means:

- another computer does not automatically see the same reservations;
- clearing browser storage removes that browser's prototype data;
- the demo login is not a secure login;
- client-side permissions do not protect real personal or financial data;
- submitting a form simulates the workflow locally instead of reliably storing and emailing it on a server.

There are therefore two separate deployments:

1. **Private review deployment:** puts the current prototype online so owners can review it. Do not enter real guest, identity, payment, employment, or financial data.
2. **Production deployment:** first adds the server, database, authentication, email, file storage, backups, and legal content described below, then launches the real public site.

Do not skip directly from the prototype to accepting real bookings.

## 2. Recommended low-cost setup

Use these services unless a later business decision changes the architecture:

| Purpose | Service | Account owner |
| --- | --- | --- |
| Domain, DNS, website, API, database, private files, admin perimeter | Cloudflare | O Refúgio owners |
| Source code and deployment history | GitHub | O Refúgio organisation or owner-controlled account |
| Transactional email sending | Resend | O Refúgio owners |
| Passwords and recovery codes | A shared business password manager | O Refúgio owners |
| Incoming mailbox | Existing mailbox through Cloudflare Email Routing, or a paid mailbox provider | O Refúgio owners |

Cloudflare Workers, D1, R2, Access, Turnstile, and Resend have low-volume/free allowances, but prices and limits change. Check the provider's current pricing immediately before launch. The domain is the unavoidable recurring purchase.

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

1. Download the current **LTS** release from [nodejs.org](https://nodejs.org/en/download).
2. Run the installer with its normal recommended options.
3. Close and reopen PowerShell.
4. Confirm both Node and npm:

```powershell
node --version
npm --version
```

Use an LTS version supported by the current Wrangler release. Do not download Node from an advertisement or unofficial mirror.

### 7.3 Open the project

Navigate to the project folder. Quotes are important because paths may contain spaces or accents:

```powershell
cd "E:\André\Outros\refugio-site"
```

Install the project's development dependencies:

```powershell
npm install
```

Run the checks:

```powershell
npm run check
```

Start the local site:

```powershell
npm run dev
```

Open the URL printed by the command. Keep this terminal open while testing. Press `Ctrl+C` to stop the server.

## 8. Put the source code in GitHub

### 8.1 Create the account and repository

1. Create an owner-controlled [GitHub account](https://github.com/signup), or preferably a small GitHub organisation owned by the business.
2. Enable two-factor authentication.
3. In GitHub, select **New repository**.
4. Name it `refugio-site`.
5. Choose **Private** because the repository contains business workflow details.
6. Do not initialise it with a README, `.gitignore`, or licence if this local folder is already a Git repository.
7. Create the repository and copy its HTTPS URL.

### 8.2 Connect the existing folder

First inspect the current state:

```powershell
git status
git remote -v
```

If no `origin` remote exists, add the URL copied from GitHub:

```powershell
git remote add origin https://github.com/YOUR-ACCOUNT/refugio-site.git
```

If `origin` already points somewhere else, stop and verify ownership before changing it.

Commit the reviewed files:

```powershell
git add .
git status
git commit -m "Prepare O Refugio prototype for deployment"
git branch -M main
git push -u origin main
```

Review `git status` before every commit. Never commit `.dev.vars`, `.env`, API keys, database exports, contact attachments, or real guest data. GitHub's [repository guide](https://docs.github.com/en/get-started/start-your-journey/creating-a-repository-for-your-project-on-github) explains the account and repository screens.

## 9. Deploy the current prototype for private review

This stage does not make the system production-ready. Use only fake data.

### 9.1 Log Wrangler into Cloudflare

From the project folder, run:

```powershell
npx wrangler login
```

A browser opens. Sign in to the owner-controlled Cloudflare account and approve Wrangler. Then return to PowerShell.

### 9.2 Check the deployment configuration

The existing `wrangler.toml` tells Cloudflare to serve `public/` and use `404.html` for unknown pages:

```toml
name = "alojamento-rural-site"
compatibility_date = "2026-04-15"

[assets]
directory = "./public"
not_found_handling = "404-page"
```

For a private review copy, change the Worker name only if that name is already taken in the Cloudflare account.

### 9.3 Deploy

Run:

```powershell
npm run check
npx wrangler deploy
```

Wrangler prints a `workers.dev` URL. Open it and verify:

- `/index.html` loads;
- language switching works;
- `/admin.html` loads only demo data;
- `/not-a-real-page.html` shows the custom 404 page;
- phone and desktop layouts do not scroll sideways;
- the installed admin PWA opens its static shell.

Do not advertise this URL or enter real data. The official [Workers Static Assets guide](https://developers.cloudflare.com/workers/static-assets/get-started/) confirms that `npx wrangler deploy` publishes the project.

### 9.4 Optional owner-only review hostname

After the domain is active, create `review.YOUR_DOMAIN` as a Worker Custom Domain and put Cloudflare Access in front of it. Allow only the owners' and developer's exact email addresses. This is safer than sharing an unprotected review URL.

## 10. Production implementation checkpoint

The next steps require development work in this repository. Creating Cloudflare resources alone will not connect the existing browser prototype to them.

Do not continue to production launch until all of these are implemented and reviewed:

- a Worker entry point handles `/api/*` routes;
- booking and contact forms POST to server endpoints;
- every public write is validated again on the server;
- reservations, requests, guests, addresses, prices, services, consent, staff, work, expenses, and audit use D1;
- `admin-store.js` uses authenticated API requests instead of `localStorage`;
- the demo seed and demo passwords are excluded from the production bundle;
- owner, employee, and dev permissions are checked by the server on every admin action;
- availability uses half-open stays `[check-in, check-out)` and rechecks conflicts in a database transaction;
- email is sent only after the request is stored;
- contact attachments use private R2 objects and authorised downloads;
- guest-stay pages use expiring, revocable, unguessable tokens;
- marketing opt-ins create private consent records with unsubscribe and suppression support;
- audit entries are append-only for normal admin users;
- staging and production have separate resources.

The target tables and API routes are listed in [`deployment.md`](./deployment.md). Treat completion of this checkpoint as a development milestone with tests, not as a dashboard setting.

## 11. Create separate staging and production resources

Only do this when the Worker/API code and migrations exist.

### 11.1 Create D1 databases

```powershell
npx wrangler d1 create refugio-staging
npx wrangler d1 create refugio-production --location weur
```

Save each database ID. Add the returned bindings to the correct Wrangler environments. Never point staging at the production database.

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

### 11.2 Create private R2 buckets

```powershell
npx wrangler r2 bucket create refugio-staging-private
npx wrangler r2 bucket create refugio-production-private
```

Add separate R2 bindings for staging and production. Keep both buckets private. A browser must never receive a permanent public R2 URL for an attachment or identity document. See the official [R2 CLI guide](https://developers.cloudflare.com/r2/get-started/cli/).

### 11.3 Configure environments

Use at least `staging` and `production` Wrangler environments. Each needs its own:

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

## 12. Protect the admin with Cloudflare Access

For the simplest owner experience, use email one-time PIN login initially. Each person still has an individual email identity.

1. In Cloudflare, open **Zero Trust** and create the organisation/team name if prompted.
2. Go to **Settings > Authentication > Login methods**.
3. Enable **One-time PIN**, or connect the business identity provider if one exists.
4. Go to **Access controls > Applications**.
5. Create a **Self-hosted** public-hostname application.
6. Protect the final admin hostname, preferably `gestao.YOUR_DOMAIN`, and the admin API hostname/path.
7. Create an **Allow** policy containing the exact email address of Jorge, Paula, Bárbara, Marlene, André, Dulce, and Fábio.
8. Do not use a rule that allows every email address.
9. Set an appropriate session duration.
10. Test an allowed owner, an allowed employee, and a completely unlisted email.
11. The Worker must validate the Access identity/JWT and map the verified identity to an active D1 user before returning admin data.
12. Test deactivating a user without deploying new code.

Cloudflare documents [one-time PIN login](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/) and [Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/). Access is the outer gate; D1 role checks remain mandatory inside the API.

## 13. Configure incoming and outgoing email

Incoming mail and transactional sending are different services.

### 13.1 Receive replies

The cheapest setup can route addresses such as `reservas@YOUR_DOMAIN` and `contacto@YOUR_DOMAIN` to an existing owner mailbox.

1. In Cloudflare, go to **Email > Email Routing**.
2. Add the real destination mailbox.
3. Open the verification email at that destination and approve it.
4. Create routing addresses for reservations and contact.
5. Send a test from an unrelated email account and reply to it.

Use a paid mailbox provider instead if the business needs a full shared inbox, calendar, mailbox storage, or multiple staff sending manually as the domain.

### 13.2 Send transactional messages with Resend

1. Create the owner-controlled Resend account.
2. Add a sending subdomain such as `updates.YOUR_DOMAIN`; isolating transactional sending protects the main domain's reputation.
3. Resend shows DNS records for SPF and DKIM.
4. Add those records in Cloudflare DNS exactly as shown.
5. Wait for Resend to mark the domain verified.
6. Add DMARC with a cautious policy and review reports before tightening it.
7. Create a production API key and a separate staging key.
8. Put each key into the matching Worker as a secret:

```powershell
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put RESEND_API_KEY --env production
```

9. Never paste the key into JavaScript, JSON, `wrangler.toml`, GitHub, or screenshots.
10. Configure a real reply-to address that owners monitor.
11. Test acknowledgement, payment instructions, confirmation, pre-arrival, checkout, and feedback messages in every supported language.
12. Store provider message IDs and delivery results, but avoid retaining unnecessary full message bodies forever.

Resend's official guides cover [domain verification](https://resend.com/docs/dashboard/domains/introduction) and [sending email](https://resend.com/docs/api-reference/emails/send-email). Cloudflare's [secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/) explains encrypted Worker secrets.

## 14. Add Turnstile to public forms

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

## 15. Add payment-hold automation

The server must hold an accepted website request for 48 hours, then release it if payment is not received.

1. Implement a Worker's `scheduled()` handler.
2. Query only overdue `awaiting_payment` reservations.
3. In one transaction, mark each one cancelled with `payment_deadline_expired`, release availability, and add an audit event.
4. Send any cancellation notice after the database transaction succeeds.
5. Make retries idempotent.
6. Configure a Cron Trigger in Wrangler. Cron times are UTC.
7. Test the scheduled handler locally and on staging with deliberately short fake deadlines.
8. Confirm a paid reservation is never expired.

Use Cloudflare's [Cron Trigger guide](https://developers.cloudflare.com/workers/configuration/cron-triggers/) for the current configuration syntax.

## 16. Deploy and test staging

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

## 17. Prepare production data

1. Obtain owner approval for all public text, prices, rules, cancellation terms, contact details, images, partners, and map links.
2. Obtain appropriate Portuguese legal/privacy review for personal data, identity data, employment data, cookies, direct marketing, cancellation, complaints, and retention.
3. Replace every placeholder in `site-config.js` and owner-approved content files.
4. Create production users from verified individual emails. Do not migrate demo passwords.
5. Remove demo reservations, fake guests, fake staff costs, and seed-only audit entries from production.
6. Import real initial prices and future reservations through a reviewed migration/import tool, not browser `localStorage`.
7. Run a dry-run import into a fresh staging database.
8. Compare counts, IDs, totals, dates, services, payment states, and guest links.
9. Keep an encrypted export of the source data and an import report.
10. Only then import into production.

## 18. Connect the production domain

After production passes the staging checklist:

```powershell
npm run check
npx wrangler deploy --env production
```

In Cloudflare:

1. Open **Workers & Pages** and select the production Worker.
2. Open **Settings > Domains & Routes**.
3. Add the root domain as a **Custom Domain**.
4. Add `www.YOUR_DOMAIN` too, then choose one canonical hostname and redirect the other.
5. Add the separate protected admin hostname if that is the chosen architecture.
6. Wait for Cloudflare's certificate to become active.
7. Keep Universal SSL enabled; Cloudflare supplies and renews the normal certificate automatically.
8. Test `https://`, the root domain, `www`, admin, APIs, email DNS, and 404 behavior.

Cloudflare's [Custom Domains guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) explains that Cloudflare creates DNS and certificates for the Worker hostname. Do not delete unrelated MX, SPF, DKIM, or DMARC records when adding the website.

## 19. Configure automatic deployments

Once manual production deployment is understood and tested, connect GitHub to Cloudflare Workers Builds.

1. In the Worker, open **Settings > Builds**.
2. Connect the private GitHub repository.
3. Allow Cloudflare access only to the required repository.
4. Set `main` as the production branch.
5. Set the deploy command to `npx wrangler deploy` if Cloudflare does not detect it.
6. Keep preview branches connected only to staging/preview resources.
7. Require `npm run check` before production deployment.
8. Make a harmless documentation or text change on a branch and verify the preview.
9. Merge only after owner approval and green checks.

Cloudflare's [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) deploys connected Workers when the chosen branch changes. Bindings and secrets must still be configured per environment.

## 20. Backups and recovery

D1 Time Travel is automatic, but it is not the only backup.

### 20.1 Regular export

From a controlled computer, create an encrypted backup location outside the repository. Export production D1 with a dated filename:

```powershell
npx wrangler d1 export refugio-production --remote --output "D:\RefugioBackups\refugio-2026-08-30.sql"
```

Never put this file in Git, email, or an unencrypted shared folder. It contains personal and business data.

### 20.2 Restore drill

At least quarterly:

1. Create a fresh temporary/staging D1 database.
2. Restore/import the latest encrypted export into that non-production database.
3. Run integrity checks and compare expected record counts.
4. Open the staging admin and verify representative reservations, prices, consent, work, and audit records.
5. Record the date, operator, backup used, result, and cleanup.
6. Delete the temporary database only after documenting success.

For an incident within the available window, D1 [Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/) can restore to a point in time. A production Time Travel restore overwrites the database, so record the current bookmark and obtain owner approval before using it.

## 21. Install the admin PWA

Only install the production admin after Access and the server-side API are working.

### Android or desktop Chromium

1. Sign into the protected admin URL.
2. Use the app's install action or the browser's **Install app** action.
3. Confirm it launches as `O Refúgio Gestão`.
4. Test logout, expired Access session, update prompt, and offline shell.

### iPhone or iPad

1. Open the admin URL in Safari.
2. Sign in.
3. Tap **Share**.
4. Choose **Add to Home Screen**.
5. Confirm the name and add it.
6. Test launch, session expiry, safe areas, and update behavior.

The service worker caches only the static admin shell. It must never cache API responses, guest records, attachments, credentials, or secrets.

## 22. Launch-day sequence

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

## 23. Routine updates after launch

For every normal change:

```powershell
git switch -c change/short-description
npm install
npm run check
npm run dev
```

Test locally, commit, push, review the staging preview, and merge only after approval. For a database change, create a migration and apply it to staging before production. Never edit production tables manually without a recorded, reviewed reason.

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
- review dependencies, provider limits, retention, and legal text;
- verify marketing unsubscribe and suppression behavior.

Yearly:

- confirm domain renewal and registrant details;
- rotate appropriate API keys and recovery material;
- review account owners and emergency contacts;
- review whether the free tiers and architecture still fit actual traffic.

## 24. Stop and get help when

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
