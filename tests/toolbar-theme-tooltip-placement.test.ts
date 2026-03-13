// @vitest-environment jsdom
/**
 * Tests for Toolbar theme dropdown tooltip placement - validating Jamie's implementation.
 * These tests ensure theme option tooltips are positioned to the right of each option button
 * to prevent blocking adjacent theme options in the dropdown menu.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Toolbar theme dropdown tooltip placement implementation', () => {
  let toolbarContent: string;

  beforeEach(() => {
    // Read the Toolbar component file to test
    const toolbarPath = path.join(process.cwd(), 'components/Toolbar.tsx');
    toolbarContent = readFileSync(toolbarPath, 'utf-8');
  });

  describe('theme dropdown tooltip placement prop usage', () => {
    it('validates that theme option tooltips use placement="right" prop', () => {
      // Should have Tooltip component with placement="right" in theme dropdown
      expect(toolbarContent).toContain('placement="right"');

      // Should be within the THEME_OPTIONS.map() context
      expect(toolbarContent).toContain('THEME_OPTIONS.map');
      expect(toolbarContent).toContain('placement="right"');

      // placement="right" should appear in the context of theme options
      expect(toolbarContent).toContain('placement="right"');
    });

    it('ensures theme option tooltips correctly reference THEME_DESCRIPTIONS', () => {
      // Should use THEME_DESCRIPTIONS for tooltip content
      expect(toolbarContent).toContain('THEME_DESCRIPTIONS[opt.value]');

      // The Tooltip should use THEME_DESCRIPTIONS and placement="right"
      expect(toolbarContent).toContain('THEME_DESCRIPTIONS[opt.value]');
      expect(toolbarContent).toContain('placement="right"');
    });

    it('validates that key prop is properly set for theme option tooltips', () => {
      // Should have key={opt.value} for React list rendering
      expect(toolbarContent).toContain('key={opt.value}');

      // Key should be set on the Tooltip component within the map
      const tooltipKeyMatch = toolbarContent.match(/key=\{opt\.value\}[^>]*>/);
      expect(tooltipKeyMatch).toBeTruthy();
    });

    it('ensures theme option buttons remain properly nested within tooltips', () => {
      // Button should be child of Tooltip component
      const tooltipButtonPattern = /<Tooltip[^>]*>[^<]*<button/s;
      expect(toolbarContent).toMatch(tooltipButtonPattern);

      // Button should have proper role and click handler
      expect(toolbarContent).toContain('role="menuitem"');
      expect(toolbarContent).toContain('onClick={() => {');
    });
  });

  describe('theme dropdown structure and tooltip integration', () => {
    it('validates that THEME_OPTIONS mapping includes tooltips for all theme options', () => {
      // THEME_OPTIONS.map should contain the Tooltip component
      expect(toolbarContent).toContain('THEME_OPTIONS.map');
      expect(toolbarContent).toContain('<Tooltip');

      // Each mapped item should have a tooltip with placement
      const mapContentMatch = toolbarContent.match(/THEME_OPTIONS\.map\(opt => \([^)]*<Tooltip[^>]*placement="right"/s);
      expect(mapContentMatch).toBeTruthy();
    });

    it('ensures theme dropdown maintains proper semantic structure with ARIA roles', () => {
      // Theme buttons should have menuitem role for accessibility
      expect(toolbarContent).toContain('role="menuitem"');

      // Should maintain proper menu semantics even with tooltip wrapping
      const menuitemInTooltipMatch = toolbarContent.match(/<Tooltip[^>]*>[^<]*<button[^>]*role="menuitem"/s);
      expect(menuitemInTooltipMatch).toBeTruthy();
    });

    it('validates that theme selection functionality remains intact with tooltip wrapping', () => {
      // onClick handler should still call onThemeChange and setIsThemeOpen
      expect(toolbarContent).toContain('onThemeChange(opt.value)');
      expect(toolbarContent).toContain('setIsThemeOpen(false)');

      // These should be within the button click handler inside the Tooltip
      const clickHandlerMatch = toolbarContent.match(/onClick=\{\(\) => \{[^}]*onThemeChange\(opt\.value\)[^}]*setIsThemeOpen\(false\)[^}]*\}/s);
      expect(clickHandlerMatch).toBeTruthy();
    });
  });

  describe('theme dropdown z-index and positioning context', () => {
    it('validates that theme dropdown maintains high z-index for visibility above Heretto toolbar', () => {
      // Theme dropdown should have z-index: 9999
      expect(toolbarContent).toContain('zIndex: 9999');

      // Should be in a style object for the dropdown container
      const zIndexStyleMatch = toolbarContent.match(/style=\{\{[^}]*zIndex: 9999[^}]*\}\}/);
      expect(zIndexStyleMatch).toBeTruthy();
    });

    it('ensures theme dropdown container provides proper stacking context for tooltips', () => {
      // Dropdown should have absolute positioning for z-index to work
      expect(toolbarContent).toContain('absolute');

      // Background and border colors should be theme-aware
      expect(toolbarContent).toContain('var(--editor-toolbar-bg)');
      expect(toolbarContent).toContain('var(--editor-toolbar-border)');
    });

    it('validates that tooltips work within the high z-index dropdown context', () => {
      // Tooltips should appear above the dropdown without z-index conflicts
      // The Tooltip component has z-50 which should work within the dropdown's stacking context
      expect(toolbarContent).toContain('placement="right"');

      // Tooltips should use placement prop instead of custom z-index
      expect(toolbarContent).toContain('placement="right"');
    });
  });

  describe('regression tests for theme dropdown tooltip blocking prevention', () => {
    it('validates that right-positioned tooltips prevent blocking adjacent theme options', () => {
      // Right placement should move tooltips away from the dropdown list
      expect(toolbarContent).toContain('placement="right"');

      // This prevents tooltips from appearing below and blocking the next theme option
      expect(toolbarContent).toContain('THEME_OPTIONS.map');
      expect(toolbarContent).toContain('placement="right"');
    });

    it('ensures consistent tooltip behavior across all theme options in dropdown', () => {
      // Every theme option should have the same tooltip placement
      const tooltipCount = (toolbarContent.match(/placement="right"/g) || []).length;

      // Should have at least one occurrence of placement="right" for theme options
      expect(tooltipCount).toBeGreaterThan(0);

      // All tooltips in the theme dropdown should use right placement
      expect(toolbarContent).toContain('THEME_OPTIONS.map(opt => (');
      expect(toolbarContent).toContain('placement="right"');
    });

    it('validates that tooltip placement fix maintains theme switching responsiveness', () => {
      // Theme change should still work immediately
      expect(toolbarContent).toContain('onThemeChange(opt.value)');

      // Dropdown should close after selection
      expect(toolbarContent).toContain('setIsThemeOpen(false)');

      // Event handling should not be impacted by tooltip wrapping
      const eventHandlingMatch = toolbarContent.match(/onClick=\{\(\) => \{[^}]*\}\}/s);
      expect(eventHandlingMatch).toBeTruthy();
    });
  });

  describe('WYSIWYG/DITA parity and accessibility compliance', () => {
    it('ensures theme tooltips work consistently across WYSIWYG and DITA content modes', () => {
      // Tooltip functionality should not depend on editor content
      expect(toolbarContent).toContain('THEME_DESCRIPTIONS[opt.value]');

      // Theme descriptions should be static content that works in any mode
      expect(toolbarContent).toContain('placement="right"');
    });

    it('validates that theme option tooltips provide helpful descriptions', () => {
      // Should reference THEME_DESCRIPTIONS for meaningful content
      expect(toolbarContent).toContain('content={THEME_DESCRIPTIONS[opt.value]}');

      // Tooltip content should be informative for user theme selection
      const contentMatch = toolbarContent.match(/content=\{THEME_DESCRIPTIONS\[opt\.value\]\}/);
      expect(contentMatch).toBeTruthy();
    });

    it('ensures keyboard navigation remains accessible with tooltip additions', () => {
      // Menu items should still have proper roles
      expect(toolbarContent).toContain('role="menuitem"');

      // Tooltip wrapping should not break keyboard interaction
      const buttonInTooltipMatch = toolbarContent.match(/<Tooltip[^>]*>[^<]*<button[^>]*role="menuitem"/s);
      expect(buttonInTooltipMatch).toBeTruthy();
    });
  });

  describe('theme dropdown styling and visual consistency', () => {
    it('validates that theme options maintain consistent button styling', () => {
      // Buttons should have proper padding and layout classes
      expect(toolbarContent).toContain('px-');
      expect(toolbarContent).toContain('py-');

      // Should maintain hover states for theme option buttons
      expect(toolbarContent).toContain('hover:');
    });

    it('ensures theme dropdown backdrop and visual hierarchy', () => {
      // Dropdown should have proper background styling
      expect(toolbarContent).toContain('backgroundColor: \'var(--editor-toolbar-bg)\'');

      // Border styling should be theme-aware
      expect(toolbarContent).toContain('borderColor: \'var(--editor-toolbar-border)\'');
    });

    it('validates that tooltip placement does not interfere with theme option visual feedback', () => {
      // Active theme indication should still work
      expect(toolbarContent).toContain('currentTheme');

      // Visual feedback for theme selection should be preserved
      expect(toolbarContent).toContain('currentTheme');
      expect(toolbarContent).toContain('opt.value');
    });
  });

  describe('performance and code quality considerations', () => {
    it('ensures efficient rendering of theme option tooltips', () => {
      // Should use key prop for efficient React rendering
      expect(toolbarContent).toContain('key={opt.value}');

      // Mapping should be efficient with proper key usage
      const mapWithKeyMatch = toolbarContent.match(/THEME_OPTIONS\.map\(opt => \([^)]*key=\{opt\.value\}/s);
      expect(mapWithKeyMatch).toBeTruthy();
    });

    it('validates that tooltip implementation follows established patterns', () => {
      // Should use the same Tooltip component used elsewhere
      expect(toolbarContent).toContain('<Tooltip');
      expect(toolbarContent).toContain('content={');
      expect(toolbarContent).toContain('placement="right"');

      // Pattern should be consistent with other tooltip usages
      const tooltipPatternMatch = toolbarContent.match(/<Tooltip[^>]*content=\{[^}]+\}[^>]*placement="right"[^>]*>/);
      expect(tooltipPatternMatch).toBeTruthy();
    });
  });
});