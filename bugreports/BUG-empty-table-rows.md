# BUG: Empty table rows rendered between data rows

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** Medium
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

Empty `<row>` elements in DITA XML are rendered as full-height blank rows in the Lexical table. These appear between `dateRange`/`isDirectional`, `isDirectional`/`roadTypes`, and `roadTypes`/`zones` in the Parameters table.

## Steps to Reproduce

1. Open a DITA topic containing a `<table>` with empty `<row>` elements (no `<entry>` children)
2. View in the Lexical visual editor

## Expected Behavior

Empty rows should be collapsed or hidden in the WYSIWYG view. They exist in the source XML as structural separators but should not occupy visual space.

## Actual Behavior

Each empty `<row>` renders as a full-height blank row, creating large gaps between data rows.

## Affected Component

`sync/parseXmlToLexical.ts` — table row parsing logic
