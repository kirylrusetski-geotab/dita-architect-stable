# BUG: H2 heading invisible on Light theme

**Filed by:** Rafael Santos (via Kiryl Rusetski)
**Date:** 2026-03-12
**Severity:** High (accessibility failure — WCAG contrast ratio 1:1)
**Status:** Open

## Summary

Section-level `<title>` elements (rendered as `h2` in Lexical) are invisible when the Light theme is active. The text is white on a white background.

## Steps to Reproduce

1. Open DITA Architect at `localhost:3000`
2. Switch to the **Light** theme
3. Load or create any DITA topic with a `<section><title>...</title></section>`
4. The section heading does not appear in the visual editor (left pane)

## Root Cause

`dita-architect.tsx:51` — the Lexical theme config hardcodes the `h2` class to `text-white`:

```ts
h2: 'text-2xl font-bold text-white mb-3',
```

The `h1` class correctly uses a CSS variable (`color: var(--editor-h1)` in `.dita-editor-h1`), but `h2` was never given the same treatment. It uses a Tailwind utility that assumes a dark background.

## Affected Files

- `dita-architect.tsx:51` — hardcoded `text-white` class on h2
- `index.css` — missing `--editor-h2` variable and `.dita-editor-h2` class across all 6 themes

## Suggested Fix

1. Add `--editor-h2` CSS variable to each theme block in `index.css` (or reuse `--editor-h1`)
2. Create a `.dita-editor-h2` class mirroring `.dita-editor-h1` but at `text-2xl` size
3. Replace the Tailwind string in `dita-architect.tsx:51` with `'dita-editor-h2'`

## Additional Notes (Maya — UX)

- This is a WCAG failure at every conformance level (contrast ratio 1:1)
- Audit other Lexical theme classes for similar hardcoded dark-mode colors — `text-dita-400` on bold (line 61) may have the same issue
- Consider adding a visual regression check across all themes to catch contrast violations

## Screenshot

See: `Screenshot 2026-03-12 at 10.56.43 AM.png` (Light theme, h2 "Portal 2.0 2.1.0" invisible between intro paragraph and bullet list)
