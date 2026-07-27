# O Refúgio — Product Roadmap

## Project strategy

The project is currently in the **prototype phase**. The immediate goal is to complete the public website and in-stay guest experience, then improve booking, contact, content, pricing, and administrative workflows in small, testable increments.

Routine operational changes should be manageable through the Cloudflare-hosted admin application. Owners should not need to edit source code, configuration files, or Cloudflare settings to update prices, availability, guest information, or local-guide content.

## Status legend

- [x] Completed
- [ ] Planned
- [~] In progress
- [!] Requires a decision, content, or external dependency

---

# Phase 1 — Complete the public website prototype

## 1.1 Existing page scaffolds

- [x] Homepage
- [x] Alojamento page
- [x] Galeria page
- [x] Reservas page
- [x] Reserva enviada page
- [~] Contacto page
- [ ] Guia Local page
- [ ] Guest Stay page for QR/NFC access
- [ ] Custom `404.html` page

## 1.2 Immediate content and consistency fixes

### Brand naming

- [ ] Replace **“Refúgio”** with **“O Refúgio”** in page titles, headings, metadata, navigation, and other places where the full name is appropriate.
- [ ] Review shorter uses of “Refúgio” individually so natural sentences are not made awkward.

### Accommodation details

- [ ] Update the accommodation content to state that **all rooms have televisions**, not only the bunk bedroom.
- [ ] Check the gallery, room descriptions, feature lists, structured data, and booking summaries for the same outdated information.

### Tweaks

- [ ] I changed lots of things in pt.json, remove from the pages anything that I removed from pt.json, add anything that I add, and replace all the portuguese fallback text hardcoded into the html files.
- [ ] reservas.html
  - [ ] does
      ```
      "details": {
        "eyebrow": "Detalhes",
        "title": "Preferências e informações adicionais."
      },
      ```
      do anything? If not, remove this.
  - [ ] Add "guestCountHelp2"
  - [ ] The bed preference background box stays even if the contents are not visible
  - [ ] Sort the "form": contents a little bit in the pt.json file to better correspond to where the elements actually appear in the page.
  - [ ] only show "timezoneWarning" if the device seems to have a different timezone that isn't Portugal.
  - [ ] "submitNotice" should be in the redder warning to be clear that it is important to read

- [ ] Others
  - [ ] If phone numbers have a portuguese format, don't refuse them from not having +xxx or 00xxx.

### Google Maps and location

- [ ] Add the full address to the Homepage.
- [ ] Embed Google Maps on the Alojamento page.
- [ ] Investigate whether separate pins or labels can clearly represent the different rooms or accommodation areas.
- [ ] Provide a normal external map link as a fallback when the embedded map cannot load.

### Google Maps review call to action

Add a clearly labelled **“Review O Refúgio on Google Maps”** button wherever it is contextually useful.

Suggested locations:

- [x] Homepage testimonial or trust section
      - [ ] Also the button "reviewCta2" with linkling to the contact page, if possible with the Context and Assunto already filled in to "Nõ tenho reserva" and "Estive aqui e quero deixar feedback"
- [ ] Contacto page
- [ ] Reserva enviada confirmation page
- [ ] Post-stay or feedback section
- [ ] Footer, if it does not make the footer too crowded

Review URL:

<https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204811,-8.3871842,646m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D>

#### Acceptance criteria

- The button opens the correct Google Maps listing.
- The link works on desktop and mobile.
- External-link behaviour and accessibility text are consistent across the site.
- The call to action is not displayed so often that it becomes distracting.

---

# Phase 2 — Design and build the Contacto page

## 2.1 Page goals

The Contacto page should help visitors:

1. Send a structured enquiry.
2. Reach the correct person based on their language and situation.
3. Contact O Refúgio by telephone or WhatsApp.
4. Find social media and location information.
5. Leave feedback or a Google Maps review.

## 2.2 Recommended page structure

### Section A — Contact introduction

- [ ] Short, welcoming introduction.
- [ ] Typical response-time guidance.
- [ ] Clarify which contact should be used by current guests versus general enquiries.
- [ ] Provide a visible emergency note that directs current guests to the Guest Stay page rather than using the ordinary contact form.

### Section B — Structured contact form

#### Personal details

- [ ] Full name — required
- [ ] Email address — required
- [ ] Telephone number — optional unless telephone or WhatsApp is selected
- [ ] Preferred language
- [ ] Message — required

#### Preferred response method

Allow one or more preferences where appropriate:

- [ ] Email
- [ ] Telephone call
- [ ] WhatsApp message
- [ ] WhatsApp call

#### Contact context

Use a **single-choice control** such as radio buttons or a select menu for the main context. This avoids contradictory selections.

##### I already have a confirmed reservation

