# DeepSeek Harness plugins

Plugins for [DeepSeek Harness](https://github.com/glebis) that add capability to the app rather than
to a single conversation. Each directory is a self-contained bundle you can install into a profile.

| Plugin | What it does |
|---|---|
| [`plugin-studio`](plugin-studio/) | A graphical builder for MCP-backed data panels: connect sources, describe the panel in words or pick it from three columns, and install the result without writing code. |

## Install a plugin

Every plugin here is a directory with a `package.json` that declares a bundle patch, so the install is
the same for all of them:

```bash
git clone https://github.com/glebis/deepseek-harness-plugins.git
dsh plugin --profile desktop install ./deepseek-harness-plugins/plugin-studio
```

Then reload the app. A plugin that adds UI shows up where its manifest says — `plugin-studio`, for
example, adds a sidebar action and a settings tab.

To remove one: `dsh plugin --profile desktop remove <package-name>`, or use the Remove action inside
the plugin's own list.

## What is in a plugin

```
plugin-studio/
  package.json        # name, exports, and the `dsh` block that declares the bundle patch
  cordis.patch.yml    # the rows this bundle inserts into the profile tree
  index.js            # host half: tools, HTTP routes, services
  client.js           # client half: slot registrations, rendered UI
  templates/          # source templates for anything the plugin generates
  locale/             # display metadata per language
  docs/               # detail page shown in the plugin list
```

A plugin's host half runs in Node with the Cordis context; its client half runs in the browser and is
loaded through `window.__ModuleLoader__`. Neither half may assume the other's memory — they talk over
whatever the plugin declares, usually an HTTP route registered through `ctx.webServer`.

## Status

These are works in progress, published because they are useful now, not because they are finished.
Each plugin's README lists its known rough edges; read that before wiring one into something you depend
on.
