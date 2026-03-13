import React from 'react';
import { Eye, Upload, X } from 'lucide-react';

const HerettoLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" opacity="0.15" />
    <text x="12" y="17.5" textAnchor="middle" fill="currentColor" fontWeight="800" fontSize="16" fontFamily="Inter, sans-serif">H</text>
  </svg>
);

interface HerettoReplaceBarProps {
  targetName: string;
  onPreviewDiff: () => void;
  onReplace: () => void;
  onDismiss: () => void;
}

export const HerettoReplaceBar = ({
  targetName,
  onPreviewDiff,
  onReplace,
  onDismiss,
}: HerettoReplaceBarProps) => {
  return (
    <div
      className="absolute top-10 left-0 right-0 h-9 flex items-center justify-between px-4 z-10"
      style={{
        backgroundColor: 'color-mix(in srgb, #f59e0b 8%, var(--app-surface))',
        borderBottom: '1px solid color-mix(in srgb, #f59e0b 25%, var(--app-border))',
      }}
    >
      {/* Left: logo + replace target info */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <HerettoLogo className="w-3.5 h-3.5 shrink-0" style={{ color: '#f59e0b' }} />
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ color: 'var(--app-text-muted)' }}>Replace target:</span>
          <span
            className="truncate font-medium"
            style={{ color: 'var(--app-text-primary)' }}
            title={targetName}
          >
            {targetName}
          </span>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onPreviewDiff}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'var(--app-surface-raised)',
            border: '1px solid var(--app-border-subtle)',
            color: 'var(--app-text-secondary)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--app-surface-hover)';
            e.currentTarget.style.color = 'var(--app-text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)';
            e.currentTarget.style.color = 'var(--app-text-secondary)';
          }}
          title="Preview the diff between current content and your editor"
          aria-label="Preview Diff"
        >
          <Eye className="w-3 h-3" />
          Preview Diff
        </button>

        <button
          onClick={onReplace}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
          style={{
            backgroundColor: '#f59e0b',
            color: '#ffffff',
            border: '1px solid #f59e0b',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#d97706';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f59e0b';
          }}
          title="Replace the existing file in Heretto with your editor content"
          aria-label="Replace in Heretto"
        >
          <Upload className="w-3 h-3" />
          Replace in Heretto
        </button>

        <button
          onClick={onDismiss}
          className="p-1 rounded transition-colors hover-text"
          style={{ color: 'var(--app-text-muted)' }}
          title="Dismiss replace target"
          aria-label="Dismiss replace target"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};