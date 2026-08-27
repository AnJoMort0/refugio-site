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
- [x] Guia Local page
- [x] Guest Stay prototype scaffold at `qr.html` for QR/NFC access
- [x] Custom `404.html` page

## 1.2 Immediate content and consistency fixes

### Tweaks

- [ ] Go down roadmap.md and mark "x" everything that is actually already done, "~" for things that are kinda done, "!" for things that seem off, not really fitting the current way the website works, needing a decision to see if it's to be done or now or how, ">" if it's something that can only be done in the final version, not the prototype
- [ ] Reorganise, classify properly roadmap.md
- [ ] Reorganise the locales files to make more sense, if I delete something from pt.json, that means it is to be deleted from the website completly
- [ ] Limit available and preferred languages to Portuguese, English, French, and Spanish.
- [ ] I'm changing pt.json, please update the other language files
- [ ] Check file hierchy, organisation, make sure they are well sorted and logically placed, change if needed
- [ ] Update the docs to reflect the current state of the website. Since almost all the feautures are currently implemented in this prototype and working as intended, in the docs folder make one file (deployment? or create a new one), explaining how to move this prototype into a working website, with all the feautures working as intended and in the cheapest possible way.
  - [ ] In the final website there should be a private place where all the people that opted-in for marketing are listed automatically

I'll be exploring the entire website in PC and phone mode and I'll tell you the changes I want you to make, track them all in roadmap.md

