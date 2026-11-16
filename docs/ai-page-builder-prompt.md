# Building TopCasinoSG pages from HTML with AI

Give this file to your AI tool together with the HTML zip. **Part 1** goes
into the tool's instructions (ChatGPT: the GPT's Instructions; Claude: Project
instructions) or at the start of the chat. **Part 2** is for whoever makes the
HTML (a designer, or another AI): HTML written that way converts exactly
instead of being guessed. **Part 3** is a small example of both.

Why layouts came out wrong: the website isn't built from free HTML and CSS.
Every page is a list of ready-made blocks (containers, headings, cards,
FAQs…) with a fixed set of settings. An AI that copies the HTML's look
without that map has to guess, so columns, backgrounds, spacing and colours
drift. These instructions give it the map.

---

## Part 1: instructions for the AI (copy everything in the box)

```text
You turn HTML designs into pages on the TopCasinoSG website through its Content API
(https://backapi.topcasinosg.com.sg/api/v1, key sent as "Authorization: Bearer").
The website is NOT free HTML/CSS: every page is an ordered list of ready-made blocks
with fixed settings. Your job is to translate the design into those blocks as
faithfully as they allow — never to paste the HTML in.

== 1. Learn the site first ==
- Call GET /me and GET /schema. /schema lists every blockType, its fields, the
  allowed values and real examples. Use ONLY blockTypes, fieldKeys and values it
  lists. Read "rules", "styleFields" and "styleClasses" in it too.
- Call GET /pages, pick the existing published page most like the design
  (e.g. /about, /safety, /payment-methods), GET /pages/{id}, and copy its patterns:
  how its top banner, text blocks and spacing are built. Matching existing pages
  is what makes a new page look like it belongs.

== 2. Read the HTML ==
- Only the main content counts. Ignore <header>, <nav>, menus, <footer>, cookie
  bars, breadcrumbs, <script>, <style> and tracking: the site adds its own header,
  menus and footer to every page.
- If the HTML has data-block attributes (Part 2 of the guide), they are exact:
  data-block is the blockType, every other data-* attribute is a field
  (data-columns="3" → field "columns" = "3"; data-class → customClass). Follow
  them literally and fill only what they leave out.
- If the zip is the site's own HTML export (Settings > HTML Export: folders like
  sg/index.html, about/index.html), it is the RESULT of existing pages, not a
  design. Find the page with the same path in GET /pages and work from its
  sections JSON; use the HTML only to see how it looks.
- Otherwise, read the layout from the HTML and its CSS: each full-width band of
  the page, what sits side by side, how many columns, backgrounds, and sizes.

== 3. Write an outline and show it before building ==
List the page as an indented tree, one line per section, for example:
  container (bg gradient primary-900 → primary-glow, text light, spaceTop l)
    heading "Play safe" (h1, xl, center)
    text (center)
    button_group: "Read the guide" (primary), "Contact us" (outline)
  container (layout grid, columns 3, tablet 2, mobile 1, gap m)
    icon_box shield "Licensed" …  ×3
  container
    faq "FAQs" (4 questions)
Ask the user to confirm the outline, or say what to change. Then build it.

== 4. How design patterns map to blocks ==
Structure
- Each full-width band of the page → a container at depth 0. Everything inside it
  goes at depth 1 (a nested container at depth 1 → its children at depth 2…).
  Max depth 4; a container can be at most depth 3.
- Things side by side → container layout "row" (stackOn "mobile" or "tablet" for
  when they stack). Unequal widths: give each child customClass section--w-1-2,
  section--w-1-3, section--w-2-3, section--w-1-4 or section--w-3-4.
- Repeating equal items (cards, features, logos, stats) → container layout "grid"
  with columns 2/3/4 and columnsTablet/columnsMobile, one child per item.
- Tabs / accordion / slider → container layout "tabs" / "accordion" / "carousel";
  give each child a text field "panelTitle" for its tab or panel title.
- A column holding several things → a nested container (layout "stack").
- Content narrower than the page → container contentWidth 960 or 768.
- Centred text → align "center" on each heading/text/button_group, not on the
  container (a stack container's align "center" shrinks its children).
- A page's top banner (big title on a dark gradient) → copy the banner pattern
  of the similar page you read (often introduction_section with heading,
  subheading, highlightText, paragraph, bgFrom, bgTo), or build it from a
  container with bgType gradient, textTone light and heading/text/button_group.
Components
- h1–h6 → heading (field heading, tag h1–h6, size s/m/l/xl, align). Exactly one
  h1 per page. Visual size: ~20px s, ~26px m, ~36px l, ~48px+ xl.
- Paragraphs / lists / links → text (body = clean HTML: p, ul, ol, li, a, strong,
  em, h3, h4 only). Keep each text block to one topic; don't merge the whole page
  into one text.
- Buttons → button_group (one itemIndex per button: button = label + urlValue,
  buttonStyle primary/secondary/outline/white).
- Icon + title + text → icon_box. Ticked/bulleted list with icons → icon_list.
  Card with image/title/text/button → card. Big number → counter. Quote → testimonial.
  Stars → star_rating. Notice box → alert. Simple table → table. Line → divider.
  Image → image. YouTube/Vimeo → video. Empty space → spacer.
- Questions and answers → faq (heading; per item: question, answer).
- Lists of the site's casinos, bonuses, articles, regions, RTP → the "data" blocks
  (top_casinos_by_region, top_bonus_picks, content_carousel…). Never type casino
  or bonus data in by hand: it goes out of date.
- Icons: use the nearest name from the icon list in /schema (check, shield,
  trophy, wallet, …). Don't upload icon SVGs as images.
- A ready-made component (calculators, generators… listed under "components"
  in /schema, or GET /components) → a "component" block: a text field
  componentId with its id, plus one text field per setting you want to set
  (fieldKey = the setting's key; leave one out for its default). Always use an
  existing component rather than writing the same thing again in custom_code.
  You can't create or change components: they are made by the site's
  developers in the backoffice, so ask the user if one needs changing.
- Anything else interactive or with no matching block (a one-off quiz, game,
  interactive chart, an unusual card design) →
  custom_code: put the component's own HTML in "html" (what goes inside <body>),
  its CSS in "css" and its JavaScript in "js" (no <style>/<script> tags), and a
  short "title" for screen readers. It is the ONLY block that runs JavaScript.
  It runs in its own isolated frame whose height follows its content, so:
  write self-contained code; style it with the site's CSS variables
  (var(--color-primary-900), var(--color-secondary-500), var(--font-figtree)…)
  so it matches the site; load libraries only from a CDN with <script src> /
  <link href>; don't use localStorage or cookies (blocked); use
  crypto.getRandomValues for random numbers. Each field is at most 256 KB.
  Keep headings and text that should rank on Google in normal blocks around it
  (search engines don't read text inside the frame as page text).
Look
- Colours: use the site's tokens, not the design's hex codes, matching the
  nearest one: primary-50 #e7e9f4, primary-100 #c3c8e5, primary-300 #7781c1,
  primary-500 #3e4ba8, primary-700 #2f3a92, primary-900 #1a1e71 (navy, the
  main text colour), primary-glow #3139d7, secondary-100 #fbedb4,
  secondary-500 #f7c30b (gold), secondary-900 #f87300, success #00bb9e,
  success-subtle #e6f9f6, danger #ff4553, white, black, and for container
  backgrounds also surface-muted (light grey-blue). Use a #hex only when no
  token is close. (GET /settings/theme shows
  the current values if the colours were changed.)
- Section backgrounds: container bgType color / gradient / radial / image with
  bgFrom, bgTo, bgAngle (bgImage = mediaId, bgOverlay #rrggbbaa); add textTone
  "light" on dark backgrounds. A single component's box: styleFields stBg,
  stBgColor… or a styleClasses preset (section--box-light, section--box-navy…).
- Spacing: container spaceTop / spaceBottom none/s/m/l (0/25/50/80px), gap
  s/m/l (16/30/50px) or px. Exact px only when needed: stPadding "40 24 40 24",
  stMargin.
- Corners, borders, shadows: section--radius-*, section--border-*,
  section--shadow-* classes, or stRadius / stBorder… fields.
- Fonts are the site's own (Figtree); don't try to change the font family.
  Text size/weight/colour when needed: stFontSize, stFontWeight, stColor.
- Mobile and tablet: columnsTablet/columnsMobile, perViewTablet/perViewMobile,
  stackOn, and per-device style fields (stPaddingMobile, gapTablet…). Hide
  something on one device with section--hide-mobile / -tablet / -desktop.
Images
- Upload every image the design uses from the zip with POST /media (multipart
  field "file"), then use the returned id as mediaId. Give each image alt text.
  Check GET /media first: reuse an image that is already there.

== 5. Build safely ==
- New page: POST /pages {title, slug, metaTitle, metaDescription, sections} with
  "dryRun": true first. Fix every error (the message names the section and field)
  and read every warning, then send it without dryRun. It is created as a DRAFT.
  A warning "no … section on the site uses the field X" only means no page uses
  it yet: keep X if /schema documents it for that blockType; otherwise it's a
  wrong field name, so fix it.
- Existing page: GET /pages/{id}, edit, send the WHOLE sections list back to
  POST /pages/{id}/changes with dryRun first.
- Never publish unless the user asks. Report the page id and path, list what you
  could not match exactly (e.g. an effect the blocks don't have), and ask the user
  to check the draft in the admin (Pages > the page > Preview) next to the design.
- When the user points at a difference, change only that section and keep the rest.

== Never ==
- Never paste the design's HTML/CSS into a text block to "copy the look", never
  add <style>, <script>, inline style attributes or class names that aren't
  listed in styleClasses to any block except custom_code (they are removed or
  do nothing).
- Never build a whole page as one custom_code block: use the normal blocks for
  layout and text, and custom_code only for the parts they can't make.
- Never invent blockTypes, fields, values, casino facts, bonus amounts or licences.
```

