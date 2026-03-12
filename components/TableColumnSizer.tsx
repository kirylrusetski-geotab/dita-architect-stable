import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $isElementNode } from 'lexical';
import { $isTableNode, $isTableRowNode, $isTableCellNode } from '@lexical/table';

export const TableColumnSizer = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const tableNodes: any[] = [];

        // Find all table nodes in the editor
        const findTables = (node: any) => {
          if ($isTableNode(node)) {
            tableNodes.push(node);
          }
          if ($isElementNode(node)) {
            node.getChildren().forEach((child: any) => findTables(child));
          }
        };

        root.getChildren().forEach(child => findTables(child));

        // Process each table
        tableNodes.forEach(tableNode => {
          const rows = tableNode.getChildren().filter((child: any) => $isTableRowNode(child));
          if (rows.length === 0) return;

          // Calculate column count from first row
          const firstRow = rows[0];
          const firstRowCells = firstRow.getChildren().filter((child: any) => $isTableCellNode(child));
          const columnCount = firstRowCells.length;
          if (columnCount === 0) return;

          // Calculate content length for each column
          const columnContentLengths: number[] = new Array(columnCount).fill(0);

          rows.forEach((row: any) => {
            const cells = row.getChildren().filter((child: any) => $isTableCellNode(child));
            cells.forEach((cell: any, columnIndex: number) => {
              if (columnIndex < columnCount) {
                const contentLength = cell.getTextContent().length;
                columnContentLengths[columnIndex] = Math.max(
                  columnContentLengths[columnIndex],
                  contentLength
                );
              }
            });
          });

          // Calculate optimal widths with minimum width constraint
          const minWidthPerColumn = 10; // Minimum 10% width per column
          const totalContentLength = columnContentLengths.reduce((sum, length) => sum + length, 0);

          let columnWidths: number[];
          if (totalContentLength === 0) {
            // Equal distribution if no content
            columnWidths = new Array(columnCount).fill(100 / columnCount);
          } else {
            // Proportional distribution based on content length
            columnWidths = columnContentLengths.map(length =>
              Math.max(minWidthPerColumn, (length / totalContentLength) * 100)
            );

            // Normalize to 100% if total exceeds due to minimum constraints
            const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
            if (totalWidth > 100) {
              columnWidths = columnWidths.map(width => (width / totalWidth) * 100);
            }
          }

          // Apply widths to all cells in the table
          const tableKey = tableNode.getKey();
          const tableElement = editor.getElementByKey(tableKey);

          if (tableElement) {
            rows.forEach((row: any) => {
              const cells = row.getChildren().filter((child: any) => $isTableCellNode(child));
              cells.forEach((cell: any, columnIndex: number) => {
                if (columnIndex < columnWidths.length) {
                  const cellKey = cell.getKey();
                  const cellElement = editor.getElementByKey(cellKey);

                  if (cellElement) {
                    cellElement.style.width = `${columnWidths[columnIndex]}%`;
                    cellElement.style.minWidth = `${minWidthPerColumn}%`;
                  }
                }
              });
            });
          }
        });
      });
    });
  }, [editor]);

  return null;
};