import React from 'react';
import { DecoratorNode } from 'lexical';
import type { LexicalEditor, EditorConfig, NodeKey, SerializedLexicalNode } from 'lexical';

interface SerializedDitaPhRefNode extends SerializedLexicalNode {
  refType: string;
  refValue: string;
  originalText: string;
}

function PhRefComponent({ refValue }: { refValue: string }) {
  return (
    <code
      contentEditable={false}
      style={{
        padding: '1px 4px',
        borderRadius: '3px',
        fontSize: '0.85em',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        backgroundColor: 'var(--app-surface-raised, #2a2a3e)',
        color: 'var(--app-text-muted, #999)',
        border: '1px solid var(--app-border-subtle, #333)',
        userSelect: 'none',
      }}
    >
      {refValue}
    </code>
  );
}

export class DitaPhRefNode extends DecoratorNode<React.ReactElement> {
  __refType: string;
  __refValue: string;
  __originalText: string;

  constructor(refType: string, refValue: string, originalText: string, key?: NodeKey) {
    super(key);
    this.__refType = refType;
    this.__refValue = refValue;
    this.__originalText = originalText;
  }

  static getType(): string {
    return 'ditaphref';
  }

  static clone(node: DitaPhRefNode): DitaPhRefNode {
    return new DitaPhRefNode(node.__refType, node.__refValue, node.__originalText, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.ReactElement {
    return <PhRefComponent refValue={this.__refValue} />;
  }

  getTextContent(): string {
    return this.__originalText;
  }

  getRefType(): string {
    return this.__refType;
  }

  getRefValue(): string {
    return this.__refValue;
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  static importJSON(serializedNode: SerializedDitaPhRefNode): DitaPhRefNode {
    return new DitaPhRefNode(
      serializedNode.refType,
      serializedNode.refValue,
      serializedNode.originalText,
    );
  }

  exportJSON(): SerializedDitaPhRefNode {
    return {
      ...super.exportJSON(),
      type: 'ditaphref',
      version: 1,
      refType: this.__refType,
      refValue: this.__refValue,
      originalText: this.__originalText,
    };
  }
}

export function $createDitaPhRefNode(
  refType: string,
  refValue: string,
  originalText: string,
): DitaPhRefNode {
  return new DitaPhRefNode(refType, refValue, originalText);
}

export function $isDitaPhRefNode(node: unknown): node is DitaPhRefNode {
  return node instanceof DitaPhRefNode;
}
