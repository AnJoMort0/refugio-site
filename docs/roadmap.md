# O Refúgio — Product Roadmap

## Project strategy

The project is currently in the **prototype phase**. The immediate goal is to complete the public website and in-stay guest experience, then improve booking, contact, content, pricing, and administrative workflows in small, testable increments.

Routine operational changes should be manageable through the Cloudflare-hosted admin application. Owners should not need to edit source code, configuration files, or Cloudflare settings to update prices, availability, guest information, or local-guide content.

## Status legend

- [x] Completed
- [ ] Planned
- [~] In progress
- [!] Requires a decision, content, or external dependency
- [c] Codex changed

---

# Phase 1 — Complete the public website prototype

## 1.1 Existing page scaffolds

A scaffold means a made static HTML page ready for owner review/approval. A placeholder shell does not count.

- [x] Homepage
- [x] Alojamento page
- [x] Galeria page
- [x] Reservas page
- [x] Reserva enviada page
- [x] Contacto page
- [x] Obrigado.html
- [ ] Guia Local page
- [ ] Guest Stay page for QR/NFC access
- [x] Custom `404.html` page

## 1.2 Immediate content and consistency fixes

### Tweaks

- [~] Admin page
  - [ ] Calendar
    - [ ] Have a text box where they can paste the text of the booking.com email in there and the app would look for the information to fill up the field, need to use an example of email to be able to code the data scrapper.

## Additions

---

# Phase 2 — Contacto page follow-up checklist

The current `contacto.html` page already has a usable prototype flow: structured contact form, required name/email/message fields, language preference, preferred reply method, optional context and assunto fields, phone validation, locked phone-dependent reply options, optional marketing checkbox, attachment picker with selected-file summary, Google Maps/Facebook/Instagram links, URL prefill support, and a basic `obrigado.html` success page.

## 2.1 Later if needed — data, consent, and delivery

- [ ] Connect the form to a real backend, email service, CRM, or admin inbox instead of the current GET-based prototype redirect.
- [ ] Connect selected attachments to real upload/storage/email delivery once the contact backend exists.
- [ ] Store enough submitted context for staff to handle the enquiry efficiently.
- [ ] Add a required privacy-policy acknowledgement once the privacy-policy page/text exists.
- [ ] Store marketing consent status and timestamp if marketing messages will actually be sent.
- [ ] Provide a clear unsubscribe method before sending future marketing communications.

## 2.2 Later if needed — reliability and abuse protection

- [ ] Prevent accidental duplicate submissions after a real backend exists.
- [ ] Display actionable backend error messages if message delivery fails.
- [ ] Add spam protection suitable for the final hosting setup.
- [ ] Add monitoring or logs for failed contact submissions.

## 2.3 Later if needed — richer contact help

- [ ] Add FAQ entries for the most common contact topics.
- [ ] Add reservation/request reference fields if staff need those to match messages faster.
- [ ] Add direct telephone, WhatsApp deep link, copy-number, and `.vcf` contact-card actions if the page should become a fuller contact hub.
- [ ] Link current guests to the future Guest Stay page for urgent or stay-specific information once that page exists.

---

# Phase 4 — Local discovery and the in-stay guest experience

## 4.1 Guia Local — public local discovery guide

### Purpose and scope

The Guia Local is a public page for people planning a stay and guests who want to explore the surrounding area. It should focus on **what is nearby, what to do, and selected sponsors or partners**.

It should not contain private reservation details, Wi-Fi credentials, house rules, or stay-specific emergency instructions. Those belong on the Guest Stay page.

### Content categories

- [ ] Restaurants, cafés, bakeries, and bars.
- [ ] Attractions, walks, nature, beaches, culture, and entertainment.
- [ ] Nearby supermarkets, grocery shops, pharmacies, fuel stations, and other practical stores.
- [ ] Transport options, parking, taxis, and useful travel services.
- [ ] Family-friendly, rainy-day, accessible, and seasonal suggestions.
- [ ] Sponsored businesses, partners, offers, or discount codes.
- [ ] A short “essentials nearby” section for guests who need practical services rather than entertainment.

### Listing information

