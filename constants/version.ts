declare const __APP_VERSION__: string;

/** Application version injected from package.json at build time. */
export const APP_VERSION: string = __APP_VERSION__;

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  sections: {
    heading: string;
    items: string[];
  }[];
}

/**
 * Release notes for each version, newest first.
 * When shipping a new version:
 *   1. Update `version` in package.json
 *   2. Add a new entry at the top of this array
 */
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '0.7.1',
    date: '2026-03-13',
    title: 'Heretto integration \u2014 draft topics, preview diffs, and replace live documents directly from the editor.',
    sections: [
      {
        heading: 'New Features',
        items: [
          'Replace in Heretto \u2014 draft a topic, preview the diff against the live version, and replace it directly from the editor. The three-step wizard shows you exactly what will change before you commit. After replacing, the tab transitions to a live Heretto-backed document with full save, refresh, and conflict detection.',
          'External content loading API \u2014 external tools can now load DITA content into the editor via a stable HTTP endpoint. Content is validated and beautified automatically, replacing the previous browser automation approach.',
          'Heretto empty states \u2014 empty folders now show "No topics in this folder" with a "Create new topic" button instead of blank space.',
          'Format XML \u2014 new toolbar button (or Shift+Alt+F) to beautify your XML source. Errors now tell you "Failed to format XML: Check for syntax errors" instead of a generic message.',
        ],
      },
      {
        heading: 'Accessibility',
        items: [
          'All Heretto modals now have proper label associations, aria-live regions on search progress, aria-labels on icon buttons, focus management on open, and aria-labelledby on headings.',
          'Format XML button and Replace bar buttons have screen reader labels.',
        ],
      },
      {
        heading: 'Polish',
        items: [
          'Import toast now says "Imported {fileName}" instead of developer-centric "Loaded from external tool".',
          'Theme descriptions updated to help you choose: "High contrast for low-light work", "Comfortable for extended daytime use", and more.',
        ],
      },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-03-13',
    title: 'Visual polish \u2014 body element indicators, light theme warmth, and tooltip fixes.',
    sections: [
      {
        heading: 'Bug Fixes',
        items: [
          'Theme dropdown tooltips no longer cover the next option \u2014 they now appear to the right.',
        ],
      },
      {
        heading: 'New Features',
        items: [
          'Body element indicators \u2014 prereq, context, result, and postreq blocks now show left-edge color bars and hover labels so you can tell which DITA element you\'re editing without checking the XML source.',
          'Light theme warmth \u2014 the Light theme shifted from cool Slate to warmer Stone tones. Same clarity, more comfortable for long sessions.',
        ],
      },
      {
        heading: 'Terminology',
        items: [
          '"Post-Requisite" label corrected to "Postrequisites" to match DITA standard terminology.',
        ],
      },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-03-12',
    title: 'Rendering fixes and editor improvements — codeblocks, tables, and references now display faithfully in the visual editor.',
    sections: [
      {
        heading: 'Bug Fixes',
        items: [
          'Codeblock content now renders in the visual editor \u2014 <codeblock> elements nested inside <p>, <context>, <prereq>, <result>, or <postreq> no longer silently disappear',
          'H2 section headings visible on all themes \u2014 text classes now use CSS variables instead of hardcoded colors',
          'Lists inside table cells render correctly \u2014 mixed inline-and-block content in table entries is parsed in reading order',
          'Empty table rows filtered out \u2014 rows with no entries no longer create blank visual gaps',
          'Theme dropdown no longer hidden behind the Heretto context toolbar',
          'Concept-to-task conversion no longer fails to save to Heretto \u2014 converted task topics now include the required <steps> element per the DITA task DTD',
          'Heretto save errors now surface specific DTD validation details instead of a generic "Failed to save" message',
          'Visual editor syncs immediately after topic type conversion without requiring focus',
        ],
      },
      {
        heading: 'New Features',
        items: [
          'Conkeyref / keyref / conref placeholder chips \u2014 unresolved references display as visible chips (e.g. [conkeyref: glossary/term]) instead of blank space',
          'Table column auto-sizing \u2014 columns proportionally distribute width based on content length, with a 10% minimum to prevent word-breaking',
          'Geotab theme refinements \u2014 improved contrast and visual hierarchy with three distinct tiers for text, headings, and muted elements',
        ],
      },
      {
        heading: 'Under the Hood',
        items: [
          'Pipeline health reporting \u2014 real-time dashboard, error categorization, and fallback plan generation when agents fail',
          'Agent turn limits increased to 50\u2013100 to prevent mid-task timeouts on complex work',
          '458 tests across 21 test suites, with new coverage for topic type conversions, conkeyref placeholders, mixed-content table cells, and CSS variable consistency',
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-03-10',
    title: 'Stability and usability release focused on making the editing experience feel reliable and polished.',
    sections: [
      {
        heading: 'Sync & Data Integrity',
        items: [
          'Fixed XML round-trip fidelity \u2014 edits in the visual editor no longer silently drop attributes, processing instructions, or comments',
          'Resolved the savedXmlRef mutation bug that caused false \u201cunsaved changes\u201d warnings',
          'Heretto CMS sync now preserves remote formatting on save instead of re-serializing from scratch',
          'Added integrity verification on import \u2014 topics are fetched twice and compared before opening',
        ],
      },
      {
        heading: 'Edit Mode & Tracked Changes',
        items: [
          'New Edit Mode \u2014 click the pencil icon to isolate changes before committing them to the document',
          'Word-level tracked insertions highlighted via the CSS Custom Highlight API',
          'Tracked deletions rendered inline with strikethrough styling',
          'Accept merges changes into the XML source; Reject restores the pre-edit snapshot',
        ],
      },
      {
        heading: 'Editor Polish',
        items: [
          'Full keyboard navigation across all dropdown menus \u2014 Arrow keys, Escape, and focus management',
          'All modals now trap focus, respond to Escape, and carry proper aria-modal attributes',
          'Multi-tab support \u2014 open several topics side by side, each with independent undo history and sync state',
          'Status bar shows word count, character count, readability score, encoding, and DITA version',
        ],
      },
      {
        heading: 'Heretto CMS Integration',
        items: [
          'File browser with breadcrumb navigation, folder-scoped search, and progress indicators',
          'Save new topics to any Heretto folder or overwrite existing files',
          'Background polling detects remote changes and surfaces conflict indicators',
          'Credentials stored locally in ~/heretto.json \u2014 never sent to the browser',
        ],
      },
      {
        heading: 'Under the Hood',
        items: [
          '239 tests covering XML parsing, sync round-trips, tab management, and Heretto utilities',
          'Modals decomposed into standalone components \u2014 main file reduced by 38%',
          '7-agent development pipeline with checkpoint-based resume for long-running tasks',
          'Five application themes: Dark, Light, Claude, Nord, and Solarized',
        ],
      },
    ],
  },
];
