# New: managing the sitemap through the Content API

*Added 25 November 2026.*

The website's `/sitemap.xml` is no longer an uploaded file. It is built live
from published content, and it can now be managed in the admin dashboard
(Settings › Sitemap, and a Sitemap box in each item's SEO & Sharing tab) and
through the Content API.

**How to use this file:** paste the box below into your AI tool's
instructions (ChatGPT: the GPT's Instructions; Claude: Project instructions),
next to the instructions it already has, or at the start of a chat. The AI
also finds the same details itself in `GET /api/v1/schema`.

**What the API key needs:**
- It must be a **Direct** key. "Needs approval" keys can't change the sitemap.
- To change one item's sitemap setting, the key needs that item's area: pages,
  news, casinos, bonuses or guides.
- To see the whole sitemap or change the site-wide settings, the key needs
  the **settings** area.
- Only a key created by a Super Admin or Admin can change the site-wide
  settings.

Admins can check or change the key's areas in Settings › API Keys.

---

## Instructions for the AI (copy everything in the box)

```text
== Sitemap (https://topcasinosg.com.sg/sitemap.xml) ==
The website builds /sitemap.xml live from published content. There is no file to
upload or edit: you control what is listed through the Content API
(https://backapi.topcasinosg.com.sg/api/v1, key sent as "Authorization: Bearer").
These calls need a Direct key and save at once, with no approval step and no dry
run. Before changing anything, tell the user exactly what you will change and
wait for them to agree.

What is listed:
- Content types: page, casino, guide, news, bonus, and listing (the fixed list
  pages /casinos, /guides, /news and /blacklist, ids 1-4). Each type has a
  switch that sets the default for every item of that type.
- Each item has its own mode:
  "default" (follow the type's switch), "include" (always listed),
  "exclude" (never listed).
- Always left out, whatever the settings say: drafts and scheduled items,
  items set to noindex in their SEO tab, and addresses with an active redirect.
- If the whole website is set to noindex (Settings > General), or the sitemap is
  switched off, /sitemap.xml shows "not found".

Reading:
- GET /sitemap  (needs the settings area)
  -> {settings: {enabled, types, extraUrls, updatedAt}, siteNoindex,
      items: [{entityType, entityId, name, path, updatedAt, mode, listed, reason}]}
  "items" is every published page and item. "listed" says whether it is in
  /sitemap.xml now. "reason" says why: listed, included, excluded, type_off,
  noindex, redirected, unpublished.
- GET /sitemap/items/{type}/{id}  (needs that type's area)
  -> {item: {...same fields...}, sitemapOn, typeOn}
  Use the same id as GET /pages, /casinos, /guides, /news or /bonuses.

Changing items (needs each item's area):
- PUT /sitemap/items
  {"items": [{"entityType": "page", "entityId": 12, "mode": "exclude"},
             {"entityType": "casino", "entityId": 3, "mode": "include"}]}
  All or nothing: if one item is invalid, nothing is saved. Up to 1000 per call.
  Prefer "default" to put an item back to normal. Use "include" or "exclude"
  only when the user wants that one item to differ from its type's switch.

Changing site-wide settings (needs the settings area and an Admin's key):
- PUT /sitemap/settings  {enabled, types, extraUrls}
  Send only the fields you want to change; the ones left out stay as they are.
  - enabled: true or false switches the whole sitemap on or off.
  - types: the full list of content types that are ON, e.g.
    ["page","casino","guide","news","listing"] (this turns "bonus" off).
  - extraUrls: replaces the WHOLE list of extra addresses. Each one is a path
    starting with "/" or a full address on this website (other websites are
    refused). GET /sitemap first, then send the old list plus your change.

Checking your work:
- After a change, GET /sitemap (or /sitemap/items/{type}/{id}) and confirm
  "listed" and "reason" are what the user asked for. You can also open
  https://topcasinosg.com.sg/sitemap.xml, which updates within about 5 minutes.
- If a page that should be listed isn't, read "reason": noindex is fixed in the
  item's SEO settings (PUT /seo/{type}/{id}), redirected under Redirects,
  unpublished by publishing it. Don't use "include" to work around those; it
  won't help.
- Every call is recorded in the admin activity log with this key's name.
```

---

## Examples of what to ask the AI

- "Is /about in the sitemap? If not, why?"
- "Take the bonus pages out of the sitemap."
- "Remove the Terms page from the sitemap but keep all other pages."
- "Add /promotions/cny-2027 to the sitemap as an extra address."
- "List everything that's not in the sitemap and the reason for each."
