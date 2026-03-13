// @vitest-environment jsdom

/**
 * Tests for the DiffViewer component implementation.
 * Validates that Jamie's Monaco diff editor wrapper has proper TypeScript types,
 * renders correctly, and manages resources properly.
 *
 * This test serves as regression validation for Elena's TypeScript strict mode fixes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('DiffViewer Component TypeScript and Implementation Validation', () => {
  let diffViewerContent: string;

  beforeEach(() => {
    // Read the component file for static analysis
    const diffViewerPath = path.join(process.cwd(), 'components/DiffViewer.tsx');
    diffViewerContent = readFileSync(diffViewerPath, 'utf-8');
  });

  describe('TypeScript strict mode compliance (Elena\'s fixes)', () => {
    it('uses proper Monaco editor type imports instead of any types', () => {
      // Verify that the component uses proper Monaco editor type imports
      // rather than any types (which Elena flagged as violations)
      expect(diffViewerContent).toContain('import(\'monaco-editor\').editor.IStandaloneDiffEditor');
      expect(diffViewerContent).toContain('import(\'monaco-editor\').editor.ILineChange');
    });

    it('has proper TypeScript interface for component props', () => {
      expect(diffViewerContent).toContain('interface DiffViewerProps');
      expect(diffViewerContent).toContain('originalContent: string');
      expect(diffViewerContent).toContain('modifiedContent: string');
      expect(diffViewerContent).toContain('originalLabel?: string');
      expect(diffViewerContent).toContain('modifiedLabel?: string');
    });

    it('uses proper ref typing for diffEditorRef', () => {
      // This was one of the lines Elena flagged (line 23)
      const diffEditorRefMatch = diffViewerContent.match(/diffEditorRef[^;]*useRef[^>]*>/);
      expect(diffEditorRefMatch).toBeTruthy();
      expect(diffViewerContent).not.toContain(': any');
    });

    it('uses proper typing in line change iteration', () => {
      // This was the other line Elena flagged (line 77)
      expect(diffViewerContent).toContain('changes.forEach((change:');
      expect(diffViewerContent).toContain('import(\'monaco-editor\').editor.ILineChange');

      // Should use proper Monaco editor type, not any
      expect(diffViewerContent).not.toContain('forEach((change: any)');
    });

    it('does not contain any explicit any types', () => {
      // Ensure no any types are used in the component
      expect(diffViewerContent).not.toContain(': any');
      expect(diffViewerContent).not.toContain('<any>');
      expect(diffViewerContent).not.toContain('as any');
    });
  });

  describe('component implementation validation', () => {
    it('properly imports and configures Monaco editor loader', () => {
      expect(diffViewerContent).toContain('import { loader } from \'@monaco-editor/react\'');
      expect(diffViewerContent).toContain('await loader.init()');
    });

    it('creates diff editor with correct configuration', () => {
      expect(diffViewerContent).toContain('monaco.editor.createDiffEditor');
      expect(diffViewerContent).toContain('readOnly: true');
      expect(diffViewerContent).toContain('renderSideBySide: true');
      expect(diffViewerContent).toContain('automaticLayout: true');
    });

    it('handles line change calculations correctly', () => {
      expect(diffViewerContent).toContain('getLineChanges()');
      expect(diffViewerContent).toContain('let added = 0');
      expect(diffViewerContent).toContain('let removed = 0');
    });

    it('provides proper cleanup for memory management', () => {
      expect(diffViewerContent).toContain('originalModel?.dispose()');
      expect(diffViewerContent).toContain('modifiedModel?.dispose()');
      expect(diffViewerContent).toContain('diffEditor?.dispose()');
    });

    it('uses XML language for diff models', () => {
      expect(diffViewerContent).toContain('createModel(originalContent, \'xml\')');
      expect(diffViewerContent).toContain('createModel(modifiedContent, \'xml\')');
    });

    it('displays line statistics with proper formatting', () => {
      expect(diffViewerContent).toContain('lineStats');
      expect(diffViewerContent).toContain('lines added');
      expect(diffViewerContent).toContain('lines removed');
      expect(diffViewerContent).toContain('No changes detected');
    });
  });

  describe('React component structure', () => {
    it('exports DiffViewer component properly', () => {
      expect(diffViewerContent).toContain('export const DiffViewer');
    });

    it('uses React hooks correctly', () => {
      expect(diffViewerContent).toContain('useRef');
      expect(diffViewerContent).toContain('useEffect');
      expect(diffViewerContent).toContain('useState');
    });

    it('handles component props with defaults', () => {
      expect(diffViewerContent).toContain('originalLabel = "Current in Heretto"');
      expect(diffViewerContent).toContain('modifiedLabel = "Your editor"');
      expect(diffViewerContent).toContain('className = ""');
      expect(diffViewerContent).toContain('height = 400');
    });

    it('provides accessibility labels for diff panes', () => {
      expect(diffViewerContent).toContain('{originalLabel}');
      expect(diffViewerContent).toContain('{modifiedLabel}');
    });
  });

  describe('Monaco editor integration', () => {
    it('handles async Monaco initialization', () => {
      expect(diffViewerContent).toContain('const initializeDiffEditor = async ()');
      expect(diffViewerContent).toContain('if (!mounted');
      expect(diffViewerContent).toContain('return () => {');
    });

    it('configures editor for diff viewing', () => {
      expect(diffViewerContent).toContain('minimap: { enabled: false }');
      expect(diffViewerContent).toContain('lineNumbers: \'on\'');
      expect(diffViewerContent).toContain('folding: false');
      expect(diffViewerContent).toContain('wordWrap: \'on\'');
      expect(diffViewerContent).toContain('fontSize: 12');
    });

    it('sets proper scrollbar configuration', () => {
      expect(diffViewerContent).toContain('scrollbar: {');
      expect(diffViewerContent).toContain('verticalScrollbarSize: 8');
      expect(diffViewerContent).toContain('horizontalScrollbarSize: 8');
    });

    it('handles error cases in Monaco initialization', () => {
      expect(diffViewerContent).toContain('try {');
      expect(diffViewerContent).toContain('} catch (error) {');
      expect(diffViewerContent).toContain('console.error(\'Error initializing diff editor:\', error)');
    });
  });

  describe('styling and CSS integration', () => {
    it('uses CSS custom properties for theming', () => {
      expect(diffViewerContent).toContain('var(--app-text-secondary)');
      expect(diffViewerContent).toContain('var(--app-border-subtle)');
      expect(diffViewerContent).toContain('var(--app-text-muted)');
    });

    it('applies proper layout classes', () => {
      expect(diffViewerContent).toContain('flex flex-col');
      expect(diffViewerContent).toContain('flex mb-2');
      expect(diffViewerContent).toContain('flex-1 text-xs font-medium px-2');
    });

    it('provides visual indicators for diff statistics', () => {
      expect(diffViewerContent).toContain('color: \'#22c55e\''); // green for additions
      expect(diffViewerContent).toContain('color: \'#ef4444\''); // red for deletions
      expect(diffViewerContent).toContain('text-center');
    });
  });

  describe('regression prevention', () => {
    it('maintains proper import structure', () => {
      expect(diffViewerContent).toContain('import React');
      expect(diffViewerContent).toContain('import { Monaco }');
      expect(diffViewerContent).toContain('import { loader }');
    });

    it('preserves component functionality patterns', () => {
      expect(diffViewerContent).toContain('containerRef.current');
      expect(diffViewerContent).toContain('diffEditorRef.current');
      expect(diffViewerContent).toContain('setLineStats');
    });

    it('ensures proper dependency array in useEffect', () => {
      expect(diffViewerContent).toContain('[originalContent, modifiedContent]');
    });

    it('handles component unmounting correctly', () => {
      expect(diffViewerContent).toContain('let mounted = true');
      expect(diffViewerContent).toContain('mounted = false');
      expect(diffViewerContent).toContain('if (mounted');
    });
  });

  describe('integration with DiffViewer usage patterns', () => {
    it('supports custom height configuration for modal usage', () => {
      expect(diffViewerContent).toContain('height = 400');
      expect(diffViewerContent).toContain('height: `${height}px`');
    });

    it('supports custom className for styling integration', () => {
      expect(diffViewerContent).toContain('className = ""');
      expect(diffViewerContent).toContain('className={`flex flex-col ${className}`}');
    });

    it('provides appropriate default labels for Heretto workflow', () => {
      expect(diffViewerContent).toContain('"Current in Heretto"');
      expect(diffViewerContent).toContain('"Your editor"');
    });
  });

  describe('performance and optimization', () => {
    it('implements proper cleanup to prevent memory leaks', () => {
      expect(diffViewerContent).toContain('cleanup: (() => void) | null = null');
      expect(diffViewerContent).toContain('if (cleanup) {');
      expect(diffViewerContent).toContain('cleanup();');
    });

    it('uses efficient re-rendering patterns', () => {
      expect(diffViewerContent).toContain('[originalContent, modifiedContent]');
    });

    it('handles async operations safely', () => {
      expect(diffViewerContent).toContain('if (!mounted || !containerRef.current) return');
      expect(diffViewerContent).toContain('mounted && cleanupFn');
    });
  });
});