Where available, each listing should include:

- [ ] Name and category.
- [ ] Short description and why it is recommended.
- [ ] Approximate distance or travel time from O Refúgio.
- [ ] Address and map/directions link.
- [ ] Telephone and website or social link.
- [ ] Typical opening hours, with a reminder that they may change.
- [ ] Accessibility, booking, age, or seasonal notes where relevant.
- [ ] A visible **Sponsored** or **Partner** label when applicable.

### Page features

- [ ] Category filters and a simple search.
- [ ] List and map views, if the map remains clear on mobile.
- [ ] “Near me” or distance sorting only after the visitor grants location permission.
- [ ] Favourite/share actions that do not require an account.
- [ ] Language-aware external links and telephone actions.
- [ ] Clear separation between editorial recommendations and paid placements.
- [ ] Expiry dates for temporary sponsor offers so outdated promotions disappear automatically.
- [ ] A fallback list when the map or third-party content cannot load.

### Guia Local acceptance criteria

- The page remains useful to visitors who are not currently staying at O Refúgio.
- Nearby stores and practical services are as easy to find as entertainment.
- Sponsored content is clearly identified and does not imitate an independent recommendation.
- Listings can be updated or unpublished from the admin application without editing code.
- External opening hours and prices are not presented as guaranteed unless they are actively maintained.

## 4.2 Guest Stay page — QR/NFC guest hub

### Purpose

Create a mobile-first page for guests who are currently staying at O Refúgio. It should be reachable through a QR code, an NFC tag, and a direct link supplied during check-in or reservation confirmation.

The page should provide the information a guest may need during the stay without requiring them to search through the public website.

### Access and personalisation

- [ ] Check active reservation data and greet current guests by first name.
- [ ] Show only information related to the active stay.
- [ ] Use an expiring signed link, stay code, or equivalent secure token for personalised content.
- [ ] Expire personalised access automatically after checkout and allow staff to revoke it early.
- [ ] Never expose the complete list of current guests through a public or guessable URL.
- [ ] Do not place guest names, reservation references, or stay details in search-engine-indexable content.
- [ ] Show a useful generic guest-information view when personalised access is unavailable.
- [ ] Let a static property NFC tag open the generic guest page; unlock personalised details only after a secure stay link or code is supplied.
- [ ] Use the reservation language when known, otherwise use the browser language and retain manual language selection.

### Recommended page sections

#### Welcome and stay summary

- [ ] Personal greeting using the active guest or booking name.
- [ ] Check-in and checkout dates and times.
- [ ] A simple reminder of remaining extras or actions, without displaying sensitive payment information.
- [ ] Direct buttons to contact the host, report a property problem, or request help.

#### Emergency and urgent contacts

- [ ] Place emergency information near the top of the page.
- [ ] Clearly separate public emergency services from urgent property assistance.
- [ ] Add one-tap telephone links.
- [ ] Add WhatsApp actions only for contacts that support WhatsApp.
- [ ] Include the complete property address and a copy-address button.
- [ ] Include directions back to O Refúgio.
- [ ] Explain what information a guest should provide during an emergency.
- [ ] Keep emergency information available even when personalisation fails.

#### Wi-Fi access

- [ ] Display the network name and password.
- [ ] Add copy buttons for both values.
- [ ] Generate a standards-compatible Wi-Fi QR code using the current network credentials.
- [ ] Let guests reopen or share the QR code so other people in their group can connect their own devices.
- [ ] Provide a manual connection fallback for devices that cannot use the QR code.
- [ ] Regenerate the QR code automatically when staff change the Wi-Fi credentials.
- [ ] Avoid placing Wi-Fi credentials in the public Guia Local or other indexed pages.

#### Mud-wasp warning

- [ ] Add a clear, calm mud-wasp warning.
- [ ] Explain how guests can recognise the issue and what they should avoid doing.
- [ ] Provide the correct action to take and a one-tap way to notify the host.
- [ ] Include photographs or illustrations only when they improve recognition.
- [!] Confirm the exact safety guidance and approved wording before publishing.

#### Bicycle rental during the stay

