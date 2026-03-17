// @vitest-environment jsdom
/**
 * Tests for parseXmlToLexical function - validating Jamie's codeblock parsing improvements.
 * These tests ensure codeblock content extraction preserves whitespace formatting and
 * properly ignores Heretto processing instructions.
 *
 * Environment: vitest + jsdom + Lexical editor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor, $getRoot } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableRowNode, TableCellNode } from '@lexical/table';
import { DitaOpaqueNode } from '../components/DitaOpaqueNode';
import { DitaCodeBlockNode } from '../components/DitaCodeBlockNode';
import { DitaImageNode } from '../components/DitaImageNode';
import { DitaPhRefNode } from '../components/DitaPhRefNode';
import { parseXmlToLexical } from '../sync/parseXmlToLexical';
import { createNodeOriginMap } from '../sync/nodeOriginMap';

function createTestEditor() {
  return createEditor({
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      DitaOpaqueNode,
      DitaCodeBlockNode,
      DitaImageNode,
      DitaPhRefNode,
    ],
  });
}

describe('parseXmlToLexical codeblock parsing improvements', () => {
  let editor: any;
  let originMap: any;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  describe('codeblock content extraction preserves whitespace formatting', () => {
    it('preserves leading whitespace in code content', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>    function test() {
        console.log('indented');
    }</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('    function test() {\n        console.log(\'indented\');\n    }');

        const language = (codeblockNode as any).__language;
        expect(language).toBe('');
      });
    });

    it('preserves trailing whitespace in code content', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>function test() {
    return 'value';
}   </codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('function test() {\n    return \'value\';\n}   ');
      });
    });

    it('preserves internal whitespace and line breaks exactly', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>if (condition) {


    // Comment with spaces
    return value;
}</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('if (condition) {\n\n\n    // Comment with spaces\n    return value;\n}');
      });
    });

    it('preserves tab characters and mixed whitespace', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>function\ttabbed() {
\t\treturn\t\t'mixed whitespace';
\t}</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('function\ttabbed() {\n\t\treturn\t\t\'mixed whitespace\';\n\t}');
      });
    });
  });

  describe('codeblock ignores Heretto processing instructions correctly', () => {
    it('filters out processing instructions while preserving code content', () => {
      const xml = `<task>
        <taskbody>
          <codeblock><?heretto-review id="r1" author="reviewer"?>function test() {
    console.log('code');
}<?heretto-review-end?></codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('function test() {\n    console.log(\'code\');\n}');
        expect(codeContent).not.toContain('<?heretto-review');
        expect(codeContent).not.toContain('<?heretto-review-end');
      });
    });

    it('filters multiple processing instructions from different locations', () => {
      const xml = `<task>
        <taskbody>
          <codeblock><?pi1?>const x = <?pi2?>'value'<?pi3?>;
console.log(x);<?pi4?></codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('const x = \'value\';\nconsole.log(x);');
        expect(codeContent).not.toContain('<?pi');
      });
    });

    it('preserves content from nested elements while ignoring processing instructions', () => {
      const xml = `<task>
        <taskbody>
          <codeblock><?review?><b>function</b> test() {
    return <?comment?><i>'value'</i>;
}<?end-review?></codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('function test() {\n    return \'value\';\n}');
        expect(codeContent).not.toContain('<?');
      });
    });
  });

  describe('codeblock language attribute extraction', () => {
    it('extracts outputclass attribute as language identifier', () => {
      const xml = `<task>
        <taskbody>
          <codeblock outputclass="javascript">function test() {}</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        const language = (codeblockNode as any).__language;
        expect(codeContent).toBe('function test() {}');
        expect(language).toBe('javascript');
      });
    });

    it('uses empty string as language when no outputclass is present', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>function test() {}</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        const language = (codeblockNode as any).__language;
        expect(codeContent).toBe('function test() {}');
        expect(language).toBe('');
      });
    });

    it('handles outputclass with complex language specifications', () => {
      const xml = `<task>
        <taskbody>
          <codeblock outputclass="language-typescript">const x: string = 'test';</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        const language = (codeblockNode as any).__language;
        expect(codeContent).toBe('const x: string = \'test\';');
        expect(language).toBe('language-typescript');
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('handles malformed XML gracefully by skipping sync', () => {
      const malformedXml = '<task><codeblock>unclosed';

      const result = parseXmlToLexical(malformedXml, editor, originMap);
      expect(result).toBe(false);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        expect(children).toHaveLength(0);
      });
    });

    it('validates improvement over old textContent extraction method', () => {
      // This test shows that the new extraction method preserves structure
      // that the old xmlNode.textContent approach would flatten
      const xml = `<task>
        <taskbody>
          <codeblock>before<?pi?>middle<span>after</span>end</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        expect(codeContent).toBe('beforemiddleafterend');
        expect(codeContent).not.toContain('<?pi');
      });
    });
  });

  describe('regression tests for WYSIWYG/DITA parity', () => {
    it('validates that codeblock parsing supports Anna\'s plan requirements', () => {
      // Test that codeblock parsing preserves exact formatting as required for DITA compliance
      const xml = `<task>
        <title>Test Task</title>
        <taskbody>
          <codeblock outputclass="bash">#!/bin/bash
export PATH="/usr/local/bin:$PATH"
echo "Hello, World!"</codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        const language = (codeblockNode as any).__language;
        expect(codeContent).toBe('#!/bin/bash\nexport PATH="/usr/local/bin:$PATH"\necho "Hello, World!"');
        expect(language).toBe('bash');
      });
    });

    it('handles empty codeblock correctly without breaking WYSIWYG display', () => {
      const xml = `<task>
        <taskbody>
          <codeblock></codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        const language = (codeblockNode as any).__language;
        expect(codeContent).toBe('');
        expect(language).toBe('');
      });
    });

    it('handles codeblock with only whitespace preserving exact DITA content', () => {
      const xml = `<task>
        <taskbody>
          <codeblock>

  </codeblock>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const codeblockNode = children.find(child => child.__type === 'ditacodeblock');
        expect(codeblockNode).toBeDefined();

        const codeContent = (codeblockNode as any).__code;
        // WYSIWYG/DITA parity requires exact whitespace preservation
        expect(codeContent).toBe('\n\n  ');
      });
    });
  });
});

describe('parseXmlToLexical topic-level title and shortdesc with sections', () => {
  let editor: any;
  let originMap: any;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  describe('P0-3 bug fix: task topics containing section elements', () => {
    it('renders topic-level title as H1 and shortdesc when sections are present', () => {
      const xml = `<task>
        <title>Task Topic Title</title>
        <shortdesc>Task topic description</shortdesc>
        <taskbody>
          <section>
            <title>Section Title</title>
            <p>Section content</p>
          </section>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // First child should be topic-level title as H1
        const titleNode = children.find(child => child.__type === 'heading');
        expect(titleNode).toBeDefined();
        expect((titleNode as any).__tag).toBe('h1');
        expect((titleNode as any).getTextContent()).toBe('Task Topic Title');

        // Second child should be shortdesc as paragraph
        const shortdescNode = children.find(child => child.__type === 'paragraph');
        expect(shortdescNode).toBeDefined();
        expect((shortdescNode as any).getTextContent()).toBe('Task topic description');

        // Section title should be H2
        const sectionTitleNode = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitleNode).toBeDefined();
        expect((sectionTitleNode as any).getTextContent()).toBe('Section Title');
      });
    });

    it('handles task with multiple sections and preserves topic structure', () => {
      const xml = `<task>
        <title>Multi-Section Task</title>
        <shortdesc>Task with multiple sections</shortdesc>
        <taskbody>
          <section>
            <title>First Section</title>
            <p>First section content</p>
          </section>
          <section>
            <title>Second Section</title>
            <p>Second section content</p>
          </section>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Topic title should be H1
        const topicTitle = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h1'
        );
        expect(topicTitle).toBeDefined();
        expect((topicTitle as any).getTextContent()).toBe('Multi-Section Task');

        // Should have shortdesc
        const shortdesc = children.find(child => child.__type === 'paragraph');
        expect(shortdesc).toBeDefined();
        expect((shortdesc as any).getTextContent()).toBe('Task with multiple sections');

        // Should have two section titles as H2
        const sectionTitles = children.filter(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitles).toHaveLength(2);
        expect((sectionTitles[0] as any).getTextContent()).toBe('First Section');
        expect((sectionTitles[1] as any).getTextContent()).toBe('Second Section');
      });
    });
  });

  describe('P0-3 bug fix: concept topics containing section elements', () => {
    it('renders topic-level title as H1 and shortdesc when sections are present', () => {
      const xml = `<concept>
        <title>Concept Topic Title</title>
        <shortdesc>Concept topic description</shortdesc>
        <conbody>
          <section>
            <title>Concept Section</title>
            <p>Section content</p>
          </section>
        </conbody>
      </concept>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Topic title should be H1
        const titleNode = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h1'
        );
        expect(titleNode).toBeDefined();
        expect((titleNode as any).getTextContent()).toBe('Concept Topic Title');

        // Should have shortdesc
        const shortdescNode = children.find(child => child.__type === 'paragraph');
        expect(shortdescNode).toBeDefined();
        expect((shortdescNode as any).getTextContent()).toBe('Concept topic description');

        // Section title should be H2
        const sectionTitleNode = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitleNode).toBeDefined();
        expect((sectionTitleNode as any).getTextContent()).toBe('Concept Section');
      });
    });
  });

  describe('P0-3 bug fix: reference topics containing section elements', () => {
    it('renders topic-level title as H1 and shortdesc when sections are present', () => {
      const xml = `<reference>
        <title>Reference Topic Title</title>
        <shortdesc>Reference topic description</shortdesc>
        <refbody>
          <section>
            <title>Reference Section</title>
            <p>Section content</p>
          </section>
        </refbody>
      </reference>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Topic title should be H1
        const titleNode = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h1'
        );
        expect(titleNode).toBeDefined();
        expect((titleNode as any).getTextContent()).toBe('Reference Topic Title');

        // Should have shortdesc
        const shortdescNode = children.find(child => child.__type === 'paragraph');
        expect(shortdescNode).toBeDefined();
        expect((shortdescNode as any).getTextContent()).toBe('Reference topic description');

        // Section title should be H2
        const sectionTitleNode = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitleNode).toBeDefined();
        expect((sectionTitleNode as any).getTextContent()).toBe('Reference Section');
      });
    });
  });

  describe('P0-3 bug fix: generic topics with nested sections', () => {
    it('selects correct topic-level title with nested sections', () => {
      const xml = `<topic>
        <title>Generic Topic Title</title>
        <shortdesc>Generic topic description</shortdesc>
        <body>
          <section>
            <title>Parent Section</title>
            <section>
              <title>Nested Section</title>
              <p>Nested content</p>
            </section>
          </section>
        </body>
      </topic>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Topic title should be H1 (not section titles)
        const topicTitle = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h1'
        );
        expect(topicTitle).toBeDefined();
        expect((topicTitle as any).getTextContent()).toBe('Generic Topic Title');

        // Should have shortdesc
        const shortdesc = children.find(child => child.__type === 'paragraph');
        expect(shortdesc).toBeDefined();
        expect((shortdesc as any).getTextContent()).toBe('Generic topic description');

        // All section titles should be H2
        const sectionTitles = children.filter(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitles.length).toBeGreaterThanOrEqual(2);
        expect((sectionTitles[0] as any).getTextContent()).toBe('Parent Section');
        expect((sectionTitles[1] as any).getTextContent()).toBe('Nested Section');
      });
    });
  });

  describe('P0-3 edge cases', () => {
    it('handles missing title gracefully', () => {
      const xml = `<task>
        <shortdesc>Task without title</shortdesc>
        <taskbody>
          <section>
            <title>Section Title</title>
            <p>Content</p>
          </section>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Should have shortdesc
        const shortdesc = children.find(child => child.__type === 'paragraph');
        expect(shortdesc).toBeDefined();

        // Only section title should be present as H2
        const headings = children.filter(child => child.__type === 'heading');
        expect(headings).toHaveLength(1);
        expect((headings[0] as any).__tag).toBe('h2');
        expect((headings[0] as any).getTextContent()).toBe('Section Title');
      });
    });

    it('handles missing shortdesc gracefully', () => {
      const xml = `<task>
        <title>Task Title</title>
        <taskbody>
          <section>
            <title>Section Title</title>
            <p>Content</p>
          </section>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Should have topic title as H1
        const topicTitle = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h1'
        );
        expect(topicTitle).toBeDefined();
        expect((topicTitle as any).getTextContent()).toBe('Task Title');

        // Should not have a shortdesc paragraph (only section content paragraph)
        const paragraphs = children.filter(child => child.__type === 'paragraph');
        expect(paragraphs).toHaveLength(1); // Only the "Content" paragraph from the section
        expect(paragraphs[0].getTextContent()).toBe('Content');

        // Section title should be H2
        const sectionTitle = children.find(child =>
          child.__type === 'heading' && (child as any).__tag === 'h2'
        );
        expect(sectionTitle).toBeDefined();
        expect((sectionTitle as any).getTextContent()).toBe('Section Title');
      });
    });
  });
});