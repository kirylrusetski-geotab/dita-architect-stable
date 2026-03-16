# DITA Architect

A browser-based DITA XML authoring tool with a split-pane editor: WYSIWYG visual editing on the left, XML source on the right, with bidirectional sync between them.

Built for technical writers who need to edit DITA content without a heavyweight desktop CMS client.

## Features

- **Split-pane editing** -- Lexical-powered visual editor and Monaco XML source editor, synced bidirectionally
- **Heretto CMS integration** -- Browse, search, open, edit, and save topics directly to Heretto CMS with conflict detection and background polling
- **Table context menu** -- Right-click any table cell to insert/delete rows and columns (CALS `<table>` and `<simpletable>`)
- **Edit mode with tracked changes** -- Isolate edits before committing; word-level insertions highlighted, deletions shown with strikethrough
- **DITA-aware auto-completion** -- Context-sensitive element suggestions in the XML editor based on DITA content models
- **Format XML** -- One-click beautify (or Shift+Alt+F) with `<codeblock>` and `xml:space="preserve"` protection
- **Replace in Heretto** -- Draft a topic, preview the diff against the live version, and replace it directly from the editor
- **Multi-tab editing** -- Open several topics with independent undo history and sync state
- **5 app themes** -- Dark, Light, Claude, Nord, Solarized
- **7 syntax themes** -- Material, GitHub, Monokai, Dracula, One Dark, Catppuccin, Daylight
- **Body element indicators** -- Hover labels and left-edge color bars for `prereq`, `context`, `result`, `postreq`
- **Conkeyref/keyref placeholder chips** -- Unresolved references display as visible chips instead of blank space
- **Readability metrics** -- Word count, character count, Flesch-Kincaid score in the status bar
- **Import verification** -- Round-trip integrity check on file import with unsupported element detection

## Supported DITA Elements

### Block elements

`<title>`, `<shortdesc>`, `<prereq>`, `<context>`, `<result>`, `<postreq>`, `<p>`, `<note>`, `<steps>` / `<ol>` / `<ul>`, `<step>` / `<li>`, `<cmd>`, `<section>`, `<table>`, `<simpletable>`, `<codeblock>`, `<fig>`, `<image>`

### Inline elements

| Element | Visual rendering |
|---|---|
| `<b>`, `<strong>` | **Bold** text |
| `<i>`, `<em>` | *Italic* text |
| `<codeph>` | `Code` formatted text |
| `<uicontrol>` | **Bold** (preserves tag on round-trip) |
| `<wintitle>` | *Italic* (preserves tag on round-trip) |
| `<xref>` | Clickable link |
| `<ph>` with conkeyref/keyref/conref | Inline reference chip |
| `<term>` with keyref | Inline reference chip |

Unrecognized elements are rendered as read-only opaque blocks in the visual editor and are fully preserved in the XML source.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
git clone https://github.com/kirylrusetski-geotab/dita-architect-stable.git
cd dita-architect-stable
npm install
npm run dev
```

The editor opens at [http://localhost:3000](http://localhost:3000).

### Updating to the latest version

```bash
git pull
npm install
npm run dev
```

### Heretto CMS connection (optional)

To connect to Heretto CMS, create `~/heretto.json`:

```json
{
  "email": "your.email@company.com",
  "token": "your-heretto-api-token"
}
```

You can also configure credentials from the Heretto connection modal inside the app.

Without Heretto credentials, the editor works fully offline -- open local files via drag-and-drop or create new topics from templates (task, concept, reference).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | [React 19](https://react.dev) |
| Visual Editor | [Lexical 0.16.0](https://lexical.dev) |
| XML Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| Build Tool | [Vite 6](https://vite.dev) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Tests | Vitest + Testing Library |
| Types | TypeScript 5.8 |

## Project Structure

```
dita-architect.tsx              Main application component
index.css                       Theme definitions and editor styles
textAnalysis.ts                 Word count, character count, readability scoring

components/
  Toolbar.tsx                   Visual editor toolbar with theme switcher
  BottomToolbar.tsx             Status bar (word/char count, readability)
  MonacoDitaEditor.tsx          Monaco wrapper with validation and completion
  SyncManager.tsx               Bidirectional Lexical <-> XML sync
  TableActionMenuPlugin.tsx     Right-click table context menu
  EditModePlugin.tsx            Edit mode toggle (read-only lock)
  TrackedChangesPlugin.tsx      Tracked insertions/deletions
  ShortdescPlugin.tsx           H1 -> shortdesc -> paragraph authoring flow
  DitaOpaqueNode.tsx            Read-only block for unrecognized elements
  DitaCodeBlockNode.tsx         Editable <codeblock> node
  DitaImageNode.tsx             Block-level <fig>/<image> display
  DitaPhRefNode.tsx             Inline reference chip (<ph>, <term> keyrefs)
  ReleaseNotesModal.tsx         What's New modal
  Tooltip.tsx                   Reusable hover tooltip

sync/
  parseXmlToLexical.ts          XML -> Lexical tree parser
  serializeLexicalToXml.ts      Lexical tree -> DITA XML serializer (DOM-patching)
  nodeOriginMap.ts              Maps Lexical node keys to DITA element origins

hooks/
  useTabManager.ts              Tab state: open/close/switch, type conversion
  useHerettoCms.ts              Heretto CMS API: browse, search, open, save
  useLocalFile.ts               Local file open/save, drag-and-drop
  useEditorUi.ts                UI state: themes, dropdowns, keyboard shortcuts

constants/
  version.ts                    App version and release notes
  dita.ts                       DITA templates and initial content
  heretto.ts                    Heretto root UUID and folder cache

lib/
  xml-utils.ts                  XML validation, formatting, comparison
  heretto-utils.ts              Heretto API response parsing
  dita.ts                       DITA element definitions

tests/                          773 tests across 35 test suites
```

## License

Internal use -- Geotab Inc.
