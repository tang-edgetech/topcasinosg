# TopCasinoSG connector (MCP)

Lets an AI app edit the site in plain words, for example "Change the hero
heading on the Casino Bonus page" or "Write a news article about this
week's new casinos". It uses the Content API with an API key, so the AI
can only do what that key allows.

It works with any app that supports local MCP servers. **Claude Desktop**
on the free plan is enough; no paid AI plan is needed for the connector.

## What you need

- [Node.js](https://nodejs.org) 18 or newer (the LTS installer is fine).
- This folder (`mcp/`) on the computer. It has no other dependencies, so
  there's nothing to `npm install`.
- An API key: in the admin dashboard, **Settings > API Keys > + Create Key**.
  - **Needs approval**: the AI proposes changes, and an admin approves
    them in **AI Changes**. This is the safer choice to start with.
  - **Direct**: changes go live at once. New pages and articles still
    start as drafts.

## Set up Claude Desktop

1. Open Claude Desktop, then **Settings > Developer > Edit Config**. This
   opens `claude_desktop_config.json`.
2. Add the connector, using your own path, API address and key:

   ```json
   {
     "mcpServers": {
       "topcasinosg": {
         "command": "node",
         "args": ["C:\\path\\to\\topcasinosg\\mcp\\server.mjs"],
         "env": {
           "TOPCASINOSG_API_URL": "https://api.your-site.com",
           "TOPCASINOSG_API_KEY": "paste the key here"
         }
       }
     }
   }
   ```

3. Quit Claude Desktop completely and open it again. **topcasinosg**
   shows under the tools (connectors) button in a new chat.
4. Try it: *"Use topcasinosg: what can my key do?"*

Keep the config file private: it holds the key. If a key leaks, revoke it
in **Settings > API Keys** and make a new one.

## What the AI can do

| Tool | What it does |
|---|---|
| `whoami` | Shows the key's mode and areas. The AI calls this first. |
| `get_schema` | Shows how pages are built: every block, its fields and allowed values, and the style classes. |
| `list_pages`, `get_page` | Read pages and their sections. |
| `save_page_sections`, `create_page` | Change or add a page (`dryRun` only checks). |
| `list_news`, `get_news`, `save_news` | Read, write and change news articles. |
| `list_media`, `upload_image` | Use the Media Library, and add images from a file or a web address. |
| `list_my_changes` | Shows the changes this key sent and whether they were approved. |
| `set_status` | Publish or unpublish (Direct keys). |
| `api_request` | Any other call the key allows, such as casinos, bonuses or guides (Direct keys). |

Everything the AI does is recorded under the key's name in the Audit Log.
Deletes go to the Recycle Bin for 30 days.

## Other settings

| Variable | Default | Meaning |
|---|---|---|
| `TOPCASINOSG_API_URL` | `http://localhost:8090` | The API's address, without `/api/v1`. |
| `TOPCASINOSG_API_KEY` | none | The API key. |