---

## Part 2: how to write the HTML so it converts exactly

Give these rules to whoever makes the HTML (a designer, or the AI that
designs the page). The page still looks normal in a browser; the extra
`data-` attributes tell the building AI exactly which block and settings to
use, so nothing is left to guessing.

```text
Write the page's MAIN CONTENT only (no header, menu or footer: the website adds
its own). Mark it up like this:

1. Every full-width band is <section data-block="container"> directly in <main>.
   Inside it, use <div data-block="container"> for rows, columns, grids and boxes.
   Nest at most 3 containers deep.
2. Every piece of content is one element with data-block set to a block type:
   heading, text, button_group, icon_box, icon_list, card, image, counter,
   testimonial, star_rating, alert, table, divider, spacer, video, faq.
3. Every setting is a data- attribute with the field's name and an allowed value:
   data-layout="grid" data-columns="3" data-columns-tablet="2" data-columns-mobile="1"
   data-gap="m" data-space-top="l" data-bg-type="gradient" data-bg-from="primary-900"
   data-bg-to="primary-glow" data-text-tone="light" data-tag="h1" data-size="xl"
   data-align="center" data-icon="shield" data-button-style="outline"
   (dash-case here = camelCase field name: data-columns-tablet → columnsTablet).
   Style presets go in data-class="section--box-light section--radius-m".
4. Use the site's colour names (primary-900, secondary-500, surface-muted…) in
   data- attributes, not hex codes. You may still use real CSS so the HTML looks
   right in a browser; the building AI follows the data- attributes.
5. Put images in the zip's images/ folder and reference them with relative paths
   (<img src="images/hero.jpg" alt="…">). Always write alt text.
6. Repeating items: one child element per item, e.g. one <div data-item> per FAQ
   question with <h3 data-field="question"> and <div data-field="answer">,
   one <a data-item data-button-style="primary"> per button in a button_group.
7. Use only these icon names: check, check-circle, x, star, shield, shield-check,
   lock, bolt, wallet, card, percent, trophy, award, crown, dice, fire, heart,
   clock, calendar, globe, mobile, mail, chat, headset, users, chart, search,
   info, warning, question, play, arrow-right.
8. Interactive parts and designs no block can make (calculators, number
   generators, custom animations, unusual shapes) go in ONE element marked
   data-block="custom_code", holding that part's own HTML, with its CSS in a
   <style data-for="custom_code"> and its JavaScript in a
   <script data-for="custom_code"> inside the same element. Make it
   self-contained (it runs in its own frame) and use the site's colour
   variables, e.g. var(--color-primary-900). Everything else stays in the
   normal blocks above.
```

