# BUG: codeblock renders as "CODEBLOCK" label with no content

**Filed by:** Maya Chen (via session review)
**Date:** 2026-03-10
**Severity:** High
**Status:** Open
**Source:** Content review of Altitude API reference topic

## Summary

The "Sample parameters" section contains a `<codeblock>` with a JSON example. In the Lexical pane it renders as just the word "CODEBLOCK" with "0 words / 0 characters" — the actual code content is not displayed. The Monaco pane shows the JSON correctly (lines 873-882).

## Steps to Reproduce

1. Open a DITA topic containing a `<codeblock>` element with text content
2. View in the Lexical visual editor

## Expected Behavior

The code content should be displayed in a styled code block (monospace font, background differentiation), preserving whitespace and formatting.

## Actual Behavior

Only the literal text "CODEBLOCK" is shown as a label. The actual content is lost in the Lexical rendering. Content is preserved correctly in the XML/Monaco view.

## Affected Component

`sync/parseXmlToLexical.ts` and/or `nodes/DitaCodeBlockNode.ts` — the custom node renders the label but not the text content of the `<codeblock>` element.