- [ ] General changes
  - [ ] general
    - [ ] The "sale" label on the floating Reserve button clips to the right side of the page
    - [ ] Add a small round Whatsapp button floating next to the reserve button, just the Whatsapp icon in a circle, when clicked it automatically opens the message feature of whatsapp (a phone number will be included later)
    - [ ] In the footer, add the address as an google maps hyperlink and, the email and the phone number (make placeholders for now) with the click to call feature --> make sure the footer is pretty and well organised (centralised all the links and phone number(s), email, etc in a single file in this repo, so they can be changed, and used throughout the webpage easily)
  - [ ] index.html
    - [ ] I don't like how the hero looks at all, let's remove the eyebrow, change the title to just be a big "O Refúgio" and the text underneath to be a diccionary entry basically with something like: "[phonetic entry], nome masculino [I think there's diminuitives for that right?], Lugar considerado seguro para nele algo ou alguém se refugiar. Sinónimos: ABRIGO, RETIRO" super well formatted, looking sharp, professional, premium, pretty. For the other languages include the translation so something like "Portuguese for [word in that language], [phonetic entry], ..."
    - [ ] Clicking on a partner should open its section in the Guia Local
    - [ ] The cards showing the images in the Galeria section look primitive, weird, boring, add a white border around the image expanding from the white text box underneath so they look more like polaroid strips. Or if you have a better way to make it look better and more in line with the aesthetic of the page, I give you creative freedom to change them as you wish
    - [ ] Bring the coloured box aesthetic of the reservation section in alojamento.html to index.html so it looks more distinct
  - [ ] guia-local.html
    - [ ] Each partner should have a "Ver mais" button that opens a section of good selling information like menu items, description, their own webpage, etc --> since the current partners are also examples, just invent content in there to use a realistic looking placeholder
  - [ ] reservas.html
    - [ ] Make the today day a little more recognisable
  - [ ] contacto.html
    - [ ] And maybe other pages: add a css look to the droplist, like the one in the language of the header. Make it a general .css for all droplists in the website
  - [ ] guia-local.html
    - [ ] Move the hearth button to the right top corner of the cards
  - [ ] qr.html
    - [ ] Remove the demonstração label on the top of the page
    - [ ] Clicking the dates, check-out, hosts button in the top pannel, it scrolls down to the information section of the page, same with the bikes
    - [ ] The list of emergency contacts is not being translated
    - [ ] Remove all placeholder text that is useless like the wifi paragraph
    - [ ] Make sure nothing is hardcoded and everything is using the i18n system
    - [ ] Move the hospital to be over the firefighters and just add a pharmacies and other medical places expandable section under this emergencies section, remove the health section
    - [ ] Make food be the first and automatically opened section in the near me section and give the cards the same image feature as in the guia-local, but without the pattern fallback, if there's no image file, there's no image. Remove the Lavandaria, since there's washing/dryer machine in the stay (also check if that is described in the ammenities, if not, add it)
    - [ ] Clicking on a partner should open its section in the Guia Local
    - [ ] Check-out info: keys on the keyholes of their respective doors, trash in the green container down the road, in these coords: https://www.google.com/maps/place/41%C2%B001'16.7%22N+8%C2%B022'55.8%22W/@41.02131,-8.3828171,153m/data=!3m2!1e3!4b1!4m12!1m7!3m6!1s0xd24830c21a7821f:0x7babb9259b50311a!2sO+Ref%C3%BAgio!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k!3m3!8m2!3d41.02131!4d-8.382172?ucbcb=1&entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D, dishes washed and in place or in the dishwasher if not washed before check-out
    - [ ] Fill up the rules section with the rules from the rules section of reservas.html. Add a link to see all rules that opens said section
    - [ ] Clicking the Whatsapp button writes by default the message with the name of the host, stating they are the ones currently staying. These messages can go into the messages.json in the locales folder
  - [ ] admin.html
    - [ ] Add a services section, move the bikes section in there, letting the owners enabling or disabling the service (making it disappear from the reservas and qr page), as well as changing the price there. Make this section future proof for future services like breakfast that may be added in a few years. Remove the services section from the Preço tab and move the Deposit cost to the base price and keep it only there no need to make seasonal.
    - [ ] Inside Hospede Atual add the call button and the Whatsapp button
    - [ ] When clicking the Iniciar Trabalho button in the dashboard it should open a bubble to select the type of work
    - [ ] When clicking on pending payments alert in the dashboard, it should open the reservas page filtered by pending payment so you see directly what you clicked for
    - [ ] Reservation requests await payments for 48h, otherwise they are classified as cancelled (with the mention of failing to pay) and it becomes available in the website again. The 48h deadline should also be mentionned in the message asking for payment
    - [ ] In calendar gray out the past days (can still be clicked but we can see more clearly it's not worth it anymore)
    - [ ] Everysingle time a "open details" or "see more" button expands the table, there should always be a diminish button at the end of the expanded space to easily close it (when closed it scroll back to the top of the closed thing), because in funcionários for instance, you need to scroll back up to close them
    - [ ] Clicking in the tab button of an already opened tab (for example clicking on "Reservas" when already in "Reservas") should close all expanded cards and reset all filters
    - [ ] Add a new section to the Mensagens tab, the marketing email list, that generates a list of emails of everyone that is opted-in by language that can be copy pasted into cci and the templates for the offers and news, also add the send email with one click option
    - [ ] In the history of the website requests add a small "v" icon just to further show that it is an expandable section
    - [ ] I love the new look of the boxed lists for the prices for example, but see screenshot, the contents are not lining up. Same in the despesas.
    - [ ] Despesas should show them all without the need to click a "mostrar mais" button. Also add a year filter, can be in the same dropdown: have [month year][full year] on top
    - [ ] Mensagens should update automatically on selection in the dropdown menus, as soon as the no reservation option is selected I should be able to change language too
    - [ ] In the stats, move the export feature to each section so it downloads the data from that section with the current filters
    - [ ] In the audit just record what changed, no need to have the full details for an entire reservation when the change was just -> paid. Just make reservation ID, date and name and then payment "awaiting -> paid" or something like that

- [ ] PC version
  - [ ] alojamento.html
    - [ ] In Antes de reservar section the boxes are [Estadia][Check-in e check-out][BLANK SPACE FOR SOME REASON] on top of a proper [Regras principais][Informações úteis]
  - [ ] guia-local.html
    - [ ] See screenshot, the filters are all over the place, fix it, without messing with the mobile view that is working quite well
  - [ ] admin.html
    - [ ] see screenshot, side pannel has a duplicate extra log-off button and the public website button is squeashed in there


- [ ] Mobile version
  - [ ] general
    - [ ] The floating Reserve button clips in the bottom when the page is fully up
    - [ ] The footer looks bad, with lots of blank space between the things, make it look better in mobile versions, grouping what makes sense to be grouped, make it look professional and premium
    - [ ] The menu button in the top bar clips to the right
    - [ ] The top bar clips to the top when scrolling down
    - [ ] If the space is tight, make the language button display the initals instead (PT, FR, EN, ES), but the same full word in the options of the scrollbar when clicked
    - [ ] Remove full-page horizontal scrolling, there's a little bit
  - [ ] alojamento.html
    - [ ] The image has a white box space underneath bor no reason (this may be a problem in multiple pages)
  - [ ] galeria.html
    - [ ] When opening the images, there's no need for < / > buttons, just swipe actions in there
  - [ ] reservas.html
    - The summary section should appear above the "Detalhes" so that they can see the final price and control their choices before filling up the sending form
  - [ ] admin.html
    - [ ] See screenshot. The elements are not always lined up
    - [ ] The "criar reserva" button in the calendar is all smushed together and ugly

- [~] Admin page
  - [ ] Have a text box where they can paste the text of the booking.com email in there and the app would look for the information to fill up the field, need to use an example of email to be able to code the data scrapper.
  - [c] Despesas
    - [c] Add filters to see certain things, by type, date, etc.
    - [c] Move the add field to the top of the page.
    - Note: Search, category, and month filters now precede a compact, expandable expense list; the add/edit form is available at the top but closed until requested.
  - [c] Audit/Log
    - [c] Should more clearly show what was changed.
    - Note: Audit rows now preview recorded change details, retain expandable entity details, support filters, and initially limit the result list with a "Mostrar mais" action.

### 2026-08-23 usability and mobile revamp

- [c] Rebuild the admin navigation for phones and compact tablets.
  - Note: `public/js/admin/main.js` and `public/css/pages/admin.css` now use a fixed compact header, four common bottom-navigation destinations, an off-canvas full menu, backdrop, body scroll lock, safe-area spacing, and 44px touch controls below 1024px. Desktop keeps the permanent sidebar.
- [c] Reduce owner-dashboard noise and promote frequent actions.
  - Note: The dashboard keeps Criar reserva and Iniciar/Terminar trabalho beside the page heading, uses a swipeable KPI rail on phones, groups website requests and pending payments into two actionable alerts, and moves financial detail into one concise operational summary.
- [c] Make routine admin records scannable before showing secondary detail.
  - Note: Reservation rows default to guest/date/status/guest count/total/payment; contact, pricing detail, destructive actions, treated website requests, past reservations, and record batches are disclosed only when requested. Reservation creation/editing no longer renders until Criar/Editar is selected.
- [c] Simplify seasonal pricing, discounts, expenses, reports, and settings.
  - Note: Base/service values are read-only summaries with explicit edit disclosures; seasons, group reductions, discount codes, and expenses are compact expandable rows; mobile reports show headline KPIs then topic disclosures; Settings now leads with the audit trail and keeps prototype export/reset notes under an Advanced disclosure.
- [c] Simplify employee and work-time workflows.
  - Note: Employee cards now show identity, role, monthly hours, and normal compensation mode by default; rates, earnings, session counts, tasks, and history remain expandable. Starting work is one action, while task/type editing appears during an active session or after explicitly choosing manual hours.
- [c] Add deliberate touch behavior to admin and public calendars.
  - Note: Horizontal swipes move one month in `admin.html` and `reservas.html`; desktop booking still displays two months, phone booking displays one. Admin calendar names and check-in/check-out markers remain on desktop, while compact phone cells use status bars/markers and the selected-day panel supplies full names and details.
- [c] Fix guest-count editing on touch keyboards.
  - Note: `public/js/pages/booking.js` now allows the adult/child number field to be temporarily empty while typing, then normalizes it on change. Submission still enforces at least one adult and the six-guest limit.
- [c] Shorten and clarify the mobile reservation journey without removing content.
  - Note: Calendar padding/gaps now preserve usable day targets; all stay rules remain translated and required but live in one disclosure that opens automatically from the existing rules link. The floating Reserva CTA is removed only from the booking page because linking to the current page obscured form controls.
- [c] Make the Local Guide progressive and phone-friendly.
  - Note: `guia-local.html`, `guide.js`, and `guia-local.css` initially show six matching cards on phones, expose translated "Mostrar mais" batches, preserve full search/filter counts, use a horizontal category rail, and expand enough results automatically for direct hash links. Missing partner fallback copy was added to all four public locales.
- [c] Refine the QR/Guest Stay phone navigation.
  - Note: `qr.js` and `qr.css` now highlight the section currently in view in the fixed bottom bar and give anchors stable landing positions; secondary pharmacy information starts closed while emergency information remains immediately visible.
- [c] Normalize the shared public mobile shell and visual geometry.
  - Note: `variables.css`, `components.css`, `layout.css`, and page CSS now keep the brand on one line, reduce mobile section whitespace, use a smaller safe-area-aware floating booking action, provide touch-sized footer links, standardize framed card surfaces at 8px, and constrain supported languages to PT/EN/FR/ES.
- [c] Verify the revamp at phone and desktop sizes.
  - Note: Project checks pass with 27 scripts, 6 JSON files, 11 pages, 662 translation keys, 5 message templates, and 14 gallery images. Scripted browser tests covered 390px touch interactions, narrow-page overflow, 1440px booking layout, both calendar swipes, guide pagination, rules-link behavior, admin drawer state, translated reservation status, and runtime exceptions. The largest admin phone views were reduced substantially: pricing from about 7,383px to 2,651px, expenses from 5,491px to 1,585px, and reports from 5,695px to 1,868px in the final audit seed.

Reversion map for this batch: shared public layout is in `public/css/{variables,base,layout,components}.css` and `public/js/ui/site-shell.js`; booking behavior is in `public/reservas.html`, `public/css/pages/reservas.css`, and `public/js/pages/booking.js`; Local Guide changes are in `public/guia-local.html`, `public/css/pages/guia-local.css`, and `public/js/pages/guide.js`; Guest Stay changes are in `public/qr.html`, `public/css/pages/qr.css`, and `public/js/pages/qr.js`; admin changes are in `public/css/pages/admin.css`, `public/js/admin/main.js`, and `public/js/admin/admin-logic.js`; translation additions are in `public/locales/{pt,en,fr,es}.json`.

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

The Guia Local is a public page for people planning a stay and guests who want to explore the surrounding area. It should focus on **places to discover, day trips, nature, beaches, culture, events, and selected sponsors or partners**.

Practical during-the-stay recommendations such as supermarkets, routine food options, emergency contacts, Wi-Fi credentials, house rules, or stay-specific instructions belong on the Guest Stay page. Commercial partners may still appear publicly in a clearly separated partner section, but should not be mixed into the editorial discovery list.

### Content categories

- [ ] Attractions, walks, nature, beaches, culture, and entertainment.
- [ ] Nearby towns, cities, viewpoints, monuments, and day-trip ideas.
- [ ] Seasonal events and traditional festivities.
- [ ] Family-friendly, rainy-day, accessible, and seasonal suggestions where confirmed.
- [ ] Sponsored businesses, partners, offers, or discount codes in a clearly separated partner section.
- [ ] Keep routine supermarkets, restaurants, pharmacies, fuel, transport, and other practical stay services on the Guest Stay / QR page rather than in the editorial discovery list.

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
- The editorial list stays focused on places and experiences worth discovering rather than routine stay logistics.
- Sponsored content is clearly identified, separated from the editorial list, and does not imitate an independent recommendation.
- Listings can be updated or unpublished from the admin application without editing code.
- External opening hours and prices are not presented as guaranteed unless they are actively maintained.

## 4.2 Guest Stay page — QR/NFC guest hub

### Prototype implementation note — `qr.html`

- [c] Add a mobile-first `qr.html` prototype that remains useful without personalised reservation data.
- [c] Add a dedicated guest-page data-provider boundary so the UI is not coupled to the admin page, DOM, or browser `localStorage`.
- [c] Add placeholder host contacts with language labels and call/WhatsApp actions that stay disabled until real numbers are configured.
- [c] Add one-tap emergency, health, pharmacy, supermarket, restaurant, transport, fuel, property-location, partner, bicycle, Wi-Fi, and house-information sections.
- [c] Keep safety/house-rule content that has not been approved visibly marked as pending rather than inventing operational guidance.
- [!] Production migration: move reservations and guest-only content to a **private server-side database** behind authenticated APIs. Personalised QR/direct links should carry an unguessable expiring/revocable stay token; the guest endpoint validates it server-side and returns only the minimum guest-facing projection (first name, stay dates/times, guest count, preferred language, and relevant extras). Never expose payment information, owner notes, other reservations, the guest directory, or raw admin state.
- [!] The static property QR/NFC tag should continue to support a generic guest view; personalised information should unlock only through the secure stay token or another approved verification flow.
- [!] Before launch, replace the prototype adapter, owner placeholders, Wi-Fi placeholders, house/check-out placeholders, and unapproved safety copy with admin-managed production data.

### Purpose

Create a mobile-first page for guests who are currently staying at O Refúgio. It should be reachable through a QR code, an NFC tag, and a direct link supplied during check-in or reservation confirmation.

The page should provide the information a guest may need during the stay without requiring them to search through the public website.

### Access and personalisation

- [c] Prototype bridge: `qr.html` reads the current active reservation from the same-origin `refugio-admin-prototype-state-v1` browser localStorage through an isolated `guest-stay-provider.js` service. It mirrors the admin active-stay rule and returns only a guest-safe projection (name, stay dates/times, guest count, language, bicycles). This is same-browser prototype behaviour only and must be replaced by the private database + expiring/revocable stay-token API before real guest deployment.
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

#### Nearby essentials during the stay

- [ ] Show supermarkets and grocery shops with approximate travel time and one-tap directions.
- [ ] Show practical restaurant / takeaway suggestions supplied by the hosts.
- [ ] Keep commercial partners clearly labelled when they also appear in this practical guest list.
- [ ] Include pharmacies, fuel, taxis/transport, and other practical services once their details are confirmed.
- [ ] Keep opening hours and availability clearly non-guaranteed unless actively maintained.
- [ ] Keep these practical listings mobile-first and easy to scan from the property QR/NFC page.

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
- [ ] Explain that it includes places to explore, day trips, beaches, nature, events, and clearly labelled partner recommendations.
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
- [c] Expand the admin demonstration seed into a complete showcase of the implemented workflows.
  - Note: Added active, future, past, cancelled, no-show, provisional, paid, unpaid, deposit-paid, and refunded reservations across every supported source and language. The seed also includes open/accepted/rejected website requests, repeat guests, children, bicycles, discounts, extra guests, expenses, paid/free/voluntary work, and detailed audit examples spread across reporting periods.
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
  - Note: The prototype includes payment instructions, combined reservation/payment confirmation, pre-arrival, checkout, and post-stay feedback templates in Portuguese, French, English, and Spanish.
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
