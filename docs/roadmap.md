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

- [x] Homepage
- [x] Alojamento page
- [x] Galeria page
- [x] Reservas page
- [x] Reserva enviada page
- [x] Contacto page
- [ ] Obrigado.html
- [ ] Guia Local page
- [ ] Guest Stay page for QR/NFC access
- [ ] Custom `404.html` page

## 1.2 Immediate content and consistency fixes

### Tweaks

- [x] Kids are between 0 and 12 yo, so when someone inputs a kid's age >12 it should trigger a validation error
- [x] Make <span data-i18n="home.location.address">Rua da Arejinha 627, 4550-518 Pedorido</span> in index.html be a link itself to google maps and add a pin icon behing this text too
- [x] There's no intuitive way to scroll through the carroussels on computer, can you add faded in on hover "<" and ">" with a white to transparent gradient background when the mouse hovers the sides of the carrousel, and when clicking on them, it moves to the next/previous items
  - [x] Once clicked the ">" don't disappear, even on hover off
      - Note: Pointer-clicked carousel controls now blur after moving the carousel, so the hover overlay does not stay open just because the button kept focus.
- [x] in reservas.html, when there's the name for the reservation, email and phone number, the boxes are not always lined up in a single line, the phone one for instance can be higher than the other, which looks ugly, make sure they aligned if next to each other
  - [x] The same problem is in the contacto.html there's also the boxes that are not aligned when the text above warps
- [x] In reserva-enviada.html the Idades das crianças has 2 list icon before it like "- - Idade da criança 1". Same for bikes.
      - Note: Removed the native list bullets for the sent-page detail list; the redundant bike detail list is removed below, so bikes no longer have a second bullet source.
- [x] In reserva-enviada.html, you can remove the part Detalhe das bicicletas, since it's already explained above
- [x] In contacto.html, make the context and assunto of the message not mandatory (but keep the *), the idea is that people that see it would still add them, but sometimes less tech savy people or confused people won't know what to do with it so that it isn't frustrating that their message isn't sent and they can't understand why
- [x] In contacto.js is it normal that TOPIC_CONFIG still has hardcoded portuguese text? There's also other occurences in that js file
- [x] In booking-sent.js it uses hardcoded portuguese text in contactLink, make sure it works with the i18n system
- [x] In booking.js there's this hardcoded portuguese: '{bikes} bicicleta(s) x {days} dia(s) = {units} bicicleta-dias' ---> Make sure any hardcoded portuguese in .js files is also replaced to work with the i18n system.
- [x] In galeria.html, you can zoom in the images but you can't naviagate within the zoom like move to a bottom corner of the zoomed image, which is frustrating
  
- [x] reserva-enviada.html
  - [x] remove the bikeLabel part and move the bikeDaysTitle up to the summary to be a proper description (this only appears when the bikes are asked of course)
      - Note: Bikes now appear only in the summary row when requested; the separate "Detalhe das bicicletas" card was removed.

- [x] Others
  - [x] reorganise pt.json for it to be consistent and proper and easy to find the different elements of the different pages, so that the footer text is not in the middle of the file, and the pages texts is maybe in the same order of the context menu, etc, just make it human readable and modifyable
      - Note: Reordered `pt.json` in site/page order: shared setup, homepage, Alojamento, Galeria, Reservas, sent booking, rules, Contacto, supporting pages, then footer.
      - [x] Then do the reorganization now.

## Additions

### Subscribe to updates

- [x] In reservas.html and contacto.html before the confirm the rules were read add an option "I want to receive updates, offers and discounts from O Refúgio"
  - [x] In reserva.html make this a square checkbox too, not a switch style one

### Google Maps review call to action

Add a clearly labelled **“Review O Refúgio on Google Maps”** button wherever it is contextually useful.

Suggested locations:

- [x] Homepage testimonial or trust section
      - [~] Also add the button "reviewCta2" with linkling to the contact page, if possible with the Context and Assunto already filled in to "Já tive reserva" and "Estive aqui e quero deixar feedback"
