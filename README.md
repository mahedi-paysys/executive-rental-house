# Reusable website template

## Change one file

**`content.js` is the only file you edit to replace the website's content.** It contains the page title/description, brand, every section's copy, buttons, navigation, links, image paths, alt text, accessibility labels, city names, listing details and gallery labels.

1. Give ChatGPT `content.js`, `CONTENT-PROMPT.md`, and the new website's content.
2. Ask it to return the complete replacement `content.js`.
3. Replace the contents of your existing `content.js`, then save.
4. Open `index.html` or refresh your browser. No build, installation or server is needed.

The design, Poppins font, responsive layouts and animations stay in `style.css`/`executive.css`. Rendering and interactions stay in `content-renderer.js`/`main.js`. Keep those files and `index.html` unchanged when replacing copy.

## How the content file is organised

| Area | What to edit |
| --- | --- |
| `meta` | Language, browser title and search description |
| `sections.loading`, `header`, `navigation` | Loading text, logo text and menu links |
| `sections.home` | Hero headline, supporting copy, CTA and background image |
| `sections.cities.items` | Any number of marquee names; automatically repeated |
| `sections.about` | About copy, photo, experience badge and contact button |
| `sections.properties` | Collection heading, search labels, filter options, source note and empty-state text |
| `sections.relocations` | Image, headline, paragraphs, three steps and CTA |
| `sections.testimonial` | Quote, attribution, expanded story and background image |
| `sections.management` | Management photo, intro and three service points |
| `sections.links` | Three premium resource cards: titles, copy, links and backgrounds |
| `sections.contact` | Main CTA image, copy and button link |
| `sections.footer` | Footer headings, wordmark, navigation, email, copyright and credit |
| `sections.accessibility` | Skip-link and close-dialog labels |
| `collection` | Card/gallery text, filter toggles and any number of cards |

Keys ending `_2`, `_3` and so on are the next copy slot in that section. Headline keys and `em` are separately styled parts of the same heading. Use **plain text**, not HTML, inside all strings. Line breaks and accent styling are controlled by the template.

Do not rename keys or change `schemaVersion`. The existing design has fixed slots for paragraphs, menu links, three relocation steps, three services and three resource cards. Fill those slots with the new content; this is a content-driven template, not an automatic website scraper or arbitrary layout generator. Cards and marquee names can be added or removed freely.

## Images and links

Replace any `img_src`, `background_image`, `resource_background_*` or card `photos[].src` value with a local path such as `images/my-photo.jpg` or a direct HTTPS image URL. A photo's webpage URL is not its image URL. For reliable offline use, place your photos in `images/` and use relative paths. Update `img_alt`, hero image labels and card photo `alt` values as well.

All 13 currently used Unsplash photos are retained locally in `images/unsplash/`; `sources.json` records their sources. Fonts are bundled locally in `fonts/`. Unsplash photos are illustrative; the editable card/gallery/source labels make that clear. If you provide genuine property photos, update those labels accordingly.

Link keys ending `_href` and each card's `enquiry.href` accept section anchors, relative pages, HTTP/HTTPS, `mailto:` or `tel:`. Scripts and HTML are not accepted as content.

## Cards and filtering

Each `collection.items` entry has these fields:

- `id`: unique string or number; keep unique across cards.
- `name`, `description`, `cardNote`: editable text.
- `status`: one of the stable codes `Listed`, `Rented` or `Enquire`. Display wording lives in `collection.statusLabels` and the section filter labels.
- `priceLabel`, `priceSuffix`: exactly what visitors see, e.g. `£750` and `/ month`.
- `sortPrice`: numeric sorting value (e.g. `750`), or `null` for unknown prices. Unknown prices sort last.
- `bedrooms`: numeric value for filtering. For another business, set `bedroomFilterEnabled` to `false` and use `0`.
- `specs` and `facts`: arrays of plain text for the card chips and detail rows. They do not control the filters.
- `photos`: one or more `{ "src": "images/photo.jpg", "alt": "Photo description" }` objects.
- `enquiry`: `{ "label": "Contact us", "href": "mailto:hello@example.com" }`.

Set `collection.priceSortEnabled` to `false` to hide price sorting. Set a section's `enabled` to `false` to hide it. Update navigation links if you hide a section. Empty `collection.items` displays the configured empty state. A one-photo gallery hides the previous/next controls.

`collection.results.format` uses `{count}` and `{noun}`; card accessibility uses `{name}`; the gallery eyebrow uses `{status}`. Preserve those placeholders when changing their surrounding text.

## Check your replacement

Run `node scripts/check-content.cjs` if Node.js is installed. It checks content bindings, unique IDs, status values, filter numbers and local image paths. The browser also shows a clear content-file diagnostic for invalid fields rather than rendering a partially broken page. JavaScript syntax errors are shown as a missing-content diagnostic; check quotes, commas and the `window.SITE_CONTENT = {...};` wrapper.

For automated browser verification, `scripts/verify-site.cjs` needs Playwright and Chrome. It checks the supplied content and separately serves an alternative content file to prove that branding, links, images and cards change without editing the design. Its original-content counts intentionally correspond to the supplied Executive House Rentals example.

## Files retained

- `content.js`: all editable content.
- `index.html`: fixed layout with content bindings.
- `content-renderer.js`, `main.js`: binding, validation and UI behavior.
- `style.css`, `executive.css`: design and animation rules.
- `fonts/`, `images/unsplash/`: currently used assets.
- `CONTENT-PROMPT.md`: prompt to reuse with another website's content.
- `scripts/`: content and browser verification.
