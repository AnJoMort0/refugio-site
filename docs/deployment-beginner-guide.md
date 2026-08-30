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
| Independent business recovery mailbox | Proton Mail Free | O Refúgio owners; kept independent from `YOUR_DOMAIN` |
| Domain, DNS, website, API, database, private files, admin perimeter | Cloudflare | O Refúgio business account, with individual members |
| Source code and deployment history | GitHub | O Refúgio GitHub Organization, with individual human owners/members |
| Transactional email sending | Resend | O Refúgio team, with individual admins/members |
| Shared infrastructure credentials | Bitwarden Free Organization initially | Designated owner + developer; upgrade if more live users are needed |
| Incoming customer mail | Cloudflare Email Routing to an existing monitored mailbox, or a paid mailbox provider | O Refúgio owners |

Cloudflare Workers, D1, R2, Access, Turnstile, Proton Mail, Bitwarden, and Resend all have useful free tiers for this small project, but prices and limits change. As of this review, Proton Mail Free provides one free mailbox and up to 1 GB of Mail storage after its starter actions; Bitwarden Free Organizations support secure sharing between two users; Workers Free allows 100,000 Worker requests per day; the Zero Trust Free plan is intended for teams under 50 users; and Resend Free allows 3,000 emails per month with a 100-per-day limit and currently up to three verified domains. Check provider pricing and limits again immediately before launch. The domain is the main unavoidable recurring purchase; a paid mailbox may also be needed later if staff must manually send as `@YOUR_DOMAIN`.

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

Before opening accounts, create a temporary deployment record **outside the project/repository**. At this moment the shared business password vault does not exist yet, so use either a paper sheet kept with the owners or an encrypted local note that is not inside the project folder and is not synchronized to a public/shared location. After Section 5 creates Bitwarden, move this record into the shared `Infrastructure` collection and securely destroy/delete the temporary copy. Call it `O Refúgio website deployment record` and add these empty fields:

```text
Business recovery mailbox (record privately; never commit it):
Primary owner responsible for recovery:
Secondary owner holding offline recovery copy:
Developer individual account/contact:
Bitwarden Organization name:
Bitwarden live members:
Chosen domain:
Domain registrar:
Domain renewal date:
Cloudflare business account ID:
Cloudflare break-glass/business login recorded in vault: yes/no
Cloudflare individual Super Administrators:
GitHub Organization:
GitHub Organization owners:
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
Resend team name:
Resend team administrators:
Turnstile production site key:
Turnstile staging site key:
Cloudflare Zero Trust team name:
Access application AUD tag:
D1/R2 data-location decision (automatic, weur hint, or EU jurisdiction):
Wrangler version last tested:
Last backup test:
Last restore test:
```

Never put passwords, API keys, guest exports, recovery codes, or the real business recovery-mailbox address in this repository.

## 5. Establish business ownership and recovery before creating infrastructure

Do this before buying the domain or creating production service accounts. The goal is **not** that every owner learns GitHub, Cloudflare, DNS, or deployment work. The goal is that the family/business can recover and take control of every important digital asset even if the developer is unavailable.

Use three roles in the steps below:

- **Primary owner:** one owner who is willing to hold emergency access and occasionally confirm account/security actions.
- **Secondary owner:** another owner who holds an offline recovery copy in case both the developer and primary owner are unavailable.
- **Developer:** the person who will do normal technical administration and deployment work using their own individual accounts.

The developer may remain the day-to-day administrator indefinitely. That is compatible with owner control as long as the domain, billing, organizations, recovery mailbox, shared credentials, and emergency access remain business-controlled.

### 5.1 Create the two individual Bitwarden accounts

Use **Bitwarden Free** as the initial shared credential system. Bitwarden's free Organization supports two users, which fits the initial operating model: the primary owner plus the developer. Each person must have their **own** Bitwarden login. Do not make one shared Bitwarden user.

