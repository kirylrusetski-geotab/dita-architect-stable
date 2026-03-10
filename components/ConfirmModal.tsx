import React from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({ message, onConfirm, onClose }: ConfirmModalProps) => (
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
      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--app-text-primary)' }}>Confirm</h3>
      <p className="text-sm mb-6" style={{ color: 'var(--app-text-secondary)' }}>{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors hover-btn"
          style={{
            backgroundColor: 'var(--app-surface-raised)',
            border: '1px solid var(--app-border-subtle)',
            color: 'var(--app-text-secondary)',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);
