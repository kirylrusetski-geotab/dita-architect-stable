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

---

## FR-011: Refine external load toast copy

**Requested:** 2026-03-13
**Status:** Shipped (v0.7.1, 2026-03-13)
**Priority:** P2-14
**Impact:** Low

### Description

The success toast when content is loaded via the external API (`POST /api/load-content`) currently reads `"Loaded {fileName} from external tool"`. The phrase "external tool" is developer-centric jargon that may not resonate with technical writers. Change to `"Imported {fileName}"` or `"Opened {fileName}"`.

One-line change in `hooks/useExternalLoad.ts`.

### Value Proposition (Maya Chen, UX Advisor)

"From external tool" describes the mechanism, not the outcome. Writers don't think in terms of "external tools" — they think "I asked the system to load my draft and it did." A simpler `"Imported {fileName}"` communicates the result without exposing the plumbing. Error messages should be specific (and they are); success messages should be brief.

---

## FR-012: Improve HerettoReplaceModal recovery text

**Requested:** 2026-03-13
**Status:** Proposed
**Priority:** P2-15
**Impact:** Low

### Description

The HerettoReplaceModal confirmation step mentions that the action "cannot be undone from DITA Architect" and references Heretto's version history, but the recovery path could be more specific and actionable.

- **Current:** `You can restore previous versions from Heretto's version history if needed.`
- **Suggested:** `To recover, use Heretto's version history (topic → History tab).`

One-line change in `components/HerettoReplaceModal.tsx`.

### Value Proposition (Maya Chen, UX Advisor)

The current copy tells authors recovery is possible but not how. Adding the specific navigation path ("topic → History tab") reduces anxiety and eliminates the need to search Heretto's docs. When warning about a destructive action, the recovery path should be as concrete as the warning itself.

---

## FR-013: Improve DiffViewer empty state copy

**Requested:** 2026-03-13
**Status:** Proposed
**Priority:** P2-16
**Impact:** Low

### Description

When the DiffViewer detects no changes between the editor content and Heretto content, it currently shows `No changes detected`. This is accurate but not informative.

- **Current:** `No changes detected`
- **Suggested:** `No changes detected — your content matches the version in Heretto`

One-line change in `components/DiffViewer.tsx`.

### Value Proposition (Maya Chen, UX Advisor)

"No changes detected" answers "what happened?" but not "what does this mean?" Adding "your content matches the version in Heretto" confirms the comparison was successful and the content is identical. It reassures the author that the diff worked correctly rather than leaving ambiguity about whether something went wrong.

---

## FR-014: Use contextual placeholder in HerettoStatusModal

**Requested:** 2026-03-13
**Status:** Proposed
**Priority:** P2-17
**Impact:** Low

### Description

The email input field in HerettoStatusModal uses the generic placeholder `user@example.com`. A more contextual placeholder would better communicate that this is a work email for Heretto CMS authentication.

- **Current:** `user@example.com`
- **Suggested:** `your.name@company.com`

One-line change in `components/HerettoStatusModal.tsx`.

### Value Proposition (Maya Chen, UX Advisor)

Placeholder text is a micro-affordance — it answers "what goes here?" at a glance. `user@example.com` is a developer convention that signals nothing about the context. `your.name@company.com` subtly communicates "use your work email" without needing a label change. Small touch, professional signal.

---

## FR-015: Rename `Commit` button to `Save to Heretto`

**Requested:** 2026-03-13
**Status:** Proposed
**Priority:** Low
**Impact:** Medium

### Description

The Heretto-connected status bar shows a `Commit` button alongside status text like `Unsaved changes` or `Conflict — updated in Heretto`. The `Commit` label is developer/Git vocabulary that doesn't match a technical writer's mental model. Additionally, there is both a `Commit` button in the status bar and a `Save` option in the Heretto dropdown menu, creating ambiguity about which action actually saves to Heretto.

- **Current:** `Commit` button in status bar + `Save` in Heretto dropdown
- **Suggested:** Single `Save to Heretto` label for the primary save action, consistent across both locations

### Value Proposition (Maya Chen, UX Advisor)

During my authoring session, I clicked `Commit` expecting it to save my changes to Heretto. It resolved the conflict state but didn't save. Then I tried `Heretto > Save` and couldn't tell if it worked either. Two buttons that sound like they do similar things but behave differently is a recipe for confusion.