- [ ] Show bicycle rental information when the reservation does not already include bicycles.
- [ ] Display the price of **€5 per bicycle per day**.
- [ ] Show available dates and quantities when live inventory is supported.
- [ ] Allow the guest to submit a rental request for selected dates.
- [ ] Limit requests to one bicycle per guest per selected day.
- [ ] Show the existing bicycle reservation instead of a second sales prompt when bicycles are already booked.
- [ ] Explain whether the request is immediately confirmed or requires host approval.
- [ ] Notify staff and add approved bicycle rentals to the reservation record and daily inventory.

#### House rules and property information

- [ ] House rules in a short, scannable format.
- [ ] Quiet hours.
- [ ] Smoking, pets, visitors, parties, and occupancy rules.
- [ ] Kitchen, heating, television, appliance, waste, and recycling guidance where useful.
- [ ] Parking and access instructions.
- [ ] Check-out checklist and key-return instructions.
- [ ] Instructions for reporting damage, maintenance problems, or missing items.
- [ ] Accessibility and safety notes relevant to the property.

#### Guia Local call to action

- [ ] Add a prominent link to Guia Local.
- [ ] Explain that it includes activities, food, nearby shops, practical services, and sponsored recommendations.
- [ ] Preserve the guest’s selected language when moving between the two pages.
- [ ] Provide a clear route back to the Guest Stay page.

### QR and NFC delivery

- [ ] Place a durable QR code and NFC tag in an appropriate location inside the property.
- [ ] Test QR scanning in low light and from a reasonable distance.
- [ ] Encode a stable short URL so the destination can change without replacing printed tags.
- [ ] Make the NFC interaction open the same stable URL as the QR code.
- [ ] Include a short printed URL as a fallback.
- [ ] Keep the destination fast and usable on weak mobile connections.
- [ ] Add a version or last-updated date for rules and safety information.
- [ ] Prepare a replacement process for damaged or missing tags.

### Guest Stay page acceptance criteria

- A valid current-stay link greets the correct guest without revealing other guests.
- An expired, revoked, or invalid link does not expose personal reservation information.
- Emergency contacts remain immediately accessible on a small mobile screen.
- Wi-Fi credentials can be copied and the Wi-Fi QR code works on supported devices.
- Bicycle content changes according to whether bicycles are already included.
- House rules and warnings can be updated from the admin application.
- QR, NFC, and typed-link access all reach a usable page.
- The page loads quickly and does not depend on a guest creating an account.

---

# Phase 5 — Supporting pages and conversion improvements

## 5.1 Marketing and communication preferences

- [x] Add an optional promotions, offers, deals, and news checkbox in suitable forms.
- [ ] Store consent status and timestamp.
- [ ] Provide a clear unsubscribe method for future marketing communications.
- [x] Avoid combining service messages with marketing consent.

---

# Phase 6 — Admin application roadmap

The admin application should be designed for owners who are not highly technical. Routine work must be completed through clear forms, previews, and confirmation steps in the Cloudflare-hosted admin interface rather than by editing code or deployment settings.

## 6.0 Admin prototype foundation

- [x] Replace the placeholder `admin.html` with a Portuguese-only standalone admin management prototype.
- [x] Remove the public footer link to `admin.html` so the admin is not presented as guest navigation.
- [x] Add an owner/dev/employee login gate for the prototype with named accounts and hashed demo passwords.
- [x] Remember the last selected admin login account locally so returning users do not need to scroll the user menu again.
- [x] Add a central permission map for owner and employee capabilities.
- [x] Add a replaceable local repository/service layer so the UI is not tied directly to static JSON or page markup.
- [x] Add stable-ID demo entities for reservations, website requests, guests, pricing, discounts, expenses, employees, work sessions, and audit log entries.
- [x] Add a dashboard showing current guests, next arrival/departure, pending website requests, awaiting-payment reservations, revenue, expenses, and active work sessions.
- [x] Add a detailed month calendar with reservation status markers, selected-day details, and website request visibility.
- [x] Add reservation search/filtering and a manual reservation form with conflict detection and owner override confirmation.
- [x] Add a website request queue with accept/reject actions and conversion into an awaiting-payment reservation.
- [x] Add `preferred_language` compatibility to the public reservation redirect so future website request storage can infer the guest communication language.
- [x] Add copyable multilingual guest message templates separate from Portuguese-only admin UI text.
- [x] Add owner-facing prototype sections for pricing, discounts, expenses, employees, employee rate history, employee time tracking, statistics, data export, and demo-data reset.
- [x] Add work-hour tracking for owners as well as employees.
- [x] Add paid, free, and voluntary work types so invested owner/volunteer time is tracked without becoming wage cost.
- [x] Add task checkboxes for work sessions: check-in, check-out, cleaning, bureaucracy, maintenance/repairs, shopping, and other details.
- [x] Document the prototype security/storage limits and Cloudflare migration path in `docs/admin-architecture.md`.
- [!] Before real data is used, replace the localStorage demo repository with authenticated server-side APIs and private storage.

