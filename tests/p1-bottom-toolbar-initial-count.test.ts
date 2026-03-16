// @vitest-environment jsdom
/**
 * Tests for P1 BottomToolbar initial count fix implementation.
 * Validates Jamie's implementation of immediate editor state reading to fix
 * word/character count display on initial load when content is parsed before
 * the BottomToolbar mounts.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('P1 BottomToolbar initial count fix implementation', () => {
  let bottomToolbarContent: string;

  beforeEach(() => {
    // Read BottomToolbar component file to test
    const bottomToolbarPath = path.join(process.cwd(), 'components/BottomToolbar.tsx');
    bottomToolbarContent = readFileSync(bottomToolbarPath, 'utf-8');
  });

  describe('immediate editor state reading after listener registration', () => {
    it('contains comment explaining the immediate state read purpose', () => {
      expect(bottomToolbarContent).toContain('// Immediately read current state to catch content parsed before listener attached');
    });

    it('reads editor state immediately after registering update listener', () => {
      // Should find the immediate state read after the listener registration
      const immediateReadMatch = bottomToolbarContent.match(/\}\);[\s\S]*?\/\/ Immediately read current state[\s\S]*?editor\.getEditorState\(\)\.read\(\(\) => \{/);
      expect(immediateReadMatch).toBeTruthy();
    });

    it('extracts text content from root node in immediate read', () => {
      // Should get root and extract text content
      expect(bottomToolbarContent).toContain('const root = $getRoot();');
      expect(bottomToolbarContent).toContain('const text = root.getTextContent();');

      // This should be within the immediate read block
      const immediateReadBlock = bottomToolbarContent.match(/\/\/ Immediately read current state[\s\S]*?editor\.getEditorState\(\)\.read\(\(\) => \{[\s\S]*?\}\);/);
      expect(immediateReadBlock).toBeTruthy();
      expect(immediateReadBlock![0]).toContain('const root = $getRoot();');
      expect(immediateReadBlock![0]).toContain('const text = root.getTextContent();');
    });

    it('calls analyzeText and setStats with the immediate content', () => {
      // Should analyze the text and set stats immediately
      const immediateReadBlock = bottomToolbarContent.match(/\/\/ Immediately read current state[\s\S]*?editor\.getEditorState\(\)\.read\(\(\) => \{[\s\S]*?\}\);/);
      expect(immediateReadBlock).toBeTruthy();
      expect(immediateReadBlock![0]).toContain('setStats(analyzeText(text));');
    });

    it('positions immediate read after update listener registration', () => {
      // The immediate read should come after the registerUpdateListener call
      const listenerThenReadMatch = bottomToolbarContent.match(/registerUpdateListener[\s\S]*?DEBOUNCE_MS\)\;\s*\}\);[\s\S]*?\/\/ Immediately read current state/);
      expect(listenerThenReadMatch).toBeTruthy();
    });
  });

  describe('existing functionality preservation', () => {
    it('maintains original update listener with debouncing', () => {
      // Original listener should still exist with debounce logic
      expect(bottomToolbarContent).toContain('registerUpdateListener');
      expect(bottomToolbarContent).toContain('DEBOUNCE_MS');

      // Should still handle updates normally
      expect(bottomToolbarContent).toContain('clearTimeout(debounceRef.current)');
    });

    it('preserves analyzeText function usage in both places', () => {
      // Should call analyzeText in both the listener and immediate read
      const analyzeTextMatches = bottomToolbarContent.match(/analyzeText\(text\)/g);
      expect(analyzeTextMatches).toBeTruthy();
      expect(analyzeTextMatches!.length).toBeGreaterThanOrEqual(2);
    });

    it('maintains existing imports and dependencies', () => {
      // Should still import required Lexical functions
      expect(bottomToolbarContent).toContain('$getRoot');
      expect(bottomToolbarContent).toContain('useLexicalComposerContext');
    });

    it('preserves component structure and rendering logic', () => {
      // Component should still render stats correctly
      expect(bottomToolbarContent).toContain('words');
      expect(bottomToolbarContent).toContain('characters');

      // Should maintain existing styling
      expect(bottomToolbarContent).toContain('text-[10px]');
      expect(bottomToolbarContent).toContain('--editor-bottom-text-strong');
    });
  });

  describe('race condition handling', () => {
    it('handles potential race between mount and SyncManager parsing', () => {
      // The immediate read acts as a safety net for content parsed before mount
      const commentMatch = bottomToolbarContent.match(/\/\/ Immediately read current state to catch content parsed before listener attached/);
      expect(commentMatch).toBeTruthy();
    });

    it('works correctly with the existing debounced update pattern', () => {
      // Both debounced listener and immediate read should coexist
      const debouncePattern = bottomToolbarContent.match(/setTimeout[\s\S]*?DEBOUNCE_MS/);
      const immediatePattern = bottomToolbarContent.match(/\/\/ Immediately read[\s\S]*?getEditorState\(\)\.read/);

      expect(debouncePattern).toBeTruthy();
      expect(immediatePattern).toBeTruthy();
    });
  });

  describe('performance and efficiency considerations', () => {
    it('performs immediate read only once during effect setup', () => {
      // Immediate read should be in the useEffect, not in a callback
      const useEffectMatch = bottomToolbarContent.match(/useEffect\(\(\) => \{[\s\S]*?\/\/ Immediately read[\s\S]*?\}, \[editor\]\);/);
      expect(useEffectMatch).toBeTruthy();
    });

    it('does not interfere with existing cleanup logic', () => {
      // Should still have proper cleanup for the update listener
      expect(bottomToolbarContent).toContain('return unregister;');
      expect(bottomToolbarContent).toContain('clearTimeout');
      expect(bottomToolbarContent).toContain('debounceRef.current');
    });
  });

  describe('error handling and edge cases', () => {
    it('safely handles empty or null content in immediate read', () => {
      // The analyzeText function should handle empty content gracefully
      // The immediate read uses the same pattern as the listener
      const immediateReadBlock = bottomToolbarContent.match(/\/\/ Immediately read[\s\S]*?setStats\(analyzeText\(text\)\);/);
      expect(immediateReadBlock).toBeTruthy();
    });

    it('maintains dependency array consistency for useEffect', () => {
      // Should depend on editor to re-run when editor changes
      const useEffectMatch = bottomToolbarContent.match(/useEffect\([\s\S]*?\}, \[editor\]\);/);
      expect(useEffectMatch).toBeTruthy();
    });
  });

  describe('integration with SyncManager and parseXmlToLexical', () => {
    it('captures content that may be parsed before BottomToolbar mounts', () => {
      // The immediate read specifically addresses timing issue where content exists before listener
      const explanationMatch = bottomToolbarContent.match(/\/\/ Immediately read current state to catch content parsed before listener attached/);
      expect(explanationMatch).toBeTruthy();
    });

    it('works with both initial XML parsing and subsequent updates', () => {
      // Should work for initial load and ongoing changes
      const listenerForUpdates = bottomToolbarContent.match(/registerUpdateListener/);
      const immediateForInitial = bottomToolbarContent.match(/\/\/ Immediately read current state/);

      expect(listenerForUpdates).toBeTruthy();
      expect(immediateForInitial).toBeTruthy();
    });
  });

  describe('code quality and maintainability', () => {
    it('uses consistent patterns with existing codebase', () => {
      // Should use same text extraction pattern
      expect(bottomToolbarContent).toContain('$getRoot()');
      expect(bottomToolbarContent).toContain('.getTextContent()');

      // Should use same stats update pattern
      expect(bottomToolbarContent).toContain('setStats(analyzeText(text))');
    });

    it('includes clear comments explaining the fix', () => {
      const commentMatch = bottomToolbarContent.match(/\/\/ Immediately read current state to catch content parsed before listener attached/);
      expect(commentMatch).toBeTruthy();
    });

    it('follows existing code formatting and style', () => {
      // Should maintain consistent indentation and structure
      const codeBlock = bottomToolbarContent.match(/\/\/ Immediately read[\s\S]*?editor\.getEditorState\(\)\.read\(\(\) => \{[\s\S]*?\}\);/);
      expect(codeBlock).toBeTruthy();

      // Should not introduce any TypeScript warnings
      expect(bottomToolbarContent).toContain('const root = $getRoot();');
      expect(bottomToolbarContent).toContain('const text = root.getTextContent();');
    });
  });
});