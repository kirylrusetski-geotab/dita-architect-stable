import React from 'react';
import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';

export type SerializedTrackedDeletionNode = Spread<
  { deletedText: string },
  SerializedLexicalNode
>;

export class TrackedDeletionNode extends DecoratorNode<React.ReactElement> {
  __deletedText: string;

  static getType(): string {
    return 'tracked-deletion';
  }

  static clone(node: TrackedDeletionNode): TrackedDeletionNode {
    return new TrackedDeletionNode(node.__deletedText, node.__key);
  }

  constructor(deletedText: string, key?: NodeKey) {
    super(key);
    this.__deletedText = deletedText;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <span contentEditable={false} className="tracked-deletion-inline">
        {this.__deletedText}
      </span>
    );
  }

  getTextContent(): string {
    return '';
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedTrackedDeletionNode): TrackedDeletionNode {
    return $createTrackedDeletionNode(serializedNode.deletedText);
  }

  exportJSON(): SerializedTrackedDeletionNode {
    return {
      ...super.exportJSON(),
      deletedText: this.__deletedText,
      type: 'tracked-deletion',
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(): DOMExportOutput {
    return { element: null };
  }
}

export function $createTrackedDeletionNode(deletedText: string): TrackedDeletionNode {
  return new TrackedDeletionNode(deletedText);
}

export function $isTrackedDeletionNode(
  node: LexicalNode | null | undefined,
): node is TrackedDeletionNode {
  return node instanceof TrackedDeletionNode;
}
