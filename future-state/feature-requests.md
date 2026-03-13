# DITA Architect — Feature Requests

Feature requests are differentiated from action items and bugs. Items here are considered for future work based on priority and impact.

---

## FR-001: Add "Beautify" button to XML toolbar

**Requested:** 2026-03-10
**Status:** Shipped (v0.6.1, 2026-03-13)
**Priority:** P2-3
**Impact:** Medium

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
**Status:** Shipped (v0.6.2, 2026-03-13)
**Priority:** P2-5
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

---

## FR-006: Hover element labels in visual editor

**Requested:** 2026-03-13
**Status:** Shipped (v0.6.0, 2026-03-13)
**Priority:** P2-7
**Impact:** High

### Description

Add hover-triggered structural labels to DITA body elements in the Lexical visual editor. When an author hovers over a block element — `context`, `result`, `prereq`, `postreq`, `steps`, `section` — a small uppercase label appears indicating the element's DITA role (e.g., `CONTEXT`, `RESULT`, `PREREQUISITE`). Labels should be hover-only to avoid visual clutter during active writing.

### Suggested Approach

The pattern already exists in the codebase. The `SHORT DESCRIPTION` label on shortdesc elements (`index.css:440-451`) uses a `::after` pseudo-element with `position: absolute`, `text-transform: uppercase`, and `opacity: 0.5`. This same CSS pattern can be extended to other DITA body elements:

- In `parseXmlToLexical.ts`, the elements `context`, `result`, `prereq`, `postreq` already map to `$createParagraphNode()` (lines ~130-170). Apply distinguishing CSS classes — `dita-editor-context`, `dita-editor-result`, etc. — to these paragraph nodes via the Lexical theme or inline class assignment.
- Add corresponding `::after` rules in `index.css` for each class, using the same positioning as `.dita-editor-shortdesc::after` but triggered on `:hover` instead of always-visible.
- No new Lexical node types required. No React components. CSS classes on existing paragraph nodes and a few lines in the parser.

Labels should use **semantic DITA names** — `CONTEXT`, `RESULT`, `PREREQUISITE`, `POST-REQUISITE` — not generic labels like `PARAGRAPH`. The value is in surfacing structural meaning, not node type.

Move/reorder arrows (as seen in DITA Doer) are explicitly out of scope. In a split-pane editor where the XML source is visible, structural reorganization belongs in the source pane.

### Value Proposition (Maya Chen, UX Advisor)

Right now, the only element in the Lexical pane that identifies itself structurally is the shortdesc — that small `SHORT DESCRIPTION` watermark. Every other DITA body element renders as an identical paragraph. An author editing a task topic can't tell where `context` ends and `result` begins without switching to the XML source pane.

This matters because DITA structure isn't decoration — `context` and `result` have semantic meaning in task topics that affects how content is rendered in output. When an author accidentally types result content inside the `context` element, they won't know until the output is built. A hover label makes the structure legible at the moment of editing, without making the default view noisy.

This also pairs well with FR-004 (inline validation hints). Once authors can see which element they're in, showing validation state on that element becomes natural — a broken `xref` inside a `CONTEXT` block is more actionable when you can see both the element label and the validation indicator.

### Prior Art

- **DITA Doer 3.0:** Shows element labels with move arrows on hover (screenshot reviewed 2026-03-13). Labels use generic names like `PARAGRAPH`.
- **Heretto CMS:** Shows always-visible element tags as inline chips (e.g., `context`, `result`, `step`, `cmd`). Comprehensive but visually dense.
- **DITA Architect (current):** Only `.dita-editor-shortdesc::after` provides a structural label. All other body elements are visually undifferentiated.

---

## FR-007: Structural color bars for DITA body elements

**Requested:** 2026-03-13
**Status:** Shipped (v0.6.0, 2026-03-13)
**Priority:** P2-8
**Impact:** Medium

### Description

Add subtle left-edge color bars to DITA body element blocks (`context`, `result`, `prereq`, `postreq`) in the Lexical visual editor. Each element type gets a distinct color — a 3px vertical stripe on the left margin — so authors can see where one structural section ends and another begins without reading labels or switching to the XML source.

### Suggested Approach

- Use `border-left` on the same CSS classes introduced for FR-006 (`dita-editor-context`, `dita-editor-result`, etc.).
- Define theme-aware CSS variables for each element type's bar color (e.g., `--editor-context-bar`, `--editor-result-bar`), following the existing pattern for `--editor-quote-border`.
- Add corresponding values in each theme block in `index.css` (dark, light, claude, nord, solarized, geotab).
- The color bars are always visible (unlike the hover labels from FR-006), providing a persistent but low-weight structural signal.

This is a lighter alternative to the full bordered section boxes seen in Heretto CMS. Full dashed-border boxes with headers work well in Heretto's single-pane, full-width editor, but would feel cramped in our split-pane layout where the Lexical pane shares horizontal space with Monaco. A left-edge bar provides the structural distinction with less visual weight — the hover labels (FR-006) tell you *what* the element is, the color bars tell you *where one ends and another begins*.

### Value Proposition (Maya Chen, UX Advisor)

