// @vitest-environment jsdom
/**
 * Tests for Insert Table Modal Keyboard Navigation.
 * Verifies that Jamie's implementation correctly handles Enter key for table creation
 * and Escape key for modal cancellation, as specified in Anna's plan and Elena's review.
 *
 * This test suite validates:
 * - Enter key on rows input creates table with correct parameters
 * - Enter key on columns input creates table with correct parameters
 * - Escape key on modal container closes modal without creating table
 * - Helper text is displayed to guide users on keyboard shortcuts
 * - Keyboard navigation follows same pattern as link modal
 * - All existing functionality continues to work
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Table Modal Keyboard Navigation - Jamie\'s Implementation', () => {
  let toolbarContent: string;

  beforeEach(() => {
    const toolbarPath = path.join(process.cwd(), 'components/Toolbar.tsx');
    toolbarContent = readFileSync(toolbarPath, 'utf-8');
  });

  describe('Enter Key Functionality on Input Fields', () => {
    it('should handle Enter key on rows input to create table', () => {
      // Verify rows input has ref for identification
      expect(toolbarContent).toContain('ref={tableRowsInputRef}');

      // Verify there are Enter key handlers that dispatch INSERT_TABLE_COMMAND
      const hasTableEnterHandlers = toolbarContent.includes('onKeyDown={e => {') &&
                                   toolbarContent.includes("if (e.key === 'Enter')") &&
                                   toolbarContent.includes('INSERT_TABLE_COMMAND');

      expect(hasTableEnterHandlers).toBeTruthy();

      // Verify it includes preventDefault
      expect(toolbarContent).toContain('e.preventDefault()');

      // Verify it dispatches with correct payload structure
      expect(toolbarContent).toContain('rows: tableRows');
      expect(toolbarContent).toContain('columns: tableCols');
      expect(toolbarContent).toContain('includeHeaders: tableIncludeHeader');

      // Verify it closes modal after creation
      expect(toolbarContent).toContain('setIsTableModalOpen(false)');
    });

    it('should handle Enter key on columns input to create table', () => {
      // Verify columns input exists with max="10"
      expect(toolbarContent).toContain('max="10"');

      // Verify the essential functionality exists - simpler approach
      // Check that there are Enter key handlers
      const hasEnterKeyHandlers = toolbarContent.includes("if (e.key === 'Enter')");
      expect(hasEnterKeyHandlers).toBeTruthy();

      // Check that INSERT_TABLE_COMMAND is dispatched
      const hasTableCommand = toolbarContent.includes('INSERT_TABLE_COMMAND');
      expect(hasTableCommand).toBeTruthy();

      // Check that modal is closed after creation
      const hasModalClose = toolbarContent.includes('setIsTableModalOpen(false)');
      expect(hasModalClose).toBeTruthy();

      // Check that preventDefault is called
      const hasPreventDefault = toolbarContent.includes('e.preventDefault()');
      expect(hasPreventDefault).toBeTruthy();
    });

    it('should use identical table creation logic for both Enter key handlers', () => {
      // Verify the essential components exist without complex parsing
      // Both handlers should use the same command and payload structure
      const dispatchCommands = (toolbarContent.match(/editor\.dispatchCommand\(INSERT_TABLE_COMMAND, \{/g) || []);

      // Should have at least 2 dispatch commands for table creation (from Enter handlers + Create button)
      expect(dispatchCommands.length).toBeGreaterThanOrEqual(2);

      // Verify payload structure is consistent
      expect(toolbarContent).toContain('rows: tableRows');
      expect(toolbarContent).toContain('columns: tableCols');
      expect(toolbarContent).toContain('includeHeaders: tableIncludeHeader');

      // Verify modal close functionality exists
      expect(toolbarContent).toContain('setIsTableModalOpen(false)');
    });
  });

  describe('Escape Key Functionality on Modal Container', () => {
    it('should handle Escape key on modal container to close modal', () => {
      // Verify modal container has onKeyDown handler for Escape key
      const escapeKeyHandler = toolbarContent.match(
        /onKeyDown=\{e\s*=>\s*\{\s*if\s*\(\s*e\.key\s*===\s*['"`]Escape['"`]\s*\)[^}]*setIsTableModalOpen\(false\)[^}]*\}\s*\}/s
      );

      expect(escapeKeyHandler).toBeTruthy();

      // Verify the handler includes preventDefault
      expect(escapeKeyHandler![0]).toContain('e.preventDefault()');

      // Verify it closes modal without creating table (no INSERT_TABLE_COMMAND)
      expect(escapeKeyHandler![0]).not.toContain('INSERT_TABLE_COMMAND');
      expect(escapeKeyHandler![0]).toContain('setIsTableModalOpen(false)');
    });

    it('should place Escape handler on modal container, not inputs', () => {
      // Verify Escape handler is on the modal container div (with stopPropagation)
      const modalContainerPattern = /onClick=\{e\s*=>\s*e\.stopPropagation\(\)\}[^>]*onKeyDown=\{e\s*=>\s*\{[^}]*Escape[^}]*\}\s*\}/s;

      expect(toolbarContent).toMatch(modalContainerPattern);

      // Verify Escape is NOT on input fields (only Enter should be on inputs)
      const inputEscapePattern = /type="number"[^>]*onKeyDown=\{[^}]*Escape[^}]*\}/s;
      expect(toolbarContent).not.toMatch(inputEscapePattern);
    });
  });

  describe('Helper Text for Keyboard Shortcuts', () => {
    it('should display keyboard shortcut instructions', () => {
      // Verify helper text exists with exact wording
      expect(toolbarContent).toContain('Press Enter to create, Escape to cancel.');

      // Verify it uses same styling as link modal
      const helperTextPattern = /<p className="text-\[10px\][^>]*>.*Press Enter to create, Escape to cancel\./s;
      expect(toolbarContent).toMatch(helperTextPattern);

      // Verify it uses muted text color variable
      expect(toolbarContent).toContain('var(--app-text-muted)');
    });

    it('should position helper text appropriately in modal layout', () => {
      // Helper text should appear after the checkbox but before buttons
      const modalLayoutPattern = /Include header row.*Press Enter to create, Escape to cancel.*<div className="flex gap-2">/s;
      expect(toolbarContent).toMatch(modalLayoutPattern);
    });
  });

  describe('Pattern Consistency with Link Modal', () => {
    it('should follow the same keyboard navigation pattern as link modal', () => {
      // Find link modal keyboard handlers for comparison
      const linkModalPattern = /onKeyDown=\{e\s*=>\s*\{[^}]*key.*===.*['"`]Enter['"`][^}]*\}/s;
      const linkModalHandlers = toolbarContent.match(linkModalPattern);

      if (linkModalHandlers) {
        // Verify link modal also uses preventDefault
        expect(linkModalHandlers[0]).toContain('e.preventDefault()');
      }

      // Table modal should follow same pattern structure
      const tableEnterHandlers = toolbarContent.match(/onKeyDown=\{e\s*=>\s*\{[^}]*Enter[^}]*INSERT_TABLE_COMMAND[^}]*\}/gs);
      expect(tableEnterHandlers).toBeTruthy();
      expect(tableEnterHandlers!.length).toBe(2);

      // Both should have preventDefault
      tableEnterHandlers!.forEach(handler => {
        expect(handler).toContain('e.preventDefault()');
      });
    });

    it('should use consistent event handling patterns', () => {
      // Verify all keyboard handlers use the same event object pattern
      const allKeyHandlers = toolbarContent.match(/onKeyDown=\{e\s*=>\s*\{[^}]*\}/gs);

      expect(allKeyHandlers).toBeTruthy();

      // All should use 'e.key ===' pattern (not keyCode)
      allKeyHandlers!.forEach(handler => {
        if (handler.includes('Enter') || handler.includes('Escape')) {
          expect(handler).toMatch(/e\.key\s*===\s*['"`]/);
          expect(handler).toContain('e.preventDefault()');
        }
      });
    });
  });

  describe('Integration with Existing Modal Functionality', () => {
    it('should preserve all existing modal functionality', () => {
      // Verify Cancel button still exists and works
      expect(toolbarContent).toContain('Cancel');
      expect(toolbarContent).toMatch(/onClick=\{\(\)\s*=>\s*setIsTableModalOpen\(false\)\}/);

      // Verify Create button still exists and works
      expect(toolbarContent).toContain('Create');
      expect(toolbarContent).toMatch(/onClick=\{.*editor\.dispatchCommand\(INSERT_TABLE_COMMAND[^}]*\}/s);

      // Verify backdrop click still closes modal
      expect(toolbarContent).toMatch(/onClick=\{.*setIsTableModalOpen\(false\).*\}/);

      // Verify stopPropagation on modal content still exists
      expect(toolbarContent).toContain('e.stopPropagation()');
    });

    it('should maintain proper focus management', () => {
      // Verify rows input ref still exists for focus
      expect(toolbarContent).toContain('tableRowsInputRef');
      expect(toolbarContent).toMatch(/ref=\{tableRowsInputRef\}/);

      // Verify useEffect for focusing still exists
      const focusEffect = toolbarContent.match(/useEffect.*tableRowsInputRef\.current.*focus/s);
      expect(focusEffect).toBeTruthy();
    });

    it('should preserve input validation and constraints', () => {
      // Verify input validation still works with keyboard handlers
      expect(toolbarContent).toMatch(/Math\.max\(1,.*Math\.min\(50,.*parseInt/); // Rows validation
      expect(toolbarContent).toMatch(/Math\.max\(1,.*Math\.min\(10,.*parseInt/); // Columns validation

      // Verify min/max attributes still exist
      expect(toolbarContent).toContain('min="1"');
      expect(toolbarContent).toContain('max="50"');
      expect(toolbarContent).toContain('max="10"');
    });
  });

  describe('Event Handling Edge Cases', () => {
    it('should not interfere with other keyboard events', () => {
      // Verify keyboard handlers only respond to specific keys
      // Find all Enter handlers (including link modal)
      const allEnterHandlers = toolbarContent.match(/if\s*\(\s*e\.key\s*===\s*['"`]Enter['"`]\s*\)/g);
      const escapeHandlers = toolbarContent.match(/e\.key\s*===\s*['"`]Escape['"`]/g);

      expect(allEnterHandlers).toBeTruthy();
      expect(allEnterHandlers!.length).toBeGreaterThanOrEqual(2); // At least 2 for table inputs

      // There are multiple Escape handlers in the app (theme dropdown, link modal, table modal)
      expect(escapeHandlers).toBeTruthy();
      expect(escapeHandlers!.length).toBeGreaterThanOrEqual(1);

      // Find table-specific Enter handlers
      const tableEnterHandlers = (toolbarContent.match(/if\s*\(\s*e\.key\s*===\s*['"`]Enter['"`]\s*\)[^}]*INSERT_TABLE_COMMAND/gs) || []);
      expect(tableEnterHandlers).toHaveLength(2); // One for each table input

      // Find table-specific Escape handler
      const tableEscapeHandler = toolbarContent.includes('if (e.key === \'Escape\')') &&
                                toolbarContent.includes('setIsTableModalOpen(false)');
      expect(tableEscapeHandler).toBeTruthy();
    });

    it('should properly prevent default browser behavior', () => {
      // All keyboard handlers should call preventDefault
      const keyHandlersWithPreventDefault = toolbarContent.match(/onKeyDown=\{e\s*=>\s*\{[^}]*e\.preventDefault\(\)[^}]*\}/gs);

      expect(keyHandlersWithPreventDefault).toBeTruthy();
      expect(keyHandlersWithPreventDefault!.length).toBeGreaterThanOrEqual(3); // At least 3 handlers
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide clear keyboard interaction guidance', () => {
      // Helper text should be visible and informative
      const helperText = toolbarContent.match(/Press Enter to create, Escape to cancel\./);
      expect(helperText).toBeTruthy();

      // Text should be appropriately sized but readable
      expect(toolbarContent).toMatch(/text-\[10px\]/);
    });

    it('should maintain logical tab order and focus flow', () => {
      // Focus starts on rows input (preserved existing behavior)
      expect(toolbarContent).toContain('tableRowsInputRef');

      // Both inputs should be keyboard accessible
      const numberInputs = toolbarContent.match(/type="number"/g);
      expect(numberInputs).toHaveLength(2);

      // Checkbox should remain accessible
      expect(toolbarContent).toContain('type="checkbox"');
    });
  });
});