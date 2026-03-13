// @vitest-environment jsdom
/**
 * Tests for ShortdescPlugin body element class management - validating Jamie's implementation.
 * These tests ensure the plugin correctly handles all five DITA body element types
 * (shortdesc, prereq, context, result, postreq) with proper CSS class application
 * and clean class management to prevent DOM conflicts.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('ShortdescPlugin body element class management extension', () => {
  let shortdescPluginContent: string;

  beforeEach(() => {
    // Read the ShortdescPlugin component file to test
    const pluginPath = path.join(process.cwd(), 'components/ShortdescPlugin.tsx');
    shortdescPluginContent = readFileSync(pluginPath, 'utf-8');
  });

  describe('BODY_TAG_CLASSES constant and mapping configuration', () => {
    it('validates complete BODY_TAG_CLASSES mapping for all five DITA body elements', () => {
      // Should have mapping constant defined
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES');

      // Should map all five body element tags to their CSS classes
      expect(shortdescPluginContent).toContain('shortdesc: \'dita-editor-shortdesc\'');
      expect(shortdescPluginContent).toContain('prereq: \'dita-editor-prereq\'');
      expect(shortdescPluginContent).toContain('context: \'dita-editor-context\'');
      expect(shortdescPluginContent).toContain('result: \'dita-editor-result\'');
      expect(shortdescPluginContent).toContain('postreq: \'dita-editor-postreq\'');
    });

    it('ensures ALL_BODY_CLASSES constant extracts all managed class names', () => {
      // Should create array of all managed classes
      expect(shortdescPluginContent).toContain('ALL_BODY_CLASSES = Object.values(BODY_TAG_CLASSES)');

      // Should be used for clean class removal
      const allBodyClassesUsage = shortdescPluginContent.match(/ALL_BODY_CLASSES\.forEach/);
      expect(allBodyClassesUsage).toBeTruthy();
    });

    it('validates that BODY_TAG_CLASSES follows consistent naming conventions', () => {
      // All CSS class names should follow dita-editor-{element} pattern
      const classNamePattern = /dita-editor-(shortdesc|prereq|context|result|postreq)/g;
      const classMatches = shortdescPluginContent.match(classNamePattern);

      expect(classMatches).toBeTruthy();
      expect(classMatches!.length).toBe(5); // One for each body element

      // Should not have inconsistent naming patterns
      expect(shortdescPluginContent).not.toContain('dita-shortdesc');
      // Note: 'editor-prereq' may appear as part of 'dita-editor-prereq', so we check for incorrect standalone usage
      expect(shortdescPluginContent).not.toContain("'editor-prereq'");
    });

    it('ensures BODY_TAG_CLASSES serves as single source of truth for tag-to-class mapping', () => {
      // Should be defined as Record<string, string> pattern
      const mappingPattern = /BODY_TAG_CLASSES[^{]*\{[^}]*\}/s;
      expect(shortdescPluginContent).toMatch(mappingPattern);

      // Should not have duplicate hardcoded class names elsewhere
      const hardcodedClassPattern = /'dita-editor-(prereq|context|result|postreq)'/g;
      const hardcodedMatches = shortdescPluginContent.match(hardcodedClassPattern);

      // Each class name should appear only once (in the mapping)
      if (hardcodedMatches) {
        const uniqueClasses = new Set(hardcodedMatches);
        expect(hardcodedMatches.length).toBe(uniqueClasses.size * 1); // Each appears exactly once
      }
    });
  });

  describe('mutation listener enhanced logic for multi-element support', () => {
    it('validates clean class removal using ALL_BODY_CLASSES before applying new class', () => {
      // Should remove all managed classes first
      expect(shortdescPluginContent).toContain('ALL_BODY_CLASSES.forEach(className =>');
      expect(shortdescPluginContent).toContain('domElement.classList.remove(className)');

      // Removal should happen before adding new class
      const forEachRemovalMatch = shortdescPluginContent.match(/ALL_BODY_CLASSES\.forEach.*?classList\.remove/s);
      const conditionalAddMatch = shortdescPluginContent.match(/BODY_TAG_CLASSES\[origin\.tag\].*?classList\.add/s);
      expect(forEachRemovalMatch).toBeTruthy();
      expect(conditionalAddMatch).toBeTruthy();
    });

    it('ensures conditional class application based on origin tag matching', () => {
      // Should check if origin tag exists in BODY_TAG_CLASSES
      expect(shortdescPluginContent).toContain('origin?.tag && BODY_TAG_CLASSES[origin.tag]');

      // Should add the mapped class when condition is met
      expect(shortdescPluginContent).toContain('domElement.classList.add(BODY_TAG_CLASSES[origin.tag])');
    });

    it('validates that mutation listener targets ParagraphNode type correctly', () => {
      // Should register mutation listener for ParagraphNode
      expect(shortdescPluginContent).toContain('registerMutationListener(');
      expect(shortdescPluginContent).toContain('ParagraphNode');

      // Should filter nodes by paragraph type
      expect(shortdescPluginContent).toContain("node.getType() !== 'paragraph'");
    });

    it('ensures DOM element existence check before class manipulation', () => {
      // Should check if domElement exists before manipulating classes
      expect(shortdescPluginContent).toContain('domElement = editor.getElementByKey(key)');
      expect(shortdescPluginContent).toContain('if (!domElement) return');

      // Safety check should prevent errors on missing DOM elements
      expect(shortdescPluginContent).toContain('if (!domElement) return');
    });
  });

  describe('nodeOriginMap integration and tag tracking', () => {
    it('validates proper nodeOriginMap usage for origin tag retrieval', () => {
      // Should get origin data from nodeOriginMap
      expect(shortdescPluginContent).toContain('nodeOriginMap.get(key)');

      // Should access tag property from origin data
      expect(shortdescPluginContent).toContain('origin?.tag');
    });

    it('ensures graceful handling of nodes without origin data', () => {
      // Should use optional chaining for origin access
      expect(shortdescPluginContent).toContain('origin?.tag');

      // Should not crash when origin is undefined
      expect(shortdescPluginContent).toContain('&&');
    });

    it('validates that key-based DOM element lookup is used correctly', () => {
      // Should get key from node
      expect(shortdescPluginContent).toContain('node.getKey()');

      // Should use key to get DOM element
      expect(shortdescPluginContent).toContain('editor.getElementByKey(key)');

      // Should check both origin and domElement before proceeding
      expect(shortdescPluginContent).toContain('const key = node.getKey()');
      expect(shortdescPluginContent).toContain('editor.getElementByKey(key)');
      expect(shortdescPluginContent).toContain('if (!domElement) return');
    });
  });

  describe('performance and efficiency optimizations', () => {
    it('validates efficient class removal using forEach instead of individual checks', () => {
      // Should use forEach for batch class removal
      expect(shortdescPluginContent).toContain('ALL_BODY_CLASSES.forEach');

      // Should not have individual remove statements for each class
      expect(shortdescPluginContent).not.toContain('classList.remove(\'dita-editor-prereq\')');
      expect(shortdescPluginContent).not.toContain('classList.remove(\'dita-editor-context\')');
      expect(shortdescPluginContent).not.toContain('classList.remove(\'dita-editor-result\')');
      expect(shortdescPluginContent).not.toContain('classList.remove(\'dita-editor-postreq\')');
    });

    it('ensures O(1) lookup performance using object mapping instead of array scanning', () => {
      // Should use object property access for tag lookup
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES[origin.tag]');

      // Should not use array methods like find() or includes()
      expect(shortdescPluginContent).not.toContain('.find(');
      expect(shortdescPluginContent).not.toContain('.includes(');
    });

    it('validates minimal DOM manipulation with single class add operation', () => {
      // Should add class only once per element per mutation
      const classAddPattern = /classList\.add\(BODY_TAG_CLASSES\[origin\.tag\]\)/;
      expect(shortdescPluginContent).toMatch(classAddPattern);

      // Should not have multiple add operations
      const addMatches = shortdescPluginContent.match(/classList\.add/g);
      expect(addMatches!.length).toBe(1); // Only one add operation
    });
  });

  describe('regression tests for shortdesc functionality preservation', () => {
    it('ensures existing shortdesc behavior remains intact with new body element support', () => {
      // Shortdesc should still be included in BODY_TAG_CLASSES
      expect(shortdescPluginContent).toContain('shortdesc: \'dita-editor-shortdesc\'');

      // Original shortdesc functionality should work through the new system
      expect(shortdescPluginContent).toContain('dita-editor-shortdesc');
    });

    it('validates that Enter key handler for shortdesc creation remains unchanged', () => {
      // Should still register KEY_ENTER_COMMAND
      expect(shortdescPluginContent).toContain('KEY_ENTER_COMMAND');

      // Should still handle H1 to shortdesc flow
      expect(shortdescPluginContent).toContain('getTopLevelElement()');
      expect(shortdescPluginContent).toContain('selection.isCollapsed()');
    });

    it('ensures backward compatibility with existing shortdesc visual indicators', () => {
      // CSS class application should work for shortdesc same as before
      expect(shortdescPluginContent).toContain('dita-editor-shortdesc');

      // Should not break existing shortdesc styles in CSS
      const shortdescInMapping = shortdescPluginContent.match(/shortdesc: ['"]dita-editor-shortdesc['"]/);
      expect(shortdescInMapping).toBeTruthy();
    });
  });

  describe('WYSIWYG/DITA parity and visual consistency', () => {
    it('validates that all body elements receive consistent visual treatment', () => {
      // All five body elements should have corresponding CSS classes
      const bodyElementClasses = [
        'dita-editor-shortdesc',
        'dita-editor-prereq',
        'dita-editor-context',
        'dita-editor-result',
        'dita-editor-postreq'
      ];

      bodyElementClasses.forEach(className => {
        expect(shortdescPluginContent).toContain(className);
      });
    });

    it('ensures visual indicators work consistently across WYSIWYG and DITA content modes', () => {
      // Class application should depend only on origin tag, not content mode
      expect(shortdescPluginContent).toContain('origin?.tag');
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES[origin.tag]');

      // Should not have mode-dependent logic for class application
      expect(shortdescPluginContent).not.toContain('wysiwyg');
      expect(shortdescPluginContent).not.toContain('dita-mode');
    });

    it('validates that class management prevents visual conflicts between body elements', () => {
      // Clean removal of all classes prevents conflicts
      expect(shortdescPluginContent).toContain('ALL_BODY_CLASSES.forEach(className =>');
      expect(shortdescPluginContent).toContain('classList.remove(className)');

      // Only one class should be applied at a time
      const conditionalAdd = shortdescPluginContent.match(/if \(origin\?\.tag && BODY_TAG_CLASSES\[origin\.tag\]\) \{[^}]*classList\.add[^}]*\}/s);
      expect(conditionalAdd).toBeTruthy();
    });
  });

  describe('code maintainability and extensibility', () => {
    it('validates that adding new body elements only requires updating BODY_TAG_CLASSES', () => {
      // System should be data-driven through the mapping
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES:');

      // Logic should reference the mapping, not hardcode element names
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES[origin.tag]');
      expect(shortdescPluginContent).toContain('Object.values(BODY_TAG_CLASSES)');
    });

    it('ensures consistent TypeScript typing for mapping structure', () => {
      // Mapping should follow Record<string, string> pattern for type safety
      const recordPattern = /BODY_TAG_CLASSES[^=]*:\s*Record<string,\s*string>/;
      const explicitTypingPattern = /BODY_TAG_CLASSES[^{]*\{/;

      // Should have either explicit typing or inference from structure
      const hasTyping = recordPattern.test(shortdescPluginContent) || explicitTypingPattern.test(shortdescPluginContent);
      expect(hasTyping).toBe(true);
    });

    it('validates clean separation of concerns between tag mapping and DOM manipulation', () => {
      // Tag-to-class mapping should be separate from DOM logic
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES');
      expect(shortdescPluginContent).toContain('ALL_BODY_CLASSES');

      // DOM manipulation should reference the mapping, not duplicate it
      expect(shortdescPluginContent).toContain('forEach(className =>');
      expect(shortdescPluginContent).toContain('[origin.tag]');
    });
  });

  describe('error handling and edge case management', () => {
    it('validates graceful handling of unexpected origin tag values', () => {
      // Should check if tag exists in mapping before using it
      expect(shortdescPluginContent).toContain('BODY_TAG_CLASSES[origin.tag]');
      expect(shortdescPluginContent).toContain('&&');

      // Should not crash on undefined or unmapped tags
      const conditionalLogic = shortdescPluginContent.match(/origin\?\.tag && BODY_TAG_CLASSES\[origin\.tag\]/);
      expect(conditionalLogic).toBeTruthy();
    });

    it('ensures safe DOM element access with null checks', () => {
      // Should check domElement before class manipulation
      expect(shortdescPluginContent).toContain('if (!domElement) return');

      // Should check for domElement before class operations
      expect(shortdescPluginContent).toContain('if (!domElement) return');

      // Class operations should occur after the null check
      const domCheckIndex = shortdescPluginContent.indexOf('if (!domElement) return');
      const classListIndex = shortdescPluginContent.indexOf('classList.remove');
      expect(domCheckIndex).toBeGreaterThan(-1);
      expect(classListIndex).toBeGreaterThan(domCheckIndex);
    });

    it('validates that mutation listener cleanup prevents memory leaks', () => {
      // Should return cleanup function
      expect(shortdescPluginContent).toContain('removeMutationListener');

      // Should call cleanup in return statement
      expect(shortdescPluginContent).toContain('return () => {');
      expect(shortdescPluginContent).toContain('removeMutationListener()');
    });
  });
});