# DITA Architect Backlog

**Last updated:** 2026-03-13

This is the single prioritized backlog for DITA Architect. Every actionable item — bugs, features, integration work, asset extraction — lives here with a clear priority, dependency chain, and execution criteria.

---

## Priority Definitions

| Priority | Meaning | Action |
|----------|---------|--------|
| **P0** | Blocks users or breaks core functionality now | Fix in next working session |
| **P1** | Degrades the editing experience or blocks a planned workflow | Fix before next feature work |
| **P2** | Improves quality or enables future work | Schedule in next available cycle |
| **P3** | Nice-to-have, no urgency | Pick up opportunistically |

---

## Active Backlog

### P0 — Fix Now

No open P0 items.

---

### P1 — Before Next Feature Work

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P1-8 | Theme dropdown tooltip blocks next option | Bug | The `Tooltip` component (`Tooltip.tsx`) positions descriptions below the hovered item (`top-full`). Inside the theme dropdown, this covers the next option — hovering "Claude" hides "Solarized." Fix: position tooltip to the right (`left-full`) when used inside a vertical list. One-line CSS change in the Tooltip component, or add a `placement` prop. |

**Fix note:** Surgical. The `Tooltip` component is 12 lines. Either change the default positioning for dropdown contexts, or add a `placement` prop and pass `"right"` from the theme dropdown in `Toolbar.tsx:139`. Bundle with P2-7/P2-8/P2-9 (visual polish session) or fix independently — it's a 5-minute change.

---

