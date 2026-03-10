import React from 'react';
import { BookOpen } from 'lucide-react';

interface ReleaseNotesModalProps {
  onClose: () => void;
}

export const ReleaseNotesModal = ({ onClose }: ReleaseNotesModalProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <div
      role="dialog"
      aria-modal="true"
      className="rounded-xl p-6 w-[520px] max-h-[80vh] flex flex-col shadow-2xl"
      style={{
        backgroundColor: 'var(--app-surface)',
        border: '1px solid var(--app-border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dita-500 to-dita-600 flex items-center justify-center shadow-lg shadow-dita-500/20">
          <BookOpen className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
            DITA <span className="text-dita-500">Architect</span> v0.5
          </h3>
          <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>Release Notes</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm" style={{ color: 'var(--app-text-secondary)' }}>
        <p style={{ color: 'var(--app-text-primary)' }}>
          v0.5 is a stability and usability release focused on making the editing experience feel
          reliable and polished. Here&rsquo;s what changed.
        </p>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
            Sync &amp; Data Integrity
          </h4>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Fixed XML round-trip fidelity &mdash; edits in the visual editor no longer silently drop attributes, processing instructions, or comments</li>
            <li>Resolved the <code className="text-[11px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--app-surface-raised)' }}>savedXmlRef</code> mutation bug that caused false &ldquo;unsaved changes&rdquo; warnings</li>
            <li>Heretto CMS sync now preserves remote formatting on save instead of re-serializing from scratch</li>
            <li>Added integrity verification on import &mdash; topics are fetched twice and compared before opening</li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
            Edit Mode &amp; Tracked Changes
          </h4>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>New <strong>Edit Mode</strong> &mdash; click the pencil icon to isolate changes before committing them to the document</li>
            <li>Word-level tracked insertions highlighted via the CSS Custom Highlight API</li>
            <li>Tracked deletions rendered inline with strikethrough styling</li>
            <li>Accept merges changes into the XML source; Reject restores the pre-edit snapshot</li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
            Editor Polish
          </h4>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>Full keyboard navigation across all dropdown menus &mdash; Arrow keys, Escape, and focus management</li>
            <li>All modals now trap focus, respond to Escape, and carry proper <code className="text-[11px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--app-surface-raised)' }}>aria-modal</code> attributes</li>
            <li>Multi-tab support &mdash; open several topics side by side, each with independent undo history and sync state</li>
            <li>Status bar shows word count, character count, readability score, encoding, and DITA version</li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
            Heretto CMS Integration
          </h4>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>File browser with breadcrumb navigation, folder-scoped search, and progress indicators</li>
            <li>Save new topics to any Heretto folder or overwrite existing files</li>
            <li>Background polling detects remote changes and surfaces conflict indicators</li>
            <li>Credentials stored locally in <code className="text-[11px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--app-surface-raised)' }}>~/heretto.json</code> &mdash; never sent to the browser</li>
          </ul>
        </section>

        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--app-text-muted)' }}>
            Under the Hood
          </h4>
          <ul className="space-y-1 text-xs list-disc list-inside">
            <li>239 tests covering XML parsing, sync round-trips, tab management, and Heretto utilities</li>
            <li>Modals decomposed into standalone components &mdash; main file reduced by 38%</li>
            <li>7-agent development pipeline with checkpoint-based resume for long-running tasks</li>
            <li>Five application themes: Dark, Light, Claude, Nord, and Solarized</li>
          </ul>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--app-border-subtle)' }}>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);
