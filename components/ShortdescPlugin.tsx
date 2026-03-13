import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isElementNode,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $createParagraphNode,
  ParagraphNode,
} from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { useSyncContext } from '../sync';

const BODY_TAG_CLASSES: Record<string, string> = {
  shortdesc: 'dita-editor-shortdesc',
  prereq: 'dita-editor-prereq',
  context: 'dita-editor-context',
  result: 'dita-editor-result',
  postreq: 'dita-editor-postreq',
};
const ALL_BODY_CLASSES = Object.values(BODY_TAG_CLASSES);

/**
 * Handles the DITA authoring flow: H1 (title) → shortdesc → paragraph.
 *
 * When Enter is pressed at the end of the H1 at index 0 and no shortdesc
 * exists yet, the new paragraph is tagged as 'shortdesc' and gets a
 * visual indicator via a CSS class applied through a mutation listener.
 */
export const ShortdescPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const { nodeOriginMap } = useSyncContext();

  useEffect(() => {
    // ── Enter key handler ─────────────────────────────────────────────
    const removeEnterListener = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;

        const anchorNode = selection.anchor.getNode();
        const topLevelNode = anchorNode.getTopLevelElement();
        if (!topLevelNode) return false;

        const root = $getRoot();
        const children = root.getChildren();
        const nodeIndex = children.indexOf(topLevelNode);

        // Case 1: Enter at end of H1 at index 0 → create shortdesc
        if (
          nodeIndex === 0 &&
          $isHeadingNode(topLevelNode) &&
          topLevelNode.getTag() === 'h1'
        ) {
          // Check if a shortdesc already exists
          const hasShortdesc = Array.from(nodeOriginMap.values()).some(o => o.tag === 'shortdesc');
          if (!hasShortdesc) {
            event?.preventDefault();

            const shortdescNode = $createParagraphNode();
            topLevelNode.insertAfter(shortdescNode);
            shortdescNode.select();

            nodeOriginMap.set(shortdescNode.getKey(), { tag: 'shortdesc', bodyIndex: -2 });

            return true;
          }
        }

        // Case 2: Enter in shortdesc paragraph → create regular paragraph
        if ($isElementNode(topLevelNode) && topLevelNode.getType() === 'paragraph') {
          const origin = nodeOriginMap.get(topLevelNode.getKey());
          if (origin?.tag === 'shortdesc') {
            event?.preventDefault();

            const pNode = $createParagraphNode();
            topLevelNode.insertAfter(pNode);
            pNode.select();

            return true;
          }
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    // ── Mutation listener: apply/remove CSS class on shortdesc DOM node ──
    const removeMutationListener = editor.registerMutationListener(
      ParagraphNode,
      () => {
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          children.forEach((node) => {
            if (!$isElementNode(node) || node.getType() !== 'paragraph') return;

            const key = node.getKey();
            const origin = nodeOriginMap.get(key);
            const domElement = editor.getElementByKey(key);
            if (!domElement) return;

            // Remove all managed classes first
            ALL_BODY_CLASSES.forEach(className => {
              domElement.classList.remove(className);
            });

            // Add the appropriate class if origin tag matches
            if (origin?.tag && BODY_TAG_CLASSES[origin.tag]) {
              domElement.classList.add(BODY_TAG_CLASSES[origin.tag]);
            }
          });
        });
      },
    );

    return () => {
      removeEnterListener();
      removeMutationListener();
    };
  }, [editor, nodeOriginMap]);

  return null;
};