## 6.1 Calendar management overview

- [x] Create a consolidated reservation calendar.
- [x] Show property occupancy and reservation status.
- [!] Add day, week, month, and agenda views.
- [x] Provide clear visual distinction between requests, provisional holds, confirmed reservations, external bookings, maintenance, and unavailable periods.
- [ ] Provide printable and mobile-friendly arrival, departure, and occupancy views.

## 6.2 Pricing, seasonal rates, and availability management

### Owner-friendly price controls

- [x] Allow authorised owners to change base accommodation prices from the admin application.
- [x] Support seasonal prices with a start date, end date, name, and optional notes.
  - Note: Added in the admin prototype with date-overlap checks; public price calculation still needs the final shared backend source.
- [!] Support day-of-week and weekend adjustments.
- [x] Support special-event, holiday, or one-off date overrides.
- [x] Keep bicycle pricing and other extras separate from accommodation pricing.
- [ ] Provide a calendar-style price editor for quick date-range changes.
- [x] Provide a simple form mode for owners who prefer not to edit a pricing grid.

### Price calculation and safety

- [x] Define a clear precedence order for overlapping base, seasonal, weekend, and date-specific rules.
- [ ] Preview the final guest price before publishing a rule.
- [ ] Show which pricing rules produced the calculated total.
- [~] Warn about gaps, overlaps, unusually large changes, and impossible stay rules.
  - Note: Seasonal date overlaps are blocked in the prototype; gap/unusual-change/impossible-stay warnings remain planned.
- [ ] Keep an audit history of who changed a price, what changed, and when.
- [ ] Allow an authorised owner to restore a previous pricing configuration.
- [ ] Do not silently reprice confirmed reservations.
- [ ] Require an explicit choice before applying a new price to an existing request or reservation.
- [ ] Test price changes against sample stays before publication.
- [~] Ensure the website and admin application use the same price-calculation source.
  - Note: Public booking now reads the admin prototype localStorage prices when present; final launch still needs a shared server-side pricing source.

### Availability controls

- [ ] Allow manual closure of dates without creating a fake reservation.
- [ ] Explain whether a closure is maintenance, owner use, operational, or another reason.
- [ ] Optionally set an automatic reopening date.
- [ ] Prevent pricing rules from making a closed date bookable.

## 6.3 Reservation creation, confirmation, and import

### Manual reservation entry

- [x] Allow authorised staff to create a reservation directly from the reservation list.
- [~] Collect guest details, room, dates, guest count, source, price, payment status, extras, language, and internal notes.
  - Note: The prototype collects guest details, dates, guest count, source, extras, language, status, discounts, deposit choice, and owner notes; room selection is not needed while the property is modeled as one unit.
- [~] Check availability, occupancy limits, maintenance blocks, and bicycle inventory before saving.
  - Note: The prototype checks date conflicts and occupancy limit; maintenance blocks and bicycle inventory checks remain planned.
- [~] Allow provisional, awaiting-payment, confirmed, checked-in, checked-out, cancelled, and no-show states.
  - Note: The data model includes these statuses; the manual create UI currently offers the most useful first statuses.
- [x] Record the staff member and time for every manually created reservation.
- [x] Clearly distinguish internal notes from guest-visible information.
- [ ] Detect likely duplicate reservations before saving.

