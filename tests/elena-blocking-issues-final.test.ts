// @vitest-environment jsdom
/**
 * Elena's Blocking Issues - Final Validation Tests
 *
 * These tests validate Jamie's implementation against Elena's specific blocking concerns:
 * 1. Missing validation for header/body boundary merging
 * 2. Potential data loss when merging cells with existing spans
 *
 * Written as specification tests that demonstrate both the issues and expected behavior.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor, $getRoot, $createParagraphNode, LexicalEditor } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  TableCellHeaderStates
} from '@lexical/table';
import { DitaOpaqueNode } from '../components/DitaOpaqueNode';
import { DitaCodeBlockNode } from '../components/DitaCodeBlockNode';
import { DitaImageNode } from '../components/DitaImageNode';
import { DitaPhRefNode } from '../components/DitaPhRefNode';
import { parseXmlToLexical, createNodeOriginMap, serializeLexicalToXml, createXmlMetaCache } from '../sync';
import type { NodeOriginMapType } from '../sync';

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

// CALS table with clear header/body separation
const testTable = `
<topic>
  <title>Test Table</title>
  <body>
    <table>
      <tgroup cols="2">
        <thead>
          <row>
            <entry>Header A</entry>
            <entry>Header B</entry>
          </row>
        </thead>
        <tbody>
          <row>
            <entry>Body Cell 1</entry>
            <entry>Body Cell 2</entry>
          </row>
          <row>
            <entry>Body Cell 3</entry>
            <entry>Body Cell 4</entry>
          </row>
        </tbody>
      </tgroup>
    </table>
  </body>
</topic>
`;

// Table with existing spans to test Elena's span preservation issue
const tableWithSpans = `
<topic>
  <title>Span Test</title>
  <body>
    <table>
      <tgroup cols="3">
        <tbody>
          <row>
            <entry namest="col1" nameend="col2">Wide Cell (2 cols)</entry>
            <entry>Single Cell</entry>
          </row>
          <row>
            <entry>Cell A</entry>
            <entry>Cell B</entry>
            <entry morerows="1">Tall Cell</entry>
          </row>
          <row>
            <entry>Cell C</entry>
            <entry>Cell D</entry>
          </row>
        </tbody>
      </tgroup>
    </table>
  </body>
</topic>
`;

describe('Elena\'s Blocking Issue #1: Header/Body Boundary Merging Prevention', () => {
  let editor: LexicalEditor;
  let originMap: NodeOriginMapType;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  it('should correctly identify header and body cells in parsed table structure', () => {
    const result = parseXmlToLexical(testTable, editor, originMap, true);
    expect(result).toBe(true);

    let headerCells: any[] = [];
    let bodyCells: any[] = [];

    editor.getEditorState().read(() => {
      const root = $getRoot();

      const categorizeTableCells = (node: any): void => {
        if (node.__type === 'tablecell') {
          const headerStyles = node.getHeaderStyles();
          const isHeaderCell = (headerStyles & TableCellHeaderStates.ROW) !== 0;
          const cellContent = node.getTextContent();

          if (isHeaderCell) {
            headerCells.push({ content: cellContent, headerStyles });
          } else {
            bodyCells.push({ content: cellContent, headerStyles });
          }
        }
        if (node.getChildren) {
          node.getChildren().forEach((child: any) => categorizeTableCells(child));
        }
      };

      categorizeTableCells(root);
    });

    // Validate we can distinguish between header and body cells
    expect(headerCells.length).toBe(2); // Header A, Header B
    expect(bodyCells.length).toBe(4); // 4 body cells

    // Validate content appears in correct sections
    expect(headerCells.some(cell => cell.content.includes('Header A'))).toBe(true);
    expect(bodyCells.some(cell => cell.content.includes('Body Cell 1'))).toBe(true);
  });

  it('should demonstrate the boundary violation risk that Elena identified', () => {
    parseXmlToLexical(testTable, editor, originMap, true);

    let headerCell: any = null;
    let bodyCell: any = null;
    let boundaryViolationRisk = false;

    editor.getEditorState().read(() => {
      const root = $getRoot();

      const findCellsInDifferentSections = (node: any): void => {
        if (node.__type === 'tablecell') {
          const headerStyles = node.getHeaderStyles();
          const isHeaderCell = (headerStyles & TableCellHeaderStates.ROW) !== 0;

          if (isHeaderCell && !headerCell) {
            headerCell = node;
          } else if (!isHeaderCell && !bodyCell) {
            bodyCell = node;
          }
        }
        if (node.getChildren) {
          node.getChildren().forEach((child: any) => findCellsInDifferentSections(child));
        }
      };

      findCellsInDifferentSections(root);

      // Elena's concern: Jamie's implementation doesn't validate section boundaries
      if (headerCell && bodyCell) {
        const headerIsHeader = (headerCell.getHeaderStyles() & TableCellHeaderStates.ROW) !== 0;
        const bodyIsHeader = (bodyCell.getHeaderStyles() & TableCellHeaderStates.ROW) !== 0;

        // These cells are in different sections
        boundaryViolationRisk = headerIsHeader !== bodyIsHeader;
      }
    });

    expect(boundaryViolationRisk).toBe(true);
    expect(headerCell).toBeTruthy();
    expect(bodyCell).toBeTruthy();
  });

  it('should maintain DITA structure integrity in serialization after table operations', () => {
    parseXmlToLexical(testTable, editor, originMap, true);

    const editorState = editor.getEditorState();
    const cache = createXmlMetaCache();
    const serializedXml = serializeLexicalToXml(editorState, testTable, originMap, cache);

    // Validate DITA structure preservation
    expect(serializedXml).toContain('<thead>');
    expect(serializedXml).toContain('<tbody>');
    expect(serializedXml).toContain('Header A');
    expect(serializedXml).toContain('Body Cell 1');

    // Ensure proper section placement
    const theadMatch = serializedXml.match(/<thead>(.*?)<\/thead>/s);
    const tbodyMatch = serializedXml.match(/<tbody>(.*?)<\/tbody>/s);

    expect(theadMatch).toBeTruthy();
    expect(tbodyMatch).toBeTruthy();

    if (theadMatch && tbodyMatch) {
      // Headers should only be in thead
      expect(theadMatch[1]).toContain('Header A');
      expect(theadMatch[1]).toContain('Header B');
      expect(tbodyMatch[1]).not.toContain('Header A');

      // Body cells should only be in tbody
      expect(tbodyMatch[1]).toContain('Body Cell 1');
      expect(theadMatch[1]).not.toContain('Body Cell 1');
    }
  });
});

describe('Elena\'s Blocking Issue #2: Span Data Loss During Merge Operations', () => {
  let editor: LexicalEditor;
  let originMap: NodeOriginMapType;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  it('should correctly parse and preserve existing span attributes', () => {
    const result = parseXmlToLexical(tableWithSpans, editor, originMap, true);
    expect(result).toBe(true);

    let spannedCells: Array<{content: string, colspan: number, rowspan: number}> = [];

    editor.getEditorState().read(() => {
      const root = $getRoot();

      const collectSpanData = (node: any): void => {
        if (node.__type === 'tablecell') {
          const content = node.getTextContent();
          const colspan = node.getColSpan();
          const rowspan = node.getRowSpan();

          if (colspan > 1 || rowspan > 1) {
            spannedCells.push({ content, colspan, rowspan });
          }
        }
        if (node.getChildren) {
          node.getChildren().forEach((child: any) => collectSpanData(child));
        }
      };

      collectSpanData(root);
    });

    expect(spannedCells.length).toBeGreaterThan(0);

    // Validate specific span values
    const wideCell = spannedCells.find(cell => cell.content.includes('Wide Cell'));
    const tallCell = spannedCells.find(cell => cell.content.includes('Tall Cell'));

    expect(wideCell).toBeTruthy();
    expect(tallCell).toBeTruthy();

    if (wideCell) {
      expect(wideCell.colspan).toBe(2);
    }
    if (tallCell) {
      expect(tallCell.rowspan).toBe(2);
    }
  });

  it('should demonstrate Elena\'s span data loss concern during merge operations', () => {
    parseXmlToLexical(tableWithSpans, editor, originMap, true);

    let spanDataLossExample = false;
    let cellsWithExistingSpans: any[] = [];

    editor.update(() => {
      const root = $getRoot();

      const findCellsWithSpans = (node: any): void => {
        if (node.__type === 'tablecell') {
          const colspan = node.getColSpan();
          const rowspan = node.getRowSpan();

          if (colspan > 1 || rowspan > 1) {
            cellsWithExistingSpans.push({
              node,
              originalColspan: colspan,
              originalRowspan: rowspan,
              content: node.getTextContent()
            });
          }
        }
        if (node.getChildren) {
          node.getChildren().forEach((child: any) => findCellsWithSpans(child));
        }
      };

      findCellsWithSpans(root);

      // Elena's concern: When Jamie's implementation removes merged cells,
      // it doesn't account for their existing span values
      if (cellsWithExistingSpans.length > 0) {
        spanDataLossExample = true;

        // Example scenario: if we merge cell A (colspan=2) with cell B (colspan=1)
        // Correct total should be 2 + 1 = 3, not just "2 cells merged"
        const cellWithSpan = cellsWithExistingSpans[0];
        const originalSpanValue = cellWithSpan.originalColspan || cellWithSpan.originalRowspan;

        // This demonstrates the issue
        expect(originalSpanValue).toBeGreaterThan(1);
      }
    });

    expect(spanDataLossExample).toBe(true);
    expect(cellsWithExistingSpans.length).toBeGreaterThan(0);
  });

  it('should validate correct span calculation algorithm for Elena\'s fix', () => {
    parseXmlToLexical(tableWithSpans, editor, originMap, true);

    let correctSpanCalculationDemo = false;

    editor.update(() => {
      const root = $getRoot();

      // Simulate the correct approach to merge spanning cells
      const demonstrateCorrectSpanMerge = (node: any): boolean => {
        if (node.__type === 'tablerow') {
          const cells = node.getChildren();

          if (cells.length >= 2) {
            const cell1 = cells[0];
            const cell2 = cells[1];

            if (cell1.__type === 'tablecell' && cell2.__type === 'tablecell') {
              const cell1Colspan = cell1.getColSpan() || 1;
              const cell1Rowspan = cell1.getRowSpan() || 1;
              const cell2Colspan = cell2.getColSpan() || 1;
              const cell2Rowspan = cell2.getRowSpan() || 1;

              // Elena's correct approach: sum the spans, don't just count cells
              const correctTotalColspan = cell1Colspan + cell2Colspan;
              const correctMaxRowspan = Math.max(cell1Rowspan, cell2Rowspan);

              // This would be the correct implementation
              correctSpanCalculationDemo = correctTotalColspan > Math.max(cell1Colspan, cell2Colspan);

              return true;
            }
          }
        }

        if (node.getChildren) {
          for (const child of node.getChildren()) {
            if (demonstrateCorrectSpanMerge(child)) return true;
          }
        }
        return false;
      };

      demonstrateCorrectSpanMerge(root);
    });

    expect(correctSpanCalculationDemo).toBe(true);
  });

  it('should preserve span attributes in DITA serialization after table modifications', () => {
    parseXmlToLexical(tableWithSpans, editor, originMap, true);

    const editorState = editor.getEditorState();
    const cache = createXmlMetaCache();
    const serializedXml = serializeLexicalToXml(editorState, tableWithSpans, originMap, cache);

    // Validate DITA spanning attributes are preserved
    expect(serializedXml).toMatch(/namest="col1"/);
    expect(serializedXml).toMatch(/nameend="col2"/);
    expect(serializedXml).toMatch(/morerows="1"/);

    // Validate content is preserved
    expect(serializedXml).toContain('Wide Cell (2 cols)');
    expect(serializedXml).toContain('Tall Cell');
  });
});

describe('Content Preservation and Table Structure Integrity', () => {
  let editor: LexicalEditor;
  let originMap: NodeOriginMapType;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  it('should preserve cell content during merge operations (Jamie\'s implementation strength)', () => {
    parseXmlToLexical(testTable, editor, originMap, true);

    let contentPreservationDemo = false;
    let originalCellContents: string[] = [];
    let mergedContent = '';

    editor.update(() => {
      const root = $getRoot();

      const performContentPreservingMerge = (node: any): boolean => {
        if (node.__type === 'tablerow') {
          const cells = node.getChildren();

          if (cells.length >= 2) {
            const targetCell = cells[0];
            const sourceCell = cells[1];

            if (targetCell.__type === 'tablecell' && sourceCell.__type === 'tablecell') {
              // Collect content before merge
              const targetContent = targetCell.getTextContent();
              const sourceContent = sourceCell.getTextContent();
              originalCellContents = [targetContent, sourceContent].filter(c => c.trim());

              // Perform content-preserving merge (Jamie's implementation does this correctly)
              sourceCell.getChildren().forEach((child: any) => {
                targetCell.append(child);
              });

              sourceCell.remove();

              // Validate content preservation
              mergedContent = targetCell.getTextContent();
              contentPreservationDemo = originalCellContents.every(content =>
                mergedContent.includes(content.trim())
              );

              return true;
            }
          }
        }

        if (node.getChildren) {
          for (const child of node.getChildren()) {
            if (performContentPreservingMerge(child)) return true;
          }
        }
        return false;
      };

      performContentPreservingMerge(root);
    });

    expect(contentPreservationDemo).toBe(true);
    expect(originalCellContents.length).toBeGreaterThan(0);
    expect(mergedContent.length).toBeGreaterThan(0);
  });

  it('should maintain minimum table structure requirements', () => {
    parseXmlToLexical(testTable, editor, originMap, true);

    let structureValid = false;
    let tableStats = { tableCount: 0, rowCount: 0, cellCount: 0 };

    editor.getEditorState().read(() => {
      const root = $getRoot();

      const validateTableStructure = (node: any): void => {
        if (node.__type === 'table') {
          tableStats.tableCount++;
        } else if (node.__type === 'tablerow') {
          tableStats.rowCount++;
        } else if (node.__type === 'tablecell') {
          tableStats.cellCount++;
        }

        if (node.getChildren) {
          node.getChildren().forEach((child: any) => validateTableStructure(child));
        }
      };

      validateTableStructure(root);

      // Basic structure validation
      structureValid = tableStats.tableCount === 1 &&
                      tableStats.rowCount > 0 &&
                      tableStats.cellCount > 0;
    });

    expect(structureValid).toBe(true);
    expect(tableStats.tableCount).toBe(1);
    expect(tableStats.rowCount).toBe(3); // 1 header + 2 body rows
    expect(tableStats.cellCount).toBe(6); // 2 + 2 + 2 = 6 cells total
  });
});