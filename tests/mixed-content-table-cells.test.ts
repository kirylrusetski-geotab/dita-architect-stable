// @ts-nocheck
// @vitest-environment jsdom
/**
 * Tests for enhanced table cell mixed content parsing in parseXmlToLexical.
 * These tests validate Jamie's implementation that fixes P1-1/P1-2 by properly handling
 * sequential processing of text nodes and block elements within table cells.
 *
 * Environment: vitest + jsdom + Lexical editor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor, $getRoot, $isElementNode, type LexicalNode } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, $isListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { TableNode, TableRowNode, TableCellNode, $isTableNode, $isTableRowNode, $isTableCellNode } from '@lexical/table';
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

describe('enhanced table cell mixed content parsing fixes P1-1 and P1-2', () => {
  let editor: any;
  let originMap: any;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  describe('text before lists in table cells is properly parsed and displayed', () => {
    it('parses text preceding unordered list in table cell as separate paragraph', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <tbody>
                <row>
                  <entry>
                    Here is some introductory text before the list:
                    <ul>
                      <li>First item</li>
                      <li>Second item</li>
                    </ul>
                  </entry>
                  <entry>Simple cell content</entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const tableRows = tableNode!.getChildren();
        expect(tableRows).toHaveLength(1);

        const row = tableRows[0] as TableRowNode;
        const cells = row.getChildren();
        expect(cells).toHaveLength(2);

        // First cell should contain both paragraph and list
        const firstCell = cells[0];
        if ($isElementNode(firstCell)) {
          const firstCellChildren = firstCell.getChildren();

          // Should have both paragraph (for intro text) and list
          const paragraph = firstCellChildren.find(child => child.getType() === 'paragraph');
          const list = firstCellChildren.find(child => child.getType() === 'list') as ListNode | undefined;

          expect(paragraph).toBeDefined();
          expect(list).toBeDefined();

          // Verify paragraph content includes the introductory text
          expect(paragraph!.getTextContent()).toContain('Here is some introductory text before the list:');

          // Verify list structure and content
          expect(list!.getListType()).toBe('bullet');
          const listItems = list!.getChildren();
          expect(listItems).toHaveLength(2);
          expect(listItems[0].getTextContent()).toBe('First item');
          expect(listItems[1].getTextContent()).toBe('Second item');
        }
      });
    });

    it('parses text following unordered list in table cell correctly', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <entry>
                    <ul>
                      <li>Item one</li>
                      <li>Item two</li>
                    </ul>
                    This text comes after the list and should be in a separate paragraph.
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Should have list first, then paragraph
          const list = cellChildren.find(child => child.getType() === 'list');
          const paragraph = cellChildren.find(child => child.getType() === 'paragraph');

          expect(list).toBeDefined();
          expect(paragraph).toBeDefined();

          // Verify trailing text content
          expect(paragraph!.getTextContent()).toContain('This text comes after the list');
          expect(paragraph!.getTextContent()).toContain('should be in a separate paragraph');
        }
      });
    });

    it('parses text both before and after list in same table cell', () => {
      const xml = `<task>
        <taskbody>
          <simpletable>
            <strow>
              <stentry>
                Intro text before list:
                <ul>
                  <li>Listed item 1</li>
                  <li>Listed item 2</li>
                </ul>
                Concluding text after list.
              </stentry>
            </strow>
          </simpletable>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Should have three elements: paragraph + list + paragraph
          expect(cellChildren).toHaveLength(3);

          const firstParagraph = cellChildren[0];
          const list = cellChildren[1];
          const lastParagraph = cellChildren[2];

          expect(firstParagraph.getType()).toBe('paragraph');
          expect(list.getType()).toBe('list');
          expect(lastParagraph.getType()).toBe('paragraph');

          expect(firstParagraph.getTextContent()).toContain('Intro text before list:');
          expect(lastParagraph.getTextContent()).toContain('Concluding text after list.');
        }
      });
    });

    it('parses text preceding ordered list in table cell correctly', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <entry>
                    Follow these steps in order:
                    <ol>
                      <li>First step</li>
                      <li>Second step</li>
                      <li>Final step</li>
                    </ol>
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          const paragraph = cellChildren.find(child => child.getType() === 'paragraph');
          const list = cellChildren.find(child => child.getType() === 'list') as ListNode | undefined;

          expect(paragraph).toBeDefined();
          expect(list).toBeDefined();

          // Verify introductory text
          expect(paragraph!.getTextContent()).toContain('Follow these steps in order:');

          // Verify ordered list
          expect(list!.getListType()).toBe('number');
          const listItems = list!.getChildren();
          expect(listItems).toHaveLength(3);
          expect(listItems[0].getTextContent()).toBe('First step');
          expect(listItems[2].getTextContent()).toBe('Final step');
        }
      });
    });
  });

  describe('mixed content with multiple block elements in table cells', () => {
    it('parses multiple paragraphs mixed with lists in table cell', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <entry>
                    <p>First paragraph in cell.</p>
                    Some loose text between elements.
                    <ul>
                      <li>List item</li>
                    </ul>
                    <p>Last paragraph in cell.</p>
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Should have: paragraph + paragraph (for loose text) + list + paragraph
          expect(cellChildren.length).toBeGreaterThanOrEqual(4);

          const paragraphs = cellChildren.filter(child => child.getType() === 'paragraph');
          const lists = cellChildren.filter(child => child.getType() === 'list');

          expect(paragraphs.length).toBeGreaterThanOrEqual(3);
          expect(lists).toHaveLength(1);

          // Verify content is preserved
          const allContent = cellChildren.map(child => child.getTextContent()).join(' ');
          expect(allContent).toContain('First paragraph in cell');
          expect(allContent).toContain('Some loose text between elements');
          expect(allContent).toContain('List item');
          expect(allContent).toContain('Last paragraph in cell');
        }
      });
    });

    it('parses complex nested structures in table cells correctly', () => {
      const xml = `<task>
        <taskbody>
          <simpletable>
            <strow>
              <stentry>
                Initial text with <b>formatting</b>.
                <ul>
                  <li>Item with <i>italic</i> text</li>
                  <li>Second item</li>
                </ul>
                <p>Paragraph with <codeph>code</codeph> element.</p>
                Final loose text.
              </stentry>
            </strow>
          </simpletable>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Verify structure includes all expected elements
          const paragraphs = cellChildren.filter(child => child.getType() === 'paragraph');
          const lists = cellChildren.filter(child => child.getType() === 'list');

          expect(lists).toHaveLength(1);
          expect(paragraphs.length).toBeGreaterThanOrEqual(2);

          // Verify complex formatting is preserved
          const totalContent = firstCell.getTextContent();
          expect(totalContent).toContain('Initial text with formatting');
          expect(totalContent).toContain('Item with italic text');
          expect(totalContent).toContain('Paragraph with code element');
          expect(totalContent).toContain('Final loose text');
        }
      });
    });

    it('handles multiple lists within single table cell correctly', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <entry>
                    First list:
                    <ul>
                      <li>Bullet item 1</li>
                      <li>Bullet item 2</li>
                    </ul>
                    Second list:
                    <ol>
                      <li>Numbered item 1</li>
                      <li>Numbered item 2</li>
                    </ol>
                    End of cell content.
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          const paragraphs = cellChildren.filter(child => child.getType() === 'paragraph');
          const lists = cellChildren.filter(child => child.getType() === 'list');

          expect(lists).toHaveLength(2);
          expect(paragraphs.length).toBeGreaterThanOrEqual(3); // Before, between, and after

          // Verify list types
          const bulletList = lists.find(list => (list as ListNode).getListType() === 'bullet') as ListNode;
          const numberedList = lists.find(list => (list as ListNode).getListType() === 'number') as ListNode;

          expect(bulletList).toBeDefined();
          expect(numberedList).toBeDefined();

          expect(bulletList.getChildren()).toHaveLength(2);
          expect(numberedList.getChildren()).toHaveLength(2);
        }
      });
    });
  });

  describe('regression tests that validate fix for P1-1 and P1-2 bugs', () => {
    it('ensures text before lists is no longer missing (fixes P1-1)', () => {
      // This test specifically validates the bug fix where text preceding lists was not rendered
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <tbody>
                <row>
                  <entry>
                    Before this fix, this text would be missing:
                    <ul>
                      <li>Only the list would show</li>
                    </ul>
                  </entry>
                  <entry>Control cell</entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Critical: The text before the list MUST be present
          const introTextParagraph = cellChildren.find(child =>
            child.getType() === 'paragraph' &&
            child.getTextContent().includes('Before this fix')
          );

          expect(introTextParagraph).toBeDefined();
          expect(introTextParagraph!.getTextContent()).toContain('this text would be missing:');

          // List should also be present
          const list = cellChildren.find(child => child.getType() === 'list');
          expect(list).toBeDefined();
        }
      });
    });

    it('ensures lists in table cells render as proper lists (fixes P1-2)', () => {
      // This test validates that lists render as actual list nodes, not as indented text
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <entry>
                    <ul>
                      <li>This should be a proper bullet list</li>
                      <li>Not just indented text</li>
                      <li>With proper list formatting</li>
                    </ul>
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstCell = tableNode!.getChildren()[0].getChildren()[0];
        if ($isElementNode(firstCell)) {
          const cellChildren = firstCell.getChildren();

          // Must find an actual ListNode, not just paragraphs with list-like text
          const listNode = cellChildren.find(child => $isListNode(child)) as ListNode | undefined;
          expect(listNode).toBeDefined();

          // Verify it's a proper bullet list
          expect(listNode!.getListType()).toBe('bullet');

          // Verify list items are actual ListItemNodes
          const listItems = listNode!.getChildren();
          expect(listItems).toHaveLength(3);

          listItems.forEach((item, index) => {
            expect(item.getType()).toBe('listitem');
            if (index === 0) {
              expect(item.getTextContent()).toContain('proper bullet list');
            }
          });

          // Should NOT be rendered as simple paragraphs
          const paragraphs = cellChildren.filter(child => child.getType() === 'paragraph');
          const paragraphsWithListContent = paragraphs.filter(p =>
            p.getTextContent().includes('This should be a proper bullet list')
          );
          expect(paragraphsWithListContent).toHaveLength(0);
        }
      });
    });

    it('validates WYSIWYG/DITA parity for complex table cell content', () => {
      // Comprehensive test ensuring the visual representation matches the DITA structure
      const xml = `<task>
        <title>Complex Table Test</title>
        <taskbody>
          <table>
            <title>Mixed Content Table</title>
            <tgroup cols="2">
              <thead>
                <row>
                  <entry>Feature</entry>
                  <entry>Implementation</entry>
                </row>
              </thead>
              <tbody>
                <row>
                  <entry>
                    Sequential processing now handles:
                    <ul>
                      <li>Text before block elements</li>
                      <li>Text after block elements</li>
                    </ul>
                    This ensures WYSIWYG/DITA parity.
                  </entry>
                  <entry>
                    <p>Enhanced parseCellContent function.</p>
                    <ol>
                      <li>Processes all child nodes sequentially</li>
                      <li>Handles both text and element nodes</li>
                    </ol>
                  </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const tableRows = tableNode!.getChildren();
        expect(tableRows).toHaveLength(2); // header + data row

        const dataRow = tableRows[1] as TableRowNode;
        const dataCells = dataRow.getChildren();
        expect(dataCells).toHaveLength(2);

        // First cell: text + list + text
        const firstCell = dataCells[0];
        if ($isElementNode(firstCell)) {
          const firstCellChildren = firstCell.getChildren();

          const paragraphs = firstCellChildren.filter(child => child.getType() === 'paragraph');
          const lists = firstCellChildren.filter(child => child.getType() === 'list');

          expect(paragraphs.length).toBeGreaterThanOrEqual(2);
          expect(lists).toHaveLength(1);

          const content = firstCell.getTextContent();
          expect(content).toContain('Sequential processing now handles:');
          expect(content).toContain('Text before block elements');
          expect(content).toContain('This ensures WYSIWYG/DITA parity');
        }

        // Second cell: paragraph + ordered list
        const secondCell = dataCells[1];
        if ($isElementNode(secondCell)) {
          const secondCellChildren = secondCell.getChildren();

          const paragraphs = secondCellChildren.filter(child => child.getType() === 'paragraph');
          const orderedLists = secondCellChildren.filter(child =>
            child.getType() === 'list' && (child as ListNode).getListType() === 'number'
          );

          expect(paragraphs.length).toBeGreaterThanOrEqual(1);
          expect(orderedLists).toHaveLength(1);

          const content = secondCell.getTextContent();
          expect(content).toContain('Enhanced parseCellContent function');
          expect(content).toContain('Processes all child nodes sequentially');
        }
      });
    });
  });

  describe('edge cases and backward compatibility', () => {
    it('maintains backward compatibility with simple text-only cells', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <tbody>
                <row>
                  <entry>Simple text only</entry>
                  <entry>Another simple cell</entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstRow = tableNode!.getChildren()[0] as TableRowNode;
        const cells = firstRow.getChildren();

        expect(cells[0].getTextContent()).toBe('Simple text only');
        expect(cells[1].getTextContent()).toBe('Another simple cell');
      });
    });

    it('handles empty cells gracefully', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="3">
              <tbody>
                <row>
                  <entry></entry>
                  <entry>Content</entry>
                  <entry>   </entry>
                </row>
              </tbody>
            </tgroup>
          </table>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const tableNode = children.find(child => $isTableNode(child)) as TableNode | undefined;
        expect(tableNode).toBeDefined();

        const firstRow = tableNode!.getChildren()[0] as TableRowNode;
        const cells = firstRow.getChildren();
        expect(cells).toHaveLength(3);

        // Middle cell should have content
        expect(cells[1].getTextContent()).toBe('Content');
      });
    });
  });
});