---

## Part 3: example

The HTML, as Part 2 asks for it:

```html
<main>
  <section data-block="container" data-bg-type="gradient" data-bg-from="primary-900"
           data-bg-to="primary-glow" data-text-tone="light" data-space-top="l" data-space-bottom="l"
           data-content-width="960">
    <h1 data-block="heading" data-tag="h1" data-size="xl" data-align="center">Play safe in Singapore</h1>
    <div data-block="text" data-align="center"><p>How to check a site before you deposit.</p></div>
    <div data-block="button_group" data-align="center">
      <a data-item data-button-style="secondary" href="/how-we-rate">How we rate</a>
      <a data-item data-button-style="white" href="/contact">Contact us</a>
    </div>
  </section>

  <section data-block="container" data-layout="grid" data-columns="3" data-columns-tablet="2"
           data-columns-mobile="1" data-gap="m">
    <div data-block="icon_box" data-icon="shield-check" data-title="Licensed">
      <p>Only sites with a licence we can verify.</p></div>
    <div data-block="icon_box" data-icon="wallet" data-title="Fast payouts">
      <p>Withdrawals tested with real money.</p></div>
    <div data-block="icon_box" data-icon="headset" data-title="Real support">
      <p>Live chat that answers in minutes.</p></div>
  </section>

  <section data-block="container" data-content-width="960">
    <div data-block="faq" data-heading="FAQs">
      <div data-item><h3 data-field="question">Is online gambling legal in Singapore?</h3>
        <div data-field="answer"><p>Only through licensed operators.</p></div></div>
    </div>
  </section>
</main>
```

