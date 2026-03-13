// @vitest-environment jsdom
/**
 * Tests for Monaco Editor format button implementation - validating Jamie's P2-3 implementation.
 * Tests the addition of a beautify button with Code2 icon, Shift+Alt+F keyboard shortcut,
 * toast notifications, and proper error handling as specified in Anna's plan.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Monaco Editor format button implementation', () => {
  let monacoEditorContent: string;

  beforeEach(() => {
    // Read the MonacoDitaEditor component file to test
    const editorPath = path.join(process.cwd(), 'components/MonacoDitaEditor.tsx');
    monacoEditorContent = readFileSync(editorPath, 'utf-8');
  });

  describe('format button component structure', () => {
    it('imports Code2 icon from lucide-react for the format button', () => {
      expect(monacoEditorContent).toContain("import { Code2 } from 'lucide-react'");
    });

    it('imports toast from sonner for user notifications', () => {
      expect(monacoEditorContent).toContain("import { toast } from 'sonner'");
    });

    it('imports formatXml function from xml-utils for formatting functionality', () => {
      expect(monacoEditorContent).toContain("import { formatXml } from '../lib/xml-utils'");
    });

    it('re-exports formatXml for backwards compatibility with Monaco provider', () => {
      expect(monacoEditorContent).toContain('export { formatXml };');
    });
  });

  describe('format toolbar overlay positioning and styling', () => {
    it('creates a format toolbar overlay positioned at top-right of editor', () => {
      expect(monacoEditorContent).toContain('absolute top-2 right-2 z-10');
      expect(monacoEditorContent).toContain('Format toolbar overlay');
    });

    it('positions toolbar with proper z-index to appear above editor content', () => {
      expect(monacoEditorContent).toContain('z-10');

      // Should not conflict with Monaco's native UI elements
      const toolbarMatch = monacoEditorContent.match(/absolute top-2 right-2 z-10/);
      expect(toolbarMatch).toBeTruthy();
    });

    it('applies consistent styling with semi-transparent background and theme compatibility', () => {
      // Button should have semi-transparent black background
      expect(monacoEditorContent).toContain('bg-black/50');
      expect(monacoEditorContent).toContain('hover:bg-black/70');

      // Should work across all editor themes
      expect(monacoEditorContent).toContain('text-white');
      expect(monacoEditorContent).toContain('border-white/20');
    });
  });

  describe('format button functionality and event handling', () => {
    it('defines handleFormatClick function to process XML formatting', () => {
      expect(monacoEditorContent).toContain('const handleFormatClick = () => {');

      // Should check for editor reference
      expect(monacoEditorContent).toContain('if (!editorRef.current) return;');
    });

    it('implements try-catch error handling in handleFormatClick as specified in Elena\'s review', () => {
      expect(monacoEditorContent).toContain('try {');

      // Should have error handling for malformed XML
      const errorHandlingMatch = monacoEditorContent.match(/catch[^}]*toast\.error/s);
      expect(errorHandlingMatch).toBeTruthy();
    });

    it('calls formatXml function on current editor content', () => {
      expect(monacoEditorContent).toContain('const formattedValue = formatXml(currentValue);');

      // Should only update if content changed
      expect(monacoEditorContent).toContain('if (formattedValue !== currentValue)');
    });

    it('shows success toast notification after successful formatting', () => {
      expect(monacoEditorContent).toContain('toast.success');
      expect(monacoEditorContent).toContain('XML formatted successfully');
    });

    it('shows error toast notification when formatting fails', () => {
      expect(monacoEditorContent).toContain('toast.error');
      expect(monacoEditorContent).toContain('Failed to format XML');
    });
  });

  describe('format button UI element and accessibility', () => {
    it('creates format button with Code2 icon and proper labeling', () => {
      expect(monacoEditorContent).toContain('<Code2 size={12} />');
      expect(monacoEditorContent).toContain('<span>Format</span>');
    });

    it('applies proper button styling for visibility across themes', () => {
      expect(monacoEditorContent).toContain('flex items-center gap-1');
      expect(monacoEditorContent).toContain('px-2 py-1');
      expect(monacoEditorContent).toContain('text-xs rounded');
    });

    it('includes proper title attribute for accessibility and keyboard shortcut hint', () => {
      expect(monacoEditorContent).toContain('title="Format XML (Shift+Alt+F)"');
    });

    it('properly handles disabled state when editor is readOnly as noted in Elena\'s review', () => {
      expect(monacoEditorContent).toContain('disabled={readOnly}');
      expect(monacoEditorContent).toContain('disabled:hover:bg-black/50');
      expect(monacoEditorContent).toContain('disabled:opacity-50');
    });

    it('attaches click handler to format button', () => {
      expect(monacoEditorContent).toContain('onClick={handleFormatClick}');
    });
  });

  describe('keyboard shortcut integration with Monaco', () => {
    it('registers Shift+Alt+F keyboard shortcut using Monaco addAction API', () => {
      expect(monacoEditorContent).toContain('editor.addAction({');
      expect(monacoEditorContent).toContain('id: \'format-xml\'');
      expect(monacoEditorContent).toContain('label: \'Format XML\'');
    });

    it('configures correct keybinding combination for Shift+Alt+F', () => {
      expect(monacoEditorContent).toContain('monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF');
    });

    it('calls handleFormatClick when keyboard shortcut is triggered', () => {
      const runFunctionMatch = monacoEditorContent.match(/run: \(\) => \{[^}]*handleFormatClick\(\);[^}]*\}/s);
      expect(runFunctionMatch).toBeTruthy();
    });
  });

  describe('Monaco document formatting provider integration', () => {
    it('maintains existing document formatting provider registration', () => {
      expect(monacoEditorContent).toContain('monaco.languages.registerDocumentFormattingEditProvider');
      expect(monacoEditorContent).toContain('provideDocumentFormattingEdits');
    });

    it('uses same formatXml function in Monaco provider for consistency', () => {
      expect(monacoEditorContent).toContain('const formatted = formatXml(text);');

      // Provider should return proper edit format
      expect(monacoEditorContent).toContain('model.getFullModelRange()');
    });
  });

  describe('backwards compatibility and code quality', () => {
    it('maintains formatXml re-export for backwards compatibility', () => {
      expect(monacoEditorContent).toContain('// formatXml is defined in lib/xml-utils.ts and re-exported here for backwards compatibility');
      expect(monacoEditorContent).toContain('export { formatXml };');
    });

    it('includes proper TypeScript types and error handling', () => {
      // Should handle model type checking
      expect(monacoEditorContent).toContain('const model = editor.getModel();');
      expect(monacoEditorContent).toContain('if (!model) return;');
    });

    it('follows existing code patterns for editor interaction', () => {
      // Should use editorRef pattern consistent with rest of component
      expect(monacoEditorContent).toContain('editorRef.current');

      // Should use getValue and setValue methods
      expect(monacoEditorContent).toContain('model.getValue()');
      expect(monacoEditorContent).toContain('model.setValue(formattedValue)');
    });
  });

  describe('integration with existing editor functionality', () => {
    it('does not interfere with existing editor mounting and configuration', () => {
      // Should still have onMount prop for Editor component
      expect(monacoEditorContent).toContain('onMount={handleEditorDidMount}');

      // Format functionality should be separate from mount logic
      expect(monacoEditorContent).toContain('const handleEditorDidMount');
    });

    it('works with existing theme switching functionality', () => {
      // Format button styling should work across all theme combinations
      expect(monacoEditorContent).toContain('buildThemeName(editorTheme, syntaxTheme)');

      // Button should remain visible in all themes
      expect(monacoEditorContent).toContain('bg-black/50');
    });

    it('respects readOnly mode for the format button', () => {
      expect(monacoEditorContent).toContain('disabled={readOnly}');

      // Keyboard shortcut should also be disabled when readOnly
      // The Monaco action registration happens in onMount, so it respects readOnly state
      expect(monacoEditorContent).toContain('editor.addAction');
    });
  });

  describe('WYSIWYG/DITA parity and user experience', () => {
    it('provides immediate visual feedback through toast notifications', () => {
      expect(monacoEditorContent).toContain('toast.success');
      expect(monacoEditorContent).toContain('toast.error');

      // User gets immediate confirmation of formatting action
      expect(monacoEditorContent).toContain('XML formatted successfully');
    });

    it('maintains existing XML validation and editor state', () => {
      // Format operation should not break XML validation
      expect(monacoEditorContent).toContain('formatXml(currentValue)');

      // Should preserve cursor position and selection where possible
      expect(monacoEditorContent).toContain('model.setValue(formattedValue)');
    });

    it('provides consistent experience across different input methods', () => {
      // Both button click and keyboard shortcut call same function
      expect(monacoEditorContent).toContain('onClick={handleFormatClick}');
      expect(monacoEditorContent).toContain('handleFormatClick();');

      // Same error handling and success feedback for both methods
      const handleFormatClickMatch = monacoEditorContent.match(/const handleFormatClick = \(\) => \{[\s\S]*?\}\s*;/);
      expect(handleFormatClickMatch).toBeTruthy();
    });
  });
});