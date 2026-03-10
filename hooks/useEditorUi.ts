import { useState, useEffect, useRef, useCallback } from 'react';
import type { Tab } from '../types/tab';
import type { ThemeName } from '../components/Toolbar';
import type { SyntaxThemeName } from '../components/MonacoDitaEditor';

interface UseEditorUiParams {
  activeTabId: string;
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  herettoDropdownRef: React.RefObject<HTMLDivElement | null>;
  setIsHerettoDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useEditorUi({
  activeTabId,
  tabs,
  setTabs,
  herettoDropdownRef,
  setIsHerettoDropdownOpen,
}: UseEditorUiParams) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = localStorage.getItem('dita-architect-theme');
    if (stored === 'light' || stored === 'claude' || stored === 'nord' || stored === 'solarized') return stored;
    return 'dark';
  });

  const handleThemeChange = useCallback((newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem('dita-architect-theme', newTheme);
  }, []);

  const [syntaxTheme, setSyntaxTheme] = useState<SyntaxThemeName>(() => {
    const stored = localStorage.getItem('dita-architect-syntax-theme');
    const valid: SyntaxThemeName[] = ['material', 'github', 'monokai', 'dracula', 'one-dark', 'catppuccin', 'daylight'];
    if (stored && valid.includes(stored as SyntaxThemeName)) return stored as SyntaxThemeName;
    return 'material';
  });

  const handleSyntaxThemeChange = useCallback((newTheme: SyntaxThemeName) => {
    setSyntaxTheme(newTheme);
    localStorage.setItem('dita-architect-syntax-theme', newTheme);
  }, []);

  const [isSyntaxThemeOpen, setIsSyntaxThemeOpen] = useState(false);
  const [codeEditorCollapsed, setCodeEditorCollapsed] = useState(false);
  const syntaxDropdownRef = useRef<HTMLDivElement>(null);

  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const errorPanelRef = useRef<HTMLDivElement>(null);

  const [isDitaMenuOpen, setIsDitaMenuOpen] = useState(false);
  const ditaMenuRef = useRef<HTMLDivElement>(null);

  const [isFileOptionsOpen, setIsFileOptionsOpen] = useState(false);
  const fileOptionsRef = useRef<HTMLDivElement>(null);

  // Close syntax theme dropdown on outside click (only registered while open)
  useEffect(() => {
    if (!isSyntaxThemeOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (syntaxDropdownRef.current && !syntaxDropdownRef.current.contains(e.target as Node)) {
        setIsSyntaxThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSyntaxThemeOpen]);

  // Close error panel on outside click
  useEffect(() => {
    if (!showErrorPanel) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (errorPanelRef.current && !errorPanelRef.current.contains(e.target as Node)) {
        setShowErrorPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showErrorPanel]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (herettoDropdownRef.current && !herettoDropdownRef.current.contains(e.target as Node)) {
        setIsHerettoDropdownOpen(false);
      }
      if (ditaMenuRef.current && !ditaMenuRef.current.contains(e.target as Node)) {
        setIsDitaMenuOpen(false);
      }
      if (fileOptionsRef.current && !fileOptionsRef.current.contains(e.target as Node)) {
        setIsFileOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [herettoDropdownRef, setIsHerettoDropdownOpen]);

  // Ctrl+Enter to sync between editors (active tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, syncTrigger: t.syncTrigger + 1 } : t));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, setTabs]);

  // Flush XML→Lexical sync when switching tabs
  useEffect(() => {
    const id = setTimeout(() => {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, syncTrigger: t.syncTrigger + 1 } : t));
    }, 50);
    return () => clearTimeout(id);
  }, [activeTabId, setTabs]);

  // Warn on unsaved changes when closing the browser tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = tabs.some(t => t.xmlContent !== t.savedXmlRef.current);
      if (hasUnsaved) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tabs]);

  return {
    theme,
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
  };
}