- [x] Footer, if it does not make the footer too crowded

Review URL:

<https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204811,-8.3871842,646m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D>

---

# Phase 2 — Design and build the Contacto page

#### Consent and preferences

- [ ] Required privacy-policy acknowledgement.
- [ ] Optional checkbox for promotions, special offers, news, and updates.
- [ ] Keep marketing consent separate from permission to respond to the enquiry.
- [ ] Do not preselect optional marketing consent.

#### Form behaviour

- [ ] Display a useful success state after submission.
- [ ] Display actionable error messages.
- [ ] Protect the form from spam.
- [ ] Send or store enough context for staff to handle the enquiry efficiently.

## 2.4 Other Contacto page content

- [ ] Frequently asked questions for common contact topics.

---

# Phase 3 — Improve the reservation experience

This page feels way to cluttered, remove useless text, add small toggles to add information, only show information when relevant (like timezones or checkin times etc).

## 3.2 Reservation lifecycle improvements --> this is to be added to the Admin page

- [ ] Add a reservation status for a guest who is added after the stay has already begun.
- [ ] Define how this status affects occupancy, price, guest records, and reporting.
- [ ] Ensure mid-stay additions appear in the reservation timeline and audit log.

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
- [ ] Accommodation or room name where appropriate.
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

## 5.1 Custom 404 page

- [ ] Create `404.html`.
- [ ] Match the main site branding and navigation.
- [ ] Explain that the requested page could not be found.
- [ ] Include links to Homepage, Alojamento, Reservas, Contacto, and Guia Local.
- [ ] Do not link directly to personalised Guest Stay content from the public 404 page.
- [ ] Include language switching where technically possible.
- [ ] Log or monitor common broken URLs if analytics are available.

## 5.2 Marketing and communication preferences

- [ ] Add an optional promotions, offers, deals, and news checkbox in suitable forms.
- [ ] Store consent status and timestamp.
- [ ] Provide a clear unsubscribe method for future marketing communications.
- [ ] Avoid combining service messages with marketing consent.

## 5.3 Social proof and post-stay feedback

- [ ] Add a post-stay feedback route or contact-form option.
- [ ] Invite satisfied guests to leave a Google Maps review.
- [ ] Keep private feedback available for guests who do not want to post publicly.

---

# Phase 6 — Admin application roadmap

The admin application should be designed for owners who are not highly technical. Routine work must be completed through clear forms, previews, and confirmation steps in the Cloudflare-hosted admin interface rather than by editing code or deployment settings.

## 6.1 Calendar management overview

- [ ] Create a consolidated reservation calendar.
- [ ] Show room occupancy and reservation status.
- [ ] Add day, week, month, and agenda views.
- [ ] Add filters for rooms, dates, booking source, payment status, reservation status, and guest name.
- [ ] Allow staff to add maintenance blocks.
- [ ] Allow maintenance blocks to apply to one room, several rooms, or the whole property.
- [ ] Prevent new reservations from conflicting with maintenance blocks.
- [ ] Show bicycle reservations or daily bicycle demand where useful.
- [ ] Provide clear visual distinction between requests, provisional holds, confirmed reservations, external bookings, maintenance, and unavailable periods.
- [ ] Allow authorised staff to move or resize calendar entries only after conflict and price checks.
- [ ] Show a clear warning before any action changes an existing guest’s dates or room.
- [ ] Provide printable and mobile-friendly arrival, departure, and occupancy views.

## 6.2 Pricing, seasonal rates, and availability management

### Owner-friendly price controls

- [ ] Allow authorised owners to change base accommodation prices from the admin application.
- [ ] Support a default price for each room, unit, occupancy level, or bookable accommodation type.
- [ ] Support seasonal prices with a start date, end date, name, and optional notes.
- [ ] Support day-of-week and weekend adjustments.
- [ ] Support special-event, holiday, or one-off date overrides.
- [ ] Support minimum-stay, maximum-stay, closed-to-arrival, and closed-to-departure rules where needed.
- [ ] Keep bicycle pricing and other extras separate from accommodation pricing.
- [ ] Make taxes, cleaning fees, deposits, discounts, and included services explicit.
- [ ] Provide a calendar-style price editor for quick date-range changes.
- [ ] Provide a simple form mode for owners who prefer not to edit a pricing grid.

