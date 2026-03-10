# DITA Architect

A split-pane DITA XML authoring tool with a visual WYSIWYG editor (Lexical) on the left and an XML source editor (Monaco) on the right. Bidirectional sync keeps both panes in sync as you edit.

## Features

- **Visual Editor** -- Rich text editing with heading, paragraph, list, quote, and link support mapped to DITA elements
- **XML Source Editor** -- Full Monaco editor with syntax highlighting, auto-close tags, XML formatting (Shift+Alt+F), and context-aware DITA element completion
- **Bidirectional Sync** -- Edits in either pane propagate to the other; press Ctrl+Enter to force a sync
- **DITA Authoring Flow** -- Pressing Enter after the title automatically creates a short description, then regular paragraphs
- **XML Validation** -- Structural well-formedness checking with clickable error details that jump to the problematic line
- **Heretto CMS Integration** -- Browse, open, edit, and save DITA files directly from Heretto CMS
- **5 App Themes** -- Dark (default), Light, Claude, Nord, Solarized -- applied to the entire UI
- **7 Syntax Themes** -- Material, GitHub, Monokai, Dracula, One Dark, Catppuccin, Daylight -- independent of the app theme
- **Topic Management** -- Create new Task, Concept, or Reference topics; convert between types; save/open files
- **Import Verification** -- Round-trip integrity check on file import with unsupported element detection

## Supported DITA Elements

### Block elements

`<title>`, `<shortdesc>`, `<prereq>`, `<context>`, `<result>`, `<postreq>`, `<p>`, `<note>`, `<steps>` / `<ol>` / `<ul>`, `<step>` / `<li>`, `<cmd>`, `<section>`, `<table>`, `<simpletable>`, `<codeblock>`, `<fig>`, `<image>` (block-level)

### Inline elements

| Element | Lexical rendering |
|---|---|
| `<b>`, `<strong>` | **Bold** text |
| `<i>`, `<em>` | *Italic* text |
| `<codeph>` | `Code` formatted text |
| `<uicontrol>` | **Bold** text (preserves tag on round-trip) |
| `<wintitle>` | *Italic* text (preserves tag on round-trip) |
| `<xref>` | Clickable link |
| `<ph>` with conkeyref/keyref/conref | Inline reference chip |
| `<term>` with keyref | Inline reference chip |
| `<image>` (inline, inside `<cmd>`) | Inline image path chip |

### Structural containers (preserved but not directly rendered)

`<task>`, `<concept>`, `<reference>`, `<topic>`, `<taskbody>`, `<conbody>`, `<refbody>`, `<body>`, `<tgroup>`, `<thead>`, `<tbody>`, `<row>`, `<entry>`, `<sthead>`, `<strow>`, `<stentry>`, `<option>`, `<alt>`

Unrecognized elements are rendered as read-only opaque blocks in the visual editor and are fully preserved in the XML source.

## XML Round-Trip Preservation

The serializer uses a DOM-patching strategy to preserve elements it doesn't directly edit:

- **Inline element preservation** -- When editing text inside elements like `<cmd>`, the serializer diffs old and new text, maps the change to a specific DOM segment, and updates only that segment. Inline wrappers like `<uicontrol>`, `<wintitle>`, and their attributes are preserved.
- **Processing instruction handling** -- Heretto review markers (`<?ezd-review-start?>` / `<?ezd-review-end?>`) are filtered from Lexical rendering but preserved in the XML output.
- **Formatting whitespace normalization** -- XML beautification (indentation, newlines) does not affect Lexical rendering. The parser normalizes formatting whitespace so the visual editor shows clean content regardless of XML formatting.

## Getting Started

### 1. Install Node.js (one-time setup)

You need Node.js to run the app. In Claude Code, ask:

> Check if I have Node.js installed, and if not, install it for me

If Claude reports a version of v18 or higher, you're good to go. If not, Claude will walk you through installing it.

### 2. Download the project

In Claude Code, ask:

> Clone the technical-content-solutions repo from git.geotab.com

### 3. Install dependencies and start the app

In Claude Code, ask:

> Install dependencies and start the dev server for the dita-architect project

Claude will run `npm install` to download the libraries the app needs, then start the local server. Once it's running, open the URL Claude provides (usually http://localhost:5173) in your browser.

### 4. Updating to the latest version

When changes are pushed to the repo, ask Claude:

> Pull the latest changes for technical-content-solutions and restart the dita-architect dev server

## Project Structure

```
components/
  Toolbar.tsx            -- Visual editor toolbar with theme switcher
  BottomToolbar.tsx      -- Status bar (word/character count, readability)
  MonacoDitaEditor.tsx   -- Monaco wrapper with validation, completion, formatting
  SyncManager.tsx        -- Bidirectional Lexical <-> XML sync with focus awareness
  ShortdescPlugin.tsx    -- H1 -> shortdesc -> paragraph authoring flow
  EmptyToH1Plugin.tsx    -- Auto-converts first empty paragraph to H1
  Tooltip.tsx            -- Reusable tooltip component
  DitaOpaqueNode.tsx     -- Read-only block for unrecognized DITA elements
  DitaCodeBlockNode.tsx  -- Editable code block node (<codeblock>)
  DitaImageNode.tsx      -- Block-level image/figure display (<fig>, <image>)
  DitaPhRefNode.tsx      -- Inline reference chip (<ph>, <term> keyrefs, inline <image>)
sync/
  parseXmlToLexical.ts   -- XML -> Lexical tree parser
  serializeLexicalToXml.ts -- Lexical tree -> DITA XML serializer (DOM-patching)
  nodeOriginMap.ts       -- Maps Lexical node keys to DITA element origins
dita-architect.tsx       -- Main application component with Heretto integration
textAnalysis.ts          -- Word count, character count, readability scoring
index.css                -- Theme definitions and editor styles
```

## Tech Stack

- [React 19](https://react.dev)
- [Lexical](https://lexical.dev) -- WYSIWYG rich text editor
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) -- XML source editor
- [Vite](https://vite.dev) -- Build tool and dev server
- [Tailwind CSS 4](https://tailwindcss.com) -- Utility-first styling
- [Lucide](https://lucide.dev) -- Icons