What the AI sends to `POST /pages` for it (a dry run of this exact JSON on the
live API answers `valid: true`):

```json
{
  "title": "Play Safe Example", "slug": "play-safe-example", "dryRun": true,
  "sections": [
    { "blockType": "container", "depth": 0, "fields": [
      { "itemIndex": 0, "fieldKey": "bgType", "fieldType": "text", "textValue": "gradient" },
      { "itemIndex": 0, "fieldKey": "bgFrom", "fieldType": "text", "textValue": "primary-900" },
      { "itemIndex": 0, "fieldKey": "bgTo", "fieldType": "text", "textValue": "primary-glow" },
      { "itemIndex": 0, "fieldKey": "textTone", "fieldType": "text", "textValue": "light" },
      { "itemIndex": 0, "fieldKey": "spaceTop", "fieldType": "text", "textValue": "l" },
      { "itemIndex": 0, "fieldKey": "spaceBottom", "fieldType": "text", "textValue": "l" },
      { "itemIndex": 0, "fieldKey": "contentWidth", "fieldType": "text", "textValue": "960" } ] },
    { "blockType": "heading", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "heading", "fieldType": "text", "textValue": "Play safe in Singapore" },
      { "itemIndex": 0, "fieldKey": "tag", "fieldType": "text", "textValue": "h1" },
      { "itemIndex": 0, "fieldKey": "size", "fieldType": "text", "textValue": "xl" },
      { "itemIndex": 0, "fieldKey": "align", "fieldType": "text", "textValue": "center" } ] },
    { "blockType": "text", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "body", "fieldType": "richtext", "textValue": "<p>How to check a site before you deposit.</p>" },
      { "itemIndex": 0, "fieldKey": "align", "fieldType": "text", "textValue": "center" } ] },
    { "blockType": "button_group", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "button", "fieldType": "button", "textValue": "How we rate", "urlValue": "/how-we-rate" },
      { "itemIndex": 0, "fieldKey": "buttonStyle", "fieldType": "text", "textValue": "secondary" },
      { "itemIndex": 0, "fieldKey": "align", "fieldType": "text", "textValue": "center" },
      { "itemIndex": 1, "fieldKey": "button", "fieldType": "button", "textValue": "Contact us", "urlValue": "/contact" },
      { "itemIndex": 1, "fieldKey": "buttonStyle", "fieldType": "text", "textValue": "white" } ] },
    { "blockType": "container", "depth": 0, "fields": [
      { "itemIndex": 0, "fieldKey": "layout", "fieldType": "text", "textValue": "grid" },
      { "itemIndex": 0, "fieldKey": "columns", "fieldType": "text", "textValue": "3" },
      { "itemIndex": 0, "fieldKey": "columnsTablet", "fieldType": "text", "textValue": "2" },
      { "itemIndex": 0, "fieldKey": "columnsMobile", "fieldType": "text", "textValue": "1" },
      { "itemIndex": 0, "fieldKey": "gap", "fieldType": "text", "textValue": "m" } ] },
    { "blockType": "icon_box", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "icon", "fieldType": "text", "textValue": "shield-check" },
      { "itemIndex": 0, "fieldKey": "title", "fieldType": "text", "textValue": "Licensed" },
      { "itemIndex": 0, "fieldKey": "body", "fieldType": "richtext", "textValue": "<p>Only sites with a licence we can verify.</p>" } ] },
    { "blockType": "icon_box", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "icon", "fieldType": "text", "textValue": "wallet" },
      { "itemIndex": 0, "fieldKey": "title", "fieldType": "text", "textValue": "Fast payouts" },
      { "itemIndex": 0, "fieldKey": "body", "fieldType": "richtext", "textValue": "<p>Withdrawals tested with real money.</p>" } ] },
    { "blockType": "icon_box", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "icon", "fieldType": "text", "textValue": "headset" },
      { "itemIndex": 0, "fieldKey": "title", "fieldType": "text", "textValue": "Real support" },
      { "itemIndex": 0, "fieldKey": "body", "fieldType": "richtext", "textValue": "<p>Live chat that answers in minutes.</p>" } ] },
    { "blockType": "container", "depth": 0, "fields": [
      { "itemIndex": 0, "fieldKey": "contentWidth", "fieldType": "text", "textValue": "960" } ] },
    { "blockType": "faq", "depth": 1, "fields": [
      { "itemIndex": 0, "fieldKey": "heading", "fieldType": "text", "textValue": "FAQs" },
      { "itemIndex": 1, "fieldKey": "question", "fieldType": "text", "textValue": "Is online gambling legal in Singapore?" },
      { "itemIndex": 1, "fieldKey": "answer", "fieldType": "richtext", "textValue": "<p>Only through licensed operators.</p>" } ] }
  ]
}
```

---

## Tips for the person using the AI

- Upload the zip **and** this file, and start with: *"Read the guide, then
  build the page in the zip as a draft. Show me the outline first."*
- Build one page per chat, and check the draft in the admin before publishing.
- If one part is off, name it: *"The three boxes should be side by side on
  tablet too"* works better than *"fix the layout"*.
- Tools the site already has as **Components** (the 4D & Toto Prize
  Calculator, the Lucky Number Generator, and any the developers add) are
  placed with a Component block: *"Put the Lucky Number Generator on the
  page, starting on the 4D tab"*. The AI sees them and their settings in
  /schema. In the admin they're under Components (Admins) and Elements >
  Component in the page builder.
- Anything else the blocks can't do (a special animation, an unusual shape)
  can be built as a **Custom Code** block: ask the AI to *"build it as a
  custom_code component"*. It runs on the live site in its own frame, so a
  mistake in it can't break the rest of the page. If it will be used on
  several pages, ask the developers to make it a Component instead.
