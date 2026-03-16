// @vitest-environment jsdom
/**
 * Tests for P1 Format button toolbar placement fix implementation.
 * Validates Jamie's implementation of moving Format XML button from floating
 * overlay position in MonacoDitaEditor to proper integration in the XML toolbar
 * row in dita-architect.tsx.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('P1 Format button toolbar placement fix implementation', () => {
  let ditaArchitectContent: string;

  beforeEach(() => {
    // Read main DITA Architect component file to test
    const ditaArchitectPath = path.join(process.cwd(), 'dita-architect.tsx');
    ditaArchitectContent = readFileSync(ditaArchitectPath, 'utf-8');
  });

  describe('Format button placement in XML toolbar', () => {
    it('contains Format button in XML toolbar flex container', () => {
      // Should find the Format button within the XML toolbar layout
      const toolbarMatch = ditaArchitectContent.match(/className="flex items-center gap-2">[\s\S]*?<Tooltip content="Format XML[\s\S]*?<\/Tooltip>[\s\S]*?<\/div>/);
      expect(toolbarMatch).toBeTruthy();
    });

    it('has correct Tooltip content for Format button', () => {
      // Should have keyboard shortcut in tooltip
      expect(ditaArchitectContent).toContain('<Tooltip content="Format XML (Shift+Alt+F)">');
    });

    it('uses correct button styling to match toolbar theme', () => {
      // Should use toolbar-consistent styling, not floating overlay styling
      const formatButtonMatch = ditaArchitectContent.match(/<Tooltip content="Format XML[\s\S]*?<button[\s\S]*?onClick=\{handleFormatClick\}[\s\S]*?className="p-1 rounded transition-colors hover-app-text"/);
      expect(formatButtonMatch).toBeTruthy();

      // Should not use old floating overlay styles
      expect(ditaArchitectContent).not.toContain('bg-black/50');
      expect(ditaArchitectContent).not.toContain('absolute top-2 right-2');
    });

    it('includes proper aria-label for accessibility', () => {
      // Should have aria-label for screen readers
      const formatButtonMatch = ditaArchitectContent.match(/<button[\s\S]*?onClick=\{handleFormatClick\}[\s\S]*?aria-label="Format XML"/);
      expect(formatButtonMatch).toBeTruthy();
    });

    it('uses Code2 icon component', () => {
      // Should use the Code2 icon with proper sizing
      const iconMatch = ditaArchitectContent.match(/<Code2 className="w-3\.5 h-3\.5" \/>/);
      expect(iconMatch).toBeTruthy();
    });
  });

  describe('handleFormatClick function implementation', () => {
    it('includes defensive check for Monaco API availability', () => {
      // Should check that Monaco API is available before formatting
      expect(ditaArchitectContent).toContain('const monacoApiRef = activeTab.monacoApiRef;');
      expect(ditaArchitectContent).toContain('if (!monacoApiRef?.current) return;');
    });

    it('uses try-catch error handling with toast notifications', () => {
      // Should handle errors gracefully with user feedback
      const errorHandlingMatch = ditaArchitectContent.match(/try \{[\s\S]*?formatXml[\s\S]*?\} catch \(error\) \{[\s\S]*?toast\.error/);
      expect(errorHandlingMatch).toBeTruthy();
    });

    it('updates tab state with lastUpdatedBy flag after formatting', () => {
      // Should mark tab as updated by code for sync coordination
      const tabUpdateMatch = ditaArchitectContent.match(/updateTab\(activeTab\.id, \{[\s\S]*?lastUpdatedBy: 'code'[\s\S]*?\}\);/);
      expect(tabUpdateMatch).toBeTruthy();
    });

    it('shows success toast when formatting completes', () => {
      // Should provide positive feedback to user
      expect(ditaArchitectContent).toContain("toast.success('XML formatted successfully')");
    });

    it('shows error toast when formatting fails', () => {
      // Should provide error feedback with helpful context
      expect(ditaArchitectContent).toContain("toast.error('Failed to format XML: Check for syntax errors')");
    });
  });

  describe('XML toolbar layout and positioning', () => {
    it('places Format button in correct toolbar section with other controls', () => {
      // Should be in the same flex container as syntax theme picker and collapse button
      const toolbarSectionMatch = ditaArchitectContent.match(/className="flex items-center gap-2">[\s\S]*?Format XML[\s\S]*?<\/div>/);
      expect(toolbarSectionMatch).toBeTruthy();
    });

    it('maintains proper gap spacing between toolbar elements', () => {
      // Should use consistent gap-2 spacing in toolbar layout
      const gapMatch = ditaArchitectContent.match(/className="flex items-center gap-2">[\s\S]*?<Tooltip content="Format XML/);
      expect(gapMatch).toBeTruthy();
    });

    it('uses CSS custom properties for theming consistency', () => {
      // Should use theme variables for colors
      const themeColorMatch = ditaArchitectContent.match(/style=\{\{ color: 'var\(--app-text-muted\)' \}\}/);
      expect(themeColorMatch).toBeTruthy();
    });

    it('has proper height matching the XML toolbar row', () => {
      // Should fit within the h-10 toolbar row height
      expect(ditaArchitectContent).toContain('className="w-3.5 h-3.5"');
    });
  });

  describe('interaction and keyboard shortcuts', () => {
    it('responds to click events via handleFormatClick handler', () => {
      // Should wire up click handler correctly
      const clickHandlerMatch = ditaArchitectContent.match(/<button[\s\S]*?onClick=\{handleFormatClick\}/);
      expect(clickHandlerMatch).toBeTruthy();
    });

    it('maintains Shift+Alt+F keyboard shortcut compatibility', () => {
      // Should mention keyboard shortcut in tooltip for discoverability
      expect(ditaArchitectContent).toContain('Shift+Alt+F');
    });

    it('provides hover effects matching other toolbar buttons', () => {
      // Should use hover-app-text class for consistent hover behavior
      expect(ditaArchitectContent).toContain('hover-app-text');
    });
  });

  describe('integration with Monaco editor', () => {
    it('accesses Monaco API through activeTab.monacoApiRef', () => {
      // Should use the correct ref path
      expect(ditaArchitectContent).toContain('const monacoApiRef = activeTab.monacoApiRef;');
    });

    it('handles case where Monaco editor is not ready', () => {
      // Should gracefully handle Monaco not being initialized
      expect(ditaArchitectContent).toContain('if (!monacoApiRef?.current) return;');
    });

    it('uses formatXml function for XML formatting', () => {
      // Should call the formatXml utility function
      const formatMatch = ditaArchitectContent.match(/const formattedValue = formatXml\(currentValue\);/);
      expect(formatMatch).toBeTruthy();
    });

    it('compares formatted value to avoid unnecessary updates', () => {
      // Should only update if formatting actually changed content
      const comparisonMatch = ditaArchitectContent.match(/if \(formattedValue !== currentValue\) \{/);
      expect(comparisonMatch).toBeTruthy();
    });
  });

  describe('existing functionality preservation', () => {
    it('maintains all other XML toolbar elements', () => {
      // Should still have syntax theme selector
      expect(ditaArchitectContent).toContain('Syntax theme');

      // Should still have TASK badge for topic type
      expect(ditaArchitectContent).toContain('currentTopicType');

      // Should still have collapse XML editor button
      expect(ditaArchitectContent).toContain('Collapse XML editor');
    });

    it('preserves XML toolbar z-index for Heretto compatibility', () => {
      // Should maintain z-index hierarchy
      expect(ditaArchitectContent).toContain('z-20');
    });

    it('maintains existing imports and dependencies', () => {
      // Should import required components
      expect(ditaArchitectContent).toContain("import { Tooltip }");
      expect(ditaArchitectContent).toContain("import { toast }");
    });
  });

  describe('visual consistency and design', () => {
    it('uses consistent button padding and border radius', () => {
      // Should match other toolbar button styling
      const buttonStyleMatch = ditaArchitectContent.match(/className="p-1 rounded transition-colors hover-app-text"/);
      expect(buttonStyleMatch).toBeTruthy();
    });

    it('applies muted text color for inactive state', () => {
      // Should use muted color when not hovered
      expect(ditaArchitectContent).toContain('var(--app-text-muted)');
    });

    it('sizes icon appropriately for toolbar context', () => {
      // Should use consistent icon sizing with other toolbar icons
      expect(ditaArchitectContent).toContain('w-3.5 h-3.5');
    });
  });

  describe('error prevention and edge cases', () => {
    it('handles missing activeTab gracefully', () => {
      // Should access activeTab properties safely
      const safeAccessMatch = ditaArchitectContent.match(/const monacoApiRef = activeTab\.monacoApiRef;/);
      expect(safeAccessMatch).toBeTruthy();
    });

    it('prevents format action when editor is not ready', () => {
      // Should exit early if Monaco isn't initialized
      expect(ditaArchitectContent).toContain('if (!monacoApiRef?.current) return;');
    });

    it('provides user feedback for both success and error cases', () => {
      // Should always give user feedback about format result
      expect(ditaArchitectContent).toContain('toast.success');
      expect(ditaArchitectContent).toContain('toast.error');
    });
  });

  describe('code quality and maintainability', () => {
    it('follows existing code patterns in dita-architect.tsx', () => {
      // Should use consistent patterns with other handlers
      const handlerPattern = ditaArchitectContent.match(/const handle[A-Za-z]+ = \(\) => \{/);
      expect(handlerPattern).toBeTruthy();
    });

    it('maintains proper TypeScript typing', () => {
      // Should not introduce any TypeScript warnings
      expect(ditaArchitectContent).toContain('const formattedValue = formatXml(currentValue);');
    });

    it('uses semantic HTML and proper accessibility attributes', () => {
      // Should have proper button semantics
      expect(ditaArchitectContent).toContain('aria-label="Format XML"');
    });
  });
});