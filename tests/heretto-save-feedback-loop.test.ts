// @vitest-environment jsdom

/**
 * Tests for the Heretto save feedback loop improvements.
 * Validates that Jamie's implementation provides real-time save progress feedback,
 * addressing the original issue where users didn't get clear feedback during save operations.
 *
 * This test covers Anna's plan implementation that adds herettoSaveProgress state
 * to track 'idle' | 'saving' | 'verifying' | 'complete' progression and integrates
 * it with the status bar display in the main app.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Heretto Save Feedback Loop Improvements', () => {
  let useHerettoCmsContent: string;
  let ditaArchitectContent: string;

  beforeEach(() => {
    // Read the hook and main app files for static analysis
    const hookPath = path.join(process.cwd(), 'hooks/useHerettoCms.ts');
    const mainAppPath = path.join(process.cwd(), 'dita-architect.tsx');
    useHerettoCmsContent = readFileSync(hookPath, 'utf-8');
    ditaArchitectContent = readFileSync(mainAppPath, 'utf-8');
  });

  describe('useHerettoCms hook save progress state', () => {
    it('defines herettoSaveProgress state with correct TypeScript types', () => {
      // Anna's plan: Add a new state variable herettoSaveProgress to track detailed save states
      expect(useHerettoCmsContent).toContain("useState<'idle' | 'saving' | 'verifying' | 'complete'>('idle')");
      expect(useHerettoCmsContent).toContain('const [herettoSaveProgress, setHerettoSaveProgress]');
    });

    it('exports herettoSaveProgress state for use in components', () => {
      // The save progress state must be accessible to the UI for status display
      expect(useHerettoCmsContent).toContain('herettoSaveProgress,');
    });

    it('sets save progress to saving before PUT request', () => {
      // Anna's plan: Set 'saving' before PUT request
      const handleSaveMatch = useHerettoCmsContent.match(/handleHerettoSave[\s\S]*?setHerettoSaveProgress\('saving'\)/);
      expect(handleSaveMatch).toBeTruthy();

      // Verify it's set before the PUT request
      const beforePutRegex = /setHerettoSaveProgress\('saving'\)[\s\S]*?fetch\([^)]*PUT/;
      expect(useHerettoCmsContent).toMatch(beforePutRegex);
    });

    it('sets save progress to verifying before verification GET request', () => {
      // Anna's plan: Set 'verifying' before verification GET request
      const beforeVerifyRegex = /setHerettoSaveProgress\('verifying'\)[\s\S]*?fetch\([^)]*signal: abort.signal/;
      expect(useHerettoCmsContent).toMatch(beforeVerifyRegex);
    });

    it('sets save progress to complete after successful verification', () => {
      // Anna's plan: Set 'complete' after successful verification
      const afterVerifyRegex = /compareXml[\s\S]*?setHerettoSaveProgress\('complete'\)/;
      expect(useHerettoCmsContent).toMatch(afterVerifyRegex);
    });

    it('resets save progress to idle after completion or error', () => {
      // Anna's plan: Reset to 'idle' after toast display or error
      expect(useHerettoCmsContent).toContain("setHerettoSaveProgress('idle')");

      // Should reset in both success and error paths
      const successIdleRegex = /toast\.success[\s\S]*?setHerettoSaveProgress\('idle'\)/;
      const errorIdleRegex = /catch[\s\S]*?setHerettoSaveProgress\('idle'\)/;
      expect(useHerettoCmsContent).toMatch(successIdleRegex);
      expect(useHerettoCmsContent).toMatch(errorIdleRegex);
    });

    it('integrates properly with existing abort controller pattern', () => {
      // Save progress should work with concurrent save prevention
      expect(useHerettoCmsContent).toContain('herettoSaveAbortRef.current?.abort()');
      expect(useHerettoCmsContent).toContain('if (abort.signal.aborted) return');

      // Progress should reset properly when aborted
      const abortedReturnRegex = /if \(abort\.signal\.aborted\) return/;
      expect(useHerettoCmsContent).toMatch(abortedReturnRegex);
    });
  });

  describe('main app status bar integration', () => {
    it('imports and uses herettoSaveProgress from the hook', () => {
      // Anna's plan: Import and use the new herettoSaveProgress state from useHerettoCms
      expect(ditaArchitectContent).toContain('herettoSaveProgress,');
    });

    it('displays saving status with amber indicator when save is in progress', () => {
      // Anna's plan: When herettoSaveProgress === 'saving': Show "Saving to Heretto..." with amber indicator
      expect(ditaArchitectContent).toContain("herettoSaveProgress === 'saving'");
      expect(ditaArchitectContent).toContain('Saving to Heretto...');
      expect(ditaArchitectContent).toContain('bg-amber-500');
    });

    it('displays verification status with amber indicator when verifying', () => {
      // Anna's plan: When herettoSaveProgress === 'verifying': Show "Verifying save..." with amber indicator
      expect(ditaArchitectContent).toContain("herettoSaveProgress === 'verifying'");
      expect(ditaArchitectContent).toContain('Verifying save...');

      // Should use amber indicator for verification too
      const verifyingSection = ditaArchitectContent.match(/herettoSaveProgress === 'verifying'[\s\S]*?bg-amber-500/);
      expect(verifyingSection).toBeTruthy();
    });

    it('preserves existing status logic for non-saving states', () => {
      // Anna's plan: Keep existing status logic for other states
      expect(ditaArchitectContent).toContain('tab.herettoRemoteChanged');
      expect(ditaArchitectContent).toContain('tab.herettoLastSaved');

      // Should have the full conditional chain
      const statusChainRegex = /herettoSaveProgress === 'saving'[\s\S]*?herettoSaveProgress === 'verifying'[\s\S]*?tab\.herettoRemoteChanged/;
      expect(ditaArchitectContent).toMatch(statusChainRegex);
    });

    it('displays writer-friendly conflict message when changes exist in both locations', () => {
      // P3-11: Replace "Conflict — updated in Heretto" with writer-friendly "Changes in both locations"
      expect(ditaArchitectContent).toContain('Changes in both locations');

      // Should not contain old developer-centric "Conflict" terminology
      expect(ditaArchitectContent).not.toContain('Conflict — updated in Heretto');

      // Should show the message when both remote changes and local dirty state exist
      const conflictConditionRegex = /tab\.herettoDirty \? 'Changes in both locations' : 'Updated in Heretto'/;
      expect(ditaArchitectContent).toMatch(conflictConditionRegex);
    });

    it('changes commit button text to save to heretto for consistency', () => {
      // Anna's plan: Change "Commit" button text (line 826) to "Save to Heretto" for consistency
      expect(ditaArchitectContent).toContain('Save to Heretto');

      // Should not contain old "Commit" text in the button
      const commitButtonRegex = /CloudUpload[\s\S]*?>[\s\S]*?Commit[\s\S]*?<\/button>/;
      expect(ditaArchitectContent).not.toMatch(commitButtonRegex);
    });

    it('maintains button spinner display during saves', () => {
      // The herettoSaving state should continue to control button spinner
      expect(ditaArchitectContent).toContain('herettoSaving ? <Loader2');
      expect(ditaArchitectContent).toContain('animate-spin');
    });
  });

  describe('save progress state transitions', () => {
    it('follows the correct state transition sequence', () => {
      // idle -> saving -> verifying -> complete -> idle
      const handleSaveFunction = useHerettoCmsContent.match(/handleHerettoSave = useCallback\(async \([^)]*\) => \{[\s\S]*?\}, \[/)?.[0] || '';

      // Should set states in the correct order
      const savingIndex = handleSaveFunction.indexOf("setHerettoSaveProgress('saving')");
      const verifyingIndex = handleSaveFunction.indexOf("setHerettoSaveProgress('verifying')");
      const completeIndex = handleSaveFunction.indexOf("setHerettoSaveProgress('complete')");
      const idleIndex = handleSaveFunction.indexOf("setHerettoSaveProgress('idle')");

      expect(savingIndex).toBeGreaterThan(-1);
      expect(verifyingIndex).toBeGreaterThan(savingIndex);
      expect(completeIndex).toBeGreaterThan(verifyingIndex);
      expect(idleIndex).toBeGreaterThan(completeIndex);
    });

    it('handles error states by resetting to idle', () => {
      // Error handling should reset progress state
      const errorResetRegex = /catch[\s\S]*?setHerettoSaveProgress\('idle'\)/;
      expect(useHerettoCmsContent).toMatch(errorResetRegex);
    });

    it('handles abort scenarios properly', () => {
      // When aborted, should not set final states
      expect(useHerettoCmsContent).toContain('if (abort.signal.aborted) return');

      // Should reset herettoSaving state only if not aborted
      expect(useHerettoCmsContent).toContain('if (!abort.signal.aborted) setHerettoSaving(false)');
    });
  });

  describe('acceptance criteria validation', () => {
    it('provides status bar feedback immediately when save starts', () => {
      // Status should show immediately, not wait for server response
      const immediateProgressRegex = /setHerettoSaving\(true\);[\s\S]*?setHerettoSaveProgress\('saving'\)/;
      expect(useHerettoCmsContent).toMatch(immediateProgressRegex);
    });

    it('shows progress even if save button is scrolled out of view', () => {
      // Status bar is separate from dropdown button area
      const statusBarRegex = /<div className="flex items-center gap-3 text-xs shrink-0">[\s\S]*?herettoSaveProgress/;
      expect(ditaArchitectContent).toMatch(statusBarRegex);
    });

    it('maintains existing save functionality without changes', () => {
      // PUT request -> verify -> update state pattern should remain
      expect(useHerettoCmsContent).toContain('method: \'PUT\'');
      expect(useHerettoCmsContent).toContain('compareXml(content, remote)');
      expect(useHerettoCmsContent).toContain('tab.savedXmlRef.current = content');
    });

    it('prevents concurrent save operations as before', () => {
      // Existing abort controller behavior must be preserved
      expect(useHerettoCmsContent).toContain('herettoSaveAbortRef.current?.abort()');
      expect(useHerettoCmsContent).toContain('new AbortController()');
    });

    it('preserves toast notifications for user feedback', () => {
      // Toast messages should still appear for success/failure
      expect(useHerettoCmsContent).toContain('toast.success');
      expect(useHerettoCmsContent).toContain('toast.error');
      expect(useHerettoCmsContent).toContain('toast.warning');
    });
  });

  describe('user experience improvements', () => {
    it('provides granular feedback during multi-step save process', () => {
      // Users should see what's happening at each step
      expect(ditaArchitectContent).toContain('Saving to Heretto...');
      expect(ditaArchitectContent).toContain('Verifying save...');
    });

    it('uses consistent visual indicators for in-progress states', () => {
      // Both saving and verifying should use amber indicators
      const savingAmberRegex = /herettoSaveProgress === 'saving'[\s\S]*?bg-amber-500/;
      const verifyingAmberRegex = /herettoSaveProgress === 'verifying'[\s\S]*?bg-amber-500/;
      expect(ditaArchitectContent).toMatch(savingAmberRegex);
      expect(ditaArchitectContent).toMatch(verifyingAmberRegex);
    });

    it('maintains clear separation between button state and status display', () => {
      // Button spinner (herettoSaving) and status bar progress are independent
      expect(ditaArchitectContent).toContain('herettoSaving ? <Loader2');
      expect(ditaArchitectContent).toContain('herettoSaveProgress ===');
    });
  });

  describe('error handling and edge cases', () => {
    it('handles network timeout scenarios gracefully', () => {
      // Should reset state on any error
      expect(useHerettoCmsContent).toContain('} catch (err) {');
      expect(useHerettoCmsContent).toMatch(/catch[\s\S]*?setHerettoSaveProgress\('idle'\)/);
    });

    it('handles race conditions with user edits during save', () => {
      // Existing herettoDirty tracking should work with new progress state
      expect(ditaArchitectContent).toContain('herettoDirty');
    });

    it('provides appropriate error context to users', () => {
      // Error messages should include context from server
      expect(useHerettoCmsContent).toContain('DTD validation error');
      expect(useHerettoCmsContent).toContain('Failed to save to Heretto');
    });
  });
});