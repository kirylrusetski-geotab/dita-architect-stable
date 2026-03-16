import React, { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getNodeByKey
} from 'lexical';
import {
  $isTableCellNode,
  $isTableRowNode,
  $isTableNode,
  TableCellNode,
  TableRowNode,
  $createTableRowNode,
  $createTableCellNode,
  $getTableRowIndexFromTableCellNode,
  $getTableColumnIndexFromTableCellNode
} from '@lexical/table';
import {
  $createParagraphNode
} from 'lexical';

type MenuPosition = {
  x: number;
  y: number;
};

type MenuAction = {
  label: string;
  action: () => void;
  separator?: boolean;
};

export const TableActionMenuPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [targetCellKey, setTargetCellKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get table cell from right-click target
  const getTableCellFromTarget = (target: Element): TableCellNode | null => {
    let element = target;
    while (element && element !== document.body) {
      const nodeKey = element.getAttribute('data-lexical-editor-key');
      if (nodeKey) {
        return editor.getEditorState().read(() => {
          const node = $getNodeByKey(nodeKey);
          return $isTableCellNode(node) ? node : null;
        });
      }
      element = element.parentElement as Element;
    }
    return null;
  };

  // Calculate menu position within viewport
  const calculateMenuPosition = (x: number, y: number): MenuPosition => {
    const menuWidth = 200;
    const menuHeight = 280;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + menuWidth > viewport.width) {
      adjustedX = x - menuWidth;
    }

    // Adjust vertical position
    if (y + menuHeight > viewport.height) {
      adjustedY = y - menuHeight;
    }

    // Ensure menu doesn't go off-screen
    adjustedX = Math.max(10, adjustedX);
    adjustedY = Math.max(10, adjustedY);

    return { x: adjustedX, y: adjustedY };
  };

  // Handle right-click events
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as Element;
      const cellNode = getTableCellFromTarget(target);

      if (cellNode) {
        event.preventDefault();
        const position = calculateMenuPosition(event.clientX, event.clientY);
        setMenuPosition(position);
        setTargetCellKey(cellNode.getKey());
        setMenuVisible(true);
      }
    };

    const handleClick = () => {
      setMenuVisible(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuVisible(false);
      }
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('contextmenu', handleContextMenu);
      }
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  // Menu actions
  const createMenuActions = (cellKey: string): MenuAction[] => {
    return [
      {
        label: 'Insert row above',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  // Create new row with same number of cells
                  const newRow = $createTableRowNode();
                  const cellCount = rowNode.getChildren().length;

                  for (let i = 0; i < cellCount; i++) {
                    const newCell = $createTableCellNode(0);
                    newCell.append($createParagraphNode());
                    newRow.append(newCell);
                  }

                  rowNode.insertBefore(newRow);
                }
              }
            }
          });
          setMenuVisible(false);
        }
      },
      {
        label: 'Insert row below',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  // Create new row with same number of cells
                  const newRow = $createTableRowNode();
                  const cellCount = rowNode.getChildren().length;

                  for (let i = 0; i < cellCount; i++) {
                    const newCell = $createTableCellNode(0);
                    newCell.append($createParagraphNode());
                    newRow.append(newCell);
                  }

                  rowNode.insertAfter(newRow);
                }
              }
            }
          });
          setMenuVisible(false);
        }
      },
      {
        label: 'Delete row',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  const rowCount = tableNode.getChildren().length;
                  // Prevent deletion if only one row remains
                  if (rowCount <= 1) {
                    return; // Exit early without performing deletion
                  }

                  rowNode.remove();
                }
              }
            }
          });
          setMenuVisible(false);
        },
        separator: true
      },
      {
        label: 'Insert column left',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  const columnIndex = $getTableColumnIndexFromTableCellNode(cellNode);

                  // Insert new cell in each row at the specified column index
                  const rows = tableNode.getChildren();
                  rows.forEach((row) => {
                    if ($isTableRowNode(row)) {
                      const cells = row.getChildren();
                      const targetCell = cells[columnIndex];
                      if (targetCell && $isTableCellNode(targetCell)) {
                        const newCell = $createTableCellNode(0);
                        newCell.append($createParagraphNode());
                        targetCell.insertBefore(newCell);
                      }
                    }
                  });
                }
              }
            }
          });
          setMenuVisible(false);
        }
      },
      {
        label: 'Insert column right',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  const columnIndex = $getTableColumnIndexFromTableCellNode(cellNode);

                  // Insert new cell in each row after the specified column index
                  const rows = tableNode.getChildren();
                  rows.forEach((row) => {
                    if ($isTableRowNode(row)) {
                      const cells = row.getChildren();
                      const targetCell = cells[columnIndex];
                      if (targetCell && $isTableCellNode(targetCell)) {
                        const newCell = $createTableCellNode(0);
                        newCell.append($createParagraphNode());
                        targetCell.insertAfter(newCell);
                      }
                    }
                  });
                }
              }
            }
          });
          setMenuVisible(false);
        }
      },
      {
        label: 'Delete column',
        action: () => {
          editor.update(() => {
            const cellNode = $getNodeByKey(cellKey);
            if ($isTableCellNode(cellNode)) {
              const rowNode = cellNode.getParent();
              if ($isTableRowNode(rowNode)) {
                const tableNode = rowNode.getParent();
                if ($isTableNode(tableNode)) {
                  const firstRow = tableNode.getChildren()[0];
                  if ($isTableRowNode(firstRow)) {
                    const colCount = firstRow.getChildren().length;
                    // Prevent deletion if only one column remains
                    if (colCount <= 1) {
                      return; // Exit early without performing deletion
                    }

                    const columnIndex = $getTableColumnIndexFromTableCellNode(cellNode);

                    // Delete cell at the specified column index from each row
                    const rows = tableNode.getChildren();
                    rows.forEach((row) => {
                      if ($isTableRowNode(row)) {
                        const cells = row.getChildren();
                        const targetCell = cells[columnIndex];
                        if (targetCell && $isTableCellNode(targetCell)) {
                          targetCell.remove();
                        }
                      }
                    });
                  }
                }
              }
            }
          });
          setMenuVisible(false);
        }
      }
    ];
  };

  if (!menuVisible || !targetCellKey) {
    return null;
  }

  const actions = createMenuActions(targetCellKey);

  return (
    <div
      ref={menuRef}
      className="table-action-menu"
      style={{
        position: 'fixed',
        left: menuPosition.x,
        top: menuPosition.y,
        zIndex: 20
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {actions.map((action, index) => (
        <React.Fragment key={index}>
          <div
            className="table-action-menu-item"
            onClick={action.action}
          >
            {action.label}
          </div>
          {action.separator && <div className="table-action-menu-separator" />}
        </React.Fragment>
      ))}
    </div>
  );
};