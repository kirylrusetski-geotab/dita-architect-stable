import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $isElementNode } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';

export const EmptyToH1Plugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length === 1) {
          const firstChild = children[0];
          if ($isElementNode(firstChild) && firstChild.getType() === 'paragraph' && firstChild.getTextContent() === '') {
            editor.update(() => {
              const root = $getRoot();
              const children = root.getChildren();
              if (children.length === 1) {
                const firstChild = children[0];
                if ($isElementNode(firstChild) && firstChild.getType() === 'paragraph' && firstChild.getTextContent() === '') {
                  const h1 = $createHeadingNode('h1');
                  firstChild.replace(h1);

                  const rootElement = editor.getRootElement();
                  if (rootElement && (document.activeElement === rootElement || rootElement.contains(document.activeElement))) {
                    h1.select();
                  }
                }
              }
            });
          }
        }
      });
    });
  }, [editor]);

  return null;
};
