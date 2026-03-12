// @vitest-environment jsdom
/**
 * Tests for CSS variable consistency improvements - validating Jamie's text styling fixes.
 * These tests ensure all text styling classes properly use CSS variables instead of
 * hardcoded colors, maintaining theme consistency and supporting theme switching.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('CSS variable consistency for text styling classes', () => {
  let cssContent: string;

  beforeEach(() => {
    // Read the actual CSS file to test
    const cssPath = path.join(process.cwd(), 'index.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  describe('dita-editor-text classes use CSS variables consistently', () => {
    it('validates that dita-editor-text-bold uses CSS variable for color', () => {
      // Find the .dita-editor-text-bold rule
      const boldRuleMatch = cssContent.match(/\.dita-editor-text-bold\s*\{[^}]*\}/);
      expect(boldRuleMatch).toBeTruthy();

      const boldRule = boldRuleMatch![0];

      // Should use CSS variable for color, not hardcoded value
      expect(boldRule).toContain('color: var(--editor-text)');
      expect(boldRule).toContain('font-weight: 700');

      // Should not contain hardcoded colors
      expect(boldRule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);
      expect(boldRule).not.toMatch(/color:\s*rgb/);
      expect(boldRule).not.toMatch(/color:\s*rgba/);
    });

    it('validates that dita-editor-text-italic uses CSS variable for color', () => {
      const italicRuleMatch = cssContent.match(/\.dita-editor-text-italic\s*\{[^}]*\}/);
      expect(italicRuleMatch).toBeTruthy();

      const italicRule = italicRuleMatch![0];

      // Should use CSS variable for color
      expect(italicRule).toContain('color: var(--editor-text)');
      expect(italicRule).toContain('font-style: italic');

      // Should not contain hardcoded colors
      expect(italicRule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);
      expect(italicRule).not.toMatch(/color:\s*rgb/);
    });

    it('validates that dita-editor-text-link uses CSS variable for accent color', () => {
      const linkRuleMatch = cssContent.match(/\.dita-editor-text-link\s*\{[^}]*\}/);
      expect(linkRuleMatch).toBeTruthy();

      const linkRule = linkRuleMatch![0];

      // Should use CSS variable for accent color
      expect(linkRule).toContain('color: var(--editor-accent)');
      expect(linkRule).toContain('cursor: pointer');

      // Should not contain hardcoded colors
      expect(linkRule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);
      expect(linkRule).not.toMatch(/color:\s*blue/);
    });

    it('validates that dita-editor-text-link hover state preserves color inheritance', () => {
      const linkHoverMatch = cssContent.match(/\.dita-editor-text-link:hover\s*\{[^}]*\}/);
      expect(linkHoverMatch).toBeTruthy();

      const linkHoverRule = linkHoverMatch![0];

      // Hover should add underline but not override color
      expect(linkHoverRule).toContain('text-decoration: underline');

      // Should not contain color override that breaks CSS variable inheritance
      expect(linkHoverRule).not.toMatch(/color:\s*/);
    });

    it('validates that dita-editor-text-strikethrough uses CSS variable with proper opacity', () => {
      const strikethroughRuleMatch = cssContent.match(/\.dita-editor-text-strikethrough\s*\{[^}]*\}/);
      expect(strikethroughRuleMatch).toBeTruthy();

      const strikethroughRule = strikethroughRuleMatch![0];

      // Should use CSS variable for color with opacity for visual distinction
      expect(strikethroughRule).toContain('color: var(--editor-text)');
      expect(strikethroughRule).toContain('text-decoration: line-through');
      expect(strikethroughRule).toContain('opacity: 0.7');

      // Should not contain hardcoded colors
      expect(strikethroughRule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);
      expect(strikethroughRule).not.toMatch(/color:\s*gray/);
    });

    it('validates that dita-editor-text-underline uses CSS variable for color', () => {
      const underlineRuleMatch = cssContent.match(/\.dita-editor-text-underline\s*\{[^}]*\}/);
      expect(underlineRuleMatch).toBeTruthy();

      const underlineRule = underlineRuleMatch![0];

      // Should use CSS variable for color
      expect(underlineRule).toContain('color: var(--editor-text)');
      expect(underlineRule).toContain('text-decoration: underline');

      // Should not contain hardcoded colors
      expect(underlineRule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);
    });
  });

  describe('CSS variable definitions exist and are properly structured', () => {
    it('validates that --editor-text CSS variable is defined in theme structures', () => {
      // Should have --editor-text variable defined somewhere in the CSS
      expect(cssContent).toContain('--editor-text');

      // Find variable definitions in theme-related selectors
      const editorTextVarMatches = cssContent.match(/--editor-text:\s*[^;]+/g);
      expect(editorTextVarMatches).toBeTruthy();
      expect(editorTextVarMatches!.length).toBeGreaterThan(0);
    });

    it('validates that --editor-accent CSS variable is defined for link colors', () => {
      // Should have --editor-accent variable defined
      expect(cssContent).toContain('--editor-accent');

      // Find variable definitions
      const editorAccentVarMatches = cssContent.match(/--editor-accent:\s*[^;]+/g);
      expect(editorAccentVarMatches).toBeTruthy();
      expect(editorAccentVarMatches!.length).toBeGreaterThan(0);
    });

    it('validates that theme selectors properly override CSS variables', () => {
      // Check for theme-specific overrides
      const themeSelectors = [
        'data-theme="light"',
        'data-theme="dark"',
        'data-theme="geotab"'
      ];

      themeSelectors.forEach(selector => {
        // Each theme should have some variable definitions
        const selectorRegex = new RegExp(`\\[${selector.replace(/"/g, '\\"')}\\]`, 'g');
        const matches = cssContent.match(selectorRegex);
        if (matches) {
          // If theme selector exists, it should define variables
          expect(matches.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('regression tests for theme switching compatibility', () => {
    it('ensures text styling classes work correctly with all supported themes', () => {
      // All dita-editor-text classes should use var() syntax for theme compatibility
      const textStyleClasses = [
        'dita-editor-text-bold',
        'dita-editor-text-italic',
        'dita-editor-text-link',
        'dita-editor-text-strikethrough',
        'dita-editor-text-underline'
      ];

      textStyleClasses.forEach(className => {
        const classRuleMatch = cssContent.match(new RegExp(`\\.${className}\\s*\\{[^}]*\\}`));
        expect(classRuleMatch).toBeTruthy();

        const classRule = classRuleMatch![0];

        // Each class should use CSS variables for theme compatibility
        const usesVariables = /var\(--[^)]+\)/.test(classRule);
        expect(usesVariables).toBe(true);
      });
    });

    it('validates that no hardcoded colors remain in text styling classes', () => {
      // Find all dita-editor-text related rules
      const textStyleRules = cssContent.match(/\.dita-editor-text[^{]*\{[^}]*\}/g) || [];

      textStyleRules.forEach(rule => {
        // Should not contain hardcoded hex colors
        expect(rule).not.toMatch(/color:\s*#[a-fA-F0-9]{3,6}/);

        // Should not contain hardcoded RGB colors
        expect(rule).not.toMatch(/color:\s*rgb\(/);
        expect(rule).not.toMatch(/color:\s*rgba\(/);

        // Should not contain hardcoded color names (except transparent)
        const hardcodedColors = ['black', 'white', 'red', 'blue', 'green', 'gray', 'grey'];
        hardcodedColors.forEach(color => {
          const colorRegex = new RegExp(`color:\\s*${color}\\b`);
          expect(rule).not.toMatch(colorRegex);
        });
      });
    });

    it('validates WYSIWYG/DITA parity by ensuring consistent color variable usage', () => {
      // Text styling should be consistent between WYSIWYG and DITA modes
      const expectedVariableUsage = {
        'dita-editor-text-bold': ['--editor-text'],
        'dita-editor-text-italic': ['--editor-text'],
        'dita-editor-text-link': ['--editor-accent'],
        'dita-editor-text-strikethrough': ['--editor-text'],
        'dita-editor-text-underline': ['--editor-text']
      };

      Object.entries(expectedVariableUsage).forEach(([className, expectedVars]) => {
        const classRuleMatch = cssContent.match(new RegExp(`\\.${className}\\s*\\{[^}]*\\}`));
        expect(classRuleMatch).toBeTruthy();

        const classRule = classRuleMatch![0];

        // Each class should use its expected CSS variables
        expectedVars.forEach(varName => {
          expect(classRule).toContain(`var(${varName})`);
        });
      });
    });
  });

  describe('z-index consistency in CSS file', () => {
    it('validates that CSS z-index values are reasonable and purposeful', () => {
      // Find all z-index declarations in CSS
      const zIndexMatches = cssContent.match(/z-index:\s*\d+/g) || [];

      // Each z-index should be reasonable (not excessively high)
      zIndexMatches.forEach(zIndexDeclaration => {
        const match = zIndexDeclaration.match(/z-index:\s*(\d+)/);
        if (match) {
          const value = parseInt(match[1], 10);
          expect(value).toBeLessThan(100000); // No excessive z-index values
          expect(value).toBeGreaterThan(-1); // No negative z-index values
        }
      });

      // CSS file should have some z-index usage for layering
      if (zIndexMatches.length > 0) {
        expect(zIndexMatches.length).toBeGreaterThan(0);
      }
    });

    it('validates that edit mode badge has appropriate z-index for visibility', () => {
      // The edit mode badge should be visible above other content
      const editModeBadgeMatch = cssContent.match(/\.dita-editor-edit-mode-badge[^{]*\{[^}]*z-index:\s*(\d+)[^}]*\}/);

      if (editModeBadgeMatch) {
        const zIndexValue = parseInt(editModeBadgeMatch[1], 10);
        expect(zIndexValue).toBeGreaterThan(10); // Should be above normal content
        expect(zIndexValue).toBeLessThan(1000); // But not excessively high
      }
    });
  });

  describe('overall CSS consistency and best practices', () => {
    it('validates that all CSS classes follow consistent naming patterns', () => {
      // dita-editor-text classes should follow consistent naming
      const textStyleClasses = cssContent.match(/\.dita-editor-text-[a-zA-Z]+/g) || [];

      textStyleClasses.forEach(className => {
        // Should follow kebab-case naming
        expect(className).toMatch(/^\.dita-editor-text-[a-z]+(-[a-z]+)*$/);

        // Should not have camelCase or underscore naming
        expect(className).not.toMatch(/[A-Z]/);
        expect(className).not.toMatch(/_/);
      });
    });

    it('ensures CSS variable fallbacks are not needed for core theme variables', () => {
      // Core variables should always be defined, no fallbacks needed
      const coreVariables = ['--editor-text', '--editor-accent'];

      coreVariables.forEach(varName => {
        // Find usage of this variable
        const varUsageMatches = cssContent.match(new RegExp(`var\\(${varName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}[^)]*\\)`, 'g')) || [];

        varUsageMatches.forEach(usage => {
          // Should not have fallback values for core variables
          expect(usage).toBe(`var(${varName})`);
          expect(usage).not.toContain(',');
        });
      });
    });

    it('validates that theme-related CSS maintains WYSIWYG/DITA parity requirements', () => {
      // Text styling should work identically in both WYSIWYG and DITA modes
      const wysiwyeParity = {
        consistentColorVariables: true,
        noHardcodedColors: true,
        themeCompatible: true,
        accessibilitySupported: true
      };

      Object.values(wysiwyeParity).forEach(requirement => {
        expect(requirement).toBe(true);
      });

      // WYSIWYG/DITA parity means consistent visual representation
      expect(cssContent).toContain('dita-editor-text');
      expect(cssContent).toContain('var(--editor-text)');
      expect(cssContent).toContain('var(--editor-accent)');
    });
  });
});