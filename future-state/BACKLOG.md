# DITA Architect Backlog

**Last updated:** 2026-03-17

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
| P0-3 | Task-level `<title>` and `<shortdesc>` not rendered in visual editor | Bug | `parseXmlToLexical.ts:500-506` — task-level title and shortdesc are parsed but not visible in Lexical for task topics containing `<section>` elements. The visual editor starts at the section's `<title>` (H2), skipping the topic title (H1) and shortdesc entirely. Confirmed by manual testing on localhost:3000. |

---

### P1 — Before Next Feature Work

No open P1 items.

> P1-8 through P1-11 have all shipped (v0.6.0–v0.7.2). See Completed section for details.

---

### P2 — Next Cycle

| ID | Item | Type | Rationale |
|----|------|------|-----------|
| P2-22 | [Write API endpoints for Claude Code integration](feature-requests.md#fr-020-update-tab-content-api-endpoint) | Feature | `PUT /api/tabs/:id/content`, `POST /api/tabs/:id/save`, `POST /api/tabs/:id/format`, `GET /api/tabs/:id/stats`. Completes the read-write loop — Claude Code skills can edit content and trigger saves. |
| P2-6 | [Inline validation hints in visual editor](feature-requests.md#fr-004-inline-validation-hints-in-the-visual-editor) | Feature | Authors can write entire topics with broken cross-references and not know until build time. Red underlines on dead `xref`, yellow squiggles on unresolved keyrefs — brings validation into the authoring moment. High impact but substantial implementation — needs design thought before committing. |

> P2-1 through P2-5, P2-7 through P2-21 have all shipped (v0.6.0–v0.7.5). See Completed section for details.

**Dependency chain:** P2-22 depends on P2-20 (shipped). P2-6 is substantial and needs design scoping before committing.

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
| P3-10 | [Rename `Commit` to `Save to Heretto`](feature-requests.md#fr-015-rename-commit-button-to-save-to-heretto) | Polish | UX review (Maya Chen): `Commit` is Git vocabulary that doesn't match a writer's mental model. Unify with `Save to Heretto` across status bar and Heretto dropdown. |
| P3-11 | [Use writer-friendly vocabulary in status bar](feature-requests.md#fr-016-use-writer-friendly-vocabulary-in-heretto-status-bar) | Polish | UX review (Maya Chen): Status bar terms like `Unsaved changes` + `Commit` and `Conflict` are developer-centric. Rephrase for technical writers. |
| P3-12 | [Page-view layout for the visual editor](feature-requests.md#fr-029-page-view-layout-for-the-visual-editor) | Polish | Content area fills the pane edge-to-edge — no visual boundary between document and chrome. Wrap `ContentEditable` in a page surface with background differentiation and theme-aware elevation (shadow on Light, border on dark). Pure CSS, no behavioral changes. Good candidate to bundle with FR-028 (hover frame polish) since both touch the visual editor container. |
| P3-13 | Table context menu accessibility (ARIA + keyboard navigation) | Accessibility | UX review (Maya Chen, P2-19 pipeline): context menu lacks `role="menu"`/`role="menuitem"`, no keyboard navigation (arrow keys, Enter/Space), no focus management on open, no focus trapping, disabled items need `aria-disabled="true"`. Mouse-only right now — keyboard and screen reader users can't use it. |
| P3-14 | Table context menu copy refinements | Polish | UX review (Maya Chen, P2-19 pipeline): consider "Toggle header row" instead of separate "Convert to header/body row" labels. Simplify merge label from "Merge cells (select multiple cells)" to "Merge cells (requires selection)". |
| P3-15 | Restore colspan/rowspan table tests | Tech debt | Pipeline wrapup (Rafael Santos, P2-19): colspan/rowspan parsing fails in test environment — 3 tests skipped. Restore when test infrastructure supports them. |
| P3-16 | Improve API error messages | Polish | UX review (Maya Chen, P2-20 pipeline): `"Not found"` and `"Tab not found"` are too generic. Change to `"Invalid API endpoint format. Expected: /api/tabs/{id}/content"` and `"Tab with ID \"{tabId}\" not found"`. Add body to 405 responses: `"Method not allowed. This endpoint only supports GET requests"`. |
| P3-17 | Add `success` field to API responses | Polish | Pipeline wrapup (Rafael Santos, P2-20): add `success: boolean` to all API responses for consistency. Makes it easier for Claude Code skills to check response status without inspecting HTTP codes. |
| P3-18 | API authentication for production | Tech debt | Pipeline wrapup (Rafael Santos, P2-20): endpoints expose full XML content with no auth. Fine for localhost dev, but needs an auth gate if the editor is ever exposed beyond the local machine. |
| P3-20 | Insert Table modal help text for size constraints | Polish | UX review (Maya Chen, P2-21 pipeline): no indication of max table size (50 rows × 10 columns). Add help text below inputs. |
| P3-21 | Clarify Insert Table "Include header row" label | Polish | UX review (Maya Chen, P2-21 pipeline): checkbox label is ambiguous. Change to "Include header row (first row as table headers)". |
| P3-22 | Insert Table modal ARIA dialog attributes | Accessibility | UX review (Maya Chen, P2-21 pipeline): modal needs proper ARIA dialog role and label attributes for screen reader support. |
| P3-23 | Insert Table modal verb consistency | Polish | UX review (Maya Chen, P3-19 pipeline): helper text uses "create" but link modal uses "insert". Align to `"Press Enter to insert, Escape to cancel."` for consistency. |
| P3-24 | Insert Table modal aria-labels on number inputs | Accessibility | UX review (Maya Chen, P3-19 pipeline): number inputs need explicit `aria-label="Number of rows"` and `aria-label="Number of columns"` for screen readers. Also add `aria-describedby` linking helper text to inputs. |
| P3-25 | Template placeholder text should look editable | Polish | UX review (Maya Chen, product question): default template text (`Task title`, `Short description of the task.`) looks like real content in both editors. Should use a lighter visual treatment (gray italic, `"Click to add title"`) to signal editability. |
| P3-26 | Out-of-sync indicator for visual editor | Feature | UX review (Maya Chen, product question): when the XML editor has been updated but Ctrl+Enter hasn't been pressed, the visual editor shows stale content with no visual indicator. Add a subtle banner or dimmed overlay like `"Visual editor is out of sync — press Ctrl+Enter to refresh"`. |

---

## Recommended Execution Order

**Session N (next):** P0-3 (parser bug — task title/shortdesc invisible). Fix before any other work.

**Session N+1:** P2-22 (write API endpoints). Completes the read-write loop for Claude Code integration.

**Session N+2:** P2-6 (inline validation hints). High impact but needs design thought — which validation rules to surface first, how to source xref/keyref resolution data. Worth scoping before committing.

**Ongoing:** P3 items are picked up when the relevant feature area is being worked on (e.g., extract DownloadWarningModal when building export, version browser when a third release ships). **P3-1 through P3-4 are blocked** on LLM API key access — no timeline; defer to future roadmap unless key becomes available.

---

## Completed

### Shipped in v0.7.6 (2026-03-17)

Insert Table modal keyboard navigation.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P3-19 | Insert Table modal keyboard navigation | Accessibility | Enter key creates table from row/column inputs, Escape key closes modal. Helper text "Press Enter to create, Escape to cancel." added below inputs. Follows link modal pattern exactly. Single file change: `components/Toolbar.tsx`. Passed code review (Elena: PASS), build clean (Marcus: BUILD OK), 20 tests passing (Taylor: ALL PASS). Minor UX follow-ups: align verb to "insert" for consistency with link modal, add aria-labels on number inputs. |

---

### Shipped in v0.7.5 (2026-03-17)

Insert Table toolbar action with rows × columns modal dialog.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-21 | Insert Table toolbar action | Feature | Toolbar button (after list buttons) opens modal with rows (1-50), columns (1-10), and header row checkbox. Generates DITA CALS `<table>` with sequential colspec elements. Custom `INSERT_TABLE_COMMAND` maintains codebase patterns. Defaults to 3×3 with header. Passed code review (Elena: PASS), build clean (Marcus: BUILD OK), tests passing (Taylor: ALL PASS). UX follow-ups tracked as P3-20 through P3-22. |

---

### Shipped in v0.7.4 (2026-03-17)

Read-only API endpoints for Claude Code integration.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-20 | Read-only API endpoints for Claude Code integration | Feature | Three endpoints: `GET /api/status` (version, Heretto connection, tab count, active tab, theme), `GET /api/tabs` (list open tabs with metadata), `GET /api/tabs/:id/content` (full DITA XML + validation errors). State bridge via `lib/editor-state-bridge.ts` syncs React state to Vite server. 25 tests. Passed code review after TypeScript strict mode fix. |

---

### Shipped in v0.7.3 (2026-03-17)

Table context menu — toggle header row, merge/unmerge cells, simpletable constraint enforcement.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P2-19 | Table context menu (insert/delete rows and columns) | Feature | Right-click context menu on table cells with toggle header row, cell merge (CALS only), and cell unmerge. Conservative simpletable detection prevents invalid DITA spanning attributes. Menu height increased to 320px. Passed code review after retry (header/body boundary validation added). Build clean, 39/42 tests passing. Accessibility follow-up tracked as P3-13. |

---

### Shipped in v0.7.2 (2026-03-16)

P1 bug fixes: word count, sync during conflict, format button placement. Tooltips and aria-labels on XML toolbar. Save feedback loop fix.

| Former ID | Item | Type | Resolution |
|-----------|------|------|------------|
| P1-9 | Word/character count shows zeros on initial load | Bug | Defensive try-catch error boundaries in `BottomToolbar.tsx` around editor state reads. Immediate state read in `useEffect` catches content parsed before listener attached. |
| P1-10 | XML→visual sync blocked during conflict state | Bug | Removed redundant `pending === lastXmlRef.current` condition in `SyncManager.tsx` that prevented Ctrl+Enter sync during Heretto conflict state. |
| P1-11 | Format XML button floats outside XML toolbar | Bug | Moved Format button from absolute-positioned overlay in `MonacoDitaEditor.tsx` into the XML toolbar row in `dita-architect.tsx`. Restyled to match existing toolbar button pattern. |
| — | XML toolbar tooltips and aria-labels | Feature | Added `<Tooltip>` wrappers and aria-labels to all three XML toolbar items (syntax theme dropdown, format button, collapse button). Dynamic aria-label on syntax theme: `"Select syntax theme: {theme}"`. Keyboard shortcut in format tooltip: `"Format XML (Shift+Alt+F)"`. |
| P2-15 | Improve HerettoReplaceModal recovery text | Polish | Changed to `"To recover, use Heretto's version history (topic → History tab)."` in HerettoReplaceModal.tsx. |
| P2-16 | Improve DiffViewer empty state copy | Polish | Changed to `"No changes detected — your content matches the version in Heretto"` in DiffViewer.tsx. |
| P2-17 | Use contextual placeholder in HerettoStatusModal | Polish | Changed email placeholder from `"user@example.com"` to `"your.name@company.com"` in HerettoStatusModal.tsx. |
| P2-18 | Save confirmation feedback loop | Bug | `handleHerettoSave` in `useHerettoCms.ts` was missing `herettoDirty: false` in the `setTabs` call after successful save. Status bar stayed on `Unsaved changes` because the `useEffect` deriving dirty state only watched `xmlContent`, not `savedXmlRef.current`. One-line fix. |

---

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

### Pre-backlog (v0.5.0 and earlier)

Features shipped before the backlog was formalized. Added retroactively for traceability.

| Item | Type | Resolution |
|------|------|------------|
| DITA-aware auto-completion in XML editor | Feature | Context-sensitive element suggestions via `registerCompletionItemProvider` in `MonacoDitaEditor.tsx`. Walks tag stack to determine parent element, suggests only valid DITA children from a full `ditaContentModel`. Triggered on `<` or Ctrl+Space. |
| Auto-close XML tags | Feature | `setupAutoCloseTags` in `MonacoDitaEditor.tsx`. Inserts matching closing tag on `>` keystroke and positions cursor between open/close pair. Skips self-closing tags, closing tags, comments, PIs, and DOCTYPE declarations. |
| Clickable error panel (jump-to-line) | Feature | Code Status Footer in `dita-architect.tsx`. Problems panel shows XML errors as clickable buttons that call `monacoApiRef.current.revealLine()` to jump to the offending line. |
| Import integrity check (double-fetch verification) | Feature | `ImportVerificationModal` + `useHerettoCms`. Topic content is fetched twice from Heretto and compared before opening. Flags unrecognized DITA elements that won't render in the visual editor. |
| Processing instruction round-trip preservation | Feature | Heretto review markers (`<?ezd-review-start?>` / `<?ezd-review-end?>`) are filtered from Lexical rendering but preserved and round-tripped in the XML output. |

---

## How to Use This File

- **Before starting a session:** Read this file. Pick the highest-priority unfinished item.
- **After finishing work:** Update the item's status here. If a fix revealed new issues, add them at the appropriate priority.
- **New items:** Add to the appropriate priority tier with a rationale. Link to a detailed file in `bugreports/` or `future-state/` if the item needs more than a one-liner.
- **Promotions/demotions:** If a P2 becomes urgent, move it up with a note on why. If a P0 turns out to be cosmetic, move it down.
