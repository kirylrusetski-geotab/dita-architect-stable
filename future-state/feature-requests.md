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

---

## FR-002: Release notes version browser in What's New modal

**Requested:** 2026-03-12
**Status:** Proposed
**Priority:** Low
**Impact:** Low–Medium

### Description

The What's New modal currently displays only the latest release notes entry (`RELEASE_NOTES[0]`). As more versions ship, users lose access to past entries unless they read the source code. Add a version selector or scrollable list so users can browse release notes from any version.

### Suggested Approach

- Add a version list or dropdown to the left side of the modal, populated from the `RELEASE_NOTES` array in `constants/version.ts`.
- Default selection remains the latest version.
- Selecting a past version renders that entry's sections in the existing right-side layout.
- No backend changes needed — the `RELEASE_NOTES` array already contains all entries.

### Value Proposition (Maya Chen, UX Advisor)

Right now with two versions this isn't urgent, but every release adds another entry that becomes invisible. A version browser turns the modal from a one-time notification into a lightweight changelog — useful for users returning after multiple updates, onboarding new team members, or simply answering "when did we add conkeyref chips?" without leaving the app.

---

## FR-003: Empty states for Heretto file browser

**Requested:** 2026-03-12
**Status:** Proposed
**Priority:** Medium
**Impact:** Medium

### Description

When a Heretto CMS folder contains no topics, the file browser shows nothing — no message, no affordance, just blank space. Add an empty state with a message like `No topics in this folder` and a `Create new topic` action button.

### Value Proposition (Maya Chen, UX Advisor)

An empty folder with no feedback is a dead end. The author doesn't know if the folder is genuinely empty, still loading, or broken. A clear empty state with a `No topics in this folder` message answers the question instantly, and a `Create new topic` call-to-action turns a dead end into a starting point. This is low-effort, high-trust UX — it tells the user "we anticipated this state and we've got you covered."

---

## FR-004: Inline validation hints in the visual editor

**Requested:** 2026-03-12
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add inline visual indicators in the Lexical WYSIWYG editor for content issues that are currently invisible until publish time. Examples include red underlines for broken `xref` targets, yellow highlights for unresolved keyrefs/conkeyrefs, and subtle markers for missing required elements.

### Value Proposition (Maya Chen, UX Advisor)

Right now, an author can write an entire topic with broken cross-references and not know until the output is built. That's a long feedback loop. Inline hints — a red underline on a dead `xref`, a yellow squiggle on an unresolved keyref — bring validation into the authoring moment. Authors catch problems while they still remember the context, not three steps later in a build log. This borrows a pattern every developer already knows from their code editor, applied to the content side of the split pane.

---

## FR-005: Keyboard shortcut cheat sheet

**Requested:** 2026-03-12
**Status:** Proposed
**Priority:** Low
**Impact:** Medium

### Description

Add a discoverable keyboard shortcut overlay that displays all available shortcuts. Trigger via `?` or `Cmd+/` (when not focused in an editor). Show grouped shortcuts for formatting, navigation, file operations, and edit mode actions.

### Value Proposition (Maya Chen, UX Advisor)

We've built good keyboard shortcuts — bold, italic, save, edit mode toggle — but there's no way to discover them without reading source code. A shortcut overlay (like GitHub's `?` or Figma's `Ctrl+Shift+?`) gives power users a reference and new users a learning path. Discoverability is the difference between "this app has shortcuts" and "this app taught me its shortcuts." It's a small surface that signals the app respects keyboard-driven workflows.
