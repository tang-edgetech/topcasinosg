# TopCasinoSG connector (MCP)

Lets an AI app such as Claude Desktop work on the TopCasinoSG website in
plain words, for example *"Change the hero heading on the Casino Bonus
page"* or *"Write a draft news article about this week's new casinos"*.

The connector runs on your own computer and talks to the site's Content API
with an API key. The AI can only do what that key allows. It never touches
the database or the server directly.

| | Address |
|---|---|
| Website | https://topcasinosg.com.sg |
| API (the connector talks to this) | https://backapi.topcasinosg.com.sg |

Any app that supports local MCP servers works. **Claude Desktop** on the
free plan is enough: the connector doesn't need a paid AI plan.

## Before you start

1. **Node.js 18 or newer.** Install the LTS version from
   [nodejs.org](https://nodejs.org). To check, run `node --version` in a
   terminal.
2. **This folder (`mcp/`) on your computer**, for example
   `C:\topcasinosg\mcp`. It has no dependencies, so you don't need to run
   `npm install`.
3. **An API key.** In the admin dashboard go to **Settings > API Keys >
   + Create Key**, pick the areas the AI may work on, and choose a mode:
   - **Direct** (what we use while building the site together): the AI's
     changes go live at once, so you see the result straight away and we can
     fix problems as they come up. It's still safe to undo:
     - New pages and articles start as drafts.
     - Edited pages keep their last 10 versions of the content (**Edit Page >
       Revisions**); the Activity Log shows old titles and meta text.
     - Deletes go to the Recycle Bin for 30 days.
     - Every call is in the Activity Log.
   - **Needs approval**: the AI only *proposes* page and news changes, and
     an admin approves each one in **AI Changes** before it goes live. Use
     it later, or for people who shouldn't change the site on their own.

   The key is shown **once**. Copy it straight into the config below.
   Give each person their own key, so the Activity Log shows who did what.

   **For site-wide changes** (Global Sections, header and footer menus, the
   website's colours), the key must belong to an **Admin or Super Admin** and
   be **Direct** with the **navigation** and **settings** areas ticked. Global
   Sections also work with a Needs-approval key; menus and colours don't.
   These are usually for the person in charge of the site, since one change
   shows on every page.

## Set up Claude Desktop

1. Open Claude Desktop and go to **Settings > Developer > Edit Config**.
   This opens `claude_desktop_config.json`:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the connector. Use your own folder path, and paste your key in place
   of `tcs_...`:

   **Windows**

   ```json
   {
     "mcpServers": {
       "topcasinosg": {
         "command": "node",
         "args": ["C:\\topcasinosg\\mcp\\server.mjs"],
         "env": {
           "TOPCASINOSG_API_URL": "https://backapi.topcasinosg.com.sg",
           "TOPCASINOSG_API_KEY": "tcs_..."
         }
       }
     }
   }
   ```

   **macOS**

   ```json
   {
     "mcpServers": {
       "topcasinosg": {
         "command": "node",
         "args": ["/Users/you/topcasinosg/mcp/server.mjs"],
         "env": {
           "TOPCASINOSG_API_URL": "https://backapi.topcasinosg.com.sg",
           "TOPCASINOSG_API_KEY": "tcs_..."
         }
       }
     }
   }
   ```

   On Windows, write every `\` in the path as `\\`. If the file already has
   other servers under `"mcpServers"`, add `"topcasinosg": {...}` next to
   them, separated by a comma.
3. Quit Claude Desktop completely (on Windows, also from the system tray),
   then open it again.
4. In a new chat, open the tools (connectors) menu and check that
   **topcasinosg** is listed and switched on.
5. Try it: *"Use topcasinosg: what can my key do?"*

## Set up Claude Code (optional)

```bash
claude mcp add topcasinosg --env TOPCASINOSG_API_URL=https://backapi.topcasinosg.com.sg --env TOPCASINOSG_API_KEY=tcs_... -- node /path/to/mcp/server.mjs
```

## Things to ask

- *"List the pages on topcasinosg."*
- *"On the Casino Bonus page, change the hero heading to 'Best Casino Bonuses in Singapore 2026'."*
- *"Write a draft news article about the three newest casinos, about 400 words."*
- *"Upload this image to the Media Library and use it on the About page hero."*
- *"Which of my changes are still waiting for approval?"*
- *"Which pages use the 'Responsible gambling' global section? Change its text to …"*
- *"Add 'Payment Guides' to the header menu under 'Casino Reviews', linking to /guides."*
- *"Make the brand colour a bit darker blue and show me the old and new colours before saving."*

How the AI works with the site:

1. It checks what your key can do (`whoami`).
2. It reads the site's structure (`get_schema`): every block, its fields and
   their allowed values. That way it builds content the way the page
   builder does, rather than guessing.
3. It reads the page or article and changes only what you asked. For larger
   changes it can do a dry run first, which checks the change without saving
   it.
4. It saves:
   - **Direct key:** the change is live. Check it on https://topcasinosg.com.sg.
   - **Needs approval key:** the change waits in **AI Changes** with a preview
     link. An admin approves or rejects it there.

The AI is told to ask you before it publishes, deletes or changes anything
you didn't ask for. Treat its summary as a report, and check the result on
the site. With a Direct key, it helps to say *"do a dry run first"* for big
changes, and to ask for one page at a time.

## Debugging together

While the connector is new, report anything odd to the developers, so we can
fix it while you keep working:

1. In the admin dashboard, open **Activity Log** and set **Source: AI
   connector**. Add your key and today's date if the list is long. Failed
   calls are marked **Failed** in red.
2. Tick the entries for the problem (or don't tick any, to send everything
   that matches the filters). Then click **Copy for debugging**.
3. Paste the result into the chat with the developers. Add one line on what
   you asked the AI and what you expected to happen.

What we get: each call's request, the status and error message, what was
sent and what changed, the AI app and tool used, and the time. API keys and
passwords are never included.

To undo a change while we look into it:

| Problem | How to undo it |
|---|---|
| A page's content (sections) | **Pages > Edit Page > Revisions**: restore the version from before the change. |
| A title or meta text | The Activity Log entry shows the old value: type it back in. |
| Something deleted | **Recycle Bin**: restore it within 30 days. |
| Published by mistake | Set it back to **Draft** in the dashboard, or ask the AI to unpublish it. |
| A Global Section | **Pages > Global Sections > Edit > Revisions**: restore the earlier version. |
| A menu item | The Activity Log entry shows what it was: add it back in **Navigation**, or ask the AI to. |
| The website's colours | **Settings > Theme**: **Reset** one colour or **Reset all to original**; the Activity Log shows the old values. |

## What the AI can do

| Tool | What it does |
|---|---|
| `whoami` | Shows the key's mode and the areas it can use. The AI calls this first. |
| `get_schema` | Shows how pages are built: every block, its fields and allowed values, and the style classes. |
| `list_pages`, `get_page` | Reads pages and their sections. |
| `save_page_sections`, `create_page` | Changes a page or adds one (as a draft). `dryRun` only checks the change. |
| `list_global_sections`, `get_global_section` | Lists Global Sections (shared blocks), and shows one with the pages that use it. |
| `save_global_section` | Changes a Global Section, on every page that uses it at once. Admin keys only. |
| `get_menus`, `save_menu_item`, `delete_menu_item` | Reads and changes the header and footer menus. Only items with nothing under them can be deleted. Admin, Direct keys. |
| `get_theme`, `save_theme` | Reads and changes the website's colours (Settings > Theme). Admin, Direct keys. |
| `list_news`, `get_news`, `save_news` | Reads, writes and changes news articles. |
| `list_media`, `upload_image` | Uses the Media Library, and adds images from a file or a web address. |
| `list_my_changes` | Shows the changes this key sent and whether they were approved. |
| `set_status` | Publishes, unpublishes or schedules (Direct keys). |
| `api_request` | Any other call the key allows, such as casinos, bonuses or guides (Direct keys). |

No key can reach users, other API keys, passwords, 2FA or security
settings. Each key is limited to 120 requests a minute.

## Tracking: who did what

Every call the connector makes, reads included, is recorded in the admin
dashboard's **Activity Log**. Each entry has:

- the admin who owns the key, and the key's name;
- the AI app and the tool it used, for example
  `topcasinosg-mcp/1.0.0 (Claude Desktop; save_page_sections)`;
- the IP address;
- for changes, what changed, before and after.

Requests that are refused (a wrong key, an area the key can't use) are
recorded too. To see one connector's work, filter the Activity Log by
**Source: AI connector** or by the key.

## Keep the key safe

- The config file holds the key in plain text. Don't share the file,
  commit it or paste it into a chat.
- If a key leaks, or someone leaves, revoke the key in **Settings > API
  Keys** and create a new one. Revoking takes effect at once.

## Troubleshooting

| You see | What to do |
|---|---|
| **topcasinosg** isn't in the tools menu | Check that the config is valid JSON (commas, `\\` in Windows paths). Quit Claude Desktop fully and reopen it. Check that `node --version` works in a terminal. |
| `TOPCASINOSG_API_KEY is not set` | Add the key under `"env"` in the config, then restart the app. |
| `Could not reach the API at ...` | Check `TOPCASINOSG_API_URL`: it should be `https://backapi.topcasinosg.com.sg`, without `/api/v1` and without a slash at the end. Check your internet connection. |
| `this API key is not valid, has been revoked ...` (401) | The key was mistyped or revoked, or its admin account is inactive. Create a new key. |
| `this API key can't use ...` (403) | The key doesn't include that area. An admin can create a key that includes it. |
| `this is a "Needs approval" key ...` (403) | Only Direct keys can do this. Propose the change instead, or ask an admin for a Direct key. |
| `too many requests` (429) | Wait a minute and try again. |
| The change didn't appear on the site | New pages and articles start as drafts until someone publishes them. With a Needs approval key, the change is waiting in **AI Changes**. Otherwise, send us the Activity Log entries (see **Debugging together**). |

## Settings

| Variable | Default | Meaning |
|---|---|---|
| `TOPCASINOSG_API_URL` | `https://backapi.topcasinosg.com.sg` | The API's address, without `/api/v1`. |
| `TOPCASINOSG_API_KEY` | none (required) | The API key from **Settings > API Keys**. |

### For developers

To use the connector against a local API (`go run ./cmd/api` in `api/`), set
`TOPCASINOSG_API_URL` to `http://localhost:8090` and use a key created in the
local admin (`http://localhost:4001`). The connector is a single file,
`server.mjs`, with no dependencies. It speaks MCP over stdio.
