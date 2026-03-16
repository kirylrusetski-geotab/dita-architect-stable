# DITA Architect

A lightweight DITA editor that runs in your browser. Write in a visual editor on the left, see the XML source on the right -- changes sync between both sides as you work.

No installation beyond the initial setup. No heavy CMS client. Open a topic, edit, save to Heretto.

## What You Can Do

**Write visually.** The left pane is a rich text editor. Bold, italic, lists, tables, notes, code blocks -- they all render the way your readers will see them. You don't need to think about XML tags while you're writing.

**See the XML when you need it.** The right pane shows the raw DITA source with syntax highlighting, auto-completion, and one-click formatting. Edits in either pane sync to the other automatically, or press Ctrl+Enter to sync manually.

**Work with tables without touching XML.** Right-click any table cell to insert or delete rows and columns. Works for both CALS tables and simpletables.

**Open topics from Heretto.** Browse your Heretto CMS folders, search for topics, open them in the editor, and save changes back. The editor checks for conflicts if someone else edits the same topic while you're working.

**Replace topics in Heretto.** Draft a new version of a topic, preview a side-by-side diff against the live version, and replace it when you're ready.

**Track your changes.** Click the pencil icon to enter Edit Mode. Your insertions are highlighted and deletions are shown with strikethrough. Accept to merge your changes, or reject to restore the original.

**Work with multiple topics.** Open several topics in tabs. Each tab has its own undo history and sync state.

**See where you are in the structure.** Hover over a paragraph in the visual editor to see which DITA element it belongs to -- `CONTEXT`, `RESULT`, `PREREQUISITE`, `POSTREQUISITE` -- with color-coded left-edge bars so you can tell where one section ends and another begins.

**Spot unresolved references.** Conkeyrefs, keyrefs, and conrefs that can't be resolved show up as labeled chips (e.g., `[conkeyref: glossary/term]`) instead of blank space.

**Choose your theme.** 5 app themes (Dark, Light, Claude, Nord, Solarized) and 7 syntax themes for the XML pane.

## Setup

You'll need two things installed on your machine: **Node.js** and **Git**. If you're not sure whether you have them, ask your Claude Code assistant:

> Check if I have Node.js and Git installed, and help me install anything that's missing

### First-time setup

Open your terminal (or ask Claude Code to run this for you) and paste these four lines:

```
git clone https://github.com/kirylrusetski-geotab/dita-architect-stable.git
cd dita-architect-stable
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. That's it -- the editor is running.

### Starting the editor after the first time

Open your terminal, go to the project folder, and run:

```
cd dita-architect-stable
npm run dev
```

Or ask Claude Code:

> Start the DITA Architect dev server

### Updating to the latest version

When the team ships a new version, update by running:

```
cd dita-architect-stable
git pull
npm install
npm run dev
```

Or ask Claude Code:

> Pull the latest changes for DITA Architect and restart the dev server

### Connecting to Heretto (optional)

You'll need your Heretto API token. Generate one at [Heretto Token Management](https://geotab.heretto.com/tools/token-management/tokens.xql) (log in to Heretto first).

You can connect to Heretto CMS in two ways:

1. **From the app:** Click the Heretto icon in the toolbar and enter your email and API token in the connection modal.

2. **From a file:** Create a file called `heretto.json` in your home folder with your credentials:

```json
{
  "email": "your.name@geotab.com",
  "token": "your-heretto-api-token"
}
```

Without a Heretto connection, the editor still works -- you can create new topics from templates (task, concept, reference), open local `.dita` files by dragging them into the browser, and save files locally.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+Enter | Sync XML to visual editor |
| Shift+Alt+F | Format (beautify) XML |
| Ctrl+S | Save to Heretto (when connected) |
| Escape | Close modal or dismiss menu |

## Supported DITA Elements

The visual editor renders these elements as formatted content:

- **Headings:** `<title>`, `<shortdesc>`
- **Body:** `<p>`, `<note>`, `<section>`, `<prereq>`, `<context>`, `<result>`, `<postreq>`
- **Lists:** `<ol>`, `<ul>`, `<li>`, `<steps>`, `<step>`, `<cmd>`
- **Tables:** `<table>` (CALS), `<simpletable>`
- **Media:** `<fig>`, `<image>`, `<codeblock>`
- **Inline:** `<b>`, `<i>`, `<codeph>`, `<uicontrol>`, `<wintitle>`, `<xref>`, `<ph>`, `<term>`

Elements the editor doesn't recognize are shown as labeled read-only blocks -- they won't be lost or changed when you save.

## Questions or Issues

Reach out to Kiryl Rusetski on Google Chat or file an issue in this repository.
