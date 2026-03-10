import React from 'react';
import { DecoratorNode } from 'lexical';
import type { LexicalEditor, EditorConfig, NodeKey, SerializedLexicalNode } from 'lexical';

interface SerializedDitaImageNode extends SerializedLexicalNode {
  href: string;
  alt: string;
  title: string;
  isFig: boolean;
}

function ImageComponent({
  href,
  alt,
  title,
  isFig,
}: {
  href: string;
  alt: string;
  title: string;
  isFig: boolean;
}) {
  const isUrl = /^https?:\/\//.test(href);

  return (
    <div
      contentEditable={false}
      style={{
        margin: '8px 0',
        borderRadius: '6px',
        border: '1px solid var(--app-border-subtle, #333)',
        overflow: 'hidden',
        backgroundColor: 'var(--app-surface-raised, #1e1e1e)',
      }}
    >
      {title && (
        <div
          style={{
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--app-text-secondary, #aaa)',
            borderBottom: '1px solid var(--app-border-subtle, #333)',
          }}
        >
          {title}
        </div>
      )}
      {isUrl ? (
        <img
          src={href}
          alt={alt}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px',
            color: 'var(--app-text-muted, #888)',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ width: 28, height: 28, opacity: 0.5, flexShrink: 0 }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                wordBreak: 'break-all',
              }}
            >
              {href || 'No image source'}
            </div>
            {alt && (
              <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                {alt}
              </div>
            )}
            <div
              style={{
                fontSize: '10px',
                opacity: 0.4,
                marginTop: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {isFig ? 'fig · image' : 'image'}
            </div>
          </div>
        </div>
      )}
      {isUrl && alt && (
        <div
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--app-text-muted, #888)',
            borderTop: '1px solid var(--app-border-subtle, #333)',
          }}
        >
          {alt}
        </div>
      )}
    </div>
  );
}

export class DitaImageNode extends DecoratorNode<React.ReactElement> {
  __href: string;
  __alt: string;
  __title: string;
  __isFig: boolean;

  constructor(href: string, alt: string, title: string, isFig: boolean, key?: NodeKey) {
    super(key);
    this.__href = href;
    this.__alt = alt;
    this.__title = title;
    this.__isFig = isFig;
  }

  static getType(): string {
    return 'ditaimage';
  }

  static clone(node: DitaImageNode): DitaImageNode {
    return new DitaImageNode(node.__href, node.__alt, node.__title, node.__isFig, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): React.ReactElement {
    return (
      <ImageComponent
        href={this.__href}
        alt={this.__alt}
        title={this.__title}
        isFig={this.__isFig}
      />
    );
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  static importJSON(serializedNode: SerializedDitaImageNode): DitaImageNode {
    return new DitaImageNode(
      serializedNode.href,
      serializedNode.alt,
      serializedNode.title,
      serializedNode.isFig,
    );
  }

  exportJSON(): SerializedDitaImageNode {
    return {
      ...super.exportJSON(),
      type: 'ditaimage',
      version: 1,
      href: this.__href,
      alt: this.__alt,
      title: this.__title,
      isFig: this.__isFig,
    };
  }
}

export function $createDitaImageNode(
  href: string,
  alt: string,
  title: string,
  isFig: boolean,
): DitaImageNode {
  return new DitaImageNode(href, alt, title, isFig);
}

export function $isDitaImageNode(node: unknown): node is DitaImageNode {
  return node instanceof DitaImageNode;
}