- [ ] Cancel my reservation
- [ ] Change my reservation
- [ ] Ask a question about my reservation
- [ ] Report an issue during my stay
- [ ] Other reservation-related request

##### I submitted a reservation request

- [ ] Cancel my reservation request
- [ ] Change my reservation request
- [ ] Ask a question about my reservation request
- [ ] Check the status of my request
- [ ] Other request-related question

##### I do not have a reservation

- [ ] Ask about availability or booking
- [ ] Ask about O Refúgio or its facilities
- [ ] Ask about accessibility or special requirements
- [ ] Ask about group stays
- [ ] Ask about the local area
- [ ] I previously stayed and want to share feedback
- [ ] Other

#### Conditional fields

- [ ] Show a reservation number field when the visitor already has a reservation.
- [ ] Show a reservation-request reference field when the visitor submitted a request.
- [ ] Require a telephone number when the chosen reply method needs it.
- [ ] Show WhatsApp-specific guidance only when a WhatsApp option is selected.
- [ ] Keep conditional behaviour accessible to keyboard and screen-reader users.

#### Consent and preferences

- [ ] Required privacy-policy acknowledgement.
- [ ] Optional checkbox for promotions, special offers, news, and updates.
- [ ] Keep marketing consent separate from permission to respond to the enquiry.
- [ ] Do not preselect optional marketing consent.

#### Form behaviour

- [ ] Validate required fields clearly.
- [ ] Prevent accidental duplicate submissions.
- [ ] Display a useful success state after submission.
- [ ] Display actionable error messages.
- [ ] Protect the form from spam.
- [ ] Send or store enough context for staff to handle the enquiry efficiently.

### Contact actions to implement

- [ ] `tel:` link for normal telephone calls.
- [ ] WhatsApp deep link using the international number without spaces or punctuation.
- [ ] Copy-number button with a brief “Copied” confirmation.
- [ ] Downloadable `.vcf` contact card for Apple and Android devices.
- [ ] Clear language badges or labels for every contact.
- [ ] Identify the recommended contact after the visitor selects a preferred language.
- [ ] Avoid automatically opening an application without a deliberate user action.

## 2.4 Other Contacto page content

- [ ] Social media links.
- [ ] Address and map link.
- [ ] Opening or contact hours, if applicable.
- [ ] Google Maps review button.
- [ ] Frequently asked questions for common contact topics.
- [ ] Link to Reservas for visitors who are ready to book.
- [ ] Link to the Guest Stay page for current guests seeking property or emergency information.
- [ ] Link to Guia Local for local activities, nearby shops, services, and sponsored recommendations.

## 2.5 Contacto page acceptance criteria

- Visitors can identify the correct contact without reading the entire page.
- The form adapts to the visitor’s reservation status.
- Telephone, WhatsApp, copy, and save-contact actions work on supported devices.
- Every field has a visible label and understandable validation.
- The page works in every supported language.
- Personal data and marketing consent are handled separately.
- The layout remains usable on small mobile screens.

---

# Phase 3 — Improve the reservation experience

This page feels way to cluttered, remove useless text, add small toggles to add information, only show information when relevant (like timezones or checkin times etc).

## 3.1 Optional bicycle reservations

Add bicycle hire as an optional extra during booking.

### Business rules

- Price: **€5 per bicycle per day**.
- Maximum quantity: **one bicycle per guest per selected day**.
- Bicycle dates may cover only part of the accommodation stay.
- Example: a guest staying five nights may reserve bicycles for only one or two days.
- Availability must be checked per day, not only for the full stay.

### Booking interface

- [ ] Add an optional bicycle section after the stay and guest details are known.
- [ ] Allow visitors to select individual dates within their stay.
- [ ] Allow a bicycle quantity for each selected date.
- [ ] Limit each day’s quantity to the number of guests on the reservation.
- [ ] Show the daily price and calculated bicycle subtotal.
- [ ] Include bicycle details in the full booking-price summary.
- [ ] Include bicycle details in confirmation screens and messages.
- [ ] Make it clear that bicycle requests remain subject to availability, if availability is not confirmed instantly.

### Data and administration

- [ ] Store bicycle quantity by date.
- [ ] Make bicycle reservations visible in the admin reservation view.
- [ ] Prevent overbooking when total bicycle inventory is known.
- [ ] Allow staff to edit or remove bicycle extras.
- [ ] Record bicycle changes in the reservation history or logs.

### Acceptance criteria

- A visitor can reserve bicycles for some, all, or none of the stay dates.
- A visitor cannot reserve more than one bicycle per guest on any selected day.
- The price is always calculated as `selected bicycles × selected days × €5`.
- Bicycle selections are preserved through validation errors and booking review steps.

## 3.2 Reservation lifecycle improvements

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

- [ ] Contacto page scaffold
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