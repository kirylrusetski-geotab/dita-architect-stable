import { useState, useEffect, useRef, useCallback } from 'react';
import type { Tab } from '../types/tab';
import { createTab } from '../types/tab';
import { getTopicId, validateDitaXml } from '../lib/xml-utils';
import { toast } from 'sonner';

interface UseLocalFileParams {
  activeTab: Tab;
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  setActiveTabId: React.Dispatch<React.SetStateAction<string>>;
}

export function useLocalFile({
  activeTab,
  tabs: _tabs,
  setTabs,
  setActiveTabId,
}: UseLocalFileParams) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const openSaveModal = useCallback(() => {
    const topicId = getTopicId(activeTab.xmlContent);
    setSaveFileName(topicId ? `${topicId}.dita` : 'topic.dita');
    setIsSaveModalOpen(true);
  }, [activeTab.xmlContent]);

  const handleSaveConfirm = useCallback(async () => {
    const name = saveFileName.trim() || 'topic.dita';
    const finalName = name.endsWith('.dita') || name.endsWith('.xml') ? name : `${name}.dita`;
    const content = activeTab.xmlContent;
    const tabId = activeTab.id;
    const blob = new Blob([content], { type: 'text/xml' });

    // Use native save dialog if available (Chrome, Edge)
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: finalName,
          types: [
            { description: 'DITA files', accept: { 'text/xml': ['.dita', '.xml'] } },
          ],
        });
        try {
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (writeErr: any) {
          toast.error(`Failed to write file: ${writeErr.message || 'Unknown error'}`);
          return;
        }
        // Update savedXmlRef outside the state updater to avoid mutating React state.
        activeTab.savedXmlRef.current = content;

        setTabs(prev => prev.map(t => {
          if (t.id !== tabId) return t;
          return { ...t, localFileName: handle.name };
        }));
        setIsSaveModalOpen(false);
        toast.success(`Saved as ${handle.name}`);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // user cancelled
        // Any other showSaveFilePicker error (e.g. SecurityError): fall through to download
      }
    }

    // Fallback: browser download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Update savedXmlRef outside the state updater to avoid mutating React state.
    activeTab.savedXmlRef.current = content;

    setTabs(prev => prev.map(t => {
      if (t.id !== tabId) return t;
      return { ...t, localFileName: finalName };
    }));
    setIsSaveModalOpen(false);
    toast.success(`Saved as ${finalName}`);
  }, [saveFileName, activeTab, setTabs]);

  const loadFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const result = validateDitaXml(content);
      if (!result.valid) {
        toast.error(result.error || 'Invalid DITA file');
        return;
      }

      const newTab = createTab(content);
      newTab.localFileName = file.name;
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      toast.success(`Opened ${file.name}`);
    };
    reader.readAsText(file);
  }, [setTabs, setActiveTabId]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    loadFile(file);
    event.target.value = '';
  }, [loadFile]);

  // Drag-and-drop
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOver(true);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
      }
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      const file = e.dataTransfer?.files[0];
      if (!file) return;

      if (!file.name.endsWith('.dita') && !file.name.endsWith('.xml')) {
        toast.error('Only .dita and .xml files are supported');
        return;
      }

      loadFile(file);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [loadFile]);

  return {
    fileInputRef,
    isSaveModalOpen,
    setIsSaveModalOpen,
    saveFileName,
    setSaveFileName,
    isDragOver,
    openSaveModal,
    handleSaveConfirm,
    loadFile,
    handleUploadClick,
    handleFileChange,
  };
}
