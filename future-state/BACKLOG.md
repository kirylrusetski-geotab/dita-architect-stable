# DITA Architect Backlog

**Last updated:** 2026-03-12

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

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P0-1 | [H2 invisible on Light theme](../bugreports/BUG-h2-light-theme-invisible.md) | Bug | WCAG failure. Content is invisible. Any user on Light theme loses section headings entirely. |
| P0-2 | [Codeblock renders as label with no content](../bugreports/BUG-codeblock-no-content.md) | Bug | Content is lost in the visual editor. Users see "CODEBLOCK" but not the actual code. This breaks the core value prop of a split-pane editor — if the visual pane can't show the content, the pane is useless for that element. |

**Why these two first:** Both are data-loss-in-rendering bugs. A user looking at the Lexical pane will either see nothing (H2) or see a placeholder instead of content (codeblock). These undermine trust in the editor before anything else matters.

---

### P1 — Before Next Feature Work

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P1-1 | [Nested list in table cell renders as raw text](../bugreports/BUG-nested-list-in-table-cell.md) | Bug | Content is rendered but incorrectly. Lists in table cells are common in API reference docs (the primary content type). |
| P1-2 | [dateRange sub-parameters not rendered](../bugreports/BUG-nested-list-not-rendered.md) | Bug | Content is dropped entirely. Related to P1-1 (same root cause: list-in-table-cell parsing). Fixing P1-1 likely fixes this. |
| P1-3 | [conkeyref renders as empty whitespace](../bugreports/BUG-conkeyref-empty-whitespace.md) | Bug | Content reference renders as nothing. A visible placeholder is needed for any unresolvable reference — this is a correctness issue for any DITA content using conkeyrefs. |
| P1-4 | [Table column auto-sizing truncates words](../bugreports/BUG-table-column-autosizing.md) | Bug | Content is present but unreadable. Column sizing affects every table-heavy topic. |
| P1-5 | [Empty table rows rendered as blank space](../bugreports/BUG-empty-table-rows.md) | Bug | Visual noise, not data loss. Lower urgency than the others but still a rendering correctness issue. |
| P1-6 | [Theme dropdown hidden behind Heretto context toolbar](../bugreports/BUG-theme-dropdown-z-index.md) | Bug | Z-index stacking issue. The Heretto breadcrumb bar renders on top of the theme dropdown, hiding the "Dark" theme option. Users with a Heretto file open cannot select the Dark theme. |
| P1-7 | [Geotab theme lacks visual hierarchy](../bugreports/BUG-geotab-theme-low-contrast.md) | Bug | The editor content area, app chrome, and toolbar all blend into similar dark navy tones. Insufficient contrast between UI regions compared to other themes. Needs color value adjustments for a clear three-tier visual hierarchy. |

**Dependency note:** P1-1 and P1-2 share a root cause (list nodes inside table cell nodes in Lexical). Fix them together. P1-6 is a quick z-index fix. P1-7 is a CSS variable tuning pass.

---

### P2 — Next Cycle

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P2-1 | [API endpoint for external content loading](altitude-release-notes-integration.md#feature-1-local-api-endpoint-for-external-content-loading) | Feature | Replaces the fragile cli-chrome injection with a stable HTTP API. Unblocks clean integration with the release notes skill and any future external tooling. |
| P2-2 | [Replace in Heretto workflow](altitude-release-notes-integration.md#feature-2-replace-in-heretto) | Feature | Enables draft-to-publish within the editor. Depends on P2-1 (the API delivers content with a replace target UUID). |
| P2-3 | [Beautify button](feature-requests.md) | Feature | Surfaces existing `formatXml()` as a user action. Low effort — the function exists, this is a toolbar button + keyboard shortcut. |
| P2-4 | [Accessibility fixes on Heretto modals](altitude-release-notes-integration.md#accessibility-improvements-discovered-during-review) | Fix | Label associations, aria-labels, aria-live, focus management. Bundle with P2-1/P2-2 since we'll be touching related components. |

**Dependency chain:** P2-1 → P2-2 (Replace in Heretto needs the API endpoint to deliver the replace target UUID). P2-3 and P2-4 are independent.

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

---

## Recommended Execution Order

**Session N (next):** P0-1 and P0-2. Both are surgical fixes — a CSS variable addition and a Lexical node rendering fix. Ship these before touching anything else.

**Session N+1:** P1-1 through P1-5 (Lexical rendering bugs). Tackle as a batch since they share context in `parseXmlToLexical.ts`. P1-1 and P1-2 are the same root cause. P1-3 is a separate parser path. P1-4 and P1-5 are rendering/layout. Also fix P1-6 (z-index, quick) and P1-7 (Geotab theme contrast, CSS variable tuning) in the same session.

**Session N+2:** P2-3 (Beautify button). Quick win — the function exists, just add the button and shortcut. Good momentum before the larger integration work.

**Session N+3 and N+4:** P2-1 then P2-2. The API endpoint and Replace in Heretto workflow. These are the most substantial features and should be done sequentially. Bundle P2-4 (accessibility fixes) into whichever session touches the Heretto modals.

**Ongoing:** P3 items are picked up when the relevant feature area is being worked on (e.g., extract ChatSidebar when AI features are on the roadmap, extract DownloadWarningModal when building export).

---

## How to Use This File

- **Before starting a session:** Read this file. Pick the highest-priority unfinished item.
- **After finishing work:** Update the item's status here. If a fix revealed new issues, add them at the appropriate priority.
- **New items:** Add to the appropriate priority tier with a rationale. Link to a detailed file in `bugreports/` or `future-state/` if the item needs more than a one-liner.
- **Promotions/demotions:** If a P2 becomes urgent, move it up with a note on why. If a P0 turns out to be cosmetic, move it down.
