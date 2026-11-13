# Plugin studio

A graphical builder for DeepSeek Harness plugins. It answers one question without typing a prompt:
*what should this panel show, and where does the information come from?*

Open it either way — both show the same builder:

- the **plugin-studio** button at the foot of the sidebar, directly above **Settings**, which opens a
  floating window over the conversation (Escape or ✕ closes it; the app stays usable behind it);
- **Settings → Plugins → Plugin studio**, the same page as a settings tab.

## Install

Clone this repository anywhere, then install the directory as a bundle in your profile:

```bash
git clone https://github.com/glebis/dsh-plugin-studio.git
dsh plugin --profile desktop install ./dsh-plugin-studio
```

Then reload the app. The builder appears at the foot of the sidebar and under
**Settings → Plugins → Plugin studio**.

## Status

Early and moving fast. Known rough edges, in order of how much they matter:

- **MCP sources need one re-apply after an app restart.** The `MCP credential templates require a
  credentials provider` error comes from the MCP client applying its rows before the credentials
  service is reachable to them; use **Reconnect all** in *Created plugins* to revive them.
- **Panels render raw tool payloads.** The collector stores each tool's response as-is, so a panel can
  read like wire format rather than sentences.
- **Remove is two-step but final.** Disable first if you might want the bundle back.

## What it does

1. **Sources** lists every MCP server configured in this profile, with its live connection state and
   tool count. Toggle the ones the studio may read. The choice is saved to
   `$DSH_HOME/plugin-studio/state.json`.
2. **New plugin** collects the form: package name, title, description, kind, placement, the query
   sent to the sources, and which of the enabled sources to read.
3. **Generate bundle** calls those MCP tools with the query, aggregates their answers, and writes a
   complete, installable bundle to `plugin-studio-builds/<name>` inside the session's workspace.
4. **Install** hands that directory to the Plugin Manager, which links it into the profile and
   activates it.

## Kinds

| Kind | Result |
|---|---|
| **Data panel** | A Client plugin that renders the aggregated snapshot below the composer, or after each turn. |
| **MCP connection** | A configuration-only bundle that inserts `@deepseek-ai/dsh-mcp-client` for one server (HTTP or stdio). |

## Limitations

- The aggregated snapshot is embedded in the generated panel. It stays fixed until you generate the
  bundle again; the studio does not poll the sources at runtime.
- Collection only calls tools whose required inputs the studio can fill from the query. Tools that
  need identifiers, filters, or enums are reported as skipped rather than guessed.
- Nothing can be collected while no MCP server is connected, and the studio never reads a source you
  did not enable.
- The browser half reaches the Host half over a loopback-only JSON endpoint registered at
  `/plugin-studio` on the profile's own Web server; it refuses cross-origin requests.
