# Vivaldi extension: Nexus Mods auto-click "Slow download"

Auto-clicks the free **Slow download** button on Nexus Mods download pages. Works in any Chromium browser.

## Install

1. `vivaldi://extensions` → turn on **Developer mode**
2. **Load unpacked** → pick this folder

Don't move or delete the folder afterward; the extension loads from it.

## Behavior

- Clicks only a button whose text is exactly "Slow download". Never touches Fast download.
- One click per page. Clicks once more if the button is still there 4s later.
- Mod Manager downloads open an `nxm://` link. Tick "always allow" on Vivaldi's prompt once.

## Debug

DevTools console → look for `[nexus-slow-download]` lines.