### Price calculation and safety

- [ ] Define a clear precedence order for overlapping base, seasonal, weekend, and date-specific rules.
- [ ] Preview the final guest price before publishing a rule.
- [ ] Show which pricing rules produced the calculated total.
- [ ] Warn about gaps, overlaps, unusually large changes, and impossible stay rules.
- [ ] Let staff save a draft and publish it only after review.
- [ ] Keep an audit history of who changed a price, what changed, and when.
- [ ] Allow an authorised owner to restore a previous pricing configuration.
- [ ] Do not silently reprice confirmed reservations.
- [ ] Require an explicit choice before applying a new price to an existing request or reservation.
- [ ] Test price changes against sample stays before publication.
- [ ] Ensure the website and admin application use the same price-calculation source.

### Availability controls

- [ ] Allow manual closure of dates without creating a fake reservation.
- [ ] Support property-wide, room-specific, and inventory-specific closures.
- [ ] Explain whether a closure is maintenance, owner use, operational, or another reason.
- [ ] Optionally set an automatic reopening date.
- [ ] Prevent pricing rules from making a closed date bookable.

## 6.3 Reservation creation, confirmation, and import

### Manual reservation entry

- [ ] Allow authorised staff to create a reservation directly from the calendar or reservation list.
- [ ] Collect guest details, room, dates, guest count, source, price, payment status, extras, language, and internal notes.
- [ ] Check availability, occupancy limits, maintenance blocks, and bicycle inventory before saving.
- [ ] Allow provisional, awaiting-payment, confirmed, checked-in, checked-out, cancelled, and no-show states.
- [ ] Record the staff member and time for every manually created reservation.
- [ ] Clearly distinguish internal notes from guest-visible information.
- [ ] Detect likely duplicate reservations before saving.

### Copy-ready reservation confirmation email

After a manual reservation is prepared, generate an editable email that staff can copy and paste to the guest.

- [ ] Generate the email in the guest’s preferred language.
- [ ] Include the guest name, stay dates, accommodation, guest count, price, deposit or amount due, and payment deadline.
- [ ] Include the correct IBAN, account-holder name, bank-transfer reference, and transfer instructions.
- [ ] Include cancellation terms, important booking conditions, and contact details.
- [ ] Add a one-click **Copy email** action with a clear copied confirmation.
- [ ] Let staff edit the generated text before copying it.
- [ ] Provide approved templates for confirmation, payment reminder, payment received, amendment, and cancellation.
- [ ] Store the template version used without storing unnecessary clipboard contents.
- [ ] Mark whether the email was only generated, copied, or later recorded as sent.
- [!] Confirm the final IBAN, account-holder details, payment deadline, and approved legal wording.

### Website reservation requests and bank-transfer confirmation

- [ ] Add new website requests to the admin queue automatically.
- [ ] Optionally place a temporary calendar hold while the request awaits review or payment.
- [ ] Display the hold-expiry time and release expired holds automatically.
- [ ] Let staff approve, reject, edit, or request more information.
- [ ] Let staff mark a bank transfer as received after checking the bank account.
- [ ] Convert the request into a confirmed reservation after manual payment confirmation.
- [ ] Add the confirmed reservation to the calendar without re-entering guest data.
- [ ] Prevent confirmation when dates have become unavailable.
- [ ] Generate the appropriate confirmation or rejection email.
- [ ] Keep the original request, changes, payment status, and staff actions in the audit history.
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

- [ ] Add employee accounts with limited permissions.
- [ ] Restrict employees to the information required for their role.
- [ ] Add views for pay, hours worked, and related records.
- [ ] Define which roles may view, create, edit, approve, or export employee information.
- [ ] Keep salary and personal employee data out of general reservation permissions.
- [ ] Record access and changes to sensitive employee records.
- [ ] Require stronger authentication for owners and staff with financial or employee access.
- [ ] Provide a fast way to disable access when a staff member leaves.

