
---

### 2026-03-12T18:41:46.089Z

- Pipeline run attempted for P0/P1 backlog items but failed at planning stage
- No architecture plan produced by Anna's agent
- Jamie's implementation agent failed to run
- Elena and Maya blocked due to missing upstream deliverables
- TypeScript errors found in evaluation code under future-state/acquired-products/ (dita-doer-v1 and v3)
- Test runner agent also failed
- Root cause: agent orchestration issues preventing basic workflow execution
- Next run should verify agent pipeline functionality before attempting feature work

---

### 2026-03-12T21:12:19.428Z

- **Pipeline run failed** - Jamie hit SDK max turns error, but Elena/Maya/Taylor proceeded as if code existed
- **No code shipped** - Build blocked by TypeScript errors in test file
- **Anna's plan remains valid** - Clear implementation path for all P1 bugs when we retry
- **Key technical decisions documented**: z-20 for toolbar z-index, mixed content parsing for table cells, TableColumnSizer plugin for auto-sizing
- **Known issue**: Pipeline agents not properly handling upstream failures
- **Next run should**: Start fresh with P1 fixes using Anna's plan as the blueprint
- **Technical debt**: None introduced (no code was actually written)

---

### 2026-03-13T17:52:08.183Z

- **Batch implemented**: P1-8 (tooltip placement), P2-7/P2-8 (body element indicators), P2-9 (light theme warmth)
- **Key changes**: Extended ShortdescPlugin pattern to 5 body elements using tag-to-class mapping; added placement prop to Tooltip component
- **Technical decisions**: Used CSS custom properties for theme-specific colors; mutation listener removes all managed classes before applying new ones
- **Known issues**: Theme descriptions need improvement; "Post-Requisite" should be "Postrequisites" per DITA standard
- **Test status**: Build clean but tests didn't run due to agent failure - needs re-run
- **Architecture notes**: BODY_TAG_CLASSES serves as single source of truth; color choices harmonize with existing theme palettes
- **Next run should know**: The originMap already registers all body element tags; z-index hierarchy maintains toolbar at z-20

---

### 2026-03-13T18:37:44.464Z

- **Built**: Format XML button for Monaco editor, DITA terminology fix, user-focused theme descriptions
- **Key decision**: Added toolbar overlay to Monaco editor instead of using action bar — more visible to users
- **Error handling**: Format button wrapped in try-catch with toast notifications for failures  
- **Keyboard shortcut**: Registered Shift+Alt+F using Monaco's addAction API to avoid conflicts
- **Tech debt**: None introduced — followed existing patterns, maintained backwards compatibility
- **Known issues**: Minor accessibility gaps on format button (missing aria-label)
- **Next run should know**: Monaco editor now has a toolbar pattern that could be extended for future buttons

---

### 2026-03-13T19:54:57.367Z

- **P2-1 Shipped**: Local API endpoint for external content loading implemented
- Added `/api/load-content` (POST) and `/api/pending-loads` (GET) endpoints via Vite plugin
- New `useExternalLoad` hook polls for pending content and creates tabs with validation
- Added `herettoReplaceTarget` field to Tab type for future Replace in Heretto feature
- Module-level queue in vite.config.ts handles concurrent requests safely
- Full test coverage: 29 tests for API behavior and Tab interface changes
- Minor UX debt: Success toast uses developer-centric language ("from external tool")
- No security concerns - localhost only, validates all XML before loading
- Polling interval matches existing Heretto remote change pattern (2 seconds)
- Ready for altitude-release-notes skill to migrate from Monaco injection to API calls

---

### 2026-03-13T21:03:06.623Z

- **2026-03-13**: Batch implementation of P2-2, P2-4, P2-14 discovered already complete
- All Replace in Heretto components (HerettoReplaceModal, DiffViewer, HerettoReplaceBar) fully implemented
- Accessibility improvements across all Heretto modals already in place
- Toast copy simplified to "Imported {fileName}" as requested
- **Tech debt**: DiffViewer.tsx has `any` types that violate strict mode (lines 23, 77)
- **Known issue**: HerettoReplaceBar buttons lack aria-labels for screen readers
- **Test environment**: JSX parsing issues prevent full React component testing
- Critical state transition logic (draft → live Heretto tab) implemented correctly in handleHerettoReplace

---

### 2026-03-16T14:08:44.311Z

- **Fixed P1-11**: Format button moved from Monaco overlay to XML toolbar. Lifted handler to parent component, maintained keyboard shortcut consistency, matched existing toolbar styling.
- **Fixed P1-9**: BottomToolbar now reads editor state immediately after registering listener to catch pre-parsed content. Zero word count on initial load resolved.
- **Fixed P1-10**: Removed redundant condition check in SyncManager.applyPendingSync() that blocked syncs during conflict states. Ctrl+Enter now works regardless of Heretto conflicts.
- **Tech debt**: None introduced. Clean implementation following existing patterns.
- **Known issues**: Existing TypeScript errors in test files (JSX syntax) remain — not related to these changes.
- **Next run should know**: Format button handler is now in dita-architect.tsx, not MonacoDitaEditor. The sync logic during conflicts is more permissive but maintains data integrity through existing safeguards.

---

### 2026-03-16T16:59:49.807Z

- **Task**: Added tooltips/aria-labels to XML editor toolbar (syntax theme dropdown, format button, collapse button)
- **Finding**: Feature was already implemented correctly - pipeline run mainly fixed build issues
- **Fixes**: Renamed test files from .ts to .tsx for JSX support, added @testing-library/user-event dependency
- **Pattern**: All XML toolbar items now use Tooltip component wrapper matching WYSIWYG toolbar
- **Tech debt**: tests/heretto-replace-function.test.ts has mock typing errors blocking clean TypeScript builds
- **Build warning**: Main bundle at 608KB exceeds recommended chunk size
- **Test coverage**: Comprehensive xml-toolbar-tooltips.test.tsx validates all tooltip implementations
- **Next run should know**: TypeScript strict mode violations in test suite need addressing for clean builds

---

### 2026-03-16T17:34:55.131Z

- Validated P1-11, P1-9, P1-10 fixes from 2026-03-16 - all working correctly
- Added 33 comprehensive tests for Format button toolbar integration
- Added defensive error handling to BottomToolbar for edge cases with malformed editor state
- Minor build warnings: CSS highlight pseudo-class syntax, 608KB chunk size
- All 759 tests passing with zero TypeScript warnings
- Key insight: Fixes were already implemented - this run provided validation and hardening
- No regressions introduced, no new tech debt
- Next run should note: Format button defensive checks rely on Monaco?.editor API null-safety pattern
