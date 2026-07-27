# Design System

## Mood
Warm stone luxury, mountain calm, boutique rural retreat.

# Multilingual prototype note
The homepage has been prepared for multilingual expansion with a lightweight client-side i18n setup.

## Current approach
- One shared HTML structure
- Text content stored in `public/locales/*.json`
- Language selected through a switcher in the header
- Selected language saved in `localStorage`
- Current homepage wired to the locale keys already

## Why this was added now
This avoids replacing placeholders directly in hardcoded HTML and makes future pages easier to scale to 4–5 languages.

## Next rule to follow
For every new page:
- write the structure once
- avoid hardcoded user-facing strings in HTML when possible
- add new copy to locale JSON files immediately
- test long labels on mobile before moving on
