import React, { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ParagraphNode, TextNode } from 'lexical';
import { MonacoDitaEditor } from './components/MonacoDitaEditor';
import { Toolbar } from './components/Toolbar';
import { BottomToolbar } from './components/BottomToolbar';
import { SyncManager } from './components/SyncManager';
import { EditModePlugin } from './components/EditModePlugin';
import { TrackedChangesPlugin } from './components/TrackedChangesPlugin';
import { EmptyToH1Plugin } from './components/EmptyToH1Plugin';
import { ShortdescPlugin } from './components/ShortdescPlugin';
import { DitaOpaqueNode } from './components/DitaOpaqueNode';
import { DitaCodeBlockNode } from './components/DitaCodeBlockNode';
import { DitaImageNode } from './components/DitaImageNode';
import { DitaPhRefNode } from './components/DitaPhRefNode';
import { TrackedDeletionNode } from './components/TrackedDeletionNode';
import { Code, CheckCircle, AlertTriangle, BookOpen, Save, FolderOpen, RefreshCw, FilePlus, ChevronDown, CloudUpload, Folder, FileText, Loader2, X, PanelRightClose, PanelRightOpen, Network, MapIcon, Search, XCircle } from 'lucide-react';
import { SYNTAX_THEME_OPTIONS } from './components/MonacoDitaEditor';
import type { XmlError } from './components/MonacoDitaEditor';
import type { HerettoItem, HerettoSearchResult } from './types/heretto';
import { HERETTO_ROOT_UUID } from './constants/heretto';
import { formatRelativeTime } from './lib/xml-utils';
import { useEditorUi } from './hooks/useEditorUi';
import { useTabManager } from './hooks/useTabManager';
import { useLocalFile } from './hooks/useLocalFile';
import { useHerettoCms } from './hooks/useHerettoCms';

// --- LEXICAL CONFIGURATION ---

const theme = {
  heading: {
    h1: 'dita-editor-h1',
    h2: 'text-2xl font-bold text-white mb-3',
  },
  paragraph: 'dita-editor-paragraph',
  quote: 'dita-editor-quote',
  list: {
    ol: 'dita-editor-list-ol',
    ul: 'dita-editor-list-ul',
    listitem: 'dita-editor-listitem',
  },
  text: {
    bold: 'font-bold text-dita-400',
    italic: 'italic text-slate-400',
    underline: 'underline decoration-dita-500',
    code: 'dita-editor-code',
    strikethrough: 'line-through text-red-400',
  },
  link: 'text-blue-400 hover:underline cursor-pointer',
  table: 'dita-editor-table',
  tableRow: 'dita-editor-table-row',
  tableCell: 'dita-editor-table-cell',
  tableCellHeader: 'dita-editor-table-cell-header',
};

const editorConfig = {
  namespace: 'DitaEditor',
  theme,
  onError(error: Error) {
    console.error(error);
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    ParagraphNode,
    TextNode,
    LinkNode,
    AutoLinkNode,
    TableNode,
    TableRowNode,
    TableCellNode,
    DitaOpaqueNode,
    DitaCodeBlockNode,
    DitaImageNode,
    DitaPhRefNode,
    TrackedDeletionNode,
  ],
};

const HerettoLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" opacity="0.15" />
    <text x="12" y="17.5" textAnchor="middle" fill="currentColor" fontWeight="800" fontSize="16" fontFamily="Inter, sans-serif">H</text>
  </svg>
);

// --- MAIN COMPONENT ---

