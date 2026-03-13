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
~~P1-8~~ — Shipped in v0.6.0 (see Completed section)

---

### P2 — Next Cycle

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| ~~P2-1~~ | ~~API endpoint for external content loading~~ | ~~Feature~~ | Shipped in v0.7.0 (see Completed section) |
| ~~P2-2~~ | ~~Replace in Heretto workflow~~ | ~~Feature~~ | Shipped in v0.7.1 (see Completed section) |
| ~~P2-3~~ | ~~Beautify button~~ | ~~Feature~~ | Shipped in v0.6.1 (see Completed section) |
| ~~P2-4~~ | ~~Accessibility fixes on Heretto modals~~ | ~~Fix~~ | Shipped in v0.7.1 (see Completed section) |
| ~~P2-5~~ | ~~Empty states for Heretto file browser~~ | ~~Feature~~ | Shipped in v0.6.2 (see Completed section) |
| P2-6 | [Inline validation hints in visual editor](feature-requests.md#fr-004-inline-validation-hints-in-the-visual-editor) | Feature | Authors can write entire topics with broken cross-references and not know until build time. Red underlines on dead `xref`, yellow squiggles on unresolved keyrefs — brings validation into the authoring moment. High impact but substantial implementation. |
| ~~P2-7~~ | ~~Hover element labels in visual editor~~ | ~~Feature~~ | Shipped in v0.6.0 (see Completed section) |
| ~~P2-8~~ | ~~Structural color bars for DITA body elements~~ | ~~Feature~~ | Shipped in v0.6.0 (see Completed section) |
| ~~P2-9~~ | ~~Light theme warmth refinement~~ | ~~Feature~~ | Shipped in v0.6.0 (see Completed section) |
| ~~P2-10~~ | ~~Rename "Post-Requisite" hover label to "Postrequisites"~~ | ~~Fix~~ | Shipped in v0.6.1 (see Completed section) |
| ~~P2-11~~ | ~~Improve theme descriptions to be more contextual~~ | ~~Polish~~ | Shipped in v0.6.1 (see Completed section) |
| ~~P2-12~~ | ~~Add aria-label to Format XML button~~ | ~~Fix~~ | Shipped in v0.6.2 (see Completed section) |
| ~~P2-13~~ | ~~Improve Format XML error toast specificity~~ | ~~Polish~~ | Shipped in v0.6.2 (see Completed section) |
| ~~P2-14~~ | ~~Refine external load toast copy~~ | ~~Polish~~ | Shipped in v0.7.1 (see Completed section) |
| P2-15 | Improve HerettoReplaceModal recovery text | Polish | UX review (Maya Chen): make Heretto version history recovery path more specific — suggest "To recover, use Heretto's version history (topic -> History tab)." |
| P2-16 | Improve DiffViewer empty state copy | Polish | UX review (Maya Chen): when no changes detected, use "No changes detected — your content matches the version in Heretto" instead of generic "No changes detected". |
| P2-17 | Use contextual placeholder in HerettoStatusModal | Polish | UX review (Maya Chen): change email placeholder from "user@example.com" to "your.name@company.com" to clarify it's a work email. |

**Dependency chain:** P2-6 is the only substantial remaining item. P2-15, P2-16, P2-17 are trivial one-line copy changes.

---

### P3 — Opportunistic

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P3-1 | [Extract AI diff-review workflow from V1](acquisition-evaluation-dita-doer.md) | Extraction | ⚠️ **AI-dependent.** High-value pattern but requires new AI integration infrastructure. Not needed for current workflows. |
| P3-2 | [Extract geminiService.ts from V3](acquisition-evaluation-dita-doer.md) | Extraction | ⚠️ **AI-dependent.** Good prompt engineering reference. Useful when AI features are on the roadmap. |
| P3-3 | [Extract ConversionWizard from V3](acquisition-evaluation-dita-doer.md) | Extraction | ⚠️ **AI-dependent.** Guided migration for new users. Valuable but no user demand yet. |
| P3-4 | [Extract ChatSidebar pattern from V3](acquisition-evaluation-dita-doer.md) | Extraction | ⚠️ **AI-dependent.** AI chat with inline proposals. Design is sound, needs full rewrite. |

> **Note on AI features (P3-1 through P3-4):** These items require an API key to an LLM provider (e.g., Anthropic, OpenAI, Google). We do not currently have access to one and there is no timeline for obtaining one. **Approach:** If feasible, build the backend integration with the LLM abstraction in place and gate the frontend features behind a key-availability check — they remain hidden until a key is configured. Otherwise, defer these items to a future roadmap when LLM access is available.
| P3-5 | [Extract ditaUtils.ts from V3](acquisition-evaluation-dita-doer.md) | Extraction | XML parser/serializer reference. Fix regex bug at line 188 before any use. |
| P3-6 | [Extract DownloadWarningModal from V1](acquisition-evaluation-dita-doer.md) | Extraction | 51-line validation gate. Trivial to port when export flow is built. |
| P3-7 | Geotab theme session action items | Polish | Theme descriptions, tooltip font size, screen reader testing, visual verification. See `.claude/session-2026-03-10-geotab-theme.md`. |
| P3-8 | [Release notes version browser in What's New modal](feature-requests.md#fr-002-release-notes-version-browser-in-whats-new-modal) | Feature | Modal currently shows only the latest entry. A version selector turns it from a one-time notification into a lightweight changelog. Low urgency — only two versions exist today. |
| P3-9 | [Keyboard shortcut cheat sheet](feature-requests.md#fr-005-keyboard-shortcut-cheat-sheet) | Feature | Good shortcuts exist but are undiscoverable without reading source. Overlay triggered by `?` or `Cmd+/`, grouped by category. Small surface, signals respect for keyboard-driven workflows. |

---

## Recommended Execution Order

**Session N (next):** P2-15 + P2-16 + P2-17 (UX copy fixes). Three trivial one-line changes, ship as a quick batch.

**Session N+1:** P2-6 (Inline validation hints). High impact but needs design thought — which validation rules to surface first, how to source xref/keyref resolution data. Worth scoping before committing.

**Ongoing:** P3 items are picked up when the relevant feature area is being worked on (e.g., extract DownloadWarningModal when building export, version browser when a third release ships). **P3-1 through P3-4 are blocked** on LLM API key access — no timeline; defer to future roadmap unless key becomes available.

---

## Completed

### Shipped in v0.7.1 (2026-03-13)

Replace in Heretto workflow + accessibility + toast copy.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-2 | Replace in Heretto workflow | Feature | Three-step replace wizard (HerettoReplaceModal), Monaco diff viewer (DiffViewer), persistent context bar (HerettoReplaceBar), handleHerettoReplace in useHerettoCms. Full draft-to-publish workflow with post-replace tab state transition. |
| P2-4 | Accessibility fixes on Heretto modals | Fix | htmlFor/id pairing on HerettoStatusModal, aria-live on search progress, aria-labels on toolbar buttons, autoFocus on all modals, aria-labelledby on ImportVerificationModal, aria-labels on HerettoReplaceBar buttons. |
| P2-14 | Refine external load toast copy | Polish | Changed "Loaded {fileName} from external tool" to "Imported {fileName}" in useExternalLoad.ts. |

---

### Shipped in v0.7.0 (2026-03-13)

External content loading API — replaces cli-chrome Monaco injection.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-1 | API endpoint for external content loading | Feature | Vite plugin with `POST /api/load-content` and `GET /api/pending-loads`. New `useExternalLoad` hook polls, validates, beautifies, and creates tabs. `herettoReplaceTarget` field added to Tab type for P2-2. |

---

### Shipped in v0.6.2 (2026-03-13)

Accessibility and empty states batch.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-5 | Empty states for Heretto file browser | Feature | Added "No topics in this folder" message with optional "Create new topic" button. Proper modal sequencing from browser to new topic flow. |
| P2-12 | Add aria-label to Format XML button | Fix | Added `aria-label="Format XML"` to format button in `MonacoDitaEditor.tsx`. |
| P2-13 | Improve Format XML error toast specificity | Polish | Error toast updated to "Failed to format XML: Check for syntax errors". |

---

### Shipped in v0.6.1 (2026-03-13)

Small polish batch: beautify button + UX copy fixes.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-3 | Beautify button | Feature | Added Format XML button (Code2 icon) to Monaco editor toolbar with Shift+Alt+F shortcut. Toast on success/failure. |
| P2-10 | Rename "Post-Requisite" to "Postrequisites" | Fix | Updated `::after` content in `index.css` to match DITA standard terminology. |
| P2-11 | Improve theme descriptions | Polish | Updated `THEME_DESCRIPTIONS` in `Toolbar.tsx` to user-focused copy across all 6 themes. |

---

### Shipped in v0.6.0 (2026-03-13)

Visual polish batch: tooltip fix + body element indicators + light theme warmth.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P1-8 | Theme dropdown tooltip blocks next option | Bug | Added `placement` prop to `Tooltip.tsx` (`'bottom'` default, `'right'` option). Theme dropdown tooltips use `placement="right"`. |
| P2-7 | Hover element labels in visual editor | Feature | Extended `ShortdescPlugin.tsx` mutation listener with `BODY_TAG_CLASSES` map covering `shortdesc`, `prereq`, `context`, `result`, `postreq`. Hover-triggered `::after` labels on each element. |
| P2-8 | Structural color bars for DITA body elements | Feature | Left-edge `border-left: 3px solid` color bars on prereq/context/result/postreq. Four new CSS variables (`--editor-*-bar`) defined across all 6 themes. |
| P2-9 | Light theme warmth refinement | Feature | Swapped 18 Slate values to Stone in `[data-theme="light"]` block. Increased editor padding `px-8` → `px-12`. |

---

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