Authors think in terms of "save my work." They don't think in terms of "commit." The label should match the action and the audience. `Save to Heretto` is unambiguous — it tells you *what* will happen and *where*. If `Commit` is doing something different from `Save` (like resolving a conflict vs. pushing content), those should be visually and verbally distinct — not two buttons that look interchangeable but aren't.

---

## FR-016: Use writer-friendly vocabulary in Heretto status bar

**Requested:** 2026-03-13
**Status:** Proposed
**Priority:** Low
**Impact:** Medium

### Description

The Heretto status bar uses developer-centric terms that don't align with a technical writer's workflow vocabulary. The combination of `Unsaved changes` + `Commit` reads like a Git staging area, not a document editor.

- **Current status states:** `Unsaved changes`, `Conflict — updated in Heretto`, `Saved just now`
- **Current action:** `Commit`
- **Suggested states:** `Edited — not saved`, `Someone else edited this in Heretto`, `Saved to Heretto`
- **Suggested action:** `Save to Heretto` (see FR-015)

### Value Proposition (Maya Chen, UX Advisor)

The status bar is the author's primary feedback channel for document state. Every word in it should be immediately parseable by someone who has never used Git. `Unsaved changes` is borderline fine, but paired with `Commit` it creates a Git mental model that doesn't serve the audience. `Conflict` is technical jargon — "Someone else edited this in Heretto" tells the author exactly what happened in language they understand.

This isn't about dumbing things down — it's about matching the language to the user. The same author who would be confused by `Commit` would instantly understand `Save to Heretto`. The status bar should speak the author's language, not the developer's.

---

## FR-017: Editor status API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add a `GET /api/status` endpoint that returns the editor's current state: version, Heretto connection status, number of open tabs, active theme. This is the handshake endpoint — any Claude Code skill that integrates with DITA Architect should start here to confirm the editor is running and ready.

### Suggested Response

```json
{
  "version": "0.7.2",
  "herettoConnected": true,
  "tabCount": 3,
  "activeTabId": "tab-2",
  "theme": "dark"
}
```

### Value Proposition (Maya Chen, UX Advisor)

Every Claude Code skill that talks to DITA Architect needs a way to answer one question first: "is the editor running?" Without this, skills fail silently or throw opaque network errors. A status endpoint lets a skill say `"DITA Architect is not running on localhost:3000 — start it with npm run dev"` instead of leaving the user to debug a connection refused error. It's the difference between a tool that assumes everything is fine and one that checks before acting.

---

## FR-018: List open tabs API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add a `GET /api/tabs` endpoint that returns all open tabs with their metadata: id, file name, Heretto file info, dirty state, and XML error count. Include the `activeTabId` at the top level so callers know which tab the author is currently working in.

### Suggested Response

```json
{
  "activeTabId": "tab-2",
  "tabs": [
    {
      "id": "tab-2",
      "fileName": "setting-up-traffic-analysis.dita",
      "herettoFile": { "uuid": "abc-123", "name": "Setting up a Traffic Analysis" },
      "dirty": true,
      "xmlErrorCount": 0
    },
    {
      "id": "tab-3",
      "fileName": "new-topic.dita",
      "herettoFile": null,
      "dirty": false,
      "xmlErrorCount": 1
    }
  ]
}
```

### Value Proposition (Maya Chen, UX Advisor)

This is the foundation for any Claude Code skill that wants to work *with* the editor rather than just pushing content *at* it. A skill that says "review the current topic for DITA best practices" needs to know which topic is active. A skill that says "check all open tabs for broken cross-references" needs the full list. Without this endpoint, every skill has to guess — and guessing means either asking the user to specify (friction) or assuming there's only one tab (wrong). The `activeTabId` field is the key detail: it answers "what is the author looking at right now?" without requiring them to say so.

---

## FR-019: Read tab content API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add a `GET /api/tabs/:id/content` endpoint that returns the full XML content of a specific tab along with relevant metadata. This enables the "copilot" pattern — Claude Code reads the author's current work, analyzes it, and provides suggestions.

### Suggested Response

```json
{
  "id": "tab-2",
  "fileName": "setting-up-traffic-analysis.dita",
  "herettoFile": { "uuid": "abc-123", "name": "Setting up a Traffic Analysis" },
  "dirty": true,
  "xmlErrors": [],
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE task ...>..."
}
```

### Value Proposition (Maya Chen, UX Advisor)