1. The developer opens the official [Bitwarden](https://bitwarden.com/) website or official Bitwarden app.
2. The developer creates or uses an individual Bitwarden account with an email address the developer personally controls.
3. Choose a long, unique Bitwarden master password that is not used anywhere else. A master password must be memorable/recoverable but hard to guess.
4. Verify the developer's Bitwarden email address.
5. Enable Bitwarden two-step login with an authenticator app or another supported method.
6. Save the developer's Bitwarden two-step-login recovery code in the developer's own secure emergency material, not in the Git repository.
7. The primary owner repeats the same process using an email address that **the owner personally controls**.
8. The primary owner chooses their own Bitwarden master password; the developer does not reuse or copy the developer's master password.
9. Verify the owner's Bitwarden email and enable two-step login.
10. Save the owner's Bitwarden recovery material in the owner-controlled physical emergency location.
11. Test that both users can independently sign in to Bitwarden from their own device.

### 5.2 Create the shared Bitwarden Free Organization

Now create the business-owned shared area inside Bitwarden. Organization-owned items are separate from each person's private Bitwarden items.

1. In Bitwarden Web Vault, the primary owner or developer selects **New organization**.
2. Give it a clear business name related to the property. Record that organization name in the deployment record.
3. Choose the **Free** organization plan.
4. For the billing/contact email at this first moment, use the primary owner's controlled email. After the independent business recovery mailbox is created in Section 5.3, change the Organization billing/contact email to `BUSINESS_RECOVERY_EMAIL` if Bitwarden allows it in the current settings.
5. Invite the other Bitwarden user.
6. Complete Bitwarden's full **Invite > Accept > Confirm** process. Merely sending the invitation is not enough.
7. Give both users the Organization **Owner** role so the developer is not the sole controller and the owner is not dependent on the developer.
8. Create a collection named `Infrastructure`.
9. Move the temporary `O Refúgio website deployment record` from Section 4 into a secure note inside this collection.
10. Confirm both users can open that secure note.
11. Securely destroy/delete the temporary paper/digital copy from Section 4 once the shared-vault copy is verified. If the temporary record was on paper and contains only non-secret placeholders, it may instead remain as part of the owner emergency folder.
12. From now on, store shared break-glass/provider credentials and account-recovery notes in this collection.
13. Do not use Bitwarden as a substitute for runtime secret stores: Worker/API secrets still belong in Cloudflare secrets or the relevant provider's secret facility, never in source code.

The Free Organization is intentionally limited to two live users. If three or more family members later need direct live access to the shared vault, upgrade to a Bitwarden plan that supports them. **Do not work around the two-user limit by sharing a Bitwarden user's login.**

Official reference: [Bitwarden Organizations Quick Start](https://bitwarden.com/help/getting-started-organizations/).

### 5.3 Create the independent business recovery mailbox with Proton Mail Free

Create **one new Proton Mail Free account specifically for infrastructure ownership, recovery, billing, security alerts, and provider verification**. Do not use a mailbox on `YOUR_DOMAIN` for this root recovery role: if the domain, DNS, registrar, or Cloudflare configuration ever fails, the recovery mailbox must still work independently.

Proton Free is a **single account**, not a formal multi-user business mailbox. That is acceptable here only because this address is a quiet break-glass/recovery identity rather than the daily reservations inbox. Keep access limited to the primary owner and developer. If the family later wants several people to have separate named logins to the same business mailbox, move to a paid multi-user/shared-mailbox solution instead of expanding password sharing.

Do **not** write the chosen address anywhere in this repository. In this guide, it is called `BUSINESS_RECOVERY_EMAIL`. Record the real address only in the private Bitwarden deployment record and the `Infrastructure` collection.

1. Sit with the primary owner for this setup so both the owner and developer understand what the account is for.
2. Open Proton Mail's official sign-up page or install the official Proton Mail mobile app from the phone's app store.
3. Choose the **Free** plan. A paid Proton plan is not needed for this recovery mailbox.
4. Choose a neutral, long-lived mailbox name connected to the property/business rather than to one person's name. Do not use examples from this guide as the actual address.
5. In Bitwarden, create a new login item inside the `Infrastructure` collection for the business recovery mailbox.
6. Use Bitwarden's password generator to create a long, unique password. Save it directly into that login item; do not reuse it for any other service.
7. Create the Proton account using that password.
8. Do not connect `YOUR_DOMAIN` to this Proton account. Proton custom-domain mail is a paid feature, and this particular mailbox is intentionally independent from the domain.
9. Sign in and verify that the inbox works.
10. Install the Proton Mail mobile app on the primary owner's phone. Because this is a single Proton account, do not install it on every family member's phone. For this project, the developer may also keep one authorized session/device because the developer is the long-term technical administrator; treat that as controlled break-glass access, not as a normal multi-user mailbox.
11. Complete Proton's Free-plan starter actions if offered so the mailbox receives its full available free storage allowance.
12. Send one test message to the new mailbox from an unrelated email account and confirm it arrives on the primary owner's phone and on the developer's authorized device/session if the developer keeps one.
13. Update the Bitwarden deployment record with the real recovery-mailbox address and note which people/devices currently have authorized access.
14. If Bitwarden's Organization settings permit a separate billing/contact email, change that field from the primary owner's email to `BUSINESS_RECOVERY_EMAIL`.

Use this mailbox for:

- registrar/domain ownership and recovery;
- Cloudflare account recovery and important billing/security notices;
- Resend team/account recovery;
- GitHub organization billing/contact notices where GitHub allows a separate organization contact;
- password-manager billing/contact information;
- emergency provider support.

Do **not** use it as the normal reservations/contact mailbox and do not publish it on the website.

Official references: [Proton Free plans](https://proton.me/support/proton-plans), [Proton Mail support](https://proton.me/support/mail), and [custom domains](https://proton.me/support/custom-domain).

### 5.4 Secure the recovery mailbox with two-factor authentication and offline recovery material

The recovery mailbox is a high-value account because it can reset other services. Protect it before using it to register infrastructure.

1. In Proton, open **Settings > All settings > Account and password**.
2. Enable two-factor authentication. Proton supports authenticator-app 2FA on Free plans.
3. Pair the primary owner's authenticator device.
4. Add the developer's authenticator device as another supported 2FA device. Proton supports multiple 2FA devices. Do not photograph or permanently save the setup QR code.
5. Proton will provide one-time 2FA recovery codes. Print or carefully write a copy and place it in a sealed envelope or other secure owner-controlled physical location.
6. Create a second sealed/offline copy only if the family has a genuinely separate secure location. Do **not** make the Bitwarden vault the only home of the Proton 2FA recovery codes, because the Proton password is already stored in that vault.
7. Tell the secondary owner where the emergency recovery material is kept. The secondary owner does not need to use Proton, GitHub, or Cloudflare routinely.
8. In the Bitwarden deployment record, write only the **location/status** of the recovery codes, not necessarily the codes themselves.
9. If the family later purchases physical FIDO2/security keys, Proton can register multiple keys. Keeping one with the primary owner and another in a separate emergency location is a stronger optional setup.
10. Test a normal Proton sign-in from a private/incognito browser: enter the password and then complete 2FA. Do not consume a recovery code during the test.

Official references: [Proton two-factor authentication](https://proton.me/support/two-factor-authentication-2fa) and [security keys](https://proton.me/support/2fa-security-key).

### 5.5 Apply one ownership rule to every service from now on

For every service in the rest of this guide, use this rule:

1. The **business owns the resource**: domain, Cloudflare account, GitHub Organization, Resend team, production database, storage, billing, and recovery path.
2. The **developer uses an individual account** for normal work whenever the provider supports members/teams/organizations.
3. At least one actual owner has an independent recovery/owner path.
4. A generic business/root login, when a provider requires or benefits from one, is a **break-glass account**, not the daily login.
5. Never give employees or unrelated contractors the root/recovery mailbox password. Give them individual access with the minimum role they need.
6. Use a different random password for every provider login that genuinely requires a password.
7. Enable 2FA/MFA everywhere it is supported.
8. Keep critical recovery codes in owner-controlled offline emergency material; the private deployment record should say where they are stored without exposing them in Git.
9. Use a business/owner payment method for the domain and production services, not the developer's personal card as the permanent billing source.
10. Record account IDs, organization/team names, owners/admins, renewal dates, and recovery status in the private deployment record.

### 5.6 Perform a recovery test before continuing

Before buying the domain, verify the ownership model works in practice:

1. The primary owner opens Bitwarden on their own device and confirms they can see the `Infrastructure` collection and deployment record.
2. The primary owner confirms they can sign in to the business recovery mailbox using their own 2FA device.
3. The developer confirms the same from a separate device/browser.
4. The secondary owner confirms they know where the sealed emergency recovery material is kept, without opening or photographing it.
5. Confirm that no production account created later will depend solely on the developer's personal email, personal payment card, personal password vault, or personal GitHub namespace.

Only after this test should you create the registrar/Cloudflare/GitHub/Resend production ownership structure.

## 6. Choose and buy the domain

### 6.1 Choose the name

Prepare three to five choices because the first may already be taken. Prefer:

- a short name that is easy to say and type;
- no accents in the domain itself;
- no confusing spelling;
- a suitable extension such as `.pt` for the Portuguese market or `.com` for wider recognition.

Check that the same name is not impersonating another accommodation or registered brand. Also check the intended social usernames.

### 6.2 Buy through Cloudflare when supported

1. Go to [Cloudflare](https://dash.cloudflare.com/sign-up) and create the business's Cloudflare login using `BUSINESS_RECOVERY_EMAIL`. Generate a unique password and store it in the Bitwarden `Infrastructure` collection. Treat this login as the break-glass/business identity, not the developer's normal daily login.
2. Verify the account email through the business recovery mailbox.
3. Enable Cloudflare two-factor authentication on this business login and save recovery material in the vault plus the owner-controlled offline recovery location.
4. In **Account > Members**, invite the developer's individual Cloudflare account/email as a **Super Administrator**. If the developer does not yet have a personal Cloudflare login, accept the invitation using the developer's own individual email and create one.
5. Invite at least one actual owner using their own individual email as another Super Administrator or otherwise ensure the primary owner can independently regain full account control.
6. Log out of the business/root Cloudflare login, sign in with the developer's individual Cloudflare account, and confirm the O Refúgio Cloudflare account is visible. Use the developer's individual member login for normal administration from now on.
7. Add the owners'/business payment method. Do not leave the developer's personal payment card as the permanent production billing method.
8. In the dashboard, open **Domain Registration > Register Domains**.
9. Search for the exact domain without `https://` or `www`.
10. Confirm the spelling and current renewal price, not only the first-year price.
11. Select the registration period.
12. Enter accurate registrant contact details using ordinary ASCII characters if the form requires it. The registrant must be the appropriate owner/business party, not the developer personally.
13. Keep auto-renew enabled.
14. Complete the purchase and save the invoice in the owner-controlled business records.
15. Verify any registrant email sent after purchase.
16. Record the domain, registrant, renewal date, Cloudflare account ID, and current Super Administrators in the deployment record.

Cloudflare domains already use Cloudflare nameservers. No separate DNS transfer is needed.

### 6.3 If Cloudflare does not sell the chosen extension

For example, if the desired `.pt` option is not offered, use an accredited registrar shown by the `.PT` registry or another reputable registrar.

1. Create the registrar account with `BUSINESS_RECOVERY_EMAIL`, a unique password stored in Bitwarden, owner/business registrant details, business payment details, and 2FA. Buy the domain in that account. If the registrar supports individual members, invite the developer rather than using the root login every day.
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

## 8. Move the existing repository into a business-owned GitHub Organization

The approved prototype already lives in a repository under the developer's personal GitHub account. Keep using the developer's personal GitHub identity for day-to-day development, but move the **repository ownership** into a GitHub Organization controlled by the family/business.

Do **not** create a generic shared GitHub personal account for the property. GitHub personal accounts represent individual people, and GitHub requires each person who accesses an Organization to use their own personal account. The correct shared business container is a **GitHub Organization**. GitHub recommends at least two organization owners for continuity.

### 8.1 Prepare the human GitHub accounts

1. The developer keeps their existing personal GitHub account. Do not convert or abandon it.
2. Choose the primary owner from Section 5 to be the non-developer GitHub Organization owner.
3. If that owner already has a GitHub personal account, use it.
4. If they do not have one, sit with them and have **the owner create their own personal GitHub account**. You may guide the screens, but the account represents that individual; do not create a fake generic business person.
5. The owner uses an email address they personally control and can recover. Do not use `BUSINESS_RECOVERY_EMAIL` as a shared human GitHub login.
6. Enable two-factor authentication on both the owner's and developer's GitHub accounts.
7. Save each person's GitHub recovery codes in that person's appropriate secure storage. The owner may also place an emergency copy with the family recovery material.

Official references: [GitHub accounts in organizations](https://docs.github.com/en/organizations/managing-membership-in-your-organization/can-i-create-accounts-for-people-in-my-organization) and [organization ownership continuity](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/maintaining-ownership-continuity-for-your-organization).

### 8.2 Create the O Refúgio GitHub Organization

Do this while signed in as the primary owner's personal GitHub account if practical. If the developer creates it first for convenience, add/promote the owner to Organization Owner **before** transferring the repository.

1. In GitHub, open the profile menu and choose **Your organizations**.
2. Choose **New organization**.
3. Select the GitHub Free organization plan unless a paid feature is actually needed.
4. Choose an organization name connected to the property/business. Record the exact name in the private deployment record.
5. If GitHub asks for organization contact/billing information, use business-controlled information and use `BUSINESS_RECOVERY_EMAIL` where an organization-level contact address is appropriate.
6. Finish creating the Organization.
7. Open the Organization's **People** page.
8. Invite the developer's existing personal GitHub account.
9. After the developer accepts, change the developer's Organization role to **Owner**.
10. Confirm the primary owner is also an **Owner**.
11. The Organization must now have at least two human owners: one owner/family member and the developer. A second family owner may also be added later, but do not create shared personal accounts to achieve this.
12. In **Organization Settings > Member privileges**, keep destructive privileges conservative. In particular, avoid allowing ordinary members to delete or transfer repositories unless there is a specific need.

### 8.3 Review the existing repository before transfer

1. Open the repository that currently publishes the approved GitHub Pages prototype.
2. Record its current URL and the GitHub Pages prototype URL in the private deployment record.
3. Review the repository and Git history for `.env`, `.dev.vars`, API keys, database exports, real guest data, attachments, or other secrets/private data.
4. If any real secret was ever committed, deleting the file from the latest commit is not enough. Rotate/revoke the exposed secret and clean the history appropriately before production use.
5. Demo passwords or seed credentials visible in the prototype must never become production credentials.
6. If the repository is public because of the existing Pages prototype, remember that every committed file and historical commit intended to remain public must be treated as public information. Production secrets will be stored in Cloudflare/other provider secret stores, never in Git.

### 8.4 Transfer the existing repository to the Organization

The developer must have admin access to the existing repository and sufficient permissions in the destination Organization.

1. Sign in to the developer's personal GitHub account.
2. Open the existing repository.
3. Open **Settings** for that repository.
4. Scroll to **Danger Zone**.
5. Find **Transfer** / **Transfer ownership** and select it.
6. Read GitHub's transfer warnings carefully, especially anything about GitHub Pages, packages, Actions, secrets, or features affected by the move.
7. Choose the new O Refúgio Organization as the new owner.
8. Keep the repository name unchanged unless there is a deliberate reason to rename it.
9. Type the repository name when GitHub asks for confirmation.
10. Confirm the transfer.
11. Open the repository under the Organization and verify issues, branches, Actions, settings, Pages configuration, and collaborators are still present as expected.
12. Open the existing GitHub Pages prototype URL and confirm the approved reference site still works. If Pages or its URL changed, update the private deployment record and any temporary reference links.
13. From the local project folder, run:

```powershell
git remote -v
git fetch origin
git status
```

14. GitHub normally redirects the old repository URL after a transfer, but update the local `origin` to the Organization URL explicitly so there is no ambiguity:

```powershell
git remote set-url origin https://github.com/YOUR-ORGANIZATION/refugio-site.git
git remote -v
```

15. Confirm `origin` now shows the Organization repository for fetch and push.
16. Push a harmless documentation-only branch and confirm it appears under the Organization before starting production backend work.

Official reference: [transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).

### 8.5 Create the production-development branch

From the project folder:

```powershell
git status
git branch --show-current
git switch -c production/backend-foundation
npm ci
npm run check
```

Before every commit, inspect `git status`. Never commit `.dev.vars`, `.env`, API keys, database exports, contact attachments, recovery codes, the real `BUSINESS_RECOVERY_EMAIL`, or real guest data.

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

### 10.1 Log Wrangler in with the developer's individual Cloudflare member account

From the project folder, run:

```powershell
npx wrangler login
npx wrangler --version
```

A browser opens. Sign in with the developer's **individual Cloudflare member account** that was invited to the O Refúgio Cloudflare account in Section 6, then approve Wrangler. Do not use the shared/break-glass business login for routine CLI work. Return to PowerShell and confirm the Wrangler version prints successfully. Do this before creating staging or production resources.

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

The cheapest setup can route addresses such as `reservas@YOUR_DOMAIN` and `contacto@YOUR_DOMAIN` to an existing mailbox that the owners actually monitor. Do not automatically route customer correspondence into `BUSINESS_RECOVERY_EMAIL`; keep the root recovery mailbox quiet and reserved for infrastructure/recovery unless there is a specific temporary reason.

1. In Cloudflare, go to **Email > Email Routing**.
2. Add the real destination mailbox.
3. Open the verification email at that destination and approve it.
4. Create routing addresses for reservations and contact.
5. Send a test from an unrelated email account to each routed address and confirm it arrives at the destination mailbox.

Cloudflare Email Routing is forwarding, not a normal outbound mailbox. Replying from the destination mailbox will normally send **from that destination address**, not automatically from `reservas@YOUR_DOMAIN`. Use a mailbox/SMTP provider (or a correctly configured “send as” feature backed by an SMTP service) if staff need to write manual replies from the custom-domain address, need a shared inbox/calendar, or need mailbox storage.

### 12.2 Send transactional messages with Resend

1. Create the business Resend account/team using `BUSINESS_RECOVERY_EMAIL`, a unique password, and the business recovery details. Do not use Google/GitHub social login for the root business identity; use Resend's email/password sign-up so recovery does not depend on another provider account.
2. In **Team Settings**, give the team a clear business name and invite the developer's individual Resend account/email as an **Admin**. Resend teams support individual Admin/Member roles; use the developer's individual login for normal work after the invitation is accepted. Keep at least one owner-controlled admin/recovery path.
3. Record the Resend team name and administrators in the private deployment record.
4. Add a sending subdomain such as `updates.YOUR_DOMAIN`; isolating transactional sending protects the main domain's reputation.
5. Resend shows DNS records for SPF and DKIM.
6. Add those records in Cloudflare DNS exactly as shown.
7. Wait for Resend to mark the domain verified.
8. SPF and DKIM are required for Resend verification. Add DMARC separately with a cautious initial policy such as `p=none`, review reports and all legitimate senders, then tighten it only when safe.
9. Create a production API key and a separate staging key. As of 2026-08-30, Resend Free allows up to three verified domains, so a separate staging sending domain/subdomain is now practical if desired; still keep a strict staging recipient allow-list so tests can never mail real guests accidentally.
10. Put each key into the matching Worker as a secret:

```powershell
npx wrangler secret put RESEND_API_KEY --env staging
npx wrangler secret put RESEND_API_KEY --env production
```

11. Never paste the key into JavaScript, JSON, `wrangler.toml`, GitHub, or screenshots.
12. Configure a real reply-to address that owners monitor. If `updates.YOUR_DOMAIN` is the verified Resend domain, use a From address on that verified subdomain (for example `bookings@updates.YOUR_DOMAIN`) and set `Reply-To: reservas@YOUR_DOMAIN` if replies should enter the routed owner mailbox.
13. Test acknowledgement, payment instructions, confirmation, pre-arrival, checkout, and feedback messages in every supported language.
14. Store provider message IDs and delivery results, but avoid retaining unnecessary full message bodies forever.

Resend's official guides cover [team management](https://resend.com/docs/dashboard/settings/team), [domain verification](https://resend.com/docs/dashboard/domains/introduction), and [sending email](https://resend.com/docs/api-reference/emails/send-email). Cloudflare's [secrets documentation](https://developers.cloudflare.com/workers/configuration/secrets/) explains encrypted Worker secrets.

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
