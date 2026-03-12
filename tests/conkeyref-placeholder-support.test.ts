// @ts-nocheck
// @vitest-environment jsdom
/**
 * Tests for conkeyref/keyref/conref placeholder support in parseXmlToLexical.
 * These tests validate Jamie's implementation that creates DitaPhRefNode placeholders
 * for note elements with reference attributes, addressing P1-3 bug.
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

describe('conkeyref/keyref/conref placeholder support in note elements', () => {
  let editor: any;
  let originMap: any;

  beforeEach(() => {
    editor = createTestEditor();
    originMap = createNodeOriginMap();
  });

  describe('note elements with conkeyref attributes create visible placeholders', () => {
    it('creates placeholder node for note with conkeyref attribute instead of empty note', () => {
      const xml = `<task>
        <taskbody>
          <note conkeyref="varsAltitudeNotes/noteSpecialCaseAPIs">
            <!-- This content should be replaced by the conkeyref placeholder -->
            <p>This content should not appear</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        // Should create conkeyref placeholder
        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refType).toBe('conkeyref');
        expect(refValue).toBe('varsAltitudeNotes/noteSpecialCaseAPIs');
        expect(displayText).toBe('[conkeyref: varsAltitudeNotes/noteSpecialCaseAPIs]');

        // Should NOT contain the original note content
        const quoteNode = children.find(child => child.__type === 'quote');
        expect(quoteNode).toBeUndefined();
      });
    });

    it('creates placeholder node for note with keyref attribute', () => {
      const xml = `<task>
        <taskbody>
          <note keyref="warningMessages/invalidInput">
            <p>Fallback content</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refType).toBe('keyref');
        expect(refValue).toBe('warningMessages/invalidInput');
        expect(displayText).toBe('[keyref: warningMessages/invalidInput]');
      });
    });

    it('creates placeholder node for note with conref attribute', () => {
      const xml = `<task>
        <taskbody>
          <note conref="sharedContent/commonNotes/installation">
            <p>Original note content</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refType).toBe('conref');
        expect(refValue).toBe('sharedContent/commonNotes/installation');
        expect(displayText).toBe('[conref: sharedContent/commonNotes/installation]');
      });
    });

    it('prioritizes conkeyref over keyref when both attributes are present', () => {
      const xml = `<task>
        <taskbody>
          <note conkeyref="primary/reference" keyref="secondary/reference">
            <p>This should be replaced</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;

        expect(refType).toBe('conkeyref');
        expect(refValue).toBe('primary/reference');
      });
    });

    it('prioritizes keyref over conref when both attributes are present', () => {
      const xml = `<task>
        <taskbody>
          <note keyref="keyReference" conref="contentReference">
            <p>This should be replaced</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;

        expect(refType).toBe('keyref');
        expect(refValue).toBe('keyReference');
      });
    });
  });

  describe('note elements without reference attributes render as normal quote nodes', () => {
    it('renders regular note as quote node when no reference attributes are present', () => {
      const xml = `<task>
        <taskbody>
          <note>This is a regular note without references.</note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const quoteNode = children.find(child => child.__type === 'quote');
        expect(quoteNode).toBeDefined();

        // Should NOT create a phRef node
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeUndefined();

        // Verify quote content
        expect(quoteNode!.getTextContent()).toBe('This is a regular note without references.');
      });
    });

    it('renders note with complex markup when no reference attributes', () => {
      const xml = `<task>
        <taskbody>
          <note>
            <p>This note contains <b>bold text</b> and <i>italic text</i>.</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const quoteNode = children.find(child => child.__type === 'quote');
        expect(quoteNode).toBeDefined();

        // Should contain complex content
        const quoteContent = quoteNode!.getTextContent();
        expect(quoteContent).toContain('bold text');
        expect(quoteContent).toContain('italic text');
        expect(quoteContent).toContain('List item 1');
        expect(quoteContent).toContain('List item 2');

        // Should NOT create a phRef node
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeUndefined();
      });
    });

    it('ignores empty reference attributes and renders as normal note', () => {
      const xml = `<task>
        <taskbody>
          <note conkeyref="" keyref="" conref="">
            <p>Note with empty reference attributes</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const quoteNode = children.find(child => child.__type === 'quote');
        expect(quoteNode).toBeDefined();

        // Should NOT create a phRef node for empty attributes
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeUndefined();

        expect(quoteNode!.getTextContent()).toBe('Note with empty reference attributes');
      });
    });
  });

  describe('edge cases and error handling for reference placeholders', () => {
    it('handles special characters in reference values correctly', () => {
      const xml = `<task>
        <taskbody>
          <note conkeyref="module/special-chars_123.note">
            <p>Fallback content</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refValue).toBe('module/special-chars_123.note');
        expect(displayText).toBe('[conkeyref: module/special-chars_123.note]');
      });
    });

    it('handles very long reference values without truncation', () => {
      const longRef = 'very/long/path/to/content/reference/that/exceeds/normal/length/expectations/noteContent';
      const xml = `<task>
        <taskbody>
          <note keyref="${longRef}">
            <p>Fallback content</p>
          </note>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const phRefNode = children.find(child => child.__type === 'ditaphref');
        expect(phRefNode).toBeDefined();

        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refValue).toBe(longRef);
        expect(displayText).toBe(`[keyref: ${longRef}]`);
      });
    });

    it('maintains proper WYSIWYG/DITA parity for placeholder visibility', () => {
      // Test that placeholders are visible in WYSIWYG mode and clearly indicate the reference
      const xml = `<task>
        <title>Reference Test</title>
        <taskbody>
          <p>Content before reference.</p>
          <note conkeyref="userGuide/installationNotes">
            <p>Installation instructions placeholder</p>
          </note>
          <p>Content after reference.</p>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Should have title + paragraph + phref + paragraph
        expect(children.length).toBe(4);

        // Verify the placeholder is in the right position
        const phRefNode = children[2];
        expect(phRefNode.__type).toBe('ditaphref');

        const refType = (phRefNode as any).__refType;
        const refValue = (phRefNode as any).__refValue;
        const displayText = phRefNode!.getTextContent();

        expect(refType).toBe('conkeyref');
        expect(refValue).toBe('userGuide/installationNotes');
        expect(displayText).toBe('[conkeyref: userGuide/installationNotes]');

        // Verify surrounding content is preserved
        expect(children[1].getTextContent()).toBe('Content before reference.');
        expect(children[3].getTextContent()).toBe('Content after reference.');
      });
    });
  });

  describe('regression tests for WYSIWYG/DITA parity with placeholders', () => {
    it('ensures placeholder implementation fixes P1-3 bug where conkeyref notes were invisible', () => {
      // Before this fix, conkeyref notes would render as blank space
      // Now they should render as visible placeholders
      const xml = `<task>
        <taskbody>
          <note conkeyref="troubleshooting/commonErrors/networkIssue"/>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        expect(children.length).toBe(1);

        const phRefNode = children[0];
        expect(phRefNode.__type).toBe('ditaphref');

        // Placeholder should be clearly visible to user
        const displayText = phRefNode!.getTextContent();
        expect(displayText).toBe('[conkeyref: troubleshooting/commonErrors/networkIssue]');
        expect(displayText.length).toBeGreaterThan(0);
        expect(displayText).toContain('conkeyref');
        expect(displayText).toContain('troubleshooting/commonErrors/networkIssue');
      });
    });

    it('validates that placeholder pattern is consistent with existing DitaPhRefNode usage', () => {
      // Should follow the same pattern as other ph/term references
      const xml = `<task>
        <taskbody>
          <p>Regular ph reference: <ph conkeyref="vars/productName"/></p>
          <note conkeyref="notes/securityWarning"/>
        </taskbody>
      </task>`;

      const result = parseXmlToLexical(xml, editor, originMap, true);
      expect(result).toBe(true);

      const editorState = editor.getEditorState();
      editorState.read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        // Should have paragraph and phref node
        expect(children.length).toBe(2);

        const paragraphNode = children[0];
        const notePhRef = children[1];

        // Both should use DitaPhRefNode consistently
        expect(notePhRef.__type).toBe('ditaphref');

        // Check paragraph contains ph reference
        const paragraphChildren = paragraphNode.getChildren();
        const phRefInParagraph = paragraphChildren.find((child: any) => child.__type === 'ditaphref');
        expect(phRefInParagraph).toBeDefined();

        // Both should have same structure
        const noteRefType = (notePhRef as any).__refType;
        const phRefType = (phRefInParagraph as any).__refType;
        expect(noteRefType).toBe('conkeyref');
        expect(phRefType).toBe('conkeyref');
      });
    });
  });
});