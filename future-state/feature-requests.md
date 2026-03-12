# DITA Architect — Feature Requests

Feature requests are differentiated from action items and bugs. Items here are considered for future work based on priority and impact.

---

## FR-001: Add "Beautify" button to XML toolbar

**Requested:** 2026-03-10
**Status:** Proposed
**Priority:** TBD
**Impact:** TBD

### Description

Add a "Beautify" (format/pretty-print) button to the Monaco XML source editor toolbar. When clicked, it should reformat the raw DITA XML with consistent indentation, line breaks, and attribute alignment without altering the semantic content.

### Value Proposition (Maya Chen, UX Advisor)

Writers working in the XML source pane encounter inconsistently formatted markup constantly — pasted content from Heretto, hand-edited sections, content injected via conkeyrefs or sync operations. The cognitive cost of parsing poorly formatted XML is real: mismatched nesting becomes harder to spot, attribute-heavy elements blur into walls of text, and even experienced DITA authors lose time re-reading structure that clean indentation would make obvious at a glance.

A single-click Beautify action directly addresses this. It removes a repetitive manual task (selecting all, copying to an external formatter, pasting back) and keeps the author inside their editing flow. For a split-pane editor like DITA Architect — where the XML source is always visible alongside the WYSIWYG view — source readability is not a convenience feature; it is a primary interface quality. If the right pane is hard to read, half the editor's value is diminished.

This also has a downstream quality benefit: well-formatted XML surfaces structural errors faster. A misplaced `</entry>` or unclosed `<li>` is far easier to catch in properly indented source than in a compressed block. For a team producing API reference documentation with deeply nested tables (like the Altitude content reviewed today), this is especially relevant.

The interaction should be low-friction: a toolbar icon (consistent with the existing Monaco toolbar style), a keyboard shortcut (e.g., Shift+Alt+F, matching VS Code convention), and no confirmation dialog. The formatter should preserve `<codeblock>` and `<pre>` content verbatim, respect `xml:space="preserve"` attributes, and normalize to 2-space indentation to match the project's existing XML style.
