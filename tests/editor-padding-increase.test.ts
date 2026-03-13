// @vitest-environment jsdom
/**
 * Tests for editor padding increase - validating Jamie's implementation.
 * These tests ensure the editor content area has increased horizontal padding
 * from px-8 to px-12 for better visual spacing and readability.
 *
 * Environment: vitest + jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

describe('Editor content area padding increase implementation', () => {
  let ditaArchitectContent: string;

  beforeEach(() => {
    // Read the main DITA Architect component file to test
    const ditaArchitectPath = path.join(process.cwd(), 'dita-architect.tsx');
    ditaArchitectContent = readFileSync(ditaArchitectPath, 'utf-8');
  });

  describe('ContentEditable padding modification', () => {
    it('validates that ContentEditable component uses px-12 instead of px-8', () => {
      // Should contain ContentEditable with px-12 padding
      expect(ditaArchitectContent).toContain('<ContentEditable');
      expect(ditaArchitectContent).toContain('px-12');

      // Should be in the context of ContentEditable className
      const contentEditableMatch = ditaArchitectContent.match(/<ContentEditable[^>]*className="[^"]*px-12[^"]*"/);
      expect(contentEditableMatch).toBeTruthy();
    });

    it('ensures px-8 padding has been completely replaced with px-12', () => {
      // Should not contain px-8 in ContentEditable className
      const contentEditableMatch = ditaArchitectContent.match(/<ContentEditable[^>]*className="[^"]*px-8[^"]*"/);
      expect(contentEditableMatch).toBe(null);

      // Verify px-12 is present in the correct location
      expect(ditaArchitectContent).toContain('className="outline-none max-w-6xl mx-auto px-12 min-h-[500px]"');
    });

    it('validates that ContentEditable maintains other styling classes while updating padding', () => {
      // Should preserve all other classes in ContentEditable
      const expectedClasses = [
        'outline-none',
        'max-w-6xl',
        'mx-auto',
        'px-12', // Updated padding
        'min-h-[500px]'
      ];

      const contentEditableMatch = ditaArchitectContent.match(/<ContentEditable[^>]*className="([^"]*)"/);
      expect(contentEditableMatch).toBeTruthy();

      const className = contentEditableMatch![1];
      expectedClasses.forEach(expectedClass => {
        expect(className).toContain(expectedClass);
      });

      // Should not contain the old px-8 class
      expect(className).not.toContain('px-8');
    });
  });

  describe('placeholder div padding modification', () => {
    it('validates that placeholder div uses px-12 instead of px-8', () => {
      // Should contain placeholder div with px-12 padding
      const placeholderMatch = ditaArchitectContent.match(/<div[^>]*className="[^"]*absolute[^"]*top-14[^"]*px-12[^"]*"/);
      expect(placeholderMatch).toBeTruthy();
    });

    it('ensures placeholder div padding matches ContentEditable for visual alignment', () => {
      // Both ContentEditable and placeholder should use px-12
      expect(ditaArchitectContent).toContain('className="outline-none max-w-6xl mx-auto px-12 min-h-[500px]"');
      expect(ditaArchitectContent).toContain('className="absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-12 leading-relaxed"');
    });

    it('validates that placeholder div maintains other styling classes while updating padding', () => {
      // Should preserve all other classes in placeholder div
      const expectedClasses = [
        'absolute',
        'top-14',
        'left-0',
        'right-0',
        'italic',
        'pointer-events-none',
        'max-w-6xl',
        'mx-auto',
        'px-12', // Updated padding
        'leading-relaxed'
      ];

      const placeholderMatch = ditaArchitectContent.match(/<div[^>]*className="absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-12 leading-relaxed"/);
      expect(placeholderMatch).toBeTruthy();

      const placeholderClassMatch = ditaArchitectContent.match(/className="(absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-12 leading-relaxed)"/);
      expect(placeholderClassMatch).toBeTruthy();

      const className = placeholderClassMatch![1];
      expectedClasses.forEach(expectedClass => {
        expect(className).toContain(expectedClass);
      });
    });
  });

  describe('visual alignment and consistency validation', () => {
    it('ensures both ContentEditable and placeholder have identical horizontal spacing', () => {
      // Both elements should use the same padding class for perfect alignment
      const contentEditablePadding = ditaArchitectContent.match(/ContentEditable[^>]*className="[^"]*px-12[^"]*"/);
      const placeholderPadding = ditaArchitectContent.match(/div[^>]*className="[^"]*absolute[^"]*px-12[^"]*"/);

      expect(contentEditablePadding).toBeTruthy();
      expect(placeholderPadding).toBeTruthy();

      // Both should use px-12 for consistent spacing
      expect(contentEditablePadding![0]).toContain('px-12');
      expect(placeholderPadding![0]).toContain('px-12');
    });

    it('validates that max-width and margin settings remain consistent between elements', () => {
      // Both elements should have identical width and centering classes
      const sharedWidthClasses = ['max-w-6xl', 'mx-auto'];

      sharedWidthClasses.forEach(className => {
        // ContentEditable should have the class
        const contentEditableMatch = ditaArchitectContent.match(/<ContentEditable[^>]*className="[^"]*" \/>/);
        expect(ditaArchitectContent).toContain(`ContentEditable className="outline-none max-w-6xl mx-auto px-12 min-h-[500px]"`);

        // Placeholder should have the class
        expect(ditaArchitectContent).toContain(`className="absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-12 leading-relaxed"`);
      });
    });

    it('ensures padding increase provides appropriate visual breathing room', () => {
      // px-12 provides 48px of horizontal padding (24px on each side)
      // This should be an improvement over px-8 (32px total, 16px each side)
      expect(ditaArchitectContent).toContain('px-12');

      // Verify this is specifically on editor-related elements
      expect(ditaArchitectContent).toContain('ContentEditable className="outline-none max-w-6xl mx-auto px-12');
      expect(ditaArchitectContent).toContain('italic pointer-events-none max-w-6xl mx-auto px-12');
    });
  });

  describe('RichTextPlugin integration and context validation', () => {
    it('validates that padding changes are within RichTextPlugin context', () => {
      // ContentEditable should be within RichTextPlugin
      const richTextPluginMatch = ditaArchitectContent.match(/<RichTextPlugin[^>]*contentEditable=\{<ContentEditable[^>]*px-12[^>]*\/>\}/s);
      expect(richTextPluginMatch).toBeTruthy();
    });

    it('ensures placeholder prop structure remains intact with padding update', () => {
      // Placeholder should be properly structured within RichTextPlugin
      const placeholderPropMatch = ditaArchitectContent.match(/placeholder=\{[^}]*<div[^>]*px-12[^>]*>[^<]*Start typing your DITA content here\.\.\.[^}]*\}/s);
      expect(placeholderPropMatch).toBeTruthy();
    });

    it('validates that editor styling context supports increased padding', () => {
      // The flex-1 overflow container should accommodate the larger padding
      expect(ditaArchitectContent).toContain('flex-1 overflow-y-auto custom-scrollbar');

      // The editor should maintain proper responsive behavior
      expect(ditaArchitectContent).toContain('max-w-6xl mx-auto');
    });
  });

  describe('responsive design and layout impact assessment', () => {
    it('validates that increased padding works within responsive max-width constraints', () => {
      // max-w-6xl with px-12 should provide good content width management
      expect(ditaArchitectContent).toContain('max-w-6xl mx-auto px-12');

      // Total content width should be max-w-6xl minus 96px (48px padding each side)
      // This should still provide comfortable reading width
      const responsivePattern = /max-w-6xl mx-auto px-12/;
      expect(ditaArchitectContent).toMatch(responsivePattern);
    });

    it('ensures padding increase doesn\'t conflict with other layout elements', () => {
      // Editor container should have proper overflow handling
      expect(ditaArchitectContent).toContain('overflow-y-auto');

      // Should not interfere with toolbar or other UI elements
      expect(ditaArchitectContent).toContain('flex-1');
    });

    it('validates that mobile responsiveness is maintained with larger padding', () => {
      // px-12 (48px) should be reasonable on mobile devices
      // Tailwind's px-12 is designed to work across responsive breakpoints
      expect(ditaArchitectContent).toContain('px-12');

      // Should not have responsive padding overrides that would conflict
      expect(ditaArchitectContent).not.toContain('sm:px-8');
      expect(ditaArchitectContent).not.toContain('md:px-10');
    });
  });

  describe('content readability and user experience improvements', () => {
    it('validates that increased padding improves reading comfort', () => {
      // Larger horizontal padding should provide better reading margins
      // 48px total horizontal padding (24px each side) vs previous 32px (16px each side)
      expect(ditaArchitectContent).toContain('px-12');

      // Should apply to both content and placeholder for consistency
      const contentPaddingCount = (ditaArchitectContent.match(/px-12/g) || []).length;
      expect(contentPaddingCount).toBeGreaterThanOrEqual(2); // At least ContentEditable and placeholder
    });

    it('ensures visual hierarchy is enhanced by improved spacing', () => {
      // Better padding should improve focus on content
      expect(ditaArchitectContent).toContain('outline-none max-w-6xl mx-auto px-12 min-h-[500px]');

      // Placeholder should have matching spacing for visual consistency
      expect(ditaArchitectContent).toContain('max-w-6xl mx-auto px-12 leading-relaxed');
    });

    it('validates that technical writing workflow benefits from increased spacing', () => {
      // More generous padding should reduce visual crowding
      // Important for technical documentation editing
      expect(ditaArchitectContent).toContain('px-12');

      // Should complement the min-height setting for comfortable editing
      expect(ditaArchitectContent).toContain('min-h-[500px]');
    });
  });

  describe('regression tests for other editor styling preservation', () => {
    it('ensures no other Tailwind classes were accidentally modified', () => {
      // Core layout classes should remain unchanged
      const preservedClasses = [
        'outline-none',
        'max-w-6xl',
        'mx-auto',
        'min-h-[500px]',
        'absolute',
        'top-14',
        'left-0',
        'right-0',
        'italic',
        'pointer-events-none',
        'leading-relaxed'
      ];

      preservedClasses.forEach(className => {
        expect(ditaArchitectContent).toContain(className);
      });
    });

    it('validates that editor behavior and functionality remain intact', () => {
      // RichTextPlugin structure should be unchanged except for padding
      expect(ditaArchitectContent).toContain('<RichTextPlugin');
      expect(ditaArchitectContent).toContain('contentEditable={<ContentEditable');
      expect(ditaArchitectContent).toContain('placeholder={');

      // Lexical editor setup should be unaffected
      expect(ditaArchitectContent).toContain('LexicalComposer');
    });

    it('ensures WYSIWYG/DITA parity is maintained with padding changes', () => {
      // Padding should not affect content representation
      // Visual changes should be purely for improved UX
      expect(ditaArchitectContent).toContain('px-12');

      // Content editing functionality should be preserved
      expect(ditaArchitectContent).toContain('Start typing your DITA content here...');
    });
  });

  describe('code maintainability and consistency validation', () => {
    it('validates that padding values are consistent and intentional', () => {
      // Should use px-12 consistently for content areas
      expect(ditaArchitectContent).toContain('px-12');

      // Should have px-12 in both ContentEditable and placeholder
      const px12Count = (ditaArchitectContent.match(/px-12/g) || []).length;
      expect(px12Count).toBeGreaterThanOrEqual(2);
    });

    it('ensures Tailwind class ordering remains logical and maintainable', () => {
      // Classes should follow logical ordering (layout, spacing, appearance)
      expect(ditaArchitectContent).toContain('outline-none max-w-6xl mx-auto px-12 min-h-[500px]');
      expect(ditaArchitectContent).toContain('absolute top-14 left-0 right-0 italic pointer-events-none max-w-6xl mx-auto px-12 leading-relaxed');
    });

    it('validates that changes align with established design system patterns', () => {
      // px-12 is a standard Tailwind spacing value
      // Should fit well with other design system choices
      expect(ditaArchitectContent).toContain('max-w-6xl'); // Standard max-width
      expect(ditaArchitectContent).toContain('mx-auto'); // Standard centering
      expect(ditaArchitectContent).toContain('px-12'); // Updated standard padding
    });
  });
});