export default function ProfessionalDitaEditor() {
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    updateTab,
    currentTopicType,
    handleCloseTab,
    handleNewTab,
    handleNewTopic,
    handleConvertTopic,
  } = useTabManager({
    setIsConvertModalOpen,
    setIsNewTopicModalOpen,
    setConfirmModal,
  });

  const {
    isHerettoStatusOpen,
    setIsHerettoStatusOpen,
    herettoCredentials,
    setHerettoCredentials,
    herettoStatusChecking,
    isHerettoBrowserOpen,
    setIsHerettoBrowserOpen,
    herettoBrowserMode,
    herettoConnected,
    herettoBrowsing,
    herettoBreadcrumbs,
    setHerettoBreadcrumbs,
    herettoItems,
    herettoSelected,
    setHerettoSelected,
    herettoSaving,
    isHerettoDropdownOpen,
    setIsHerettoDropdownOpen,
    herettoDropdownRef,
    herettoSaveFileName,
    setHerettoSaveFileName,
    herettoRefreshing,
    herettoSearchQuery,
    setHerettoSearchQuery,
    herettoSearchResults,
    herettoSearchStatus,
    setHerettoSearchStatus,
    herettoSearchAbortRef,
    importVerification,
    setImportVerification,
    openHerettoStatus,
    testHerettoConnection,
    saveHerettoCredentials,
    herettoNavigate,
    herettoSearch,
    openHerettoBrowser,
    handleHerettoOpen,
    handleImportContinue,
    handleHerettoSave,
    handleHerettoRefresh,
    handleHerettoDisconnect,
    handleHerettoSaveNew,
  } = useHerettoCms({
    activeTab,
    tabs,
    setTabs,
    setActiveTabId,
    setConfirmModal,
  });

  const {
    theme: appTheme,
    syntaxTheme,
    isSyntaxThemeOpen,
    setIsSyntaxThemeOpen,
    codeEditorCollapsed,
    setCodeEditorCollapsed,
    syntaxDropdownRef,
    showErrorPanel,
    setShowErrorPanel,
    errorPanelRef,
    isDitaMenuOpen,
    setIsDitaMenuOpen,
    ditaMenuRef,
    isFileOptionsOpen,
    setIsFileOptionsOpen,
    fileOptionsRef,
    handleThemeChange,
    handleSyntaxThemeChange,
  } = useEditorUi({
    activeTabId,
    tabs,
    setTabs,
    herettoDropdownRef,
    setIsHerettoDropdownOpen,
  });

  const {
    fileInputRef,
    isSaveModalOpen,
    setIsSaveModalOpen,
    saveFileName,
    setSaveFileName,
    isDragOver,
    openSaveModal,
    handleSaveConfirm,
    handleUploadClick,
    handleFileChange,
  } = useLocalFile({
    activeTab,
    tabs,
    setTabs,
    setActiveTabId,
  });

  const renderModal = (
    isOpen: boolean,
    onClose: () => void,
    title: string,
    description: string,
    onSelect: (type: 'task' | 'concept' | 'reference') => void,
    disabledType?: string,
  ) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div
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
            className="mt-6 w-full py-2 text-sm transition-colors"
            style={{ color: 'var(--app-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" data-theme={appTheme} style={{ backgroundColor: 'var(--app-bg)' }}>
      {/* Drop overlay */}
      {isDragOver && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div
            className="rounded-2xl px-10 py-8 flex flex-col items-center gap-3"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '2px dashed var(--editor-accent)',
            }}
          >
            <FolderOpen className="w-10 h-10" style={{ color: 'var(--editor-accent)' }} />
            <span className="text-lg font-semibold" style={{ color: 'var(--app-text-primary)' }}>
              Drop .dita or .xml file to open
            </span>
          </div>
        </div>
      )}

      {/* Heretto Status Modal */}
      {isHerettoStatusOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="rounded-xl p-6 w-[420px] shadow-2xl"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border-subtle)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <HerettoLogo className="w-5 h-5" style={{ color: '#14b8a6' }} />
              <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>Heretto Status</h3>
            </div>

            {/* Connection status */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className="flex-1 rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                style={{
                  backgroundColor: herettoConnected
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${herettoConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: herettoConnected ? '#10b981' : '#ef4444',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: herettoConnected ? '#10b981' : '#ef4444' }}
                />
                {herettoConnected ? 'Connected' : 'Not connected'}
              </div>
              <button
                onClick={testHerettoConnection}
                disabled={herettoStatusChecking}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
              >
                {herettoStatusChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Test
              </button>
            </div>

            {/* Email */}
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--app-text-secondary)' }}>
              Email
            </label>
            <input
              type="text"
              value={herettoCredentials.email}
              onChange={e => setHerettoCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none mb-4"
              style={{
                backgroundColor: 'var(--app-surface-raised)',
                border: '1px solid var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--editor-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border-subtle)')}
              placeholder="user@example.com"
            />

            {/* Token */}
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--app-text-secondary)' }}>
              API Token
            </label>
            <input
              type="password"
              value={herettoCredentials.token}
              onChange={e => setHerettoCredentials(prev => ({ ...prev, token: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none mb-1"
              style={{
                backgroundColor: 'var(--app-surface-raised)',
                border: '1px solid var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--editor-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border-subtle)')}
              placeholder="Your Heretto API token"
            />
            <p className="text-[10px] mb-5" style={{ color: 'var(--app-text-muted)' }}>
              Stored locally in ~/heretto.json. Never sent to the browser.
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsHerettoStatusOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
              >
                Close
              </button>
              <button
                onClick={saveHerettoCredentials}
                disabled={herettoStatusChecking}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {herettoStatusChecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="rounded-xl p-6 w-96 shadow-2xl"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border-subtle)',
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--app-text-primary)' }}>Confirm</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--app-text-secondary)' }}>{confirmModal.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Topic Modal */}
      {renderModal(
        isNewTopicModalOpen,
        () => setIsNewTopicModalOpen(false),
        'New Topic',
        'Select a DITA topic type to start with.',
        handleNewTopic,
      )}

      {/* Convert Topic Modal */}
      {renderModal(
        isConvertModalOpen,
        () => setIsConvertModalOpen(false),
        'Convert Topic Type',
        'Select the target DITA topic type. This will update the root element and body tag.',
        handleConvertTopic,
        currentTopicType,
      )}

      {/* Save Topic Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="rounded-xl p-6 w-96 shadow-2xl"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border-subtle)',
            }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--app-text-primary)' }}>Save Topic</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--app-text-muted)' }}>
              Choose a file name, then pick where to save it.
            </p>

            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--app-text-secondary)' }}>
              File name
            </label>
            <input
              type="text"
              value={saveFileName}
              onChange={e => setSaveFileName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveConfirm(); }}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none mb-1"
              style={{
                backgroundColor: 'var(--app-surface-raised)',
                border: '1px solid var(--app-border-subtle)',
                color: 'var(--app-text-primary)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--editor-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border-subtle)')}
            />
            <p className="text-[10px] mb-5" style={{ color: 'var(--app-text-muted)' }}>
              .dita extension will be added automatically if not provided.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heretto Browser Modal */}
      {isHerettoBrowserOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="rounded-xl p-6 w-[520px] max-h-[80vh] flex flex-col shadow-2xl"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--app-text-primary)' }}>
                <HerettoLogo className="w-5 h-5" style={{ color: '#14b8a6' }} />
                {herettoBrowserMode === 'open' ? 'Open from Heretto' : 'Save to Heretto'}
              </h3>
            </div>

            {/* Search input */}
            {herettoBrowserMode === 'open' && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
                <input
                  type="text"
                  value={herettoSearchQuery}
                  onChange={e => setHerettoSearchQuery(e.target.value)}
                  placeholder={
                    herettoBreadcrumbs.length > 1
                      ? `Search in ${herettoBreadcrumbs[herettoBreadcrumbs.length - 1].name}…`
                      : 'Search all files…'
                  }
                  className="w-full pl-9 pr-9 py-2 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: 'var(--app-surface-raised)',
                    border: '1px solid var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--editor-accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border-subtle)')}
                />
                {herettoSearchQuery && (
                  <button
                    onClick={() => setHerettoSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                    style={{ color: 'var(--app-text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Scope indicator — when searching from a subfolder */}
            {herettoSearchQuery.trim() && herettoBreadcrumbs.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: 'var(--app-text-muted)' }}>
                <span>Searching in {herettoBreadcrumbs.slice(1).map(b => b.name).join('/')}</span>
                <span>&middot;</span>
                <button
                  onClick={() => {
                    herettoSearchAbortRef.current?.abort();
                    const abort = new AbortController();
                    herettoSearchAbortRef.current = abort;
                    setHerettoSearchQuery(herettoSearchQuery); // keep the query
                    herettoSearch(herettoSearchQuery.trim(), HERETTO_ROOT_UUID, abort.signal);
                  }}
                  className="hover:underline transition-colors"
                  style={{ color: 'var(--editor-accent)' }}
                >
                  Search all
                </button>
              </div>
            )}

            {/* Search progress bar */}
            {herettoSearchStatus.phase === 'searching' && (
              <div className="mb-3">
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: 'var(--app-surface-raised)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, Math.round((herettoSearchStatus.foldersVisited / Math.max(1, herettoSearchStatus.foldersTotal)) * 100))}%`,
                      backgroundColor: 'var(--editor-accent)',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--app-text-muted)' }}>
                  <span>Scanning folders… {herettoSearchStatus.foldersVisited} / {herettoSearchStatus.foldersTotal}{herettoSearchStatus.foldersFailed > 0 ? ` (${herettoSearchStatus.foldersFailed} failed)` : ''}</span>
                  <button
                    onClick={() => {
                      herettoSearchAbortRef.current?.abort();
                      setHerettoSearchStatus({ phase: 'cancelled', foldersVisited: herettoSearchStatus.foldersVisited });
                    }}
                    className="hover:underline transition-colors"
                    style={{ color: 'var(--editor-accent)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Breadcrumbs — hide when searching */}
            {!herettoSearchQuery.trim() && (
              <div className="flex items-center gap-1 text-xs mb-3 flex-wrap" style={{ color: 'var(--app-text-muted)' }}>
                {herettoBreadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.uuid}>
                    {idx > 0 && <span>/</span>}
                    <button
                      onClick={() => {
                        setHerettoBreadcrumbs(prev => prev.slice(0, idx + 1));
                        herettoNavigate(crumb.uuid, crumb.name, true).then(() => {
                          setHerettoBreadcrumbs(prev => prev.slice(0, idx + 1));
                        });
                      }}
                      className="hover:underline transition-colors px-1 py-0.5 rounded"
                      style={{ color: idx === herettoBreadcrumbs.length - 1 ? 'var(--app-text-primary)' : 'var(--app-text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* File list / Search results */}
            <div
              className="flex-1 overflow-y-auto rounded-lg border min-h-[200px] max-h-[400px]"
              style={{
                backgroundColor: 'var(--app-surface-raised)',
                borderColor: 'var(--app-border-subtle)',
              }}
            >
              {herettoSearchQuery.trim() ? (
                // Search results mode
                <>
                  {herettoSearchResults.length === 0 && herettoSearchStatus.phase === 'done' && (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-sm" style={{ color: 'var(--app-text-muted)' }}>
                      <span>No results found</span>
                      {herettoSearchStatus.foldersFailed > 0 && (
                        <span className="mt-1 text-xs" style={{ color: 'var(--app-text-error, #ef4444)' }}>
                          {herettoSearchStatus.foldersFailed} folder{herettoSearchStatus.foldersFailed !== 1 ? 's' : ''} could not be searched
                        </span>
                      )}
                    </div>
                  )}
                  {herettoSearchResults.length === 0 && herettoSearchStatus.phase === 'cancelled' && (
                    <div className="flex items-center justify-center h-full py-12 text-sm" style={{ color: 'var(--app-text-muted)' }}>
                      Search cancelled — 0 results
                    </div>
                  )}
                  {herettoSearchResults.length === 0 && (herettoSearchStatus.phase === 'searching' || herettoSearchStatus.phase === 'idle') && (
                    <div className="flex items-center justify-center h-full py-12">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--editor-accent)' }} />
                    </div>
                  )}
                  {herettoSearchResults.map(item => (
                    <button
                      key={item.uuid}
                      onClick={() => setHerettoSelected(prev => prev?.uuid === item.uuid ? null : item)}
                      onDoubleClick={() => handleHerettoOpen(item)}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors heretto-item"
                      style={{
                        borderBottom: '1px solid var(--app-border-subtle)',
                        color: 'var(--app-text-secondary)',
                        backgroundColor: herettoSelected?.uuid === item.uuid ? 'var(--app-hover)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (herettoSelected?.uuid !== item.uuid) e.currentTarget.style.backgroundColor = 'var(--app-hover)';
                      }}
                      onMouseLeave={e => {
                        if (herettoSelected?.uuid !== item.uuid) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.name.endsWith('.sitemap') ? (
                        <Network className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                      ) : item.name.endsWith('.ditamap') ? (
                        <MapIcon className="w-4 h-4 shrink-0" style={{ color: '#8b5cf6' }} />
                      ) : (
                        <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--app-text-muted)' }} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.name}</div>
                        <div className="truncate text-xs mt-0.5" style={{ color: 'var(--app-text-muted)' }}>{item.path}</div>
                      </div>
                    </button>
                  ))}
                  {herettoSearchResults.length > 0 && herettoSearchStatus.phase === 'cancelled' && (
                    <div className="px-3 py-2 text-xs" style={{ color: 'var(--app-text-muted)' }}>
                      Search cancelled — {herettoSearchResults.length} result{herettoSearchResults.length !== 1 ? 's' : ''} so far
                    </div>
                  )}
                  {herettoSearchResults.length > 0 && herettoSearchStatus.phase === 'done' && (
                    <div className="px-3 py-2 text-xs" style={{ color: 'var(--app-text-muted)' }}>
                      {herettoSearchResults.length} result{herettoSearchResults.length !== 1 ? 's' : ''} found
                      {herettoSearchStatus.foldersFailed > 0 && (
                        <span style={{ color: 'var(--app-text-error, #ef4444)' }}>
                          {' '}({herettoSearchStatus.foldersFailed} folder{herettoSearchStatus.foldersFailed !== 1 ? 's' : ''} failed)
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Normal browse mode
                <>
                  {herettoBrowsing ? (
                    <div className="flex items-center justify-center h-full py-12">
                      <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--editor-accent)' }} />
                    </div>
                  ) : herettoItems.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-12 text-sm" style={{ color: 'var(--app-text-muted)' }}>
                      Empty folder
                    </div>
                  ) : (
                    herettoItems.map(item => (
                      <button
                        key={item.uuid}
                        onClick={() => {
                          if (item.type === 'folder') {
                            herettoNavigate(item.uuid, item.name);
                          } else {
                            setHerettoSelected(prev => prev?.uuid === item.uuid ? null : item);
                          }
                        }}
                        onDoubleClick={() => {
                          if (item.type === 'folder') return;
                          if (herettoBrowserMode === 'open') handleHerettoOpen(item);
                        }}
                        className="w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 transition-colors heretto-item"
                        style={{
                          borderBottom: '1px solid var(--app-border-subtle)',
                          color: 'var(--app-text-secondary)',
                          backgroundColor: herettoSelected?.uuid === item.uuid ? 'var(--app-hover)' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (herettoSelected?.uuid !== item.uuid) e.currentTarget.style.backgroundColor = 'var(--app-hover)';
                        }}
                        onMouseLeave={e => {
                          if (herettoSelected?.uuid !== item.uuid) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {item.type === 'folder' ? (
                          <Folder className="w-4 h-4 shrink-0" style={{ color: 'var(--editor-accent)' }} />
                        ) : item.name.endsWith('.sitemap') ? (
                          <Network className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                        ) : item.name.endsWith('.ditamap') ? (
                          <MapIcon className="w-4 h-4 shrink-0" style={{ color: '#8b5cf6' }} />
                        ) : (
                          <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--app-text-muted)' }} />
                        )}
                        <span className="truncate">{item.name}</span>
                        {item.type === 'folder' && (
                          <ChevronDown className="w-3 h-3 -rotate-90 ml-auto shrink-0" style={{ color: 'var(--app-text-muted)' }} />
                        )}
                      </button>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Save mode: filename input */}
            {herettoBrowserMode === 'save' && (
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--app-text-secondary)' }}>
                  File name
                </label>
                <input
                  type="text"
                  value={herettoSaveFileName}
                  onChange={e => setHerettoSaveFileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                  style={{
                    backgroundColor: 'var(--app-surface-raised)',
                    border: '1px solid var(--app-border-subtle)',
                    color: 'var(--app-text-primary)',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--editor-accent)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border-subtle)')}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsHerettoBrowserOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border-subtle)',
                  color: 'var(--app-text-secondary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
              >
                Cancel
              </button>
              {herettoBrowserMode === 'open' ? (
                <button
                  onClick={() => { if (herettoSelected && herettoSelected.type === 'file') handleHerettoOpen(herettoSelected as HerettoItem | HerettoSearchResult); }}
                  disabled={!herettoSelected || herettoSelected.type === 'folder'}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Open
                </button>
              ) : (
                <button
                  onClick={() => {
                    const currentFolder = herettoBreadcrumbs[herettoBreadcrumbs.length - 1];
                    if (currentFolder) handleHerettoSaveNew(currentFolder.uuid);
                  }}
                  disabled={herettoSaving || !herettoSaveFileName.trim()}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {herettoSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save here
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Verification Modal */}
      {importVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div
            className="rounded-xl p-6 w-[440px] shadow-2xl"
            style={{
              backgroundColor: 'var(--app-surface)',
              border: '1px solid var(--app-border-subtle)',
            }}
          >
            {importVerification.phase === 'downloading' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--editor-accent)' }} />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
                    Downloading topic...
                  </h3>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--app-surface-raised)' }}>
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{ width: '33%', backgroundColor: 'var(--editor-accent)' }}
                  />
                </div>
                <p className="text-xs font-mono truncate" style={{ color: 'var(--app-text-muted)' }}>
                  {importVerification.item.name}
                </p>
              </>
            )}

            {importVerification.phase === 'verifying' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--editor-accent)' }} />
                  <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
                    Verifying integrity...
                  </h3>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--app-surface-raised)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: '66%', backgroundColor: 'var(--editor-accent)' }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>
                  Re-fetching to confirm download integrity
                </p>
              </>
            )}

            {importVerification.phase === 'results' && (
              <>
                {importVerification.verified && importVerification.unrecognizedElements.length === 0 ? (
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
                      Ready to open
                    </h3>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-bold" style={{ color: 'var(--app-text-primary)' }}>
                      Review before opening
                    </h3>
                  </div>
                )}

                {/* Integrity status */}
                <div
                  className="rounded-lg px-3 py-2 text-sm mb-3 flex items-center gap-2"
                  style={{
                    backgroundColor: importVerification.verified
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${importVerification.verified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    color: importVerification.verified ? '#10b981' : '#f59e0b',
                  }}
                >
                  {importVerification.verified ? (
                    <><CheckCircle className="w-4 h-4 shrink-0" /> Integrity check passed</>
                  ) : (
                    <><AlertTriangle className="w-4 h-4 shrink-0" /> Integrity check failed &mdash; content differed between fetches</>
                  )}
                </div>

                {/* Unrecognized elements — only show when there are unsupported elements */}
                {importVerification.unrecognizedElements.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--app-text-secondary)' }}>
                    Unsupported DITA elements
                  </p>
                  <p className="text-[11px] mb-2" style={{ color: 'var(--app-text-muted)' }}>
                    These elements are preserved in the XML source editor but won't render in the visual editor.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {importVerification.unrecognizedElements.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#f59e0b',
                        }}
                      >
                        &lt;{tag}&gt;
                      </span>
                    ))}
                  </div>
                </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportVerification(null)}
                    className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--app-surface-raised)',
                      border: '1px solid var(--app-border-subtle)',
                      color: 'var(--app-text-secondary)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)')}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportContinue}
                    className="flex-1 py-2 rounded-lg text-sm font-medium bg-dita-600 hover:bg-dita-500 text-white transition-colors"
                  >
                    {importVerification.verified ? 'Open Topic' : 'Open Anyway'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div
        className="h-16 flex items-center justify-between px-6 shrink-0"
        style={{
          backgroundColor: 'var(--app-surface)',
          borderBottom: '1px solid var(--app-border)',
          zIndex: 20,
          position: 'relative',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative" ref={ditaMenuRef}>
            <button
              onClick={() => setIsDitaMenuOpen(prev => !prev)}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors cursor-pointer"
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dita-500 to-dita-600 flex items-center justify-center shadow-lg shadow-dita-500/20">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--app-text-primary)' }}>
                    DITA <span className="text-dita-500">Architect</span>
                  </h2>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDitaMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--app-text-muted)' }} />
                </div>
                <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeTab.lastUpdatedBy === 'editor' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                  Last update: {activeTab.lastUpdatedBy === 'editor' ? 'Visual Editor' : 'Source Code'}
                  <span style={{ opacity: 0.6 }}>&middot; Press Ctrl+Enter to sync between editors</span>
                </div>
              </div>
            </button>

            {isDitaMenuOpen && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg shadow-xl border py-1 z-50 min-w-[160px]"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  borderColor: 'var(--app-border-subtle)',
                }}
              >
                <button
                  onClick={() => { setIsDitaMenuOpen(false); setIsNewTopicModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  New Topic
                </button>
                <button
                  onClick={() => { setIsDitaMenuOpen(false); handleUploadClick(); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Open Topic
                </button>
                <button
                  onClick={() => { setIsDitaMenuOpen(false); openSaveModal(); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Topic
                </button>
                <div className="my-1 mx-2" style={{ borderTop: '1px solid var(--app-border-subtle)' }} />
                <button
                  onClick={() => { setIsDitaMenuOpen(false); setIsConvertModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Convert Topic Type
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".dita,.xml"
          />

          {/* File Options dropdown */}
          <div className="relative" ref={fileOptionsRef}>
            <button
              onClick={() => setIsFileOptionsOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded transition-all text-xs font-medium"
              style={{
                backgroundColor: 'var(--app-surface-raised)',
                color: 'var(--app-text-secondary)',
                border: '1px solid var(--app-border-subtle)',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--app-btn-hover)'; e.currentTarget.style.color = 'var(--app-text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--app-surface-raised)'; e.currentTarget.style.color = 'var(--app-text-secondary)'; }}
            >
              <FileText className="w-3.5 h-3.5" />
              File Options
              <ChevronDown className={`w-3 h-3 transition-transform ${isFileOptionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFileOptionsOpen && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg shadow-xl border py-1 z-20"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  borderColor: 'var(--app-border-subtle)',
                  minWidth: '100%',
                }}
              >
                <button
                  onClick={() => { setIsFileOptionsOpen(false); setIsNewTopicModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  New
                </button>
                <button
                  onClick={() => { setIsFileOptionsOpen(false); handleUploadClick(); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Open
                </button>
                <button
                  onClick={() => { setIsFileOptionsOpen(false); openSaveModal(); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
                <div className="my-1 mx-2" style={{ borderTop: '1px solid var(--app-border-subtle)' }} />
                <button
                  onClick={() => { setIsFileOptionsOpen(false); setIsConvertModalOpen(true); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  style={{ color: 'var(--app-text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Convert
                </button>
              </div>
            )}
          </div>

          {/* Heretto CMS dropdown */}
          <div className="relative" ref={herettoDropdownRef}>
            <button
              onClick={() => setIsHerettoDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded shadow-lg transition-all text-xs font-medium"
              style={{
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: '1px solid #14b8a6',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0f766e')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d9488')}
            >
              <HerettoLogo className="w-4 h-4" />
              Heretto
              <ChevronDown className={`w-3 h-3 transition-transform ${isHerettoDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isHerettoDropdownOpen && (
              <div
                className="absolute top-full right-0 mt-1 rounded-lg shadow-xl border py-1 z-20"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  borderColor: 'var(--app-border-subtle)',
                  minWidth: '100%',
                }}
              >
                {herettoConnected && (
                  <>
                    <button
                      onClick={() => { setIsHerettoDropdownOpen(false); openHerettoBrowser('open'); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                      style={{ color: 'var(--app-text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Open
                    </button>
                    <button
                      onClick={() => { setIsHerettoDropdownOpen(false); handleHerettoSave(); }}
                      className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                      style={{ color: 'var(--app-text-secondary)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <CloudUpload className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <div className="my-1 mx-2" style={{ borderTop: '1px solid var(--app-border-subtle)' }} />
                  </>
                )}
                  <button
                    onClick={() => { setIsHerettoDropdownOpen(false); openHerettoStatus(); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    style={{ color: 'var(--app-text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: herettoConnected ? '#10b981' : '#ef4444' }}
                    />
                    Status
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="h-[34px] flex items-end shrink-0 overflow-x-auto tab-bar-no-scrollbar"
        style={{
          backgroundColor: 'var(--app-surface)',
          borderBottom: '1px solid var(--app-border)',
          scrollbarWidth: 'none',
        }}
      >
        <div className="flex items-end h-full min-w-0">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            const isDirty = tab.xmlContent !== tab.savedXmlRef.current;
            const tabName = tab.herettoFile?.name ?? tab.localFileName ?? 'Untitled';
            return (
              <div
                key={tab.id}
                className="flex items-center gap-1.5 pl-3 pr-1 h-[32px] text-xs font-medium cursor-pointer select-none shrink-0 max-w-[180px] group/tab"
                style={{
                  backgroundColor: isActive ? 'var(--editor-bg)' : 'transparent',
                  borderTop: isActive ? '2px solid var(--editor-accent)' : '2px solid transparent',
                  borderRight: '1px solid var(--app-border-subtle)',
                  color: isActive ? 'var(--app-text-primary)' : 'var(--app-text-muted)',
                  marginBottom: isActive ? '-1px' : '0',
                }}
                onClick={() => setActiveTabId(tab.id)}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--app-hover)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isDirty && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--editor-accent)' }}
                  />
                )}
                <span className="truncate">{tabName}</span>
                <button
                  className="p-0.5 rounded opacity-0 group-hover/tab:opacity-100 transition-opacity ml-auto shrink-0"
                  style={{ color: 'var(--app-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          className="flex items-center justify-center w-[34px] h-[32px] shrink-0 transition-colors"
          style={{ color: 'var(--app-text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--app-text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--app-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--app-text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={handleNewTab}
          title="New tab"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Split View Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: VISUAL EDITOR (Lexical) — one per tab, show/hide */}
        <div
          className="flex-1 flex flex-col min-w-0 min-h-0 relative group"
          style={{
            backgroundColor: 'var(--editor-bg)',
            borderRight: '1px solid var(--app-border)',
          }}
        >
          {tabs.map(tab => (
            <LexicalComposer key={tab.id} initialConfig={{ ...editorConfig, namespace: `DitaEditor-${tab.id}` }}>
              <div
                className={`flex-1 relative flex flex-col min-h-0 overflow-hidden ${tab.editMode ? 'dita-editor-edit-mode-container' : ''}`}
                style={{ display: tab.id === activeTabId ? 'flex' : 'none' }}
              >
                <Toolbar
                  currentTheme={appTheme}
                  onThemeChange={handleThemeChange}
                  editMode={tab.editMode}
                  onEnterEditMode={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, editModeEnterTrigger: t.editModeEnterTrigger + 1 } : t))}
                  onAcceptEdits={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, editModeAcceptTrigger: t.editModeAcceptTrigger + 1 } : t))}
                  onRejectEdits={() => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, editModeRejectTrigger: t.editModeRejectTrigger + 1 } : t))}
                />
                {/* Edit Mode Badge */}
                {tab.editMode && (
                  <div className="dita-editor-edit-mode-badge">Edit Mode</div>
                )}
                {/* Heretto Context Toolbar */}
                {tab.herettoFile && (
                  <div
                    className="absolute top-10 left-0 right-0 h-9 flex items-center justify-between px-4 z-10"
                    style={{
                      backgroundColor: 'color-mix(in srgb, #0d9488 6%, var(--app-surface))',
                      borderBottom: '1px solid color-mix(in srgb, #14b8a6 20%, var(--app-border))',
                    }}
                  >
                    {/* Left: logo + breadcrumb path */}
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <HerettoLogo className="w-3.5 h-3.5 shrink-0" style={{ color: '#14b8a6' }} />
                      <div className="flex items-center gap-1 min-w-0 truncate" style={{ color: 'var(--app-text-muted)' }}>
                        {tab.herettoFile.path.split('/').filter(Boolean).map((segment, i, arr) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
                            <span style={i === arr.length - 1 ? { color: 'var(--app-text-primary)', fontWeight: 500 } : undefined}>
                              {segment}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Right: status + actions */}
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--app-text-muted)' }}>
                        {tab.herettoRemoteChanged ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <span>{tab.herettoDirty ? 'Conflict — updated in Heretto' : 'Updated in Heretto'}</span>
                          </>
                        ) : tab.herettoDirty ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>Unsaved changes</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            <span>
                              Saved{tab.herettoLastSaved ? ` ${formatRelativeTime(tab.herettoLastSaved)}` : ''}
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={handleHerettoRefresh}
                        disabled={herettoRefreshing}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--app-text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
                        title="Refresh from Heretto"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${herettoRefreshing ? 'animate-spin' : ''}`} />
                      </button>

                      {tab.herettoDirty && (
                        <button
                          onClick={handleHerettoSave}
                          disabled={herettoSaving}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: '#0d9488',
                            color: '#ffffff',
                            border: '1px solid #14b8a6',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0f766e')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d9488')}
                        >
                          {herettoSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudUpload className="w-3 h-3" />}
                          Commit
                        </button>
                      )}

                      <button
                        onClick={handleHerettoDisconnect}
                        className="p-1 rounded transition-colors"
                        style={{ color: 'var(--app-text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--app-text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--app-text-muted)')}
                        title="Disconnect from Heretto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <div className={`flex-1 overflow-y-auto custom-scrollbar pb-10 relative ${tab.herettoFile ? 'pt-[92px]' : 'pt-14'}`}>
                  <RichTextPlugin
                    contentEditable={<ContentEditable className="outline-none max-w-6xl mx-auto px-8 min-h-[500px]" />}
                    placeholder={
                      <div className="absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-8 leading-relaxed" style={{ color: 'var(--app-text-muted)' }}>
                        Start typing your DITA content here...
                      </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <HistoryPlugin />
                  <ListPlugin />
                  <LinkPlugin />
                  <TablePlugin />
                  <ClearEditorPlugin />
                  <EmptyToH1Plugin />

                  <SyncManager
                    xmlContent={tab.xmlContent}
                    onLexicalChange={(xml: string) => updateTab(tab.id, { xmlContent: xml, lastUpdatedBy: 'editor' })}
                    lastUpdatedBy={tab.lastUpdatedBy}
                    syncTrigger={tab.syncTrigger}
                    editMode={tab.editMode}
                  >
                    <ShortdescPlugin />
                    <EditModePlugin
                      tabId={tab.id}
                      editMode={tab.editMode}
                      masterXml={tab.xmlContent}
                      snapshotRef={tab.snapshotRef}
                      enterTrigger={tab.editModeEnterTrigger}
                      acceptTrigger={tab.editModeAcceptTrigger}
                      rejectTrigger={tab.editModeRejectTrigger}
                      onEnterEditMode={(tabId) => updateTab(tabId, { editMode: true })}
                      onAcceptEdits={(tabId, xml) => updateTab(tabId, { editMode: false, xmlContent: xml, lastUpdatedBy: 'editor' })}
                      onRejectEdits={(tabId) => updateTab(tabId, { editMode: false })}
                    />
                  </SyncManager>
                  <TrackedChangesPlugin
                    editMode={tab.editMode}
                    snapshotRef={tab.snapshotRef}
                    enterTrigger={tab.editModeEnterTrigger}
                  />
                </div>
                <BottomToolbar />
              </div>
            </LexicalComposer>
          ))}
        </div>

        {/* RIGHT: CODE EDITOR (Monaco) */}
        <div
          className="flex flex-col min-w-0 relative"
          style={{
            backgroundColor: 'var(--app-bg)',
            flex: codeEditorCollapsed ? '0 0 36px' : '1 1 0%',
            transition: 'flex 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
          }}
        >
          {/* Collapsed tab overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center z-10"
            style={{
              backgroundColor: 'var(--app-surface-raised)',
              opacity: codeEditorCollapsed ? 1 : 0,
              pointerEvents: codeEditorCollapsed ? 'auto' : 'none',
              transition: 'opacity 200ms ease',
              cursor: 'pointer',
            }}
            onClick={() => setCodeEditorCollapsed(false)}
            title="Expand XML editor"
          >
            <div className="p-2">
              <PanelRightOpen className="w-4 h-4" style={{ color: 'var(--app-text-muted)' }} />
            </div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
              style={{
                color: 'var(--app-text-muted)',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                padding: '8px 0',
              }}
            >
              XML Source
            </div>
          </div>
          {/* XML Toolbar */}
          <div
            className="h-10 flex items-center px-4 justify-between shrink-0"
            style={{
              backgroundColor: 'var(--app-surface-raised)',
              borderBottom: '1px solid var(--app-border-subtle)',
            }}
          >
            <div className="relative" ref={syntaxDropdownRef}>
              <button
                onClick={() => setIsSyntaxThemeOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest rounded px-2 py-1 transition-colors"
                style={{ color: 'var(--app-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Code className="w-4 h-4" />
                {SYNTAX_THEME_OPTIONS.find(t => t.value === syntaxTheme)?.label ?? 'XML Source'}
                <ChevronDown className={`w-3 h-3 transition-transform ${isSyntaxThemeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSyntaxThemeOpen && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-lg shadow-xl border py-1 min-w-[140px] z-20"
                  style={{
                    backgroundColor: 'var(--app-surface-raised)',
                    borderColor: 'var(--app-border-subtle)',
                  }}
                >
                  {SYNTAX_THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleSyntaxThemeChange(opt.value);
                        setIsSyntaxThemeOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors flex items-center justify-between"
                      style={{
                        color: opt.value === syntaxTheme
                          ? 'var(--editor-accent, #0ea5e9)'
                          : 'var(--app-text-secondary)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--app-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {opt.label}
                      {opt.value === syntaxTheme && <span>&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentTopicType !== 'undefined' && (
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider"
                  style={{
                    backgroundColor: `var(--badge-${currentTopicType}-bg, var(--app-surface-raised))`,
                    border: `1px solid var(--badge-${currentTopicType}-border, var(--app-border-subtle))`,
                    color: `var(--badge-${currentTopicType}-text, var(--app-text-muted))`,
                  }}
                >
                  {currentTopicType}
                </div>
              )}
              <button
                onClick={() => setCodeEditorCollapsed(true)}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--app-text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--app-hover)'; e.currentTarget.style.color = 'var(--app-text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--app-text-muted)'; }}
                title="Collapse XML editor"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco editors — one per tab, show/hide */}
          {tabs.map(tab => (
            <div
              key={tab.id}
              className="flex-1 overflow-hidden pt-2"
              style={{ display: tab.id === activeTabId ? 'flex' : 'none', flexDirection: 'column' }}
            >
              <MonacoDitaEditor
                value={tab.xmlContent}
                onChange={(newXml: string) => updateTab(tab.id, { xmlContent: newXml, lastUpdatedBy: 'code' })}
                onValidation={(hasErrors: boolean, errors?: XmlError[]) => {
                  updateTab(tab.id, { hasXmlErrors: hasErrors, xmlErrors: errors || [] });
                  if (!hasErrors) setShowErrorPanel(false);
                }}
                editorTheme={appTheme}
                syntaxTheme={syntaxTheme}
                onEditorReady={(api) => { tab.monacoApiRef.current = api; }}
              />
            </div>
          ))}

          {/* Code Status Footer */}
          <div
            className="h-8 flex items-center px-4 justify-between text-[10px] font-mono relative"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderTop: '1px solid var(--app-border)',
              color: 'var(--app-text-muted)',
            }}
          >
            <div className="flex items-center gap-3">
              <span>UTF-8</span>
              <span>DITA 1.3</span>
            </div>
            <button
              className={`flex items-center gap-1.5 ${activeTab.hasXmlErrors ? 'text-red-400 hover:text-red-300' : 'text-emerald-500'}`}
              style={{ cursor: activeTab.hasXmlErrors ? 'pointer' : 'default', background: 'none', border: 'none', font: 'inherit', fontSize: 'inherit' }}
              onClick={() => { if (activeTab.hasXmlErrors) setShowErrorPanel(prev => !prev); }}
            >
              {activeTab.hasXmlErrors ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
              {activeTab.hasXmlErrors ? `${activeTab.xmlErrors.filter(e => e.severity === 'error').length} Error${activeTab.xmlErrors.filter(e => e.severity === 'error').length !== 1 ? 's' : ''}` : 'Valid XML'}
            </button>

            {/* Error details panel */}
            {showErrorPanel && activeTab.xmlErrors.length > 0 && (
              <div
                ref={errorPanelRef}
                className="absolute bottom-full right-0 mb-1 w-[420px] max-h-64 overflow-y-auto rounded shadow-lg text-xs font-mono z-50"
                style={{
                  backgroundColor: 'var(--app-surface-raised)',
                  border: '1px solid var(--app-border)',
                  color: 'var(--app-text-secondary)',
                }}
              >
                <div
                  className="px-3 py-2 font-semibold text-[11px] uppercase tracking-wider sticky top-0"
                  style={{
                    backgroundColor: 'var(--app-surface-raised)',
                    borderBottom: '1px solid var(--app-border)',
                    color: 'var(--app-text-muted)',
                  }}
                >
                  Problems
                </div>
                {activeTab.xmlErrors.map((err, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                    style={{ borderBottom: '1px solid var(--app-border-subtle)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--app-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    onClick={() => {
                      activeTab.monacoApiRef.current?.revealLine(err.line, err.column);
                      setShowErrorPanel(false);
                    }}
                  >
                    {err.severity === 'error'
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="leading-snug" style={{ color: err.severity === 'error' ? '#f87171' : '#fbbf24' }}>
                        {err.message}
                      </div>
                      <div className="mt-0.5" style={{ color: 'var(--app-text-muted)' }}>
                        Line {err.line}, Column {err.column}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
