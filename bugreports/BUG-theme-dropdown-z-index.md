# BUG: Theme dropdown hidden behind Heretto context toolbar

**Filed by:** Kiryl Rusetski
**Date:** 2026-03-12
**Severity:** Medium
**Status:** Open

## Summary

The theme selector dropdown opens downward from the visual editor toolbar, but the Heretto context toolbar (breadcrumb bar) renders on top of it, hiding the first dropdown item ("Dark"). The user cannot see or select the Dark theme when a Heretto file is open.

## Steps to Reproduce

1. Open a file from Heretto (so the Heretto context toolbar is visible)
2. Click the theme selector dropdown (e.g., "CLAUDE")
3. The dropdown opens but the "Dark" option at the top is hidden behind the Heretto breadcrumb bar

## Expected Behavior

The theme dropdown should render above the Heretto context toolbar. All 6 theme options (Dark, Light, Claude, Nord, Solarized, Geotab) should be visible and selectable.

## Actual Behavior

The Heretto context toolbar occludes the first dropdown item. Only 5 of 6 themes are visible: Light, Claude, Nord, Solarized, Geotab.

## Root Cause

Z-index stacking conflict. The theme dropdown is positioned with `zIndex: 50` (inline style in `Toolbar.tsx:135`), but the Heretto context toolbar below it creates a stacking context that sits on top.

The toolbar container is `z-10` (`Toolbar.tsx:89`). The dropdown is a child of this container, so its `zIndex: 50` is scoped within the parent's `z-10` stacking context. The Heretto context toolbar, rendered as a sibling element outside the toolbar container in `dita-architect.tsx`, occupies the same or higher stacking level.

## Affected Files

- `components/Toolbar.tsx:89` — toolbar container `z-10`
- `components/Toolbar.tsx:135` — dropdown `zIndex: 50` (scoped inside parent)
- `dita-architect.tsx` — Heretto context toolbar rendering

## Suggested Fix

Ensure the theme dropdown's stacking context is above the Heretto context toolbar. Options:
- Raise the toolbar container's z-index above the Heretto context bar
- Render the dropdown via a portal so it escapes the parent stacking context
- Lower the Heretto context toolbar's z-index below the dropdown

## Screenshot

See: `Screenshot 2026-03-12 at 1.58.19 PM.png`
