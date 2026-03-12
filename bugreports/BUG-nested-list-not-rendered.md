# BUG: dateRange sub-parameters not visible in Lexical

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** Medium
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

The `dateRange` row description says "Each object contains:" but the nested `<ul>` with `DateFrom` and `DateTo` sub-parameters is not rendered in the Lexical pane. The Monaco XML (lines 52-63) shows these exist as `<li>` items with `<codeph>` elements.

## Steps to Reproduce

1. Open a DITA topic containing a `<p>` followed by a `<ul>` inside a table `<entry>`
2. View in the Lexical visual editor

## Expected Behavior

The nested list with `DateFrom` and `DateTo` entries should render below the description paragraph within the table cell.

## Actual Behavior

The nested `<ul>` is not rendered at all. Only the preceding `<p>` text is visible.

## Affected Component

`sync/parseXmlToLexical.ts` — nested list parsing within table entries. Related to BUG-nested-list-in-table-cell but distinct: that bug renders lists as raw text, this one drops them entirely.
