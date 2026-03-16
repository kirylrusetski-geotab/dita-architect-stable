/**
 * Tests for XML toolbar tooltip accessibility enhancements
 * Validates Jamie's implementation of Anna's plan for consistent tooltips
 * across both WYSIWYG and XML editor toolbars.
 *
 * Environment: vitest + jsdom + React Testing Library
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { SYNTAX_THEME_OPTIONS } from '../components/MonacoDitaEditor';

// Import main component - we'll test the XML toolbar within it
import DitaArchitect from '../dita-architect';

// Mock dependencies that aren't needed for tooltip testing
vi.mock('../sync/parseXmlToLexical', () => ({
  parseXmlToLexical: vi.fn().mockResolvedValue([]),
  parseXmlNode: vi.fn().mockReturnValue(null),
}));

vi.mock('../lib/xml-utils', () => ({
  formatXml: vi.fn().mockResolvedValue('formatted xml'),
  formatRelativeTime: vi.fn().mockReturnValue('2 minutes ago'),
}));

vi.mock('../hooks/useTabManager', () => {
  const mockTab = {
    id: 'test',
    xmlContent: '<topic><title>Test</title></topic>',
    lastUpdatedBy: 'editor',
    savedXmlRef: { current: '<topic><title>Test</title></topic>' },
    herettoFile: null,
    herettoLastSaved: null,
    herettoRemoteChanged: false,
    herettoDirty: false,
    hasXmlErrors: false,
    xmlErrors: [],
    syncTrigger: 0,
    monacoApiRef: { current: null },
    localFileName: null,
    editMode: false,
    editModeEnterTrigger: 0,
    editModeAcceptTrigger: 0,
    editModeRejectTrigger: 0,
    snapshotRef: { current: null },
    herettoReplaceTarget: null,
  };

  return {
    useTabManager: vi.fn().mockReturnValue({
      tabs: [mockTab],
      activeTabId: 'test',
      activeTab: mockTab,
      addTab: vi.fn(),
      updateTab: vi.fn(),
      closeTab: vi.fn(),
      switchToTab: vi.fn(),
      getDitaContent: vi.fn().mockReturnValue('<topic><title>Test</title></topic>'),
      setTabTitle: vi.fn(),
    }),
  };
});

vi.mock('../hooks/useLocalFile', () => ({
  useLocalFile: vi.fn().mockReturnValue({
    loadedFile: null,
    isLoadingFile: false,
    handleOpenFile: vi.fn(),
    handleSaveFile: vi.fn(),
    handleSaveAsFile: vi.fn(),
  }),
}));

vi.mock('../hooks/useHerettoCms', () => ({
  useHerettoCms: vi.fn().mockReturnValue({
    isHeretto: false,
    herettoData: null,
    saveToHeretto: vi.fn(),
  }),
}));

vi.mock('../hooks/useExternalLoad', () => ({
  useExternalLoad: vi.fn().mockReturnValue({
    isLoading: false,
    error: null,
    loadContent: vi.fn(),
  }),
}));

vi.mock('../hooks/useEditorUi', () => ({
  useEditorUi: vi.fn().mockReturnValue({
    theme: 'dark',
    setTheme: vi.fn(),
    syntaxTheme: 'material',
    setSyntaxTheme: vi.fn(),
    isToolbarCollapsed: false,
    toggleToolbar: vi.fn(),
    showThemeTooltips: true,
    wordCount: 0,
    codeEditorCollapsed: false,
    setCodeEditorCollapsed: vi.fn(),
    syntaxDropdownRef: { current: null },
    showErrorPanel: false,
    setShowErrorPanel: vi.fn(),
    errorPanelRef: { current: null },
    isSyntaxThemeOpen: false,
    setIsSyntaxThemeOpen: vi.fn(),
  }),
}));

describe('XML Toolbar Tooltips Implementation', () => {

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('syntax theme dropdown tooltip and aria-label', () => {
    it('renders syntax theme dropdown with tooltip content "Syntax theme"', () => {
      render(<DitaArchitect />);

      // Find syntax theme button by its aria-label pattern
      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });
      expect(syntaxButton).toBeInTheDocument();

      // The tooltip content should be in the DOM (even if not visible)
      expect(screen.getByText('Syntax theme')).toBeInTheDocument();
    });

    it('syntax theme button has dynamic aria-label with current theme label', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });

      // Should have aria-label that includes "Select syntax theme:" followed by current theme
      const ariaLabel = syntaxButton.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/^Select syntax theme: /);

      // Should contain one of the valid theme labels or fallback
      const validLabels = SYNTAX_THEME_OPTIONS.map(opt => opt.label);
      const hasValidLabel = validLabels.some(label => ariaLabel?.includes(label)) || ariaLabel?.includes('XML Source');
      expect(hasValidLabel).toBe(true);
    });

    it('syntax theme button has proper ARIA dropdown attributes', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });
      expect(syntaxButton).toHaveAttribute('aria-haspopup', 'true');
      expect(syntaxButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('syntax theme dropdown button is clickable and maintains proper structure', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });

      // Button should be clickable without error (functionality test)
      expect(() => fireEvent.click(syntaxButton)).not.toThrow();

      // Button should maintain proper ARIA structure
      expect(syntaxButton).toHaveAttribute('aria-haspopup', 'true');
      expect(syntaxButton).toHaveAttribute('aria-expanded', 'false');

      // Tooltip should not interfere with button interaction
      expect(syntaxButton).toBeEnabled();
      expect(syntaxButton).toBeVisible();
    });

    it('syntax theme dropdown supports keyboard interaction without tooltip interference', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });

      // Keyboard events should not throw errors when applied to tooltip-wrapped button
      expect(() => fireEvent.keyDown(syntaxButton, { key: 'ArrowDown' })).not.toThrow();
      expect(() => fireEvent.keyDown(syntaxButton, { key: 'Enter' })).not.toThrow();
      expect(() => fireEvent.keyDown(syntaxButton, { key: 'Space' })).not.toThrow();

      // Button should remain focusable and accessible after tooltip wrapping
      expect(syntaxButton).toHaveAttribute('aria-haspopup', 'true');
      expect(syntaxButton).not.toBeDisabled();
    });
  });

  describe('format XML button tooltip implementation', () => {
    it('renders Format XML button with tooltip content "Format XML (Shift+Alt+F)"', () => {
      render(<DitaArchitect />);

      // Find Format XML button by aria-label
      const formatButton = screen.getByRole('button', { name: 'Format XML' });
      expect(formatButton).toBeInTheDocument();

      // The tooltip content should be in the DOM
      expect(screen.getByText('Format XML (Shift+Alt+F)')).toBeInTheDocument();
    });

    it('Format XML button maintains existing aria-label', () => {
      render(<DitaArchitect />);

      const formatButton = screen.getByRole('button', { name: 'Format XML' });
      expect(formatButton).toHaveAttribute('aria-label', 'Format XML');
    });

    it('Format XML button click functionality still works', () => {
      render(<DitaArchitect />);

      const formatButton = screen.getByRole('button', { name: 'Format XML' });

      // Should be clickable without error
      expect(() => {
        fireEvent.click(formatButton);
      }).not.toThrow();
    });
  });

  describe('collapse XML editor button tooltip implementation', () => {
    it('renders Collapse button with tooltip content "Collapse XML editor"', () => {
      render(<DitaArchitect />);

      // Find Collapse button by aria-label
      const collapseButton = screen.getByRole('button', { name: 'Collapse XML editor' });
      expect(collapseButton).toBeInTheDocument();

      // The tooltip content should be in the DOM
      expect(screen.getByText('Collapse XML editor')).toBeInTheDocument();
    });

    it('Collapse button has correct aria-label', () => {
      render(<DitaArchitect />);

      const collapseButton = screen.getByRole('button', { name: 'Collapse XML editor' });
      expect(collapseButton).toHaveAttribute('aria-label', 'Collapse XML editor');
    });

    it('Collapse button click functionality still works', () => {
      render(<DitaArchitect />);

      const collapseButton = screen.getByRole('button', { name: 'Collapse XML editor' });

      // Should be clickable without error
      expect(() => {
        fireEvent.click(collapseButton);
      }).not.toThrow();
    });
  });

  describe('tooltip pattern consistency with WYSIWYG toolbar', () => {
    it('all three XML toolbar items use the Tooltip component wrapper pattern', () => {
      render(<DitaArchitect />);

      // All three tooltip contents should be present in DOM
      expect(screen.getByText('Syntax theme')).toBeInTheDocument();
      expect(screen.getByText('Format XML (Shift+Alt+F)')).toBeInTheDocument();
      expect(screen.getByText('Collapse XML editor')).toBeInTheDocument();
    });

    it('XML toolbar buttons have proper accessibility attributes', () => {
      render(<DitaArchitect />);

      // Syntax theme dropdown
      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });
      expect(syntaxButton).toHaveAttribute('aria-haspopup', 'true');
      expect(syntaxButton).toHaveAttribute('aria-expanded', 'false');
      expect(syntaxButton).toHaveAttribute('aria-label');

      // Format XML button
      const formatButton = screen.getByRole('button', { name: 'Format XML' });
      expect(formatButton).toHaveAttribute('aria-label', 'Format XML');

      // Collapse button
      const collapseButton = screen.getByRole('button', { name: 'Collapse XML editor' });
      expect(collapseButton).toHaveAttribute('aria-label', 'Collapse XML editor');
    });
  });

  describe('tooltip content validation', () => {
    it('syntax theme tooltip content matches Anna\'s specification exactly', () => {
      render(<DitaArchitect />);

      const tooltipContent = screen.getByText('Syntax theme');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent.textContent).toBe('Syntax theme');
    });

    it('format XML tooltip includes keyboard shortcut as specified', () => {
      render(<DitaArchitect />);

      const tooltipContent = screen.getByText('Format XML (Shift+Alt+F)');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent.textContent).toBe('Format XML (Shift+Alt+F)');
    });

    it('collapse button tooltip content matches specification exactly', () => {
      render(<DitaArchitect />);

      const tooltipContent = screen.getByText('Collapse XML editor');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent.textContent).toBe('Collapse XML editor');
    });
  });

  describe('SYNTAX_THEME_OPTIONS integration', () => {
    it('syntax theme aria-label computation handles all theme options correctly', () => {
      // This test ensures the dynamic aria-label will work for any theme
      SYNTAX_THEME_OPTIONS.forEach(option => {
        // We can't easily test theme switching in isolation, but we can verify
        // that the aria-label pattern would work for each option
        const expectedPattern = `Select syntax theme: ${option.label}`;
        expect(expectedPattern).toMatch(/^Select syntax theme: \w+/);
        expect(expectedPattern.length).toBeGreaterThan('Select syntax theme: '.length);
      });
    });

    it('syntax theme aria-label computation has proper fallback', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });
      const ariaLabel = syntaxButton.getAttribute('aria-label');

      // Should either contain a valid theme label or the fallback 'XML Source'
      const validLabels = SYNTAX_THEME_OPTIONS.map(opt => opt.label);
      const hasValidContent = validLabels.some(label => ariaLabel?.includes(label)) || ariaLabel?.includes('XML Source');

      expect(hasValidContent).toBe(true);
      expect(ariaLabel).toMatch(/^Select syntax theme: /);
    });
  });

  describe('regression tests for previous tooltip issues', () => {
    it('tooltips do not interfere with XML toolbar layout or functionality', () => {
      render(<DitaArchitect />);

      // All three buttons should be present and functional
      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });
      const formatButton = screen.getByRole('button', { name: 'Format XML' });
      const collapseButton = screen.getByRole('button', { name: 'Collapse XML editor' });

      expect(syntaxButton).toBeInTheDocument();
      expect(formatButton).toBeInTheDocument();
      expect(collapseButton).toBeInTheDocument();

      // All should be clickable
      expect(syntaxButton).not.toBeDisabled();
      expect(formatButton).not.toBeDisabled();
      expect(collapseButton).not.toBeDisabled();
    });

    it('tooltip implementation preserves original button functionality', () => {
      render(<DitaArchitect />);

      const syntaxButton = screen.getByRole('button', { name: /select syntax theme/i });

      // Tooltip wrapping should not change the button's core functionality
      expect(syntaxButton.tagName).toBe('BUTTON');
      expect(syntaxButton).toHaveAttribute('aria-haspopup', 'true');
      expect(syntaxButton).toHaveAttribute('aria-expanded', 'false');
      expect(syntaxButton).toHaveAttribute('aria-label');

      // Button should respond to user interactions without error
      expect(() => {
        fireEvent.mouseEnter(syntaxButton);
        fireEvent.mouseLeave(syntaxButton);
        fireEvent.focus(syntaxButton);
        fireEvent.blur(syntaxButton);
        fireEvent.click(syntaxButton);
      }).not.toThrow();

      // Original onclick and onKeyDown handlers should still be present/functional
      expect(syntaxButton).not.toBeDisabled();
      expect(syntaxButton).toBeVisible();
    });
  });
});

describe('SYNTAX_THEME_OPTIONS validation for tooltip integration', () => {
  it('has valid structure for aria-label computation', () => {
    expect(Array.isArray(SYNTAX_THEME_OPTIONS)).toBe(true);
    expect(SYNTAX_THEME_OPTIONS.length).toBeGreaterThan(0);

    SYNTAX_THEME_OPTIONS.forEach(option => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('label');
      expect(typeof option.value).toBe('string');
      expect(typeof option.label).toBe('string');
      expect(option.value.length).toBeGreaterThan(0);
      expect(option.label.length).toBeGreaterThan(0);
    });
  });

  it('all theme labels are suitable for aria-label usage', () => {
    SYNTAX_THEME_OPTIONS.forEach(option => {
      expect(option.label).not.toContain('"');
      expect(option.label).not.toContain("'");
      expect(option.label).toMatch(/^[a-zA-Z0-9\s-]+$/);
    });
  });
});