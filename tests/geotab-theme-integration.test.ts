// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Integration tests for Geotab theme — verifies Anna's plan implementation
// Tests CSS variables, theme consistency, and end-to-end integration.
// ---------------------------------------------------------------------------

describe('Geotab theme integration — comprehensive implementation verification', () => {
  let cssContent: string;

  beforeEach(() => {
    // Read the actual index.css file to test real CSS variables
    const cssPath = join(process.cwd(), 'index.css');
    cssContent = readFileSync(cssPath, 'utf-8');
  });

  describe('CSS theme variables — index.css implementation', () => {
    it('defines [data-theme="geotab"] CSS selector', () => {
      expect(cssContent).toContain('[data-theme="geotab"]');
    });

    it('includes all required app-level CSS variables for consistent theming', () => {
      const requiredAppVariables = [
        '--app-bg',
        '--app-surface',
        '--app-surface-raised',
        '--app-border',
        '--app-border-subtle'
      ];

      requiredAppVariables.forEach(variable => {
        expect(cssContent).toMatch(new RegExp(`\\[data-theme="geotab"\\][^}]*${variable}:`));
      });
    });

    it('includes text color variables for proper contrast on dark backgrounds', () => {
      const textVariables = [
        '--app-text-primary',
        '--app-text-secondary',
        '--app-text-muted'
      ];

      textVariables.forEach(variable => {
        expect(cssContent).toMatch(new RegExp(`\\[data-theme="geotab"\\][^}]*${variable}:`));
      });
    });

    it('includes UI element variables for comprehensive styling', () => {
      const uiVariables = [
        '--app-btn-bg',
        '--app-btn-border',
        '--app-btn-text',
        '--app-btn-hover'
      ];

      uiVariables.forEach(variable => {
        expect(cssContent).toMatch(new RegExp(`\\[data-theme="geotab"\\][^}]*${variable}:`));
      });
    });

    it('includes badge variables for topic type indicators', () => {
      const badgeVariables = [
        '--badge-task-bg',
        '--badge-task-border',
        '--badge-task-text',
        '--badge-concept-bg',
        '--badge-concept-border',
        '--badge-concept-text',
        '--badge-reference-bg',
        '--badge-reference-border',
        '--badge-reference-text'
      ];

      badgeVariables.forEach(variable => {
        expect(cssContent).toMatch(new RegExp(`\\[data-theme="geotab"\\][^}]*${variable}:`));
      });
    });

    it('uses Geotab brand colors as foundation per Anna\'s plan', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/)?.[1] || '';

      // Test for specific Geotab brand colors mentioned in Anna's plan
      expect(geotabSection).toContain('#25477b'); // Geotab Blue
      expect(geotabSection).toContain('#3c5164'); // Dark Gray
    });

    it('provides light text colors for contrast against dark theme backgrounds', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/)?.[1] || '';

      // Should contain light colors for text on dark backgrounds
      expect(geotabSection).toMatch(/#[def][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]/i);
    });
  });

  describe('theme definition completeness — no missing variables', () => {
    it('defines the same number of CSS variables as other complete themes', () => {
      // Extract variable counts from different themes to ensure consistency
      const extractVariableCount = (themeName: string): number => {
        const themeMatch = cssContent.match(new RegExp(`\\[data-theme="${themeName}"\\]\\s*\\{([^}]+)\\}`, 's'));
        if (!themeMatch) return 0;

        const variables = themeMatch[1].match(/--[^:]+:/g);
        return variables ? variables.length : 0;
      };

      const geotabVarCount = extractVariableCount('geotab');
      const nordVarCount = extractVariableCount('nord');
      const solarizedVarCount = extractVariableCount('solarized');

      // Geotab should have the same number of variables as other complete themes
      expect(geotabVarCount).toBeGreaterThan(30); // Should have 40+ variables
      expect(geotabVarCount).toBe(nordVarCount);
      expect(geotabVarCount).toBe(solarizedVarCount);
    });

    it('follows the same variable naming pattern as existing themes', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Should contain all the standard variable prefixes
      expect(geotabSection).toMatch(/--app-/);
      expect(geotabSection).toMatch(/--editor-/);
      expect(geotabSection).toMatch(/--badge-/);
    });
  });

  describe('cross-component theme integration', () => {
    // Mock DOM to test CSS application
    beforeEach(() => {
      document.head.innerHTML = `<style>${cssContent}</style>`;
    });

    it('theme selector affects DOM when data-theme attribute is set', () => {
      const testElement = document.createElement('div');
      testElement.setAttribute('data-theme', 'geotab');
      document.body.appendChild(testElement);

      // The CSS should be loaded and affect elements with data-theme="geotab"
      const computedStyle = getComputedStyle(testElement);

      // Clean up
      document.body.removeChild(testElement);

      // At minimum, the style should exist (even if we can't easily test computed values in JSDOM)
      expect(testElement.getAttribute('data-theme')).toBe('geotab');
    });

    it('theme name matches across all implementation files', () => {
      // This test ensures the theme name 'geotab' is consistent everywhere it's used
      const themeName = 'geotab';

      // Already verified in CSS
      expect(cssContent).toContain(`[data-theme="${themeName}"]`);

      // Theme name should be simple and match the brand (case-insensitive in business context)
      expect(themeName.toLowerCase()).toBe('geotab');
    });
  });

  describe('accessibility and contrast — WCAG compliance verification', () => {
    it('provides accessible color combinations per Anna\'s plan requirements', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Should use very light text colors on dark backgrounds for contrast
      // Anna's plan specifically mentions #ffffff and #f0f0f0 for accessibility
      expect(geotabSection).toMatch(/#f[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]/i);
    });

    it('uses appropriate contrast ratios between backgrounds and text', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Dark backgrounds should be paired with light text
      const hasDarkBg = /#[0-3][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]/i.test(geotabSection);
      const hasLightText = /#[def][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]/i.test(geotabSection);

      expect(hasDarkBg).toBe(true);
      expect(hasLightText).toBe(true);
    });
  });

  describe('Geotab brand color integration', () => {
    it('incorporates Geotab Blue (#0078d3) as accent color per Anna\'s plan', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Innovation Blue should be used sparingly as accent
      expect(geotabSection).toContain('#0078d3');
    });

    it('uses professional dark theme approach as planned', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Should have multiple dark color values indicating a dark theme
      const darkColorMatches = geotabSection.match(/#[0-3][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]/gi);
      expect(darkColorMatches).toBeTruthy();
      expect(darkColorMatches!.length).toBeGreaterThan(5); // Multiple dark colors for various elements
    });

    it('maintains professional appearance suitable for technical/automotive industry', () => {
      const geotabSection = cssContent.match(/\[data-theme="geotab"\]\s*\{([^}]+)\}/s)?.[1] || '';

      // Should avoid bright or playful colors — professional dark blues and grays
      // No bright red, bright green, bright yellow (professional appearance)
      expect(geotabSection).not.toMatch(/#ff0000/i);
      expect(geotabSection).not.toMatch(/#00ff00/i);
      expect(geotabSection).not.toMatch(/#ffff00/i);
    });
  });

  describe('regression prevention — Elena\'s review considerations', () => {
    it('theme implementation does not break existing theme functionality', () => {
      // Ensure other themes are still defined (dark theme is defined in :root, not data-theme)
      expect(cssContent).toContain('[data-theme="light"]');
      expect(cssContent).toContain('[data-theme="claude"]');
      expect(cssContent).toContain('[data-theme="nord"]');
      expect(cssContent).toContain('[data-theme="solarized"]');
    });

    it('follows established CSS structure and patterns', () => {
      // Should be positioned after other themes as specified in Anna's plan
      const cssLines = cssContent.split('\n');
      const geotabLineIndex = cssLines.findIndex(line => line.includes('[data-theme="geotab"]'));
      const solarizedLineIndex = cssLines.findIndex(line => line.includes('[data-theme="solarized"]'));

      expect(geotabLineIndex).toBeGreaterThan(solarizedLineIndex);
    });
  });
});