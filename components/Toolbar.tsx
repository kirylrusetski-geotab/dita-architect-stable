import React, { useState, useRef, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';
import { FileText, AlertTriangle, Heading1, Heading2, ListOrdered, List, Undo, Redo, Trash2, Link, ChevronDown, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip } from './Tooltip';

export const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'claude', label: 'Claude' },
  { value: 'nord', label: 'Nord' },
  { value: 'solarized', label: 'Solarized' },
] as const;

export type ThemeName = typeof THEME_OPTIONS[number]['value'];

interface ToolbarProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  editMode?: boolean;
  onEnterEditMode?: () => void;
  onAcceptEdits?: () => void;
  onRejectEdits?: () => void;
}

export const Toolbar = ({ currentTheme, onThemeChange, editMode = false, onEnterEditMode, onAcceptEdits, onRejectEdits }: ToolbarProps) => {
  const [editor] = useLexicalComposerContext();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatHeading = (headingSize: 'h1' | 'h2') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  };

  const currentLabel = THEME_OPTIONS.find(t => t.value === currentTheme)?.label ?? 'Visual';

  return (
    <div
      className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 gap-2 z-10"
      style={{
        backgroundColor: 'var(--editor-toolbar-bg)',
        borderBottom: '1px solid var(--editor-toolbar-border)',
      }}
    >
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsThemeOpen(prev => !prev)}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mr-2 rounded px-2 py-1 transition-colors"
          style={{
            color: 'var(--editor-toolbar-text)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <FileText className="w-4 h-4" />
          {currentLabel}
          <ChevronDown className={`w-3 h-3 transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isThemeOpen && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-xl border py-1 min-w-[140px]"
            style={{
              backgroundColor: 'var(--editor-toolbar-bg)',
              borderColor: 'var(--editor-toolbar-border)',
              zIndex: 50,
            }}
          >
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  onThemeChange(opt.value);
                  setIsThemeOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between"
                style={{
                  color: opt.value === currentTheme
                    ? 'var(--editor-accent, #0ea5e9)'
                    : 'var(--editor-toolbar-text-strong)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {opt.label}
                {opt.value === currentTheme && <span>&#10003;</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Undo">
        <button aria-label="Undo" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Undo className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Redo">
        <button aria-label="Redo" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Redo className="w-4 h-4" />
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Heading 1">
        <button aria-label="Heading 1" onClick={() => formatHeading('h1')} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Heading1 className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Heading 2">
        <button aria-label="Heading 2" onClick={() => formatHeading('h2')} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Heading2 className="w-4 h-4" />
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Bold">
        <button aria-label="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <span className="font-bold font-serif">B</span>
        </button>
      </Tooltip>
      <Tooltip content="Italic">
        <button aria-label="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <span className="italic font-serif">I</span>
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Numbered List">
        <button aria-label="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <ListOrdered className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip content="Bulleted List">
        <button aria-label="Bulleted list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <List className="w-4 h-4" />
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Warning Note">
        <button aria-label="Warning note" onClick={() => formatQuote()} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <AlertTriangle className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <Tooltip content="Insert Link">
        <button aria-label="Insert link" onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            const trimmed = url.trim().toLowerCase();
            if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
              toast.error('Invalid URL scheme');
              return;
            }
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
          }
        }} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Link className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Enter Edit Mode">
        <button aria-label="Enter edit mode" onClick={onEnterEditMode} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <div className="w-px h-4 mx-2" style={{ backgroundColor: 'var(--editor-toolbar-divider)' }} />
      <Tooltip content="Clear Contents">
        <button aria-label="Clear contents" onClick={() => { if (window.confirm('Clear all editor contents? This cannot be undone.')) { editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined); toast('Cleared editor contents'); } }} className="p-1 rounded transition-colors" style={{ color: 'var(--editor-toolbar-text-strong)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--editor-toolbar-hover)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Trash2 className="w-4 h-4" />
        </button>
      </Tooltip>

      {/* Edit Mode accept/reject controls */}
      {editMode && (
        <div className="ml-auto flex items-center gap-1">
          <Tooltip content="Accept Edits">
            <button
              aria-label="Accept edits"
              onClick={onAcceptEdits}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{ color: '#22c55e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Check className="w-3.5 h-3.5" />
              Accept
            </button>
          </Tooltip>
          <Tooltip content="Reject Edits">
            <button
              aria-label="Reject edits"
              onClick={onRejectEdits}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{ color: '#ef4444' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