The existing visual editor already uses a left-edge color pattern for one element: `<note>` elements render with `border-left: 4px solid var(--editor-quote-border)` and a tinted background. Authors have learned to recognize that visual pattern as "this is a note." Extending the same idea — left-edge color, no background tint — to `context`, `result`, `prereq`, and `postreq` builds on a visual language the editor already speaks.

Have you considered how this helps with longer task topics? In a topic with 8 steps, a context block, prerequisite, and result, the content can run to several screens of scrolling. Without structural markers, the only way to orient yourself is to scroll up to the heading or check the XML. A colored left bar gives you a peripheral signal — "I'm in the result section" — without interrupting your reading flow. It's the same principle as syntax highlighting in code editors, applied to content structure.

### Prior Art

- **Heretto CMS:** Full dashed-border section boxes with element headers. Effective in a full-width single-pane editor but visually heavy.
- **DITA Architect (current):** `<note>` elements already use `border-left: 4px solid` with a tinted background (`index.css:405-412`). This FR extends that pattern without the background tint.

---

## FR-008: Light theme warmth refinement

**Requested:** 2026-03-13
**Status:** Shipped (v0.6.0, 2026-03-13)
**Priority:** P2-9
**Impact:** Medium

### Description

Adjust the Light theme's color palette from its current cool blue-gray (Slate) family to warmer neutral tones, and increase content area breathing room. The goal is to shift the editor feel from "application" to "page" — closer to the warmth and spaciousness seen in DITA Doer's light theme.

### Suggested Changes

Current values and proposed replacements (all in `index.css`, `[data-theme="light"]` block, lines 75-124):

| Variable | Current (Slate) | Proposed (Stone/Warm) | Rationale |
|---|---|---|---|
| `--app-bg` | `#f1f5f9` (slate-100) | `#f5f5f4` (stone-100) | Shift chrome from blue-gray to warm neutral |
| `--app-surface-raised` | `#f1f5f9` | `#f5f5f4` | Match chrome warmth |
| `--app-border` | `#e2e8f0` (slate-200) | `#e7e5e4` (stone-200) | Soften border tone |
| `--app-border-subtle` | `#cbd5e1` (slate-300) | `#d6d3d1` (stone-300) | Consistent warm shift |
| `--app-hover` | `#e2e8f0` | `#e7e5e4` | Consistent warm shift |
| `--app-btn-bg` | `#f1f5f9` | `#f5f5f4` | Consistent warm shift |
| `--app-btn-hover` | `#e2e8f0` | `#e7e5e4` | Consistent warm shift |
| `--app-btn-border` | `#cbd5e1` | `#d6d3d1` | Consistent warm shift |
| `--editor-toolbar-bg` | `#f8fafc` (slate-50) | `#fafaf9` (stone-50) | Bring toolbar closer to content white |
| `--editor-toolbar-border` | `#e2e8f0` | `#e7e5e4` | Soften toolbar divider |
| `--editor-code-bg` | `#f1f5f9` | `#f5f5f4` | Consistent warm shift |

Additionally, consider increasing the `ContentEditable` horizontal padding from `px-8` (2rem) to `px-12` (3rem) on wider viewports to enhance the "page" feel (in `dita-architect.tsx`, line ~758).

No structural changes. Same CSS variable tuning pattern used for the Geotab theme (P1-7, shipped v0.5.1).

### Value Proposition (Maya Chen, UX Advisor)

Compare the screenshots side by side. DITA Doer's light theme feels like paper — warm whites, generous margins, the toolbar barely distinguished from content. Our light theme feels like an application — the three-tier separation (chrome at `#f1f5f9`, toolbar at `#f8fafc`, content at `#ffffff`) is organized but clinical. The blue-gray undertone in every surface reinforces "software" rather than "document."

The proposed shift is subtle — same luminance values, just moving from the Tailwind Slate scale to Stone. The editor still has clear visual hierarchy, but the warmth makes long editing sessions more comfortable and the overall feel more inviting. This is the kind of refinement that authors notice as "it just feels nicer" without being able to articulate exactly why.

---

## FR-009: Add aria-label to Format XML button

**Requested:** 2026-03-13
**Status:** Shipped (v0.6.2, 2026-03-13)
**Priority:** P2-12
**Impact:** Low

### Description

The Format XML button added in v0.6.1 is missing an `aria-label="Format XML"` attribute. All other toolbar buttons have appropriate aria-labels for screen reader consistency. One-line fix in `MonacoDitaEditor.tsx`.

### Value Proposition (Maya Chen, UX Advisor)

Every other button in both toolbars has a matching aria-label. The format button works correctly but is invisible to screen readers. Adding the attribute maintains the accessibility standard established across the rest of the toolbar surface.

---

## FR-010: Improve Format XML error toast specificity

**Requested:** 2026-03-13
**Status:** Shipped (v0.6.2, 2026-03-13)
**Priority:** P2-13
**Impact:** Low

### Description

When the Format XML button encounters malformed XML, the error toast shows a generic failure message. Update it to say "Failed to format XML: Check for syntax errors" to give authors actionable guidance.

### Value Proposition (Maya Chen, UX Advisor)

A generic "format failed" message leaves the author guessing. Adding "Check for syntax errors" points them toward the XML source pane where Monaco's built-in validation will highlight the problem. It closes the feedback loop — the toast tells them *what* went wrong, and the source pane shows them *where*.
