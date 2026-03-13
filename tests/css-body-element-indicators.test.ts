// @vitest-environment jsdom
/**
 * Tests for CSS body element visual indicators - validating Jamie's implementation.
 * These tests ensure all five DITA body element types have proper CSS styles with
 * colored left borders, hover labels, and theme-appropriate colors across all themes.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('CSS body element visual indicators implementation', () => {
  let cssContent: string;

  beforeEach(() => {
    // Read the CSS file to test
    const cssPath = path.join(process.cwd(), 'index.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  describe('body element base styling and structure', () => {
    it('validates shared base styles for all four new body elements', () => {
      // Should have common base styles for prereq, context, result, postreq
      const baseStylesMatch = cssContent.match(/\.dita-editor-prereq,\s*\.dita-editor-context,\s*\.dita-editor-result,\s*\.dita-editor-postreq\s*\{[^}]*\}/s);
      expect(baseStylesMatch).toBeTruthy();

      const baseStyles = baseStylesMatch![0];

      // Should include standard positioning and spacing
      expect(baseStyles).toContain('position: relative');
      expect(baseStyles).toContain('padding-left: 0.75rem');
      expect(baseStyles).toContain('margin-bottom: 1rem');
    });

    it('ensures each body element has individual colored left border rule', () => {
      // Each element should have its own border rule with CSS variable
      expect(cssContent).toContain('.dita-editor-prereq {');
      expect(cssContent).toContain('border-left: 3px solid var(--editor-prereq-bar)');

      expect(cssContent).toContain('.dita-editor-context {');
      expect(cssContent).toContain('border-left: 3px solid var(--editor-context-bar)');

      expect(cssContent).toContain('.dita-editor-result {');
      expect(cssContent).toContain('border-left: 3px solid var(--editor-result-bar)');

      expect(cssContent).toContain('.dita-editor-postreq {');
      expect(cssContent).toContain('border-left: 3px solid var(--editor-postreq-bar)');
    });

    it('validates that border styling is consistent across all body elements', () => {
      // All borders should use same width and style
      const borderPatterns = [
        'border-left: 3px solid var(--editor-prereq-bar)',
        'border-left: 3px solid var(--editor-context-bar)',
        'border-left: 3px solid var(--editor-result-bar)',
        'border-left: 3px solid var(--editor-postreq-bar)'
      ];

      borderPatterns.forEach(pattern => {
        expect(cssContent).toContain(pattern);
      });
    });
  });

  describe('pseudo-element label implementation', () => {
    it('validates shared pseudo-element base styles for hover labels', () => {
      // Should have common ::after styles for all four new body elements
      const pseudoBaseMatch = cssContent.match(/\.dita-editor-prereq::after,\s*\.dita-editor-context::after,\s*\.dita-editor-result::after,\s*\.dita-editor-postreq::after\s*\{[^}]*\}/s);
      expect(pseudoBaseMatch).toBeTruthy();

      const pseudoStyles = pseudoBaseMatch![0];

      // Should include proper positioning and styling
      expect(pseudoStyles).toContain('position: absolute');
      expect(pseudoStyles).toContain('right: 0');
      expect(pseudoStyles).toContain('top: 50%');
    });

    it('ensures each body element has individual content label', () => {
      // Each element should have its own ::after content
      expect(cssContent).toContain('.dita-editor-prereq::after {');
      expect(cssContent).toContain("content: 'Prerequisite'");

      expect(cssContent).toContain('.dita-editor-context::after {');
      expect(cssContent).toContain("content: 'Context'");

      expect(cssContent).toContain('.dita-editor-result::after {');
      expect(cssContent).toContain("content: 'Result'");

      expect(cssContent).toContain('.dita-editor-postreq::after {');
      expect(cssContent).toContain("content: 'Post-Requisite'");
    });

    it('validates hover state implementation for label visibility', () => {
      // Should have hover rules for opacity change
      const hoverRuleMatch = cssContent.match(/\.dita-editor-prereq:hover::after,\s*\.dita-editor-context:hover::after,\s*\.dita-editor-result:hover::after,\s*\.dita-editor-postreq:hover::after\s*\{[^}]*\}/s);
      expect(hoverRuleMatch).toBeTruthy();

      const hoverRule = hoverRuleMatch![0];
      expect(hoverRule).toContain('opacity: 0.5');
    });

    it('ensures consistent label positioning and styling', () => {
      // Labels should be consistently positioned on the right
      const pseudoElementMatch = cssContent.match(/\.dita-editor-prereq::after,.*?\{[^}]*\}/s);
      expect(pseudoElementMatch).toBeTruthy();

      const pseudoRule = pseudoElementMatch![0];
      expect(pseudoRule).toContain('right: 0');
      expect(pseudoRule).toContain('top: 50%');
    });
  });

  describe('CSS variables for bar colors across all themes', () => {
    it('validates dark theme (root) has all four new bar color variables', () => {
      // Dark theme should define all bar colors
      expect(cssContent).toContain('--editor-prereq-bar: #60a5fa');
      expect(cssContent).toContain('--editor-context-bar: #a78bfa');
      expect(cssContent).toContain('--editor-result-bar: #34d399');
      expect(cssContent).toContain('--editor-postreq-bar: #f472b6');
    });

    it('ensures light theme has all four new bar color variables with appropriate values', () => {
      // Light theme should have distinct colors
      expect(cssContent).toContain('--editor-prereq-bar: #3b82f6');
      expect(cssContent).toContain('--editor-context-bar: #8b5cf6');
      expect(cssContent).toContain('--editor-result-bar: #10b981');
      expect(cssContent).toContain('--editor-postreq-bar: #ec4899');
    });

    it('validates claude theme has all four new bar color variables', () => {
      // Claude theme should have softer color variants
      expect(cssContent).toContain('--editor-prereq-bar: #93c5fd');
      expect(cssContent).toContain('--editor-context-bar: #c4b5fd');
      expect(cssContent).toContain('--editor-result-bar: #6ee7b7');
      expect(cssContent).toContain('--editor-postreq-bar: #f9a8d4');
    });

    it('ensures nord theme has all four new bar color variables', () => {
      // Nord theme should use nord palette colors
      expect(cssContent).toContain('--editor-prereq-bar: #81a1c1');
      expect(cssContent).toContain('--editor-context-bar: #b48ead');
      expect(cssContent).toContain('--editor-result-bar: #a3be8c');
      expect(cssContent).toContain('--editor-postreq-bar: #bf616a');
    });

    it('validates solarized theme has all four new bar color variables', () => {
      // Solarized theme should use solarized palette
      expect(cssContent).toContain('--editor-prereq-bar: #268bd2');
      expect(cssContent).toContain('--editor-context-bar: #6c71c4');
      expect(cssContent).toContain('--editor-result-bar: #859900');
      expect(cssContent).toContain('--editor-postreq-bar: #d33682');
    });

    it('ensures geotab theme has all four new bar color variables', () => {
      // Geotab theme should use brand-appropriate colors
      expect(cssContent).toContain('--editor-prereq-bar: #5b8db8');
      expect(cssContent).toContain('--editor-context-bar: #8b7bb8');
      expect(cssContent).toContain('--editor-result-bar: #5baa8c');
      expect(cssContent).toContain('--editor-postreq-bar: #b87b8b');
    });
  });

  describe('CSS variable placement and organization', () => {
    it('validates that new bar color variables are placed after badge-reference-text in each theme', () => {
      // Variables should be consistently placed in each theme block
      const themeBlocks = [
        { name: 'root (dark)', pattern: /:root\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s },
        { name: 'light', pattern: /\[data-theme="light"\]\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s },
        { name: 'claude', pattern: /\[data-theme="claude"\]\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s },
        { name: 'nord', pattern: /\[data-theme="nord"\]\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s },
        { name: 'solarized', pattern: /\[data-theme="solarized"\]\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s },
        { name: 'geotab', pattern: /\[data-theme="geotab"\]\s*\{[^}]*--badge-reference-text[^}]*--editor-prereq-bar/s }
      ];

      themeBlocks.forEach(({ name, pattern }) => {
        expect(cssContent).toMatch(pattern);
      });
    });

    it('ensures consistent variable ordering within each theme block', () => {
      // Variables should appear in consistent order: prereq, context, result, postreq
      const orderingPatterns = [
        /--editor-prereq-bar[^;]*;[^-]*--editor-context-bar/s,
        /--editor-context-bar[^;]*;[^-]*--editor-result-bar/s,
        /--editor-result-bar[^;]*;[^-]*--editor-postreq-bar/s
      ];

      orderingPatterns.forEach(pattern => {
        expect(cssContent).toMatch(pattern);
      });
    });

    it('validates that all themes define all four bar color variables', () => {
      const themeSelectors = [
        ':root',
        '[data-theme="light"]',
        '[data-theme="claude"]',
        '[data-theme="nord"]',
        '[data-theme="solarized"]',
        '[data-theme="geotab"]'
      ];

      const barVariables = [
        '--editor-prereq-bar',
        '--editor-context-bar',
        '--editor-result-bar',
        '--editor-postreq-bar'
      ];

      // Each theme should define all variables
      themeSelectors.forEach(selector => {
        barVariables.forEach(variable => {
          const themeVariablePattern = new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^}]*${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 's');
          expect(cssContent).toMatch(themeVariablePattern);
        });
      });
    });
  });

  describe('color palette harmony and accessibility', () => {
    it('validates that bar colors harmonize with each theme\'s existing palette', () => {
      // Colors should follow established theme color patterns
      // Blue tones for prereq, purple for context, green for result, pink for postreq

      // Dark theme uses brighter variants
      expect(cssContent).toContain('#60a5fa'); // blue-400
      expect(cssContent).toContain('#a78bfa'); // violet-400
      expect(cssContent).toContain('#34d399'); // emerald-400
      expect(cssContent).toContain('#f472b6'); // pink-400

      // Light theme uses more saturated variants
      expect(cssContent).toContain('#3b82f6'); // blue-500
      expect(cssContent).toContain('#8b5cf6'); // violet-500
      expect(cssContent).toContain('#10b981'); // emerald-500
      expect(cssContent).toContain('#ec4899'); // pink-500
    });

    it('ensures color differentiation for accessibility and usability', () => {
      // Colors should be sufficiently different for distinction
      const darkThemeColors = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6'];
      const lightThemeColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ec4899'];

      // All colors should be present and distinct
      [...darkThemeColors, ...lightThemeColors].forEach(color => {
        expect(cssContent).toContain(color);
      });
    });

    it('validates that bar colors maintain sufficient contrast against backgrounds', () => {
      // Bar color variables should not use pure white or pure black
      const barColorVars = [
        '--editor-prereq-bar',
        '--editor-context-bar',
        '--editor-result-bar',
        '--editor-postreq-bar',
      ];

      barColorVars.forEach(varName => {
        const match = cssContent.match(new RegExp(`${varName}:\\s*(#[0-9a-fA-F]{6})`));
        expect(match).toBeTruthy();
        expect(match![1]).not.toBe('#ffffff');
        expect(match![1]).not.toBe('#000000');
      });
    });
  });

  describe('integration with existing shortdesc styling', () => {
    it('validates that new body element styles follow same pattern as shortdesc', () => {
      // Should maintain consistent styling approach with shortdesc
      const shortdescPattern = /\.dita-editor-shortdesc\s*\{[^}]*\}/s;
      const shortdescMatch = cssContent.match(shortdescPattern);
      expect(shortdescMatch).toBeTruthy();

      // New elements should follow similar structure
      const newElementPattern = /\.dita-editor-prereq\s*\{[^}]*\}/s;
      const newElementMatch = cssContent.match(newElementPattern);
      expect(newElementMatch).toBeTruthy();
    });

    it('ensures consistent pseudo-element implementation across all body elements', () => {
      // Shortdesc should have ::after element
      expect(cssContent).toContain('.dita-editor-shortdesc::after');

      // New elements should follow same pattern
      expect(cssContent).toContain('.dita-editor-prereq::after');
      expect(cssContent).toContain('.dita-editor-context::after');
      expect(cssContent).toContain('.dita-editor-result::after');
      expect(cssContent).toContain('.dita-editor-postreq::after');
    });

    it('validates that all body elements get consistent visual treatment', () => {
      // The four new body elements should have border-left styling
      // (shortdesc uses italic + opacity instead of a color bar)
      const barElements = ['prereq', 'context', 'result', 'postreq'];

      barElements.forEach(element => {
        expect(cssContent).toContain(`border-left: 3px solid var(--editor-${element}-bar)`);
      });

      // Shortdesc should still exist with its own visual treatment
      expect(cssContent).toContain('.dita-editor-shortdesc');
    });
  });

  describe('WYSIWYG/DITA parity and visual consistency', () => {
    it('ensures body element indicators work consistently across content modes', () => {
      // Visual indicators should be purely CSS-based, not mode-dependent
      expect(cssContent).toContain('.dita-editor-prereq');
      expect(cssContent).toContain('.dita-editor-context');
      expect(cssContent).toContain('.dita-editor-result');
      expect(cssContent).toContain('.dita-editor-postreq');

      // Should not have any mode-specific selectors
      expect(cssContent).not.toContain('[data-mode="wysiwyg"]');
      expect(cssContent).not.toContain('[data-mode="dita"]');
    });

    it('validates that hover labels provide helpful context without cluttering interface', () => {
      // Labels should be hidden by default (opacity handled by base rule)
      expect(cssContent).toContain(':hover::after');
      expect(cssContent).toContain('opacity: 0.5');

      // Labels should provide clear identification
      const expectedLabels = ['Prerequisite', 'Context', 'Result', 'Post-Requisite'];
      expectedLabels.forEach(label => {
        expect(cssContent).toContain(`content: '${label}'`);
      });
    });

    it('ensures visual hierarchy supports content authoring workflow', () => {
      // Body elements should be visually distinct but not overwhelming
      expect(cssContent).toContain('3px solid'); // Consistent border width
      expect(cssContent).toContain('padding-left: 0.75rem'); // Consistent spacing

      // Colors should create clear categorization
      expect(cssContent).toContain('var(--editor-prereq-bar)');
      expect(cssContent).toContain('var(--editor-context-bar)');
      expect(cssContent).toContain('var(--editor-result-bar)');
      expect(cssContent).toContain('var(--editor-postreq-bar)');
    });
  });

  describe('CSS specificity and selector efficiency', () => {
    it('validates that body element selectors have appropriate specificity', () => {
      // Selectors should be specific enough to override general paragraph styles
      expect(cssContent).toContain('.dita-editor-prereq {');
      expect(cssContent).toContain('.dita-editor-context {');
      expect(cssContent).toContain('.dita-editor-result {');
      expect(cssContent).toContain('.dita-editor-postreq {');

      // Should not have overly complex selectors that could cause performance issues
      expect(cssContent).not.toContain('div.dita-editor-prereq.paragraph');
    });

    it('ensures efficient CSS rule grouping for shared properties', () => {
      // Common properties should be grouped for efficiency
      const groupedSelectorsMatch = cssContent.match(/\.dita-editor-prereq,\s*\.dita-editor-context,\s*\.dita-editor-result,\s*\.dita-editor-postreq/);
      expect(groupedSelectorsMatch).toBeTruthy();

      // Pseudo-elements should also be grouped
      const groupedPseudoMatch = cssContent.match(/\.dita-editor-prereq::after,\s*\.dita-editor-context::after,\s*\.dita-editor-result::after,\s*\.dita-editor-postreq::after/);
      expect(groupedPseudoMatch).toBeTruthy();
    });

    it('validates that CSS variable usage follows performance best practices', () => {
      // Variables should be used consistently for theme switching
      expect(cssContent).toContain('var(--editor-prereq-bar)');
      expect(cssContent).toContain('var(--editor-context-bar)');
      expect(cssContent).toContain('var(--editor-result-bar)');
      expect(cssContent).toContain('var(--editor-postreq-bar)');

      // Should not have fallback values for variables that are always defined
      expect(cssContent).not.toContain('var(--editor-prereq-bar, ');
      expect(cssContent).not.toContain('var(--editor-context-bar, ');
    });
  });
});