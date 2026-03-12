# BUG: Nested list inside table cell renders as raw indented text

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** Medium
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

The `zones` parameter's Defined Value Set column contains `<ul><li>` elements inside a `<entry>`. In Lexical, these render as indented text blocks with excessive vertical spacing instead of a compact bulleted list.

## Steps to Reproduce

1. Open a DITA topic containing a `<table>` where an `<entry>` contains a `<ul>` with `<li>` children
2. View in the Lexical visual editor

## Expected Behavior

The list should render as a compact bulleted list within the table cell, matching standard list rendering outside of tables.

## Actual Behavior

List items render as indented plain text with excessive vertical spacing. No bullet markers are shown.

## Affected Component

`sync/parseXmlToLexical.ts` — list-inside-table-cell parsing. Lexical's `ListNode` may have constraints when nested inside `TableCellNode`.
