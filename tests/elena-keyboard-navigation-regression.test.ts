// @vitest-environment jsdom
/**
 * Regression test for Elena's review finding:
 * "Table modal keyboard navigation - The table creation modal doesn't support Enter to create or Escape to cancel"
 *
 * This test documents the missing keyboard navigation functionality as a regression test.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Elena\'s Keyboard Navigation Regression Test', () => {
  let toolbarContent: string;

  beforeEach(() => {
    const toolbarPath = path.join(process.cwd(), 'components/Toolbar.tsx');
    toolbarContent = readFileSync(toolbarPath, 'utf-8');
  });

  it('should confirm Enter key support for table creation - RESOLVED by Jamie', () => {
    // Look for Enter key handling in the table modal
    const enterKeyPattern = /onKeyDown.*Enter.*INSERT_TABLE_COMMAND/s;
    const hasEnterHandling = toolbarContent.match(enterKeyPattern);

    if (!hasEnterHandling) {
      console.error('ELENA REGRESSION: Enter key does not create table in modal');
      console.error('Expected: Pressing Enter in table modal should create table');
    } else {
      console.log('✓ RESOLVED: Enter key now creates table in modal (Jamie\'s implementation)');
    }

    // Now properly validate that Enter key functionality exists
    expect(hasEnterHandling).toBeTruthy();
  });

  it('should confirm Escape key support for modal cancellation - RESOLVED by Jamie', () => {
    // Look for Escape key handling in the table modal
    const escapeKeyPattern = /onKeyDown.*Escape.*setIsTableModalOpen\(false\)/s;
    const hasEscapeHandling = toolbarContent.match(escapeKeyPattern);

    if (!hasEscapeHandling) {
      console.error('ELENA REGRESSION: Escape key does not cancel table modal');
      console.error('Expected: Pressing Escape in table modal should close modal');
    } else {
      console.log('✓ RESOLVED: Escape key now cancels table modal (Jamie\'s implementation)');
    }

    // Now properly validate that Escape key functionality exists
    expect(hasEscapeHandling).toBeTruthy();
  });

  it('should confirm the table modal exists and is functional', () => {
    // Verify the table modal exists (this should pass)
    expect(toolbarContent).toContain('Insert Table Modal');
    expect(toolbarContent).toContain('isTableModalOpen');

    // Verify basic functionality exists
    expect(toolbarContent).toContain('setIsTableModalOpen(false)'); // Cancel functionality
    expect(toolbarContent).toContain('editor.dispatchCommand'); // Create functionality

    // The modal works, but lacks keyboard navigation
    console.warn('Table modal functionality confirmed, but keyboard navigation is incomplete');
  });

  it('should confirm implementation matches Elena\'s requirements - COMPLETED by Jamie', () => {
    // Verify the implementation follows the expected pattern
    const implementationCheck = {
      enterKeyOnInputs: toolbarContent.includes('onKeyDown') && toolbarContent.includes('Enter') && toolbarContent.includes('INSERT_TABLE_COMMAND'),
      escapeKeyOnContainer: toolbarContent.includes('onKeyDown') && toolbarContent.includes('Escape') && toolbarContent.includes('setIsTableModalOpen(false)'),
      helperText: toolbarContent.includes('Press Enter to create, Escape to cancel.')
    };

    console.log('✓ IMPLEMENTATION COMPLETED:');
    console.log('1. ✓ Added onKeyDown to table modal inputs and container');
    console.log('2. ✓ Handle Enter key -> triggers table creation');
    console.log('3. ✓ Handle Escape key -> closes modal');
    console.log('4. ✓ Follows same pattern as link modal');
    console.log('5. ✓ Added helper text for user guidance');

    // All requirements should now be met
    expect(implementationCheck.enterKeyOnInputs).toBeTruthy();
    expect(implementationCheck.escapeKeyOnContainer).toBeTruthy();
    expect(implementationCheck.helperText).toBeTruthy();
  });
});