This is the endpoint that makes DITA Architect a *collaborative* tool rather than a closed editor. Right now, the only way to get content out of the editor is to copy-paste from the XML pane or save to Heretto and fetch via API. Neither of those works for a Claude Code skill that wants to read, analyze, and respond in real time.

Have you considered the workflows this unlocks? A skill reads the XML, checks that every `<step>` has a `<cmd>`, flags any `<xref>` without an `href`, counts words per section, or suggests where to split a 3,000-word topic. All from the terminal, while the author keeps writing. The response includes `xmlErrors` and `dirty` state so the skill has full context — it knows whether the content has unsaved changes and whether there are validation issues before it starts its analysis.

---

## FR-020: Update tab content API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add a `PUT /api/tabs/:id/content` endpoint that updates the XML content of an existing tab. This completes the read-write loop — Claude Code can read content via FR-019, transform it, and push the result back into the same tab.

### Suggested Request Body

```json
{
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE task ...>..."
}
```

### Suggested Response

```json
{
  "id": "tab-2",
  "status": "updated"
}
```

### Value Proposition (Maya Chen, UX Advisor)

This is where the integration goes from "read-only" to "useful." A skill that can read content and write it back can do real work: reformat XML, add missing `<shortdesc>` elements, normalize `<uicontrol>` usage, or apply terminology corrections across a topic. The key UX consideration is feedback — when content changes in the editor because a skill updated it, the author should see a toast like `"Content updated from terminal"` so the change isn't invisible. Without feedback, the XML pane silently changes and the author might not notice, especially if they're focused on the visual pane.

The `PUT` should also trigger a sync to the visual editor so the author sees the updated content in both panes immediately, matching the behavior of typing directly in the XML editor.

---

## FR-021: Save tab to Heretto API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** High

### Description

Add a `POST /api/tabs/:id/save` endpoint that triggers a save to Heretto for a specific tab. This completes the full lifecycle: a Claude Code skill can read a topic, edit it, and save it back to Heretto without the author touching the browser.

### Suggested Response

```json
{
  "id": "tab-2",
  "status": "saved",
  "herettoFile": { "uuid": "abc-123", "name": "Setting up a Traffic Analysis" }
}
```

### Value Proposition (Maya Chen, UX Advisor)

This is the endpoint that closes the loop. Without it, a Claude Code skill can push edited content into the editor but the author still has to manually click `Save to Heretto` in the browser. That breaks the terminal workflow — the whole point of CLI integration is that the author can stay in their terminal.

The save should follow the same verification pattern we already use (`PUT` → fetch-back → compare) and return the result. If the save fails (not connected to Heretto, tab not linked to a Heretto file, conflict state), the response should include a clear error: `"Tab is not connected to Heretto"` or `"Conflict — resolve in the editor first"`. Those error messages can flow directly into the Claude Code skill's output to the user.

---

## FR-022: Format tab XML API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Low
**Impact:** Medium

### Description

Add a `POST /api/tabs/:id/format` endpoint that triggers XML formatting (pretty-print) on a specific tab. Useful for Claude Code skills that generate or transform XML and want to ensure the result is cleanly formatted before the author sees it.

### Suggested Response

```json
{
  "id": "tab-2",
  "status": "formatted"
}
```

### Value Proposition (Maya Chen, UX Advisor)

Skills that generate XML — whether from scratch or by transforming existing content — don't always produce cleanly indented output. Rather than requiring every skill to implement its own XML formatter, this endpoint lets them push content via FR-020 and then call format to clean it up. It's the API equivalent of the author clicking the Format button in the toolbar. One less thing for skill authors to worry about, and consistent formatting regardless of where the XML came from.

---

## FR-023: Tab content statistics API endpoint

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Low
**Impact:** Medium

### Description

Add a `GET /api/tabs/:id/stats` endpoint that returns the word count, character count, readability score, and grade level for a specific tab. These statistics are already computed by `analyzeText()` in `textAnalysis.ts` and displayed in the `BottomToolbar` — this endpoint exposes them to external tools.

### Suggested Response

```json
{
  "id": "tab-2",
  "wordCount": 487,
  "characterCount": 2841,
  "readabilityScore": 42.3,
  "gradeLevel": "12th",
  "readingLevel": "College",
  "sentenceCount": 31
}
```

### Value Proposition (Maya Chen, UX Advisor)

