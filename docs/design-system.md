# O Refúgio Design System

## Character

O Refúgio should feel warm, calm, premium, and grounded in the stone house and mountain setting. The public website may be editorial and atmospheric; the admin must remain restrained, dense, and operational.

## Foundations

- Shared tokens: `public/css/variables.css`.
- Reset and document defaults: `reset.css` and `base.css`.
- Shared layout/header/footer: `layout.css`.
- Reusable controls, buttons, cards, form fields, and floating actions: `components.css`.
- Page-specific exceptions belong under `public/css/pages/`.

Do not duplicate a global control treatment in a page file when the same rule can serve every page.

## Typography

- Display headings use the established serif stack and should be reserved for page/section identity.
- UI labels, body copy, forms, buttons, and admin content use the established sans-serif stack.
- Compact cards and panels use modest headings rather than hero-scale typography.
- Letter spacing is never negative; viewport width does not directly scale font size.

## Colour

The palette combines off-white, charcoal, mountain green, muted gold, warm red, and a small range of supporting neutrals. Red indicates warnings, conflicts, occupied dates, destructive actions, or genuine promotions; it is not decorative.

Maintain strong text contrast and avoid allowing a single green, beige, brown, or blue family to dominate an entire screen.

## Geometry

- Standard framed cards and panels use a maximum 8px radius.
- Form controls may use the existing slightly softer radius when needed for touch comfort.
- Do not place cards inside cards.
- Sections are unframed page bands; cards frame individual records, tools, or disclosures.
- Fixed-format elements use explicit grid tracks, aspect ratios, and minimum dimensions so dynamic copy does not shift controls.

## Buttons and icons

- Use Lucide-style icons already provided by the project's icon helpers.
- Familiar icon-only actions need an accessible name and tooltip/title.
- Use icon plus text for primary or potentially ambiguous commands.
- Same action means same icon, visual weight, and normal placement across admin views.
- Edit uses pencil, remove uses trash, close/collapse uses chevron-up, expand uses chevron-down/plus according to the existing disclosure, email uses mail, call uses phone, WhatsApp uses message-circle.
- Destructive actions are visually distinct and request confirmation.

## Forms

- Labels stay attached to their controls and align to the bottom of equal-height label tracks in desktop multi-column rows.
- Required `*` markers remain visible even where a field is intentionally non-blocking; helper/error copy explains actual validation.
- Date fields use `dd/mm/aaaa` display/entry in admin and retain a native calendar-picker action.
- Number fields may be temporarily empty while typing and normalise only on blur/change/submit.
- Selects use the shared styled dropdown treatment.
- Significant unsaved edits expose state and may warn before navigation.

## Public responsive behaviour

- Header, menu, language control, floating WhatsApp, and booking action respect safe-area insets.
- The page must not horizontally scroll at 360px or wider.
- Footer groups address/contact, social/review, and legal/credit information with tighter mobile spacing.
- Desktop carousels expose faded edge controls on hover/focus; touch devices use swipe/scroll.
- Mobile gallery lightbox uses swipe at base zoom and pan while zoomed.

## Admin responsive behaviour

- Desktop uses a persistent sidebar and compact top-right identity/actions.
- Phones use a compact header, bottom navigation for common destinations, and an off-canvas full menu.
- High-frequency actions appear before summaries; rare forms and history remain collapsed.
- Record rows present identity, date, state, and the most useful operational value before secondary detail.
- Calendar mobile cells use compact status markers; full names/details belong in the selected-day panel.

## Internationalisation

- Public HTML is structural and contains no Portuguese fallback copy.
- `public/locales/pt.json` determines public locale schema and ordering.
- EN/FR/ES use the exact same key paths.
- `messages.json` contains all admin guest-message translations in one catalogue.
- Test the longest translation at mobile and desktop widths; text may wrap but must not overlap or escape its control.

## Accessibility baseline

- Every interactive element is keyboard reachable.
- Focus states remain visible.
- Icon-only actions have accessible names.
- Disclosures use native `<details>/<summary>` where practical.
- Images have meaningful translated alt text when content-bearing and empty alt text when decorative.
- Motion respects `prefers-reduced-motion`.
- Colour is not the sole carrier of booking status or validation state.

## Visual QA

Use `npm run qa:capture` to inspect 390px and 1440px states and confirm `scrollWidth === clientWidth`. Always test the dense admin views, booking calendar/summary, header/footer, gallery lightbox, and Guest Stay bottom navigation after shared CSS changes.
