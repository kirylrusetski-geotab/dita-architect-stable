# BUG: Geotab theme lacks visual hierarchy between UI regions

**Filed by:** Kiryl Rusetski
**Date:** 2026-03-12
**Severity:** Medium
**Status:** Open

## Summary

The Geotab theme has insufficient contrast between UI regions. The editor content area, app background, header, tab bar, and bottom bar all blend into similar dark navy tones, making it difficult to distinguish the editing surface from the surrounding chrome. Compare to the Claude theme, which has clear visual separation between regions.

## Steps to Reproduce

1. Switch to the Geotab theme
2. Compare the visual hierarchy to the Claude theme (or any other theme)

## Expected Behavior

The editor content area should be visually distinct from the app chrome (header, tab bar, bottom bar), and the toolbar should integrate with the editor pane rather than floating as an isolated bright stripe.

## Actual Behavior

The following CSS variables produce a flat, low-contrast layout:

| Variable | Geotab | Claude (reference) |
|----------|--------|--------------------|
| `--app-bg` | `#1a1f2e` | `#1f150f` |
| `--editor-bg` | `#1e2332` | `#2d2019` |
| `--editor-toolbar-bg` | `#25477b` | `#3d2e24` |
| `--app-surface` | `#25477b` | `#241a13` |

Key issues:
- `--app-bg` (`#1a1f2e`) and `--editor-bg` (`#1e2332`) are only ~4 lightness steps apart — the editor content area doesn't stand out from the app background
- `--editor-toolbar-bg` (`#25477b`) is the same as `--app-surface` — the toolbar matches the app chrome instead of the editor pane, making it feel disconnected from the editing area it controls
- In the Claude theme, `--editor-bg` (`#2d2019`) is notably lighter than `--app-bg` (`#1f150f`), creating a clear "content surface" effect. The toolbar (`#3d2e24`) is close to the editor bg, reinforcing that it belongs to the editor

## Affected Files

- `index.css:274-322` — `[data-theme="geotab"]` CSS custom properties

## Suggested Fix

Adjust the Geotab theme color values to create a three-tier hierarchy:
1. **App chrome** (header, tab bar, bottom bar) — darkest, using a deep navy derived from Geotab Blue
2. **Editor surface** (content area) — lighter, creating a distinct "paper" or "canvas" feel
3. **Toolbar** — close to the editor surface, not the app chrome, so it reads as part of the editor

The Geotab brand colors (Geotab Blue `#25477b`, Innovation Blue `#0078d3`) should remain as accent colors, not as the primary surface colors for the toolbar and app chrome.

## Screenshots

- Geotab theme: `Screenshot 2026-03-12 at 1.59.04 PM.png`
- Claude theme (reference): `Screenshot 2026-03-12 at 1.59.23 PM.png`
