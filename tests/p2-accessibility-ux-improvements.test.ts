// @vitest-environment jsdom
/**
 * Tests for P2 accessibility and UX improvements implementation.
 * Validates Jamie's implementation of empty state action button for Heretto folder browser,
 * aria-label for Format XML button, and specific error message for XML formatting failures.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('P2 accessibility and UX improvements', () => {
  let herettoBrowserContent: string;
  let monacoEditorContent: string;
  let ditaArchitectContent: string;

  beforeEach(() => {
    // Read component files to test
    const herettoBrowserPath = path.join(process.cwd(), 'components/HerettoBrowserModal.tsx');
    const monacoEditorPath = path.join(process.cwd(), 'components/MonacoDitaEditor.tsx');
    const ditaArchitectPath = path.join(process.cwd(), 'dita-architect.tsx');

    herettoBrowserContent = readFileSync(herettoBrowserPath, 'utf-8');
    monacoEditorContent = readFileSync(monacoEditorPath, 'utf-8');
    ditaArchitectContent = readFileSync(ditaArchitectPath, 'utf-8');
  });

  describe('P2-5: Empty state action button for Heretto folder browser', () => {
    it('displays actionable empty folder state with clear message and create button', () => {
      expect(herettoBrowserContent).toContain('No topics in this folder');

      // Should have conditional rendering for the create button
      expect(herettoBrowserContent).toContain('{onCreateNew && (');
      expect(herettoBrowserContent).toContain('Create new topic');
    });

    it('styles the create button consistently with existing UI patterns', () => {
      expect(herettoBrowserContent).toContain('bg-dita-600');
      expect(herettoBrowserContent).toContain('hover:bg-dita-500');
      expect(herettoBrowserContent).toContain('text-white');
      expect(herettoBrowserContent).toContain('transition-colors');
    });

    it('properly handles button click with onCreateNew prop function', () => {
      expect(herettoBrowserContent).toContain('onClick={onCreateNew}');

      // Button should only render when prop is provided
      expect(herettoBrowserContent).toContain('{onCreateNew && (');
    });

    it('positions empty state in center with proper spacing', () => {
      expect(herettoBrowserContent).toContain('flex flex-col items-center justify-center h-full py-12');
      expect(herettoBrowserContent).toContain('mb-4');
    });

    it('displays empty state only when items length is zero and not browsing', () => {
      // Should check for items.length === 0 condition
      expect(herettoBrowserContent).toContain('items.length === 0');

      // Should not show during browsing state
      expect(herettoBrowserContent).toContain('browsing ?');
    });
  });

  describe('P2-5: Integration with main application modal flow', () => {
    it('passes onCreateNew prop to HerettoBrowserModal that sequences modal transitions', () => {
      expect(ditaArchitectContent).toContain('onCreateNew={() => { setIsHerettoBrowserOpen(false); setIsNewTopicModalOpen(true); }}');
    });

    it('maintains HerettoBrowserModal component usage with all required props', () => {
      expect(ditaArchitectContent).toContain('<HerettoBrowserModal');
      expect(ditaArchitectContent).toContain('onCreateNew=');
      expect(ditaArchitectContent).toContain('onClose=');
    });

    it('properly sequences modal state changes to avoid UI flicker', () => {
      // Should close Heretto browser first, then open new topic modal
      const onCreateNewMatch = ditaArchitectContent.match(/onCreateNew=\{[^}]*setIsHerettoBrowserOpen\(false\)[^}]*setIsNewTopicModalOpen\(true\)[^}]*\}/);
      expect(onCreateNewMatch).toBeTruthy();
    });
  });

  describe('P2-12: Format XML button aria-label for screen reader accessibility', () => {
    it('includes aria-label attribute on Format XML button for screen reader support', () => {
      expect(monacoEditorContent).toContain('aria-label="Format XML"');
    });

    it('maintains consistency with existing title attribute', () => {
      expect(monacoEditorContent).toContain('title="Format XML (Shift+Alt+F)"');

      // Both attributes should be on the same button element
      const formatButtonMatch = monacoEditorContent.match(/title="Format XML \(Shift\+Alt\+F\)"[^>]*aria-label="Format XML"/s);
      expect(formatButtonMatch).toBeTruthy();
    });

    it('preserves existing button functionality and styling', () => {
      expect(monacoEditorContent).toContain('onClick={handleFormatClick}');
      expect(monacoEditorContent).toContain('disabled={readOnly}');
      expect(monacoEditorContent).toContain('<Code2 size={12} />');
    });

    it('follows accessibility best practices with both title and aria-label', () => {
      // Title provides tooltip, aria-label provides screen reader description
      const buttonPattern = /title="[^"]*Format XML[^"]*"[^>]*aria-label="Format XML"/;
      expect(monacoEditorContent).toMatch(buttonPattern);
    });
  });

  describe('P2-13: Specific error message for XML formatting failures', () => {
    it('displays actionable error message when XML formatting fails', () => {
      expect(monacoEditorContent).toContain('Failed to format XML: Check for syntax errors');
    });

    it('shows error message through toast notification system', () => {
      expect(monacoEditorContent).toContain('toast.error(\'Failed to format XML: Check for syntax errors\')');
    });

    it('maintains proper error handling in try-catch block', () => {
      // Should be in catch block of handleFormatClick function
      const errorHandlingMatch = monacoEditorContent.match(/catch[^}]*toast\.error\([^)]*Failed to format XML: Check for syntax errors[^)]*\)/s);
      expect(errorHandlingMatch).toBeTruthy();
    });

    it('provides more specific guidance than generic error messages', () => {
      // Should not contain generic "Failed to format XML" without guidance
      expect(monacoEditorContent).not.toContain('Failed to format XML\')');
      expect(monacoEditorContent).not.toContain('Failed to format XML");');

      // Should contain the specific guidance message
      expect(monacoEditorContent).toContain('Check for syntax errors');
    });

    it('logs error details for debugging while showing user-friendly message', () => {
      expect(monacoEditorContent).toContain('console.error(\'XML formatting error:\', error)');

      // Console error should be before toast error in catch block
      const catchBlockMatch = monacoEditorContent.match(/catch[^}]*console\.error[^}]*toast\.error/s);
      expect(catchBlockMatch).toBeTruthy();
    });
  });

  describe('Integration and compatibility verification', () => {
    it('maintains backward compatibility with existing HerettoBrowserModal interface', () => {
      // onCreateNew should be optional to prevent breaking existing usage
      expect(herettoBrowserContent).toContain('onCreateNew?: () => void;');
    });

    it('preserves existing Heretto browser functionality', () => {
      expect(herettoBrowserContent).toContain('browsing');
      expect(herettoBrowserContent).toContain('items');
      expect(herettoBrowserContent).toContain('navigate');
      expect(herettoBrowserContent).toContain('onOpen');
    });

    it('maintains Monaco editor formatting functionality', () => {
      expect(monacoEditorContent).toContain('formatXml');
      expect(monacoEditorContent).toContain('handleFormatClick');
      expect(monacoEditorContent).toContain('toast.success');
    });

    it('does not break existing keyboard shortcut functionality', () => {
      expect(monacoEditorContent).toContain('monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF');
      expect(monacoEditorContent).toContain('handleFormatClick()');
    });
  });

  describe('User experience and WYSIWYG/DITA parity', () => {
    it('provides clear user guidance in empty folder state', () => {
      expect(herettoBrowserContent).toContain('No topics in this folder');

      // Message should be styled with muted text color
      expect(herettoBrowserContent).toContain('var(--app-text-muted)');
    });

    it('ensures accessibility compliance across all interactive elements', () => {
      // Format button should have proper accessibility attributes
      expect(monacoEditorContent).toContain('aria-label="Format XML"');

      // Create button should be properly labeled
      expect(herettoBrowserContent).toContain('Create new topic');
    });

    it('follows established design patterns for button styling and behavior', () => {
      // Create button uses consistent DITA brand colors
      expect(herettoBrowserContent).toContain('bg-dita-600');

      // Format button maintains existing semi-transparent styling
      expect(monacoEditorContent).toContain('bg-black/50');
    });

    it('provides immediate feedback for both success and error states', () => {
      expect(monacoEditorContent).toContain('toast.success(\'XML formatted successfully\')');
      expect(monacoEditorContent).toContain('toast.error(\'Failed to format XML: Check for syntax errors\')');
    });
  });
});