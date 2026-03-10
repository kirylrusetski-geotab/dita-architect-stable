import React from 'react';
import { CheckCircle } from 'lucide-react';

interface TopicTypeModalProps {
  title: string;
  description: string;
  onSelect: (type: 'task' | 'concept' | 'reference') => void;
  onClose: () => void;
  disabledType?: string;
}

export const TopicTypeModal = ({ title, description, onSelect, onClose, disabledType }: TopicTypeModalProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
    <div
      role="dialog"
      aria-modal="true"
      className="rounded-xl p-6 w-96 shadow-2xl"
      style={{
        backgroundColor: 'var(--app-surface)',
        border: '1px solid var(--app-border-subtle)',
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--app-text-primary)' }}>{title}</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--app-text-muted)' }}>{description}</p>
      <div className="space-y-2">
        {(['task', 'concept', 'reference'] as const).map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={disabledType === type}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all"
            style={{
              backgroundColor: 'var(--app-surface-raised)',
              border: '1px solid var(--app-border-subtle)',
              color: disabledType === type ? 'var(--app-text-muted)' : 'var(--app-text-secondary)',
              cursor: disabledType === type ? 'not-allowed' : 'pointer',
              opacity: disabledType === type ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (disabledType !== type) {
                e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)';
                e.currentTarget.style.color = 'var(--app-text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (disabledType !== type) {
                e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)';
                e.currentTarget.style.color = 'var(--app-text-secondary)';
              }
            }}
          >
            <span className="capitalize font-medium">{type}</span>
            {disabledType === type && <CheckCircle className="w-4 h-4" />}
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-6 w-full py-2 text-sm transition-colors hover-text"
        style={{ color: 'var(--app-text-muted)' }}
      >
        Cancel
      </button>
    </div>
  </div>
);
