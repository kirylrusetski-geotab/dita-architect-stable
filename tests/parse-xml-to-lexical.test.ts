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