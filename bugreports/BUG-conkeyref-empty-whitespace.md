# BUG: conkeyref renders as empty whitespace

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** Medium
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

`<note conkeyref="varsAltitudeNotes/noteSpecialCaseAPIs"/>` renders as a blank gap in Lexical. When a conkeyref cannot be resolved locally, the editor should show a visible placeholder rather than silent whitespace.

## Steps to Reproduce

1. Open a DITA topic containing a `<note>` element with a `conkeyref` attribute
2. View in the Lexical visual editor

## Expected Behavior

A visible placeholder should be rendered, e.g., `[conkeyref: varsAltitudeNotes/noteSpecialCaseAPIs]`, styled distinctly (muted, monospace) to indicate unresolved reference.

## Actual Behavior

The element renders as empty whitespace. The user has no indication that content is expected there.

## Affected Component

`sync/parseXmlToLexical.ts` — conkeyref handling (currently renders via `DitaPhRefNode` or `DitaOpaqueNode`)