## 6.5 Guest history, logs, and reporting

- [ ] Create a complete, organised history for every guest.
- [ ] Connect repeat stays without incorrectly merging different people.
- [ ] Keep reservation changes, cancellations, messages, extras, payments, imports, and staff actions in an audit trail.
- [ ] Add yearly summary statistics.
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

- Permissions follow the principle of least privilege.
- Important changes are attributable to a staff account and timestamp.
- Maintenance and availability blocks reliably prevent conflicting reservations.
- Owners can change prices and seasonal rules without editing code.
- Price previews match the amounts displayed on the booking website.
- Website requests and reviewed external imports populate the same reservation calendar.
- Sensitive financial, guest, and employee information is not exposed to unauthorised staff.
- Safety-critical guest information can be updated quickly and has a visible last-updated time.
- Destructive or high-impact actions require a confirmation step and remain recoverable where practical.

---

# Recommended delivery order

## Milestone A — Finish the prototype

- [ ] Contacto Enviado page scaffold
- [ ] Guia Local scaffold
- [ ] Guest Stay page scaffold
- [ ] `404.html`
- [ ] “O Refúgio” naming corrections
- [ ] Television information correction
- [ ] Homepage address and Alojamento map

## Milestone B — Make contact and booking flows usable

- [ ] Complete the Contacto form
- [ ] Add browser-language defaults
- [ ] Add bicycle reservation extras
- [ ] Add success, error, validation, and spam-protection behaviour
- [ ] Add the first manual reservation form and calendar conflict checks
- [ ] Add copy-ready reservation confirmation emails with bank-transfer details
- [ ] Convert manually approved website requests into confirmed reservations

## Milestone C — Launch local and in-stay guest information

- [ ] Build the public Guia Local with activities, nearby stores, practical services, and sponsor labels
- [ ] Build secure Guest Stay page access for QR, NFC, and direct links
- [ ] Add emergency contacts, Wi-Fi QR, house rules, and mud-wasp guidance
- [ ] Add conditional bicycle rental information for current guests
- [ ] Add admin controls for guest information and Guia Local listings
- [ ] Test access expiry and personal-data protection

## Milestone D — Add pricing and external reservation operations

- [ ] Add base, seasonal, weekend, and date-specific price controls
- [ ] Add price previews, rule precedence, drafts, publishing, and audit history
- [ ] Add temporary reservation holds and bank-transfer statuses
- [ ] Add the review-first Booking.com email paste importer
- [ ] Add duplicate detection and external booking references
- [ ] Add approved multilingual email templates

## Milestone E — Complete operational tooling

- [ ] Expand the admin calendar and maintenance controls
- [ ] Add mid-stay guest additions
- [ ] Add employee access and records
- [ ] Add guest history and audit logs
- [ ] Add yearly statistics and exports
- [ ] Add stronger authentication, role management, and recovery controls

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

## Direct contact directory

### Current guests / already staying at O Refúgio

| Contact | Languages | Telephone | Actions |
|---|---|---:|---|
| Ana | Portuguese, English | `+351 [placeholder]` | Call, WhatsApp, copy number, save contact |

- [!] Replace Ana’s placeholder with the final telephone number.

### General enquiries

| Contact | Languages | Telephone | Actions |
|---|---|---:|---|
| Paula | Portuguese, French | `+41 78 351 82 22` | Call, WhatsApp, copy number, save contact |
| Jorge | Portuguese, French | `+41 77 469 41 44` | Call, WhatsApp, copy number, save contact |
| Bárbara | Portuguese, French, English, Spanish | `+351 927 460 563` | Call, WhatsApp, copy number, save contact |
| Marlene | Portuguese, French, English, German | `+41 76 786 20 24` | Call, WhatsApp, copy number, save contact |
