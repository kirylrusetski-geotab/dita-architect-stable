import type { Tab } from '../types/tab';
import type { XmlError } from '../components/MonacoDitaEditor';

export interface EditorStatus {
  herettoConnected: boolean;
  theme: string;
}

export interface TabState {
  id: string;
  fileName: string | null;
  herettoFile: { uuid: string; name: string; path: string } | null;
  dirty: boolean;
  xmlErrorCount: number;
  xmlContent: string;
  xmlErrors: Array<{ line: number; column: number; message: string; severity: 'error' | 'warning' }>;
}

export interface TabsState {
  tabs: TabState[];
  activeTabId: string;
}

export interface EditorState {
  version: string;
  herettoConnected: boolean;
  tabCount: number;
  activeTabId: string;
  theme: string;
  tabs: Map<string, TabState>;
}

// Module-level state that will be referenced from vite.config.ts
// Cannot be initialized here since vite.config.ts manages the state object
let editorState: EditorState | null = null;

export function setEditorStateReference(state: EditorState): void {
  editorState = state;
}

export function updateEditorStatus(status: EditorStatus): void {
  if (!editorState) return;

  editorState.herettoConnected = status.herettoConnected;
  editorState.theme = status.theme;
}

export function updateTabsState(tabs: Tab[], activeTabId: string): void {
  if (!editorState) return;

  // Clear existing tabs
  editorState.tabs.clear();

  // Convert tabs to serializable format and populate the Map
  tabs.forEach(tab => {
    if (!editorState) return;

    const fileName = tab.localFileName || tab.herettoFile?.name || null;
    const tabState: TabState = {
      id: tab.id,
      fileName,
      herettoFile: tab.herettoFile ? {
        uuid: tab.herettoFile.uuid,
        name: tab.herettoFile.name,
        path: tab.herettoFile.path
      } : null,
      dirty: tab.herettoDirty || (tab.savedXmlRef.current !== tab.xmlContent),
      xmlErrorCount: tab.xmlErrors.length,
      xmlContent: tab.xmlContent,
      xmlErrors: tab.xmlErrors.map(error => ({
        line: error.line,
        column: error.column,
        message: error.message,
        severity: error.severity
      }))
    };
    editorState.tabs.set(tab.id, tabState);
  });

  editorState.tabCount = tabs.length;
  editorState.activeTabId = activeTabId;
}