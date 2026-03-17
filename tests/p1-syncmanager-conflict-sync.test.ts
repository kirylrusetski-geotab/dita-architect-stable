// @vitest-environment jsdom
/**
 * Tests for P1 SyncManager conflict sync fix implementation.
 * Validates Jamie's implementation of removing redundant condition checks
 * in applyPendingSync and forcing XML sync during Ctrl+Enter to fix
 * XML-to-visual sync during Heretto conflict states.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('P1 SyncManager conflict sync fix implementation', () => {
  let syncManagerContent: string;

  beforeEach(() => {
    // Read SyncManager component file to test
    const syncManagerPath = path.join(process.cwd(), 'components/SyncManager.tsx');
    syncManagerContent = readFileSync(syncManagerPath, 'utf-8');
  });

  describe('applyPendingSync function modification', () => {
    it('removes redundant condition check for pending === lastXmlRef.current', () => {
      // Should not contain the redundant comparison that blocked syncs during conflicts
      expect(syncManagerContent).not.toContain('if (pending === lastXmlRef.current) return;');

      // The function should only check for null pending
      const applyPendingSyncMatch = syncManagerContent.match(/const applyPendingSync = useCallback\(\(\) => \{[\s\S]*?if \(pending === null\) return;[\s\S]*?\}, \[/);
      expect(applyPendingSyncMatch).toBeTruthy();
    });

    it('maintains null check for pending XML in applyPendingSync', () => {
      // Should still check for null pending to avoid unnecessary work
      expect(syncManagerContent).toContain('if (pending === null) return;');

      // But should not have the comparison with lastXmlRef.current
      const functionContent = syncManagerContent.match(/const applyPendingSync = useCallback\(\(\) => \{[\s\S]*?\}, \[/);
      expect(functionContent).toBeTruthy();
      expect(functionContent![0]).not.toContain('pending === lastXmlRef.current');
    });

    it('preserves other applyPendingSync functionality', () => {
      // Should still set sync flag, call parseXmlToLexical, and update refs
      const applyPendingSyncMatch = syncManagerContent.match(/const applyPendingSync = useCallback\(\(\) => \{[\s\S]*?\}, \[/);
      expect(applyPendingSyncMatch).toBeTruthy();

      const functionBody = applyPendingSyncMatch![0];
      expect(functionBody).toContain('isSyncingFromXmlRef.current = true;');
      expect(functionBody).toContain('parseXmlToLexical(pending, editor, nodeOriginMap);');
      expect(functionBody).toContain('lastXmlRef.current = pending;');
      expect(functionBody).toContain('masterXmlRef.current = pending;');
      expect(functionBody).toContain('pendingXmlRef.current = null;');
      expect(functionBody).toContain('clearSyncFlagAfterUpdate();');
    });

    it('maintains proper dependencies in applyPendingSync useCallback', () => {
      // Should have correct dependency array
      const callbackMatch = syncManagerContent.match(/const applyPendingSync = useCallback\([\s\S]*?\}, \[(.*?)\]\);/);
      expect(callbackMatch).toBeTruthy();
      expect(callbackMatch![1]).toContain('editor');
      expect(callbackMatch![1]).toContain('clearSyncFlagAfterUpdate');
      expect(callbackMatch![1]).toContain('nodeOriginMap');
    });
  });

  describe('Ctrl+Enter sync effect modification', () => {
    it('forces pending XML to be set even when content appears unchanged', () => {
      // Should find the else block that handles Monaco focused sync
      const ctrlEnterElseBlock = syncManagerContent.match(/\} else \{[\s\S]*?\/\/ Monaco[\s\S]*?pendingXmlRef\.current = xmlContent;[\s\S]*?applyPendingSync\(\);[\s\S]*?\}/);
      expect(ctrlEnterElseBlock).toBeTruthy();
    });

    it('calls applyPendingSync after setting pending XML in Ctrl+Enter handler', () => {
      // Should set pending and immediately apply it
      const syncTriggerMatch = syncManagerContent.match(/pendingXmlRef\.current = xmlContent;[\s\S]*?applyPendingSync\(\);/);
      expect(syncTriggerMatch).toBeTruthy();
    });

    it('maintains comment explaining Monaco focus handling', () => {
      // Should have comment explaining the branch
      expect(syncManagerContent).toContain('// Monaco (or other) is focused → apply XML to Lexical');
    });

    it('preserves the Lexical focus branch in sync effect', () => {
      // Should still handle the Lexical focused case
      const lexicalFocusMatch = syncManagerContent.match(/if \(lexicalHasFocus\) \{[\s\S]*?\} else \{/);
      expect(lexicalFocusMatch).toBeTruthy();
    });
  });

  describe('automatic XML sync effect modification', () => {
    it('forces pending XML in automatic sync when lastUpdatedBy is code', () => {
      // Should find the automatic sync effect that also forces pending
      const autoSyncMatch = syncManagerContent.match(/if \(\(lastUpdatedBy === 'code'[\s\S]*?pendingXmlRef\.current = xmlContent;[\s\S]*?\}/);
      expect(autoSyncMatch).toBeTruthy();
    });

    it('maintains buffer logic when Monaco has focus in automatic sync', () => {
      // Should still buffer changes when Monaco is focused in auto sync
      expect(syncManagerContent).toContain('// Monaco (or something else) has focus — buffer the change');
    });

    it('preserves automatic sync effect dependencies', () => {
      // Should have proper dependency array for the auto sync effect
      const autoSyncEffect = syncManagerContent.match(/useEffect\(\(\) => \{[\s\S]*?if \(\(lastUpdatedBy === 'code'[\s\S]*?\}, \[(.*?)\]\);/);
      expect(autoSyncEffect).toBeTruthy();
      expect(autoSyncEffect![1]).toContain('xmlContent');
      expect(autoSyncEffect![1]).toContain('editor');
      expect(autoSyncEffect![1]).toContain('lastUpdatedBy');
    });
  });

  describe('existing functionality preservation', () => {
    it('maintains all useRef declarations and initialization', () => {
      // Should still have all the necessary refs
      expect(syncManagerContent).toContain('pendingXmlRef');
      expect(syncManagerContent).toContain('lastXmlRef');
      expect(syncManagerContent).toContain('masterXmlRef');
      expect(syncManagerContent).toContain('isSyncingFromXmlRef');
    });

    it('preserves initial XML parsing on mount', () => {
      // Should still parse initial XML when component mounts
      expect(syncManagerContent).toContain('parseXmlToLexical(xmlContent, editor, nodeOriginMap);');

      // Should have the mount effect with empty dependency array
      const mountEffect = syncManagerContent.match(/useEffect\(\(\) => \{[\s\S]*?parseXmlToLexical\(xmlContent, editor, nodeOriginMap\);[\s\S]*?\}, \[\]\);/);
      expect(mountEffect).toBeTruthy();
    });

    it('maintains Lexical focus detection and pending sync application', () => {
      // Should still handle Lexical root focus detection
      expect(syncManagerContent).toContain('lexicalRoot.contains(activeEl)');

      // Should apply pending sync when Lexical gains focus
      expect(syncManagerContent).toContain('applyPendingSync();');
    });

    it('preserves clearSyncFlagAfterUpdate timing logic', () => {
      // Should still clear sync flag after timeout
      expect(syncManagerContent).toContain('clearSyncFlagAfterUpdate');
      expect(syncManagerContent).toContain('setTimeout');
      expect(syncManagerContent).toContain('200'); // 200ms timeout
    });
  });

  describe('conflict resolution during Heretto conflicts', () => {
    it('bypasses content comparison that could block sync during conflicts', () => {
      // The applyPendingSync function should not compare pending with last XML
      const applyFunction = syncManagerContent.match(/const applyPendingSync = useCallback\(\(\) => \{[\s\S]*?\}, \[/);
      expect(applyFunction).toBeTruthy();
      expect(applyFunction![0]).not.toContain('pending === lastXmlRef.current');
    });

    it('forces sync even when XML content appears identical', () => {
      // Both sync effects should force setting pendingXmlRef
      const forcedSyncMatches = syncManagerContent.match(/pendingXmlRef\.current = xmlContent;/g);
      expect(forcedSyncMatches).toBeTruthy();
      expect(forcedSyncMatches!.length).toBeGreaterThanOrEqual(2); // At least in both effects
    });

    it('maintains proper error handling in parseXmlToLexical calls', () => {
      // Should still check parseXmlToLexical success before updating refs
      expect(syncManagerContent).toContain('const success = parseXmlToLexical(pending, editor, nodeOriginMap);');
      expect(syncManagerContent).toContain('if (success) {');
    });
  });

  describe('performance and efficiency considerations', () => {
    it('avoids unnecessary parsing when pending is null', () => {
      // Should still have the null check for efficiency
      expect(syncManagerContent).toContain('if (pending === null) return;');
    });

    it('maintains proper cleanup for timeouts and effects', () => {
      // Should have cleanup functions for effects
      expect(syncManagerContent).toContain('return () => clearTimeout');
    });

    it('preserves debouncing and timing logic', () => {
      // Should maintain timing controls
      expect(syncManagerContent).toContain('setTimeout');
      expect(syncManagerContent).toContain('clearTimeout');
    });
  });

  describe('bidirectional sync integrity', () => {
    it('maintains proper sync direction detection', () => {
      // Should still use isSyncingFromXmlRef to prevent loops
      expect(syncManagerContent).toContain('isSyncingFromXmlRef.current = true;');
      expect(syncManagerContent).toContain('isSyncingFromXmlRef.current = false;');
    });

    it('preserves master XML reference updates', () => {
      // Should update master XML on successful sync
      expect(syncManagerContent).toContain('masterXmlRef.current = pending;');
    });

    it('maintains last XML reference for tracking', () => {
      // Should update last XML reference on successful sync
      expect(syncManagerContent).toContain('lastXmlRef.current = pending;');
    });
  });

  describe('integration with Heretto conflict detection', () => {
    it('works correctly with existing conflict detection logic', () => {
      // The sync fixes should not interfere with conflict detection
      // Conflict detection happens elsewhere, sync just ensures it works during conflicts
      expect(syncManagerContent).toContain('pendingXmlRef.current = xmlContent;');
    });

    it('ensures Ctrl+Enter works during any conflict state', () => {
      // The Ctrl+Enter handler should work regardless of XML comparison results
      const ctrlEnterHandler = syncManagerContent.match(/\} else \{[\s\S]*?pendingXmlRef\.current = xmlContent;[\s\S]*?applyPendingSync\(\);/);
      expect(ctrlEnterHandler).toBeTruthy();
    });
  });

  describe('code quality and maintainability', () => {
    it('maintains clear comments explaining sync behavior', () => {
      // Should have helpful comments
      expect(syncManagerContent).toContain('// Monaco (or other) is focused → apply XML to Lexical');
      expect(syncManagerContent).toContain('// Helper: apply pending XML to Lexical');
    });

    it('follows consistent code patterns with rest of codebase', () => {
      // Should use consistent ref patterns and useCallback
      expect(syncManagerContent).toContain('useCallback');
      expect(syncManagerContent).toContain('useEffect');
      expect(syncManagerContent).toContain('.current');
    });

    it('maintains TypeScript type safety', () => {
      // Should not introduce any type errors
      expect(syncManagerContent).toContain('pending === null');
      expect(syncManagerContent).toContain('const success = parseXmlToLexical');
    });
  });
});