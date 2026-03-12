# BUG: Table column auto-sizing not proportional

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** Medium
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

The first column (`Parameter`) in DITA tables truncates entries mid-word (e.g., "queryTy pe", "dateRa nge", "isDirecti onal") even at wide viewport widths. The `Description` column absorbs most of the horizontal space.

## Steps to Reproduce

1. Open a DITA topic with a multi-column `<table>` where column content lengths vary significantly
2. View in the Lexical visual editor at any viewport width

## Expected Behavior

Column width distribution should account for content length across all columns. Short-content columns should not be compressed to the point of word truncation when the viewport is wide enough to accommodate them.

## Actual Behavior

First column is compressed to a fixed narrow width. Words are broken mid-syllable.

## Affected Component

Lexical table rendering — column width calculation