### Copy-ready reservation confirmation email

After a manual reservation is prepared, generate an editable email that staff can copy and paste to the guest.

- [x] Generate the email in the guest’s preferred language.
- [~] Include the guest name, stay dates, accommodation, guest count, price, deposit or amount due, and payment deadline.
  - Note: The prototype message includes guest name, stay dates, guest count, total, and reservation reference; final bank/payment details and legal wording still need confirmation.
- [ ] Include the correct IBAN, account-holder name, bank-transfer reference, and transfer instructions.
- [ ] Include cancellation terms, important booking conditions, and contact details.
- [x] Add a one-click **Copy email** action with a clear copied confirmation.
- [ ] Let staff edit the generated text before copying it.
- [~] Provide approved templates for confirmation, payment reminder, amendment, and cancellation.
  - Note: The prototype includes payment instructions, combined reservation/payment confirmation, pre-arrival, checkout, and post-stay feedback templates in Portuguese, French, English, Spanish, and German.
- [ ] Store the template version used without storing unnecessary clipboard contents.
- [!] Confirm the final IBAN, account-holder details, payment deadline, and approved legal wording.

### Website reservation requests and bank-transfer confirmation

- [~] Add new website requests to the admin queue automatically.
  - Note: The prototype includes a queue backed by demo data; wiring public reservation submissions into the queue needs a real persistence/API layer.
- [ ] Optionally place a temporary calendar hold while the request awaits review or payment.
- [ ] Display the hold-expiry time and release expired holds automatically.
- [~] Let staff approve, reject, edit, or request more information.
  - Note: The prototype supports prepare/approve through the reservation form, reject with a draft response, restore rejected requests, and respond without changing request status; deeper request editing remains planned.
- [x] Let staff mark a bank transfer as received after checking the bank account.
- [x] Convert the request into an awaiting-payment reservation and then a confirmed reservation after manual payment confirmation.
- [x] Add the accepted reservation to the calendar without re-entering guest data.
- [!] Prevent confirmation when dates have become unavailable.
- [x] Generate the appropriate confirmation or rejection email.
  - Note: The prototype generates payment instructions, combined reservation/payment confirmations, and rejection/response drafts. Final approved legal/payment wording remains open.
- [!] Keep the original request, changes, payment status, and staff actions in the audit history.
- [ ] Notify staff when a request has remained unanswered or unpaid for too long.

### Booking.com email paste import

Create a review-first importer where staff can paste a Booking.com reservation email and have the admin application extract the relevant information.

- [ ] Extract the booking reference, guest name, dates, guest count, room or unit, price, currency, payment details, commission where present, special requests, and contact information.
- [ ] Identify whether the pasted email represents a new reservation, modification, or cancellation.
- [ ] Match imported accommodation names to the correct internal room or unit.
- [ ] Highlight missing, uncertain, or conflicting fields.
- [ ] Require staff review and confirmation before creating or changing a reservation.
- [ ] Detect duplicates using the source, booking reference, dates, and guest details.
- [ ] Preserve the original source and booking reference for reconciliation.
- [ ] Avoid storing the full pasted email longer than necessary unless retention is explicitly required.
- [ ] Support the known email languages and formats used by the owners.
- [ ] Fail safely when Booking.com changes its email layout.
- [ ] Provide a manual correction form when parsing is incomplete.
- [ ] Record the importer version and staff member responsible for approval.
- [ ] Consider a later direct channel-manager, calendar-feed, or API integration if email parsing becomes unreliable or too time-consuming.

### Reservation workflow acceptance criteria

- A manually entered reservation cannot create an unnoticed calendar conflict.
- A website request becomes a confirmed calendar reservation without duplicate data entry.
- Bank transfers are never treated as received without an explicit staff action.
- Generated emails use the correct reservation data and editable approved templates.
- Pasted Booking.com emails always require a human review before changing the calendar.
- Duplicate detection prevents the same external booking from being entered twice.
- Every creation, import, status change, and confirmation is attributable to a staff account.

## 6.4 Employee access and records

