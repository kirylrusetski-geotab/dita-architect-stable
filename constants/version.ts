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
