// @vitest-environment jsdom
/**
 * Tests for table parsing improvements in parseXmlToLexical - validating Jamie's fixes.
 * These tests ensure proper empty row filtering with hasEntries flag and enhanced
 * parseCellContent that handles block-level elements within table cells.
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

describe('table parsing improvements - empty row filtering and block-level cell content', () => {
  let editor: any;
  let originMap: any;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  describe('hasEntries flag prevents empty table rows from being created', () => {
    it('filters out table rows with no entries in regular tables', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <thead>
                <row>
                  <entry>Header 1</entry>
                  <entry>Header 2</entry>
                </row>
                <row>
                  <!-- Empty row with no entries -->
                </row>
              </thead>
              <tbody>
                <row>
                  <entry>Data 1</entry>
                  <entry>Data 2</entry>
                </row>
                <row>
                  <!-- Another empty row -->
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        // Should only have 2 rows total (header + data), empty rows filtered out
        expect(tableRows).toHaveLength(2);

        // Verify each row has entries
        tableRows.forEach(row => {
          const cells = row.getChildren();
          expect(cells.length).toBeGreaterThan(0);
        });
      });
    });

    it('filters out empty rows in simpletable elements', () => {
      const xml = `<task>
        <taskbody>
          <simpletable>
            <sthead>
              <stentry>Header A</stentry>
              <stentry>Header B</stentry>
            </sthead>
            <strow>
              <!-- Empty row with no stentry elements -->
            </strow>
            <strow>
              <stentry>Value 1</stentry>
              <stentry>Value 2</stentry>
            </strow>
            <strow>
              <!-- Another empty row -->
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        // Should only have 2 rows (header + data), empty rows filtered out
        expect(tableRows).toHaveLength(2);

        // Verify each row has cells
        tableRows.forEach(row => {
          const cells = row.getChildren();
          expect(cells.length).toBeGreaterThan(0);
        });
      });
    });

    it('preserves rows that have entries even with mixed empty rows', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="1">
              <tbody>
                <row>
                  <!-- Empty row 1 -->
                </row>
                <row>
                  <entry>Valid content</entry>
                </row>
                <row>
                  <!-- Empty row 2 -->
                </row>
                <row>
                  <entry>More valid content</entry>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        expect(tableRows).toHaveLength(2); // Only the rows with entries

        // Verify content is preserved
        const firstRow = tableRows[0];
        const firstCell = firstRow.getChildren()[0];
        expect(firstCell.getTextContent()).toBe('Valid content');

        const secondRow = tableRows[1];
        const secondCell = secondRow.getChildren()[0];
        expect(secondCell.getTextContent()).toBe('More valid content');
      });
    });
  });

  describe('enhanced parseCellContent handles block-level elements in table cells', () => {
    it('properly parses list elements within table cells', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <tbody>
                <row>
                  <entry>
                    <ul>
                      <li>Item 1</li>
                      <li>Item 2</li>
                    </ul>
                  </entry>
                  <entry>Regular text</entry>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        expect(tableRows).toHaveLength(1);

        const row = tableRows[0];
        const cells = row.getChildren();
        expect(cells).toHaveLength(2);

        // First cell should contain a list
        const firstCell = cells[0];
        const firstCellChildren = firstCell.getChildren();
        const listNode = firstCellChildren.find(child => child.__type === 'list');
        expect(listNode).toBeDefined();
        expect(listNode.getListType()).toBe('bullet');

        // Second cell should contain text
        const secondCell = cells[1];
        expect(secondCell.getTextContent()).toBe('Regular text');
      });
    });

    it('properly parses paragraph elements within table cells', () => {
      const xml = `<task>
        <taskbody>
          <simpletable>
            <strow>
              <stentry>
                <p>First paragraph in cell</p>
                <p>Second paragraph in cell</p>
              </stentry>
              <stentry>
                <p>Single paragraph</p>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        expect(tableRows).toHaveLength(1);

        const row = tableRows[0];
        const cells = row.getChildren();
        expect(cells).toHaveLength(2);

        // First cell should contain multiple paragraphs
        const firstCell = cells[0];
        const firstCellChildren = firstCell.getChildren();
        const paragraphs = firstCellChildren.filter(child => child.__type === 'paragraph');
        expect(paragraphs).toHaveLength(2);
        expect(paragraphs[0].getTextContent()).toBe('First paragraph in cell');
        expect(paragraphs[1].getTextContent()).toBe('Second paragraph in cell');

        // Second cell should contain one paragraph
        const secondCell = cells[1];
        const secondCellChildren = secondCell.getChildren();
        const singleParagraph = secondCellChildren.find(child => child.__type === 'paragraph');
        expect(singleParagraph).toBeDefined();
        expect(singleParagraph.getTextContent()).toBe('Single paragraph');
      });
    });

    it('handles nested tables within table cells maintaining structure', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="2">
              <tbody>
                <row>
                  <entry>
                    <table>
                      <tgroup cols="1">
                        <tbody>
                          <row>
                            <entry>Nested cell content</entry>
                          </row>
                        </tbody>
                      </tgroup>
                    </table>
                  </entry>
                  <entry>Outer cell content</entry>
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
        const outerTableNode = children.find(child => child.__type === 'table');
        expect(outerTableNode).toBeDefined();

        const outerRows = outerTableNode.getChildren();
        expect(outerRows).toHaveLength(1);

        const outerRow = outerRows[0];
        const outerCells = outerRow.getChildren();
        expect(outerCells).toHaveLength(2);

        // First cell should contain nested table
        const firstCell = outerCells[0];
        const firstCellChildren = firstCell.getChildren();
        const nestedTable = firstCellChildren.find(child => child.__type === 'table');
        expect(nestedTable).toBeDefined();

        // Verify nested table structure
        const nestedRows = nestedTable.getChildren();
        expect(nestedRows).toHaveLength(1);
        const nestedRow = nestedRows[0];
        const nestedCells = nestedRow.getChildren();
        expect(nestedCells).toHaveLength(1);
        expect(nestedCells[0].getTextContent()).toBe('Nested cell content');

        // Second cell should contain regular text
        const secondCell = outerCells[1];
        expect(secondCell.getTextContent()).toBe('Outer cell content');
      });
    });

    it('maintains backward compatibility with simple text content in cells', () => {
      const xml = `<task>
        <taskbody>
          <table>
            <tgroup cols="3">
              <tbody>
                <row>
                  <entry>Simple text 1</entry>
                  <entry>Simple text 2</entry>
                  <entry>Simple text 3</entry>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        expect(tableRows).toHaveLength(1);

        const row = tableRows[0];
        const cells = row.getChildren();
        expect(cells).toHaveLength(3);

        // All cells should contain simple text
        expect(cells[0].getTextContent()).toBe('Simple text 1');
        expect(cells[1].getTextContent()).toBe('Simple text 2');
        expect(cells[2].getTextContent()).toBe('Simple text 3');
      });
    });
  });

  describe('regression tests for WYSIWYG/DITA parity in table parsing', () => {
    it('ensures table parsing maintains exact structure for round-trip fidelity', () => {
      // Test that enhanced table parsing preserves DITA structure as required
      const xml = `<task>
        <title>Table Test Task</title>
        <taskbody>
          <table>
            <title>Test Table</title>
            <tgroup cols="2">
              <colspec colname="col1" colwidth="1*"/>
              <colspec colname="col2" colwidth="2*"/>
              <thead>
                <row>
                  <entry>Feature</entry>
                  <entry>Description</entry>
                </row>
              </thead>
              <tbody>
                <row>
                  <entry>
                    <p>Block content parsing</p>
                    <ul>
                      <li>Lists in cells</li>
                      <li>Multiple paragraphs</li>
                    </ul>
                  </entry>
                  <entry>
                    <p>Enhanced parseCellContent function properly handles block-level elements while maintaining WYSIWYG/DITA parity.</p>
                  </entry>
                </row>
                <row>
                  <entry>Empty row filtering</entry>
                  <entry>hasEntries flag prevents malformed table structure</entry>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        // Should have header + 2 data rows
        expect(tableRows).toHaveLength(3);

        // Verify complex cell content in first data row
        const firstDataRow = tableRows[1];
        const firstDataCells = firstDataRow.getChildren();
        expect(firstDataCells).toHaveLength(2);

        const complexCell = firstDataCells[0];
        const complexCellChildren = complexCell.getChildren();

        // Should contain both paragraph and list
        const paragraph = complexCellChildren.find(child => child.__type === 'paragraph');
        const list = complexCellChildren.find(child => child.__type === 'list');
        expect(paragraph).toBeDefined();
        expect(list).toBeDefined();

        // Verify list structure
        const listItems = list.getChildren();
        expect(listItems).toHaveLength(2);
        expect(listItems[0].getTextContent()).toBe('Lists in cells');
        expect(listItems[1].getTextContent()).toBe('Multiple paragraphs');
      });
    });

    it('validates that improved table parsing handles edge cases without breaking WYSIWYG display', () => {
      // Test edge cases that could break WYSIWYG/DITA parity
      const xml = `<task>
        <taskbody>
          <simpletable>
            <sthead>
              <stentry>Header</stentry>
            </sthead>
            <strow>
              <!-- This row has an entry with only whitespace -->
              <stentry>   </stentry>
            </strow>
            <strow>
              <!-- This row has an entry with empty paragraph -->
              <stentry><p></p></stentry>
            </strow>
            <strow>
              <stentry>Valid content</stentry>
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
        const tableNode = children.find(child => child.__type === 'table');
        expect(tableNode).toBeDefined();

        const tableRows = tableNode.getChildren();
        // Should have header + 3 data rows (even with whitespace/empty content)
        expect(tableRows).toHaveLength(4);

        // All rows should have entries (hasEntries should be true for all)
        tableRows.forEach(row => {
          const cells = row.getChildren();
          expect(cells.length).toBeGreaterThan(0);
        });

        // Last row should have valid content
        const lastRow = tableRows[3];
        const lastCell = lastRow.getChildren()[0];
        expect(lastCell.getTextContent()).toBe('Valid content');
      });
    });
  });
});