// @vitest-environment jsdom

/**
 * Tests for writer-friendly terminology changes across user-facing content.
 * Validates that Jamie's implementation replaces developer-centric "conflict" terminology
 * with writer-friendly alternatives throughout the application.
 *
 * Covers P3-11 acceptance criteria to eliminate "Conflict" from user-facing strings
 * while preserving internal function/variable names unchanged.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Writer-Friendly Terminology Implementation', () => {
  let versionContent: string;
  let ditaArchitectContent: string;

  beforeEach(() => {
    const versionPath = path.join(process.cwd(), 'constants/version.ts');
    const mainAppPath = path.join(process.cwd(), 'dita-architect.tsx');
    versionContent = readFileSync(versionPath, 'utf-8');
    ditaArchitectContent = readFileSync(mainAppPath, 'utf-8');
  });

  describe('status bar terminology validation', () => {
    it('displays writer-friendly conflict message when both local and remote changes exist', () => {
      // Main UI change: "Changes in both locations" instead of "Conflict — updated in Heretto"
      expect(ditaArchitectContent).toContain('Changes in both locations');

      // Should not contain old developer terminology
      expect(ditaArchitectContent).not.toContain('Conflict — updated in Heretto');

      // Verify the conditional logic is correct
      const conflictCondition = /tab\.herettoDirty \? 'Changes in both locations' : 'Updated in Heretto'/;
      expect(ditaArchitectContent).toMatch(conflictCondition);
    });

    it('preserves other status messages unchanged', () => {
      // These status messages should remain as-is
      expect(ditaArchitectContent).toContain('Unsaved changes');
      expect(ditaArchitectContent).toContain('Updated in Heretto');
      expect(ditaArchitectContent).toContain('Saving to Heretto...');
      expect(ditaArchitectContent).toContain('Verifying save...');
      expect(ditaArchitectContent).toContain('Saved');
    });

    it('maintains correct visual indicators for status states', () => {
      // Red indicator appears in the herettoRemoteChanged condition
      expect(ditaArchitectContent).toMatch(/bg-red-500[\s\S]*?Changes in both locations/);

      // Amber indicator for unsaved changes
      expect(ditaArchitectContent).toMatch(/bg-amber-500[\s\S]*?Unsaved changes/);
    });
  });

  describe('release notes terminology fixes', () => {
    it('uses writer-friendly change detection terminology in v0.8.0 release notes', () => {
      // Line 89: Should say "sync change detection handling" not "sync conflict handling"
      expect(versionContent).toContain('sync change detection handling');
      expect(versionContent).not.toContain('sync conflict handling');
    });

    it('uses writer-friendly change indicators terminology in v0.6.0 release notes', () => {
      // Line 224: Should say "surfaces change indicators" not "surfaces conflict indicators"
      expect(versionContent).toContain('surfaces change indicators');
      expect(versionContent).not.toContain('surfaces conflict indicators');
    });

    it('preserves technical context where conflict terminology is appropriate', () => {
      // "conflict detection" as a feature capability description should remain
      // This validates that we only changed user-facing terminology, not technical descriptions
      if (versionContent.includes('conflict detection')) {
        // If conflict detection appears, it should be in technical context, not user-facing messages
        expect(versionContent).not.toContain('conflict status');
        expect(versionContent).not.toContain('conflict message');
      }
    });
  });

  describe('comprehensive terminology audit', () => {
    it('eliminates all instances of conflict in user-facing UI strings', () => {
      // Scan for any remaining "Conflict" in user-facing contexts
      const conflictMatches = ditaArchitectContent.match(/['">`]Conflict/g);
      expect(conflictMatches).toBeNull(); // Should find no user-facing "Conflict" strings

      // Should not contain old conflict terminology in JSX content
      expect(ditaArchitectContent).not.toContain('>Conflict<');
      expect(ditaArchitectContent).not.toContain('Conflict —');
    });

    it('preserves internal variable names and function logic unchanged', () => {
      // Internal implementation should use existing patterns
      expect(ditaArchitectContent).toContain('herettoRemoteChanged');
      expect(ditaArchitectContent).toContain('herettoDirty');

      // Conditional logic structure should be preserved (herettoRemoteChanged wraps the herettoDirty check)
      expect(ditaArchitectContent).toMatch(/tab\.herettoRemoteChanged[\s\S]*?tab\.herettoDirty.*Changes in both locations/);
    });

    it('maintains aria labels and accessibility without conflict terminology', () => {
      // Check for any aria-label attributes that might contain old terminology
      const ariaConflictMatch = ditaArchitectContent.match(/aria-label[^>]*Conflict/);
      expect(ariaConflictMatch).toBeNull();

      // Check for title attributes that might contain old terminology
      const titleConflictMatch = ditaArchitectContent.match(/title[^>]*Conflict/);
      expect(titleConflictMatch).toBeNull();
    });
  });

  describe('acceptance criteria validation', () => {
    it('meets requirement that status bar shows Changes in both locations for dual modification state', () => {
      // P3-11 acceptance criteria: Show "Changes in both locations" when both conditions true
      const dualChangePattern = /tab\.herettoDirty.*Changes in both locations/;
      expect(ditaArchitectContent).toMatch(dualChangePattern);
    });

    it('meets requirement to preserve visual indicators red dot for conflict state', () => {
      // Red indicator should still appear for changes in both locations state
      expect(ditaArchitectContent).toMatch(/bg-red-500.*shrink-0/);

      // Should be in the context of the dual-change condition
      const redIndicatorContext = ditaArchitectContent.match(/herettoRemoteChanged[\s\S]{0,200}bg-red-500/);
      expect(redIndicatorContext).toBeTruthy();
    });

    it('meets requirement that save refresh functionality works exactly as before', () => {
      // The conditional logic structure should be unchanged
      expect(ditaArchitectContent).toMatch(/herettoSaveProgress === 'saving'/);
      expect(ditaArchitectContent).toMatch(/herettoSaveProgress === 'verifying'/);
      expect(ditaArchitectContent).toMatch(/tab\.herettoRemoteChanged/);
      expect(ditaArchitectContent).toMatch(/tab\.herettoDirty/);
    });

    it('meets requirement that no instances of Conflict appear in user-facing Heretto strings', () => {
      // Check tooltip, aria-label, and text content for conflict terminology
      const herettoSectionMatch = ditaArchitectContent.match(/heretto[\s\S]*?Conflict/i);
      expect(herettoSectionMatch).toBeNull();

      // Specifically check the status bar section
      const statusBarSection = ditaArchitectContent.match(/flex items-center gap-3 text-xs[\s\S]*?<\/div>/);
      if (statusBarSection) {
        expect(statusBarSection[0]).not.toContain('Conflict');
      }
    });

    it('meets requirement that internal variable names remain unchanged', () => {
      // These internal names should NOT change per the acceptance criteria
      expect(ditaArchitectContent).toContain('herettoRemoteChanged');
      expect(ditaArchitectContent).toContain('herettoDirty');
      expect(ditaArchitectContent).toContain('herettoSaveProgress');
      expect(ditaArchitectContent).toContain('herettoLastSaved');
    });
  });

  describe('regression prevention', () => {
    it('prevents reintroduction of conflict terminology in status messages', () => {
      // This test will catch if "Conflict" gets accidentally reintroduced
      const statusMessages = [
        'Changes in both locations',
        'Updated in Heretto',
        'Unsaved changes',
        'Saving to Heretto...',
        'Verifying save...',
        'Saved'
      ];

      // All status messages should be present
      statusMessages.forEach(message => {
        expect(ditaArchitectContent).toContain(message);
      });

      // And no conflict terminology should exist
      expect(ditaArchitectContent).not.toContain('Conflict — updated');
      expect(ditaArchitectContent).not.toContain('Conflict status');
    });

    it('prevents reintroduction of conflict terminology in release notes', () => {
      // These specific phrases should never return
      expect(versionContent).not.toContain('sync conflict handling');
      expect(versionContent).not.toContain('surfaces conflict indicators');
      expect(versionContent).not.toContain('conflict status messages');
    });

    it('maintains writer-focused language consistency throughout version history', () => {
      // The two specific lines Jamie fixed should maintain writer-friendly language
      const line89Match = versionContent.match(/773 tests[\s\S]*?sync change detection handling/);
      const line224Match = versionContent.match(/Background polling[\s\S]*?surfaces change indicators/);

      expect(line89Match).toBeTruthy();
      expect(line224Match).toBeTruthy();
    });
  });
});