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

No open P1 items.

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

**Dependency chain:** P2-1 → P2-2 (Replace in Heretto needs the API endpoint to deliver the replace target UUID). P2-3, P2-4, P2-5, and P2-6 are independent. P2-5 is low effort. P2-6 is the most substantial item in this tier.

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

**Session N (next):** P2-3 (Beautify button). Quick win — the function exists, just add the button and shortcut. Good momentum before the larger integration work.

**Session N+1:** P2-5 (Empty states for Heretto file browser). Another quick win from Maya's requests — low effort, clear UX improvement.

**Session N+2 and N+3:** P2-1 then P2-2. The API endpoint and Replace in Heretto workflow. These are the most substantial features and should be done sequentially. Bundle P2-4 (accessibility fixes) into whichever session touches the Heretto modals.

**Session N+4:** P2-6 (Inline validation hints). High impact but needs design thought — which validation rules to surface first, how to source xref/keyref resolution data. Worth scoping before committing.

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