- [x] Add employee accounts with limited permissions.
- [x] Restrict employees to the information required for their role.
- [x] Add views for pay, hours worked, and related records.
- [x] Track unpaid owner/volunteer work separately from paid employee work.
- [~] Define which roles may view, create, edit, approve, or export employee information.
- [ ] Keep salary and personal employee data out of general reservation permissions.
- [~] Record access and changes to sensitive employee records.
  - Note: The prototype records important admin actions in a local audit log; production audit records must be server-side.
- [ ] Require stronger authentication for owners and staff with financial or employee access.
- [ ] Provide a fast way to disable access when a staff member leaves.

## 6.5 Guest history, logs, and reporting

- [~] Create a complete, organised history for every guest.
  - Note: The prototype creates reusable guest records and links reservations to guest IDs; a full guest-history view remains planned.
- [ ] Connect repeat stays without incorrectly merging different people.
- [~] Keep reservation changes, cancellations, messages, extras, payments, imports, and staff actions in an audit trail.
  - Note: The prototype logs key actions locally; imports and immutable server-side auditing remain planned.
- [~] Add yearly summary statistics.
  - Note: The prototype includes basic reservation, revenue, source, and language statistics.
- [ ] Define core metrics, including:
  - Reservations and reservation requests
  - Confirmed stays
  - Cancellations and no-shows
  - Occupancy
  - Revenue
  - Average daily rate and average stay length
  - Booking source and commission
  - Guest origins and languages, where appropriate and lawful
  - Repeat guests
  - Bicycle hire usage and revenue
  - Maintenance downtime
  - Outstanding and received bank transfers
- [ ] Add export options for authorised administrators.
- [ ] Define data-retention and privacy rules before treating the guest log as permanent.
- [ ] Make reports reproducible from the underlying reservation and payment records.
- [ ] Avoid using sensitive guest data in statistics when aggregated data is sufficient.

## 6.6 Content, settings, and communication management

Provide owner-friendly controls for frequently changing website and guest information.

- [ ] Manage Guia Local listings, categories, sponsor labels, offers, display order, and expiry dates.
- [ ] Manage Guest Stay page Wi-Fi credentials, emergency contacts, rules, warnings, announcements, and check-out instructions.
- [ ] Manage contact details, social links, property address, map links, and review links.
- [ ] Manage bicycle inventory, pricing, availability, and request wording.
- [ ] Manage IBAN and bank-transfer instructions with restricted financial permissions.
- [ ] Manage multilingual email templates and website text that changes frequently.
- [ ] Preview changes in every supported language before publishing.
- [ ] Schedule content to appear and disappear automatically.
- [ ] Keep draft, published, archived, and expired states.
- [ ] Record who changed public, guest-only, safety, financial, or legal content.

## 6.7 Admin acceptance criteria

- [c] Permissions follow the principle of least privilege in the prototype permission map.
- [~] Important changes are attributable to a staff account and timestamp.
- Maintenance and availability blocks reliably prevent conflicting reservations.
- Owners can change prices and seasonal rules without editing code.
- Price previews match the amounts displayed on the booking website.
- Website requests and reviewed external imports populate the same reservation calendar.
- [~] Sensitive financial, guest, and employee information is not exposed to unauthorised staff.
  - Note: The prototype UI gates access by role but must use authenticated server-side APIs before real sensitive data is entered.
- Safety-critical guest information can be updated quickly and has a visible last-updated time.
- [c] Destructive or high-impact actions require a confirmation step where implemented.

---

# Recommended delivery order

## Milestone A — Finish the prototype

- [x] Contacto Enviado page scaffold
- [ ] Guia Local scaffold
- [ ] Guest Stay page scaffold
- [x] `404.html`
- [x] “O Refúgio” naming corrections
- [x] Television information correction
- [x] Homepage address and Alojamento map

## Milestone B — Make contact and booking flows usable

- [~] Complete the Contacto form
- [x] Add browser-language defaults
- [x] Add bicycle reservation extras
- [~] Add success, error, validation, and spam-protection behaviour
- [x] Add the first manual reservation form and calendar conflict checks
- [~] Add copy-ready reservation confirmation emails with bank-transfer details
- [x] Convert manually approved website requests into awaiting-payment reservations, then confirmed reservations after payment is marked received