Imagine a Claude Code skill that says: "This topic is 2,400 words at a 12th-grade reading level — have you considered splitting the procedure section into two topics?" That's the kind of feedback that helps writers produce better content without leaving their terminal. We already compute all of this data in `BottomToolbar` via `analyzeText()`. Exposing it via API means skills can use readability as a decision input — flag topics that exceed a word count threshold, track reading level trends across a documentation set, or suggest simplification when the Flesch-Kincaid score drops too low. The data is already there; this endpoint just makes it accessible.

---

## FR-024: Table context menu (insert/delete rows and columns)

**Requested:** 2026-03-16
**Status:** Shipped (v0.7.2, 2026-03-16)
**Priority:** Medium
**Impact:** High

### Description

Add a right-click context menu on table cells in the Lexical visual editor. Currently, authors can edit content *within* existing table cells, but cannot add or remove rows, columns, or tables from the visual pane — they must switch to the XML editor and manually write DITA markup.

The Lexical playground ships a [`TableActionMenuPlugin`](https://github.com/facebook/lexical/tree/main/packages/lexical-playground/src/plugins/TableActionMenuPlugin) that provides 16 table operations. Port the relevant subset to DITA Architect.

### Operations to Include

| Operation | Menu Label | Notes |
|---|---|---|
| Insert row above | `Insert row above` | Explicit direction eliminates ambiguity |
| Insert row below | `Insert row below` | |
| Insert column left | `Insert column left` | |
| Insert column right | `Insert column right` | |
| Delete row | `Delete row` | |
| Delete column | `Delete column` | |
| Delete table | `Delete table` | Confirmation dialog before destructive action |
| Toggle header row | `Toggle header row` | Maps to DITA `<thead>` vs `<tbody>` |
| Merge cells | `Merge cells` | Only show when multiple cells selected |
| Unmerge cells | `Unmerge cells` | Only show on merged cells |

### Operations to Defer

Background color, vertical alignment, row striping, and column/row freeze are presentation-layer features that don't map to DITA semantics. Defer until there's demand.

### Suggested Approach

- Port `TableActionMenuPlugin` from the [Lexical playground source](https://github.com/facebook/lexical/tree/main/packages/lexical-playground/src/plugins/TableActionMenuPlugin). The underlying commands (`INSERT_TABLE_ROW_COMMAND`, `INSERT_TABLE_COLUMN_COMMAND`, etc.) already exist in `@lexical/table`, which is already in our dependency tree.
- Style the context menu to match the existing dropdown pattern: `bg-[var(--app-surface-raised)]`, `border-[var(--app-border-subtle)]`, `text-xs` sizing — consistent with the syntax theme dropdown.
- Ensure Tab/Shift+Tab navigation between cells works (Tab in the last cell should create a new row).
- Serializer impact: `createTableFromLexical` in `serializeLexicalToXml.ts` already handles CALS table output. New rows/columns created via the context menu will serialize correctly without changes.

### Value Proposition (Maya Chen, UX Advisor)

If I'm editing the Parameters table in a concept topic and I need to add a new `format` parameter, my only option today is to switch to the XML pane, find the right `<tbody>`, write `<row><entry>format</entry><entry>...</entry><entry>STRING</entry><entry>-</entry><entry>N</entry></row>`, and sync back. That's five nested elements for what should be a right-click and `"Insert row below"`.

This is the single most common structural editing operation in DITA API documentation. Every concept topic with a parameters table, every reference topic with a properties table, every task topic with a troubleshooting table — they all need row insertion during the writing process. The gap between "I can edit cell text visually" and "I can't add a row visually" is the gap between a viewer and an editor.

The good news is that Lexical has already solved this problem. The `@lexical/table` package provides the commands, and the playground provides a reference implementation of the context menu UI. We're porting proven code, not inventing new interactions.

---

## FR-025: Insert Table toolbar action

**Requested:** 2026-03-16
**Status:** Proposed
**Priority:** Medium
**Impact:** Medium

### Description

Add an "Insert Table" action to the WYSIWYG toolbar that opens a small dialog for specifying table dimensions (rows × columns), then inserts a new DITA table at the cursor position. This complements FR-024 (context menu for existing tables) by enabling table *creation* from the visual pane.

### Suggested Interaction

1. Author clicks the table icon in the toolbar (or selects `Insert > Table` from a dropdown).
2. A small popover appears with two number inputs: `Rows` (default: 3) and `Columns` (default: 3), plus a `"Include header row"` checkbox (checked by default).
3. Author adjusts values and clicks `Insert`.
4. A new table appears at the cursor position with the specified dimensions. The first row is marked as a header row if the checkbox was checked.

### Suggested Implementation

- Use `INSERT_TABLE_COMMAND` from `@lexical/table`, which is already in our dependency tree.
- The serializer should output CALS `<table>` format (with `<tgroup>`, `<colspec>`, `<thead>`, `<tbody>`) as the default for new tables. CALS supports column spans, row spans, and column width specifications — it's the standard format Heretto uses and what our parser/serializer already handles.
- Toolbar button: use the Lucide `Table` icon, with `<Tooltip content="Insert table">` and `aria-label="Insert a new table"`.
- The popover should match the existing toolbar dropdown styling.

### Value Proposition (Maya Chen, UX Advisor)

Right now, the only way to create a table in DITA Architect is to type the XML manually in the source pane — `<table>`, `<tgroup cols="3">`, `<colspec>` for each column, `<thead>`, `<row>`, `<entry>` for each header cell, `<tbody>`, more `<row>` and `<entry>` elements. That's a lot of markup for "I want a 3×3 table." A toolbar button with a rows-and-columns dialog reduces that to two clicks and two numbers.

Have you considered defaulting to `"Include header row"` checked? In my experience reviewing DITA content, virtually every table has a header row. Starting with one saves authors from remembering to add it, and producing tables without `<thead>` is a common DITA quality issue that reviewers flag. A sensible default prevents a common mistake.

For the toolbar placement, I'd suggest grouping it with the list buttons (ordered list, unordered list) since tables are structural elements in the same category. The tooltip `"Insert table"` is concise and matches the pattern of our other toolbar tooltips.

---

## FR-026: Table context menu accessibility (ARIA roles and keyboard navigation)

**Requested:** 2026-03-16
**Source:** Maya Chen UX review of FR-024 implementation
**Status:** Proposed
**Priority:** Medium
**Impact:** Medium

### Description

The table context menu shipped in FR-024 lacks proper accessibility attributes and keyboard navigation. Add ARIA roles, focus management, and keyboard interaction to bring the context menu up to accessibility standards.

### Required Changes

1. Add `role="menu"` to the context menu container and `role="menuitem"` to each menu item.
2. Add `aria-label="Table actions"` to the menu container.
3. Implement arrow key navigation (Up/Down) between menu items.
4. Move focus to the first menu item when the menu opens.
5. Add screen reader announcements when table operations complete (e.g., "Row inserted below").

### Value Proposition (Maya Chen, UX Advisor)

The context menu works correctly for mouse users but is invisible to screen readers and inaccessible via keyboard beyond ESC to dismiss. Adding `role="menu"` and `role="menuitem"` makes the menu discoverable by assistive technology. Arrow key navigation is the expected interaction pattern for menus — without it, keyboard users can see the menu but can't operate it. Focus management on open ensures the menu is immediately actionable without requiring a Tab keypress to reach it. Screen reader announcements confirm that the action completed, which is especially important since table structure changes may not be visually obvious to users relying on assistive technology.

---

## FR-027: User feedback for prevented table operations

**Requested:** 2026-03-16
**Source:** Maya Chen UX review of FR-024 implementation
**Status:** Proposed
**Priority:** Medium
**Impact:** Medium

### Description

When a user attempts to delete the last remaining row or column in a table, the operation silently fails. Add toast notifications explaining why the action was prevented, and add explanatory tooltips to the delete menu items.

### Required Changes

1. When last-row deletion is prevented, show a toast: `"Cannot delete the last row — tables must have at least one row"`
2. When last-column deletion is prevented, show a toast: `"Cannot delete the last column — tables must have at least one column"`
3. Add tooltips on hover for delete menu items:
   - Delete row: `"Remove this row (at least one row must remain)"`
   - Delete column: `"Remove this column (at least one column must remain)"`

### Value Proposition (Maya Chen, UX Advisor)

Silent failure when trying to delete the last row or column violates the principle of reducing cognitive load — users shouldn't have to guess why an action didn't work. The author clicks "Delete row," nothing happens, and they're left wondering if the click didn't register, if there's a bug, or if they're doing something wrong. A toast notification immediately closes the feedback loop: the action was received, understood, and intentionally prevented, with a clear explanation of why. The tooltips provide proactive guidance so users understand the constraint before they encounter it.
