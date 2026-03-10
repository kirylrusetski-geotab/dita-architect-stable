import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_HISTORY_COMMAND, type EditorState } from 'lexical';
import { serializeLexicalToXml, useSyncContext } from '../sync';
import { toast } from 'sonner';

interface EditModePluginProps {
  tabId: string;
  editMode: boolean;
  masterXml: string;
  snapshotRef: React.MutableRefObject<EditorState | null>;
  onEnterEditMode: (tabId: string) => void;
  onAcceptEdits: (tabId: string, xml: string) => void;
  onRejectEdits: (tabId: string) => void;
  enterTrigger: number;
  acceptTrigger: number;
  rejectTrigger: number;
}

export const EditModePlugin = ({
  tabId,
  editMode: _editMode,
  masterXml,
  snapshotRef,
  onEnterEditMode,
  onAcceptEdits,
  onRejectEdits,
  enterTrigger,
  acceptTrigger,
  rejectTrigger,
}: EditModePluginProps) => {
  const [editor] = useLexicalComposerContext();
  const { nodeOriginMap, xmlMetaCache } = useSyncContext();

  // Enter Edit Mode: capture snapshot
  useEffect(() => {
    if (enterTrigger === 0) return;
    snapshotRef.current = editor.getEditorState();
    onEnterEditMode(tabId);
    toast('Entered Edit Mode — changes are isolated');
  }, [enterTrigger, editor, snapshotRef, tabId, onEnterEditMode]);

  // Accept: serialize current state and push to parent
  useEffect(() => {
    if (acceptTrigger === 0) return;
    editor.getEditorState().read(() => {
      const xml = serializeLexicalToXml(editor.getEditorState(), masterXml, nodeOriginMap, xmlMetaCache);
      onAcceptEdits(tabId, xml);
    });
    snapshotRef.current = null;
    toast.success('Edits accepted and synced');
  }, [acceptTrigger, editor, masterXml, snapshotRef, tabId, onAcceptEdits]);

  // Reject: restore snapshot and clear undo history
  useEffect(() => {
    if (rejectTrigger === 0) return;
    const snapshot = snapshotRef.current;
    if (snapshot) {
      editor.setEditorState(snapshot);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    }
    snapshotRef.current = null;
    onRejectEdits(tabId);
    toast('Edits rejected — reverted to previous state');
  }, [rejectTrigger, editor, snapshotRef, tabId, onRejectEdits]);

  return null;
};
