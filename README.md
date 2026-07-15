# Cursor WakaTime

[WakaTime][wakatime] plugin for [Cursor][cursor]. It tracks AI coding activity from Cursor Agent alongside the human coding activity recorded by the WakaTime editor extension.

The plugin installs [wakatime-cli][wakatime-cli] into `~/.wakatime/`, checks for CLI updates when a Cursor conversation starts, and syncs AI heartbeats after prompts and Agent file edits.

## Install

In Cursor Agent, run:

```text
/add-plugin wakatime
```

The plugin requires `node` on your `PATH` to run its hooks.

For human coding time, also install the [WakaTime extension][vscode-wakatime] from Cursor's Extensions view if it is not already installed.

## Configure

The plugin uses the standard WakaTime config file at `~/.wakatime.cfg`:

```ini
[settings]
api_key = waka_...
```

Your API key is available at [wakatime.com/api-key][api-key]. The usual WakaTime settings are supported, including:

```ini
[settings]
debug = true
proxy = https://user:pass@example.com:8080
```

Logs are written to `~/.wakatime/cursor.log`.

## Local development

Clone this repository into Cursor's local plugin directory:

```sh
git clone https://github.com/wakatime/cursor-wakatime.git ~/.cursor/plugins/local/wakatime
cd ~/.cursor/plugins/local/wakatime
npm test
```

Restart Cursor after changing the manifest or hooks.

## Publish

Push this repository to `github.com/wakatime/cursor-wakatime`, then submit its public repository URL at [cursor.com/marketplace/publish][publish]. Cursor reviews plugins before they appear in the Marketplace.

[api-key]: https://wakatime.com/api-key
[cursor]: https://cursor.com/
[publish]: https://cursor.com/marketplace/publish
[vscode-wakatime]: https://marketplace.visualstudio.com/items?itemName=WakaTime.vscode-wakatime
[wakatime]: https://wakatime.com/
[wakatime-cli]: https://github.com/wakatime/wakatime-cli