### P2 — Next Cycle

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P2-1 | [API endpoint for external content loading](altitude-release-notes-integration.md#feature-1-local-api-endpoint-for-external-content-loading) | Feature | Replaces the fragile cli-chrome injection with a stable HTTP API. Unblocks clean integration with the release notes skill and any future external tooling. |
| P2-2 | [Replace in Heretto workflow](altitude-release-notes-integration.md#feature-2-replace-in-heretto) | Feature | Enables draft-to-publish within the editor. Depends on P2-1 (the API delivers content with a replace target UUID). |
| P2-3 | [Beautify button](feature-requests.md#fr-001-add-beautify-button-to-xml-toolbar) | Feature | Surfaces existing `formatXml()` as a user action. Low effort — the function exists, this is a toolbar button + keyboard shortcut. |
| P2-4 | [Accessibility fixes on Heretto modals](altitude-release-notes-integration.md#accessibility-improvements-discovered-during-review) | Fix | Label associations, aria-labels, aria-live, focus management. Bundle with P2-1/P2-2 since we'll be touching related components. |
| P2-5 | [Empty states for Heretto file browser](feature-requests.md#fr-003-empty-states-for-heretto-file-browser) | Feature | Empty folders show nothing — no message, no affordance. Authors can't tell if a folder is empty, loading, or broken. Add `No topics in this folder` message with a `Create new topic` CTA. Low effort, high trust signal. |
| P2-6 | [Inline validation hints in visual editor](feature-requests.md#fr-004-inline-validation-hints-in-the-visual-editor) | Feature | Authors can write entire topics with broken cross-references and not know until build time. Red underlines on dead `xref`, yellow squiggles on unresolved keyrefs — brings validation into the authoring moment. High impact but substantial implementation. |
| P2-7 | [Hover element labels in visual editor](feature-requests.md#fr-006-hover-element-labels-in-visual-editor) | Feature | DITA body elements (`context`, `result`, `prereq`, `postreq`) render as identical paragraphs — authors can't tell which structural element they're editing without checking the XML source. Hover-triggered labels surface DITA semantics in the visual pane. Low effort — the CSS pattern exists on shortdesc, parser already tracks origin tags. |
| P2-8 | [Structural color bars for DITA body elements](feature-requests.md#fr-007-structural-color-bars-for-dita-body-elements) | Feature | Left-edge color bars on `context`, `result`, `prereq`, `postreq` blocks — persistent but lightweight structural markers. Lighter alternative to Heretto-style full border boxes. Extends the existing `<note>` border-left pattern. Bundle with P2-7 since they share the same CSS classes. |
| P2-9 | [Light theme warmth refinement](feature-requests.md#fr-008-light-theme-warmth-refinement) | Feature | Shift Light theme from cool Slate palette to warmer Stone tones. Same luminance, warmer undertone. CSS variable tuning pass — same pattern as the Geotab theme fix (P1-7, shipped v0.5.1). No structural changes. |

**Dependency chain:** P2-1 → P2-2 (Replace in Heretto needs the API endpoint to deliver the replace target UUID). P2-7 → P2-8 (color bars reuse the CSS classes introduced by hover labels). P2-3, P2-4, P2-5, P2-6, and P2-9 are independent. P2-5 is low effort. P2-6 is the most substantial item in this tier. P2-7 and P2-8 together are a medium lift — CSS + a few lines in the parser.

---

### P3 — Opportunistic

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P3-1 | [Extract AI diff-review workflow from V1](acquisition-evaluation-dita-doer.md) | Extraction | High-value pattern but requires new AI integration infrastructure. Not needed for current workflows. |
| P3-2 | [Extract geminiService.ts from V3](acquisition-evaluation-dita-doer.md) | Extraction | Good prompt engineering reference. Useful when AI features are on the roadmap. |
| P3-3 | [Extract ConversionWizard from V3](acquisition-evaluation-dita-doer.md) | Extraction | Guided migration for new users. Valuable but no user demand yet. |
| P3-4 | [Extract ChatSidebar pattern from V3](acquisition-evaluation-dita-doer.md) | Extraction | AI chat with inline proposals. Design is sound, needs full rewrite. |
| P3-5 | [Extract ditaUtils.ts from V3](acquisition-evaluation-dita-doer.md) | Extraction | XML parser/serializer reference. Fix regex bug at line 188 before any use. |
| P3-6 | [Extract DownloadWarningModal from V1](acquisition-evaluation-dita-doer.md) | Extraction | 51-line validation gate. Trivial to port when export flow is built. |
| P3-7 | Geotab theme session action items | Polish | Theme descriptions, tooltip font size, screen reader testing, visual verification. See `.claude/session-2026-03-10-geotab-theme.md`. |
| P3-8 | [Release notes version browser in What's New modal](feature-requests.md#fr-002-release-notes-version-browser-in-whats-new-modal) | Feature | Modal currently shows only the latest entry. A version selector turns it from a one-time notification into a lightweight changelog. Low urgency — only two versions exist today. |
| P3-9 | [Keyboard shortcut cheat sheet](feature-requests.md#fr-005-keyboard-shortcut-cheat-sheet) | Feature | Good shortcuts exist but are undiscoverable without reading source. Overlay triggered by `?` or `Cmd+/`, grouped by category. Small surface, signals respect for keyboard-driven workflows. |

---

## Recommended Execution Order

**Session N (next):** P1-8 (Tooltip positioning fix) then P2-3 (Beautify button). P1-8 is a one-line fix — do it first, then the Beautify button in the same session.

**Session N+1:** P2-7 + P2-8 + P2-9 (Hover labels, color bars, light theme warmth). All three are CSS-and-parser work with no new components or architecture. P2-7 introduces the CSS classes that P2-8 builds on, so do them in sequence within the same session. P2-9 is independent CSS variable tuning — same session, same context. Ship as a "visual polish" batch.

**Session N+2:** P2-5 (Empty states for Heretto file browser). Quick win, low effort, clear UX improvement.

**Session N+3 and N+4:** P2-1 then P2-2. The API endpoint and Replace in Heretto workflow. These are the most substantial features and should be done sequentially. Bundle P2-4 (accessibility fixes) into whichever session touches the Heretto modals.

**Session N+5:** P2-6 (Inline validation hints). High impact but needs design thought — which validation rules to surface first, how to source xref/keyref resolution data. Worth scoping before committing. Benefits from P2-7's CSS classes being in place.

**Ongoing:** P3 items are picked up when the relevant feature area is being worked on (e.g., extract ChatSidebar when AI features are on the roadmap, extract DownloadWarningModal when building export, version browser when a third release ships).

---

## Completed

### Shipped in v0.5.1 (2026-03-12)

All P0 and P1 items from the original backlog were resolved in a single session and shipped as v0.5.1.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P0-1 | [H2 invisible on Light theme](../bugreports/BUG-h2-light-theme-invisible.md) | Bug | CSS variables instead of hardcoded colors in `index.css`. |
| P0-2 | [Codeblock renders as label with no content](../bugreports/BUG-codeblock-no-content.md) | Bug | Block-child detection in `parseXmlToLexical.ts`; content split into inline runs and block children. |
| P1-1 | [Nested list in table cell renders as raw text](../bugreports/BUG-nested-list-in-table-cell.md) | Bug | Block-level elements now parsed correctly in table entries. |
| P1-2 | [dateRange sub-parameters not rendered](../bugreports/BUG-nested-list-not-rendered.md) | Bug | Fixed by same root cause fix as P1-1. |
| P1-3 | [conkeyref renders as empty whitespace](../bugreports/BUG-conkeyref-empty-whitespace.md) | Bug | Placeholder chips via `DitaPhRefNode` — renders as e.g. `[conkeyref: glossary/term]`. |
| P1-4 | [Table column auto-sizing truncates words](../bugreports/BUG-table-column-autosizing.md) | Bug | `TableColumnSizer` plugin with proportional widths and 10% minimum. |
| P1-5 | [Empty table rows rendered as blank space](../bugreports/BUG-empty-table-rows.md) | Bug | Rows with no `<entry>` children filtered during parsing. |
| P1-6 | [Theme dropdown hidden behind Heretto context toolbar](../bugreports/BUG-theme-dropdown-z-index.md) | Bug | z-index fix in `Toolbar.tsx`. |
| P1-7 | [Geotab theme lacks visual hierarchy](../bugreports/BUG-geotab-theme-low-contrast.md) | Bug | Three-tier contrast hierarchy in `index.css`. |

---

## How to Use This File

- **Before starting a session:** Read this file. Pick the highest-priority unfinished item.
- **After finishing work:** Update the item's status here. If a fix revealed new issues, add them at the appropriate priority.
- **New items:** Add to the appropriate priority tier with a rationale. Link to a detailed file in `bugreports/` or `future-state/` if the item needs more than a one-liner.
- **Promotions/demotions:** If a P2 becomes urgent, move it up with a note on why. If a P0 turns out to be cosmetic, move it down.
