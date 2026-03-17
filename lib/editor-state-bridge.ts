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

// Callbacks for API-triggered operations (set by main app)
let syncTriggerCallback: ((tabId: string, xmlContent: string) => boolean) | null = null;
let saveHandlerCallback: ((tabId: string) => Promise<{ success: boolean; error?: string }>) | null = null;

export function setEditorStateReference(state: EditorState): void {
  editorState = state;
}

export function setSyncTriggerCallback(callback: (tabId: string, xmlContent: string) => boolean): void {
  syncTriggerCallback = callback;
}

export function setSaveHandlerCallback(callback: (tabId: string) => Promise<{ success: boolean; error?: string }>): void {
  saveHandlerCallback = callback;
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

export function updateTabContent(tabId: string, xmlContent: string): boolean {
  if (!syncTriggerCallback) return false;
  return syncTriggerCallback(tabId, xmlContent);
}

export function triggerTabSave(tabId: string): Promise<{ success: boolean; error?: string }> {
  if (!saveHandlerCallback) {
    return Promise.resolve({ success: false, error: 'Save handler not initialized' });
  }
  return saveHandlerCallback(tabId);
}