## Milestone C — Launch local and in-stay guest information

- [ ] Build the public Guia Local with activities, nearby stores, practical services, and sponsor labels
- [ ] Build secure Guest Stay page access for QR, NFC, and direct links
- [ ] Add emergency contacts, Wi-Fi QR, house rules, and mud-wasp guidance
- [ ] Add conditional bicycle rental information for current guests
- [ ] Add admin controls for guest information and Guia Local listings
- [ ] Test access expiry and personal-data protection

## Milestone D — Add pricing and external reservation operations

- [x] Add base, seasonal, weekend, and date-specific price controls
- [ ] Add price previews, rule precedence, drafts, publishing, and audit history
- [ ] Add temporary reservation holds and bank-transfer statuses
- [ ] Add the review-first Booking.com email paste importer
- [ ] Add duplicate detection and external booking references
- [ ] Add approved multilingual email templates

## Milestone E — Complete operational tooling

- [x] Add the admin prototype foundation with role-based navigation, dashboard, local data layer, and owner/employee flows
- [x] Expand the admin calendar and maintenance controls
- [ ] Add mid-stay guest additions
- [x] Add employee access and records
- [~] Add guest history and audit logs
- [~] Add yearly statistics and exports
- [ ] Add stronger authentication, protected APIs, role management, and recovery controls

---

# Open decisions and required information

- [!] Supported website languages and the fallback language.
- [!] Final public name and URL for the Guest Stay page.
- [!] Secure personalisation method: signed stay link, reservation code, or another token model.
- [!] Whether the static QR/NFC tag opens only generic content or also starts a secure guest-verification flow.
- [!] Wi-Fi network name, security type, password-management process, and who may update it.
- [!] Final emergency contacts, urgent property contacts, and approved emergency wording.
- [!] Approved house rules, check-in/check-out instructions, and appliance guidance.
- [!] Approved mud-wasp safety guidance and any supporting images.
- [!] Bicycle inventory, approval workflow, and whether in-stay rental requests can be confirmed instantly.
- [!] Guia Local categories, initial listings, sponsor policy, disclosure wording, and offer-expiry rules.
- [!] Exact social media account URLs.
- [!] Contact and service hours.
- [!] Privacy-policy wording, cookie requirements, and data-retention rules.
- [!] Final admin authentication method, including whether to use Cloudflare Access, Pages Functions sessions, an external identity provider, passkeys, email OTP, SMS 2FA, or another low-cost approach.
- [!] Final individual admin usernames, onboarding process, temporary passwords, password-reset flow, and whether every listed person should keep active access.
- [!] Final hourly rates and default paid/free/voluntary status for each person.
- [!] Room/map data needed for multiple map pins or labels.
- [!] Final IBAN, account-holder name, payment reference format, transfer deadline, and cancellation wording.
- [!] Whether website reservation requests temporarily block availability and how long holds remain active.
- [!] Booking.com email languages and examples for new bookings, modifications, and cancellations.
- [!] Pricing-rule precedence, taxes, fees, deposits, discounts, and whether prices vary by occupancy.
- [!] Employee roles and permission matrix.
- [!] Definitions for yearly business metrics and revenue reporting.

---

# Definition of done for each feature

A feature is complete when:

- [ ] It works on current desktop and mobile browsers.
- [ ] It is keyboard accessible and has appropriate labels.
- [ ] It is translated into every supported language.
- [ ] It handles loading, empty, success, and error states.
- [ ] It does not expose private information unnecessarily.
- [ ] Guest-only links, tokens, permissions, and expiry behaviour have been tested where applicable.
- [ ] Price, availability, and reservation changes have clear audit records where applicable.
- [ ] Relevant analytics or logs are included without collecting excessive data.
- [ ] Content has been reviewed for accuracy.
- [ ] The feature has been tested through its main user journey.

---

# Removed Ideas

## Google Maps and location

- [ ] Investigate whether separate pins or labels can clearly represent the different rooms or accommodation areas.
