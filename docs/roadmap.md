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

- [c] Employee page
  - [c] Change what the dashboard shows to reflect things that employees need, like time worked the month and revenue, not the owner's expected earnings. Maybe even the start/stop button, so that it's easily accessible
  - [c] In reservas, they should be able to change check-in/out time, prefered language and deposit payment status
    - Note: Employee users now see a work-focused dashboard with month hours/value and start/stop controls; reservation operations are limited to check-in/out times, preferred language, and payment/deposit status.

- [~] Admin page
  - [c] Calendar
    - [c] The calendar should clearly show what date today is, and have a button to come back to today
      - Note: Added a Hoje button and visual highlight for today's date.
  - [c] Reservas
    - [c] In the fields filling boxes dates should be dd/mm/yyyy and 24h format, and it doesn't
    - [c] The contact icons are not clear to what they stand for, they should be next to their corresponding lines (so add them next to email and telefone, remove the line contacto and replace with these 2 lines)
    - [c] The Desconto field only shows % still, not plain values
    - [c] Hospedes . total . adults . kids is confusing, it could be "[total] ([adults] adultos + [crianças] crianças)", when there are kids, otherwise just states "[adults] adultos"
      - Note: Reservation forms now use dd/mm/yyyy text date fields, 24h time fields, email/phone contact rows with icons, a typed discount value, and clearer guest summaries.
    - [c] Add the missing discount code field to `reservas.html`.
      - Note: The public booking form now validates active admin discount codes, subtracts valid discounts from the estimate, carries the code into the sent summary, and stores it with the admin website request.
    - [c] Add a closed-by-default "Reservas passadas" section underneath the page with compact past/cancelled reservation rows and expandable details.
      - Note: The main reservation list now focuses on active/future reservations; checked-out, no-show, cancelled, and ended stays live in the expandable history section.
  - [c] Pedidos do website
    - [c] For example when clicking to answer to Marlene Keller, she is supposed to have a German answer, and she doesn't. Also to answer a comment, the comment itself should be written as a quote for the ownwer to then answer
    - [c] The "histórico" part can be very summarized with 1-2 lines per case, the details are opened when clicking on the "Abrir Reserva" anyway
      - Note: Website request replies now use the request language and quote the guest comment; closed history is compact with actions preserved.
  - [c] Mensagens
    - [c] Add these:
      * pedido de reserva recebido;
      * instruções de pagamento;
      * confirmação de reserva;
      * confirmação de pagamento;
      * informação de check-in;
      * lembrete antes da chegada;
      * informações úteis;
      * instruções de checkout;
      * agradecimento depois da estadia and request for feedback.
    - [c] Give the possibility to generate the messages, not linked to reservations but by language still
      - Note: Added the requested template set and a standalone-by-language generation mode.
  - [c] Preços
    - [c] Replace the "Preços Base" section with the seasonal section that works like the following:
      - [c] Force to have a Base price if there are not prices that are covering the entire year, that will be the default outside of seasons
      - [c] Seasonal prices with no year, so that every year it changes at the same date (if these cover the entire year, then there's no need to force the base price)
      - [c] dd/mm/yyyy seasonal prices that overide the others during that period.
      - [c] Add clear indicator showing which is currently active
    - [c] Add the possibility to lower the price per night if there are over x amount of guests like you can do in booking, so group discounts by default
    - [c] Move the "Gerar código" to instead be a dice icon button in the Código field
    - [c] Since there's a "Tipo" field, fuse the Percentagem and the Valor Fixo field into one, that reflects the type
      - Note: Added recurring seasons, dated overrides, active-price indicator, group discounts, dice-code generation, and typed discount values.
  - [c] Despesas
    - [c] There's a notes section but no way to actually read said note
  - [c] Funcionários
    - [c] There's english text (owner, employee)
    - [c] There's no way to change the "Modo habitual"
    - [c] There's no way to check and change individual employee's working time and costs per job
      - Note: Added Portuguese role labels, default work-mode editing, and hidden-by-default employee detail drawers with work/cost history, per-line editing, and add-session controls.
  - [c] Add a log/audit section to the Settings page
    - [c] The log tracks every change and by whom, in a single line list, with possibility to expand for details, with sorting/filters to find specific changes
      - Note: Added a compact expandable audit list with search/entity/actor filters.
  -  [~] Statistics and others
    - [~] Actually add what I asked you too:
      - Note: Added broad prototype reports, period filters, KPI/list visualizations, CSV exports, validation improvements, unsaved-change warnings, audit surfacing, and JSON data export hooks. PDF/XLSX exports, richer comparison charts, and real backend backup/restore remain later work.

- [c] Make sure that when a guest makes a reservation from the website, they receive in the confirmation the reservation ID too
- [c] For testing, submitting `reservas.html` should add the request to the Admin page under Pedidos do website.
  - Note: Booking submissions now write a website request into the admin prototype localStorage before redirecting to `reserva-enviada.html`.
- [c] Admin page
  - [c] Welcome page has weird layout with the "Entrar" button touching the password bar, and overall poor looking spaces
  - [c] Make sure the original placeholders that were hardcoded to lock dates and prices in the reservation page (and any other function hardcoded, that is now connected to the admin page) to showcase it are removed and replaced with only the current link with the admin page
  - [c] For ease of testing change the owner password to refugio2026! as the temporary one
  - [c] Buttons that are [icon]text should have a small space between the icon and the text, currently they are squeashed together
  - [c] Can the left menu bar have it's own scrollbar, and for example when going down a long content page, the left part automatically stays visible, so it's easier to jump between pages without the need to scroll up a long reservations list page for example
  - [c] Dashboard
    - [c] If there's a current guest, it makes more sense for the "Próxima saída" to show first and then "Próxima chegada", otherwise the current order works
  - [c] Calendar
    - [c] The calendar could be a little less tall, so the entire month is visible in most computer screens at least, while still having space for 2 lines in there since it's the max guests that can be there per day
    - [c] There should be a button next to "Gerar Mensagem" to "Gerir Reserva" that opens the reservations tab in the proper reservation in editing mode
    - [c] Check-in/out times should be in the description too, the total is not needed, the description should be times, guest number, status, contacts and prefered language, logically ordered
    - [c] Contact info should have an easy copy button, add contact button, whatsapp button, call button, send email button in the form of easily discernable icons
    - [c] Remove the "Cancelar" button from here, the owner will need to go through Gerir Reserva instead
    - [c] A "+" on top of the calendar, opens the Reservas page in the manual adding section
  - [c] Reservas
    - [c] Dates should be dd/mm/yyyy
    - [c] There are fields missing in here, like ages of the kids, bed preferences, everything that is in reservas.html should be in here too
    - [c] Add an "Ver mais" button that let's you see every single detail of the reservation (so every field). Make the most important info visible and logically ordered by default without the need for the "Ver mais"
    - [c] Contact info should have an easy copy button, add contact button, whatsapp button, call button, send email button in the form of easily discernable icons
    - [c] Add an "Editar" button that let's edit every detail above
    - [c] Make cancelled reservations drop to the bottom of the list and make it visually clear that it was cancelled, changing the colour to red for example
    - [c] Make pending reservations, since they are not actually counting as reserved on the owner side, visually distinct, maybe yellow coloured
    - [c] Filters should apply automatically when something is selected, replace the "Filtrar" button with "Limpar" to clear the filters
    - [c] A cancelled reservations should be able to be restored in the manage page if it does not create conflicts
    - [c] There should be a "Criar Reserva" button on the top of the page that jumps down to the create section when clicked
    - [c] I don't have one yet, I'll give you that once I receive it, but I asked to receive a reservation confirmed email from booking to the owners, so that under the manual adding of reservation, I would like to have a text box where they can paste the text of the email in there and the app would look for the information to fill up the field, for now you can add the box that doesn't fully work, since we don't have a example of email to be able to code the data scrapper.
  - [c] Pedidos do website
    - [c] Currently it makes no sense, what it should have:
      - [c] Lists of all requests
      - [c] Quick view of the basic details, like dates, number of guests and things in the field "Comentários ou pedidos especiais"
      - [c] For each request:
        - [c] "Ver mais" to see all the details
        - [c] "Aceitar" opens the Reservas section, in the manual adding section, with all the fields automatically filled in. That request is not removed from the "Pedidos" page until a reservation with the same ID and info is actually added from the manual adding section in "Reservas". When manually adding a reservation from the website, when clicking the add button, it should automatically open the Mensagem page with the instructions for payment used. If the reservation had "Comentários ou pedidos especiais", the comment is also in the email and leaves the space for the owner to give an answer to the guest
        - [c] "Rejeitar" that refuses it and add it to "Histórico" and opens Mensagens page generating a sorry but we cannot accept your reservation email. Refused reservations in the "Histórico" can be modified to maybe "restore" so it goes back up to the requests section
        - [c] "Responder" (for reservations that have "Comentários ou pedidos especiais") that opens Mensagens and just generates an email to answer the guests request with no other step towards the status of the reservation
      - [c] The "histórico" section could be a little more useful, for instance accepted reservations can be opened in the "Reservas" page when clicking on them
  - [c] Preços e descontos
    - [c] It should support seasonal prices for rooms, so it should have a list of prices and dates, so between x date and y date it's one price and between y and z it's another, with a "+" button to add a new line and a "-" to remove specific lines, make sure they don't clash too
    - [c] Add uses per coupon, including unlimited (to give as a single use for a previous guest for example), include a generate a random coupon button too, that gives a random string and let's add a name for the coupon (the name of the guest for example)
    - [c] Add possibility of plain price reduction (-5euros for example) coupons instead of % (make that compatible with the manual reservation too)
    - [c] Make it possible to edit/remove discounts
    - [c] Separate the services prices (currently just the bikes) from the rooms

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

- [x] Create `404.html`.
- [x] Match the main site branding and navigation.
- [x] Explain that the requested page could not be found.
- [x] Include links to Homepage, Alojamento, Reservas, Contacto, and Guia Local.
- [x] Do not link directly to personalised Guest Stay content from the public 404 page.
- [x] Include language switching where technically possible.
- [ ] Log or monitor common broken URLs if analytics are available.

## 5.2 Marketing and communication preferences

- [x] Add an optional promotions, offers, deals, and news checkbox in suitable forms.
- [ ] Store consent status and timestamp.
- [ ] Provide a clear unsubscribe method for future marketing communications.
- [x] Avoid combining service messages with marketing consent.

## 5.3 Social proof and post-stay feedback

- [x] Add a post-stay feedback route or contact-form option.
- [x] Invite satisfied guests to leave a Google Maps review.
- [x] Keep private feedback available for guests who do not want to post publicly.

---

# Phase 6 — Admin application roadmap

The admin application should be designed for owners who are not highly technical. Routine work must be completed through clear forms, previews, and confirmation steps in the Cloudflare-hosted admin interface rather than by editing code or deployment settings.

## 6.0 Admin prototype foundation

- [c] Replace the placeholder `admin.html` with a Portuguese-only standalone admin management prototype.
- [c] Remove the public footer link to `admin.html` so the admin is not presented as guest navigation.
- [c] Add an owner/dev/employee login gate for the prototype with named accounts and hashed demo passwords.
- [c] Remember the last selected admin login account locally so returning users do not need to scroll the user menu again.
- [c] Add a central permission map for owner and employee capabilities.
- [c] Add André as a Dev role with owner-level access for support and quick fixes.
- [c] Add a replaceable local repository/service layer so the UI is not tied directly to static JSON or page markup.
- [c] Add stable-ID demo entities for reservations, website requests, guests, pricing, discounts, expenses, employees, work sessions, and audit log entries.
- [c] Add a dashboard showing current guests, next arrival/departure, pending website requests, awaiting-payment reservations, revenue, expenses, and active work sessions.
- [c] Add a detailed month calendar with reservation status markers, selected-day details, and website request visibility.
- [c] Add reservation search/filtering and a manual reservation form with conflict detection and owner override confirmation.
- [c] Add a website request queue with accept/reject actions and conversion into an awaiting-payment reservation.
- [c] Add `preferred_language` compatibility to the public reservation redirect so future website request storage can infer the guest communication language.
- [c] Add copyable multilingual guest message templates separate from Portuguese-only admin UI text.
- [c] Add owner-facing prototype sections for pricing, discounts, expenses, employees, employee rate history, employee time tracking, statistics, data export, and demo-data reset.
- [c] Add work-hour tracking for owners as well as employees.
- [c] Add paid, free, and voluntary work types so invested owner/volunteer time is tracked without becoming wage cost.
- [c] Add task checkboxes for work sessions: check-in, check-out, cleaning, bureaucracy, maintenance/repairs, shopping, and other details.
- [c] Document the prototype security/storage limits and Cloudflare migration path in `docs/admin-architecture.md`.
- [!] Before real data is used, replace the localStorage demo repository with authenticated server-side APIs and private storage.

## 6.1 Calendar management overview

- [c] Create a consolidated reservation calendar.
- [c] Show property occupancy and reservation status.
- [ ] Add day, week, month, and agenda views.
- [~] Add filters for rooms, dates, booking source, payment status, reservation status, and guest name.
  - Note: The prototype includes reservation list filters for guest/name/search, status, and source; room/date/payment filters and alternate calendar views remain planned.
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
- [~] Support a default price for each room, unit, occupancy level, or bookable accommodation type.
  - Note: The prototype supports adult/night and child/night prices for the single modeled property; room/unit variants remain planned if the data model expands.
- [c] Support seasonal prices with a start date, end date, name, and optional notes.
  - Note: Added in the admin prototype with date-overlap checks; public price calculation still needs the final shared backend source.
- [ ] Support day-of-week and weekend adjustments.
- [ ] Support special-event, holiday, or one-off date overrides.
- [ ] Support minimum-stay, maximum-stay, closed-to-arrival, and closed-to-departure rules where needed.
- [c] Keep bicycle pricing and other extras separate from accommodation pricing.
- [ ] Make taxes, cleaning fees, deposits, discounts, and included services explicit.
- [ ] Provide a calendar-style price editor for quick date-range changes.
- [ ] Provide a simple form mode for owners who prefer not to edit a pricing grid.

### Price calculation and safety

- [ ] Define a clear precedence order for overlapping base, seasonal, weekend, and date-specific rules.
- [ ] Preview the final guest price before publishing a rule.
- [ ] Show which pricing rules produced the calculated total.
- [~] Warn about gaps, overlaps, unusually large changes, and impossible stay rules.
  - Note: Seasonal date overlaps are blocked in the prototype; gap/unusual-change/impossible-stay warnings remain planned.
- [ ] Let staff save a draft and publish it only after review.
- [ ] Keep an audit history of who changed a price, what changed, and when.
- [ ] Allow an authorised owner to restore a previous pricing configuration.
- [ ] Do not silently reprice confirmed reservations.
- [ ] Require an explicit choice before applying a new price to an existing request or reservation.
- [ ] Test price changes against sample stays before publication.
- [~] Ensure the website and admin application use the same price-calculation source.
  - Note: Public booking now reads the admin prototype localStorage prices when present; final launch still needs a shared server-side pricing source.

### Availability controls

- [ ] Allow manual closure of dates without creating a fake reservation.
- [ ] Support property-wide, room-specific, and inventory-specific closures.
- [ ] Explain whether a closure is maintenance, owner use, operational, or another reason.
- [ ] Optionally set an automatic reopening date.
- [ ] Prevent pricing rules from making a closed date bookable.

## 6.3 Reservation creation, confirmation, and import

### Manual reservation entry

- [c] Allow authorised staff to create a reservation directly from the reservation list.
- [~] Collect guest details, room, dates, guest count, source, price, payment status, extras, language, and internal notes.
  - Note: The prototype collects guest details, dates, guest count, source, extras, language, status, discounts, deposit choice, and owner notes; room selection is not needed while the property is modeled as one unit.
- [~] Check availability, occupancy limits, maintenance blocks, and bicycle inventory before saving.
  - Note: The prototype checks date conflicts and occupancy limit; maintenance blocks and bicycle inventory checks remain planned.
- [~] Allow provisional, awaiting-payment, confirmed, checked-in, checked-out, cancelled, and no-show states.
  - Note: The data model includes these statuses; the manual create UI currently offers the most useful first statuses.
- [c] Record the staff member and time for every manually created reservation.
- [c] Clearly distinguish internal notes from guest-visible information.
- [ ] Detect likely duplicate reservations before saving.

### Copy-ready reservation confirmation email

After a manual reservation is prepared, generate an editable email that staff can copy and paste to the guest.

- [c] Generate the email in the guest’s preferred language.
- [~] Include the guest name, stay dates, accommodation, guest count, price, deposit or amount due, and payment deadline.
  - Note: The prototype message includes guest name, stay dates, guest count, total, and reservation reference; final bank/payment details and legal wording still need confirmation.
- [ ] Include the correct IBAN, account-holder name, bank-transfer reference, and transfer instructions.
- [ ] Include cancellation terms, important booking conditions, and contact details.
- [c] Add a one-click **Copy email** action with a clear copied confirmation.
- [ ] Let staff edit the generated text before copying it.
- [~] Provide approved templates for confirmation, payment reminder, payment received, amendment, and cancellation.
  - Note: The prototype includes payment-instruction and payment-received templates in Portuguese, French, English, Spanish, and German.
- [ ] Store the template version used without storing unnecessary clipboard contents.
- [ ] Mark whether the email was only generated, copied, or later recorded as sent.
- [!] Confirm the final IBAN, account-holder details, payment deadline, and approved legal wording.

### Website reservation requests and bank-transfer confirmation

- [~] Add new website requests to the admin queue automatically.
  - Note: The prototype includes a queue backed by demo data; wiring public reservation submissions into the queue needs a real persistence/API layer.
- [ ] Optionally place a temporary calendar hold while the request awaits review or payment.
- [ ] Display the hold-expiry time and release expired holds automatically.
- [~] Let staff approve, reject, edit, or request more information.
  - Note: The prototype supports prepare/approve through the reservation form, reject with a draft response, restore rejected requests, and respond without changing request status; deeper request editing remains planned.
- [c] Let staff mark a bank transfer as received after checking the bank account.
- [c] Convert the request into an awaiting-payment reservation and then a confirmed reservation after manual payment confirmation.
- [c] Add the accepted reservation to the calendar without re-entering guest data.
- [c] Prevent confirmation when dates have become unavailable.
- [c] Generate the appropriate confirmation or rejection email.
  - Note: The prototype generates payment instructions, payment-received messages, and rejection/response drafts. Final approved legal/payment wording remains open.
- [c] Keep the original request, changes, payment status, and staff actions in the audit history.
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

- [c] Add employee accounts with limited permissions.
- [c] Restrict employees to the information required for their role.
- [c] Add views for pay, hours worked, and related records.
- [c] Track unpaid owner/volunteer work separately from paid employee work.
- [c] Define which roles may view, create, edit, approve, or export employee information.
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
- [c] Add the first manual reservation form and calendar conflict checks
- [~] Add copy-ready reservation confirmation emails with bank-transfer details
- [c] Convert manually approved website requests into awaiting-payment reservations, then confirmed reservations after payment is marked received

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

- [c] Add the admin prototype foundation with role-based navigation, dashboard, local data layer, and owner/employee flows
- [~] Expand the admin calendar and maintenance controls
- [ ] Add mid-stay guest additions
- [c] Add employee access and records
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

## Direct contact directory

### Current guests / already staying at O Refúgio

| Contact | Languages | Telephone | Actions |
|---|---|---:|---|
| Dulce | Portuguese, English | `+351 [placeholder]` | Call, WhatsApp, copy number, save contact |

- [!] Replace Ana’s placeholder with the final telephone number.

### General enquiries

| Contact | Languages | Telephone | Actions |
|---|---|---:|---|
| Paula | Portuguese, French | `+41 78 351 82 22` | Call, WhatsApp, copy number, save contact |
| Jorge | Portuguese, French | `+41 77 469 41 44` | Call, WhatsApp, copy number, save contact |
| Bárbara | Portuguese, French, English, Spanish | `+351 927 460 563` | Call, WhatsApp, copy number, save contact |
| Marlene | Portuguese, French, English, German | `+41 76 786 20 24` | Call, WhatsApp, copy number, save contact |
