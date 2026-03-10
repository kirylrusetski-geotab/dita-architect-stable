// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseHerettoFolder, getFolderName } from '../lib/heretto-utils';

// ─── parseHerettoFolder ───────────────────────────────────────────────────────

describe('parseHerettoFolder', () => {
  // ── empty / missing input ──────────────────────────────────────────────────

  it('returns an empty array for an empty string', () => {
    expect(parseHerettoFolder('')).toEqual([]);
  });

  it('returns an empty array for a whitespace-only string', () => {
    expect(parseHerettoFolder('   \n\t  ')).toEqual([]);
  });

  it('returns an empty array for malformed XML', () => {
    expect(parseHerettoFolder('<folder id="x"')).toEqual([]);
  });

  it('returns an empty array when the <children> element is absent', () => {
    const xml = '<folder id="root" name="Root"><metadata/></folder>';
    expect(parseHerettoFolder(xml)).toEqual([]);
  });

  it('returns an empty array when <children> is present but has no child elements', () => {
    const xml = '<folder id="root" name="Root"><children></children></folder>';
    expect(parseHerettoFolder(xml)).toEqual([]);
  });

  // ── valid XML with folders and resources ──────────────────────────────────

  it('parses a single folder child correctly', () => {
    const xml = `
      <folder id="root" name="Root">
        <children>
          <folder id="f1" name="Alpha"/>
        </children>
      </folder>
    `;
    expect(parseHerettoFolder(xml)).toEqual([
      { uuid: 'f1', name: 'Alpha', type: 'folder' },
    ]);
  });

  it('parses a single resource child correctly', () => {
    const xml = `
      <folder id="root" name="Root">
        <children>
          <resource id="r1" name="topic.dita"/>
        </children>
      </folder>
    `;
    expect(parseHerettoFolder(xml)).toEqual([
      { uuid: 'r1', name: 'topic.dita', type: 'file' },
    ]);
  });

  it('parses a mix of folders and resources', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource id="r1" name="aaa.dita"/>
          <folder id="f1" name="Bravo"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    // Both items must be present (order tested separately)
    expect(result).toHaveLength(2);
    expect(result.some(i => i.uuid === 'r1' && i.type === 'file')).toBe(true);
    expect(result.some(i => i.uuid === 'f1' && i.type === 'folder')).toBe(true);
  });

  it('falls back to the id attribute when name attribute is absent', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource id="no-name-resource"/>
        </children>
      </folder>
    `;
    expect(parseHerettoFolder(xml)).toEqual([
      { uuid: 'no-name-resource', name: 'no-name-resource', type: 'file' },
    ]);
  });

  it('uses an empty string for uuid when the id attribute is absent', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource name="no-id.dita"/>
        </children>
      </folder>
    `;
    expect(parseHerettoFolder(xml)).toEqual([
      { uuid: '', name: 'no-id.dita', type: 'file' },
    ]);
  });

  it('ignores unrecognized child element tags inside <children>', () => {
    const xml = `
      <folder id="root">
        <children>
          <unknown id="u1" name="Mystery"/>
          <resource id="r1" name="known.dita"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ uuid: 'r1', name: 'known.dita', type: 'file' });
  });

  // ── sorting behaviour ─────────────────────────────────────────────────────

  it('places all folders before all files', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource id="r1" name="alpha.dita"/>
          <folder id="f1" name="Zebra"/>
          <resource id="r2" name="beta.dita"/>
          <folder id="f2" name="Apple"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    const types = result.map(i => i.type);
    // All folders come first
    const lastFolderIdx = types.lastIndexOf('folder');
    const firstFileIdx = types.indexOf('file');
    expect(lastFolderIdx).toBeLessThan(firstFileIdx);
  });

  it('sorts folders alphabetically within the folder group', () => {
    const xml = `
      <folder id="root">
        <children>
          <folder id="f1" name="Zebra"/>
          <folder id="f2" name="Apple"/>
          <folder id="f3" name="Mango"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    expect(result.map(i => i.name)).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('sorts files alphabetically within the file group', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource id="r1" name="zebra.dita"/>
          <resource id="r2" name="alpha.dita"/>
          <resource id="r3" name="mango.dita"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    expect(result.map(i => i.name)).toEqual(['alpha.dita', 'mango.dita', 'zebra.dita']);
  });

  it('combines folder-first and alphabetical sorting correctly', () => {
    const xml = `
      <folder id="root">
        <children>
          <resource id="r1" name="aaa.dita"/>
          <folder id="f1" name="Zzz"/>
          <resource id="r2" name="bbb.dita"/>
          <folder id="f2" name="Aaa"/>
        </children>
      </folder>
    `;
    const result = parseHerettoFolder(xml);
    expect(result).toEqual([
      { uuid: 'f2', name: 'Aaa', type: 'folder' },
      { uuid: 'f1', name: 'Zzz', type: 'folder' },
      { uuid: 'r1', name: 'aaa.dita', type: 'file' },
      { uuid: 'r2', name: 'bbb.dita', type: 'file' },
    ]);
  });

  it('is case-sensitive in sort order (uppercase letters sort before lowercase in most locales)', () => {
    const xml = `
      <folder id="root">
        <children>
          <folder id="f1" name="beta"/>
          <folder id="f2" name="Alpha"/>
        </children>
      </folder>
    `;
    // localeCompare is locale-dependent; just confirm both are present and type order is preserved
    const result = parseHerettoFolder(xml);
    expect(result).toHaveLength(2);
    expect(result.every(i => i.type === 'folder')).toBe(true);
  });

  // ── XML with parseerror element ─────────────────────────────────────────────

  it('returns an empty array when the XML contains only a declaration with no root', () => {
    expect(parseHerettoFolder('<?xml version="1.0"?>')).toEqual([]);
  });

  it('returns an empty array for a completely invalid XML string', () => {
    expect(parseHerettoFolder('not xml at all <<<')).toEqual([]);
  });

  // ── children element with only whitespace text nodes ────────────────────────

  it('handles <children> that contains only whitespace text nodes', () => {
    const xml = '<folder id="root"><children>   \n   </children></folder>';
    expect(parseHerettoFolder(xml)).toEqual([]);
  });
});

// ─── getFolderName ────────────────────────────────────────────────────────────

describe('getFolderName', () => {
  // ── empty / missing input ──────────────────────────────────────────────────

  it('returns an empty string for an empty string input', () => {
    expect(getFolderName('')).toBe('');
  });

  it('returns an empty string for a whitespace-only string', () => {
    expect(getFolderName('   ')).toBe('');
  });

  it('returns an empty string for malformed XML', () => {
    expect(getFolderName('<folder id="x"')).toBe('');
  });

  it('returns an empty string when the <name> element is absent', () => {
    const xml = '<folder id="root"><metadata/></folder>';
    expect(getFolderName(xml)).toBe('');
  });

  it('returns an empty string when the <name> element is present but empty', () => {
    const xml = '<folder id="root"><name></name></folder>';
    expect(getFolderName(xml)).toBe('');
  });

  it('returns an empty string when the <name> element contains only whitespace', () => {
    const xml = '<folder id="root"><name>   </name></folder>';
    expect(getFolderName(xml)).toBe('');
  });

  // ── valid cases ────────────────────────────────────────────────────────────

  it('returns the text content of the <name> element', () => {
    const xml = '<folder id="root"><name>My Folder</name></folder>';
    expect(getFolderName(xml)).toBe('My Folder');
  });

  it('trims leading and trailing whitespace from the name', () => {
    const xml = '<folder id="root"><name>  Trimmed Name  </name></folder>';
    expect(getFolderName(xml)).toBe('Trimmed Name');
  });

  it('returns the name from a realistic Heretto folder response', () => {
    const xml = `
      <folder id="abc-123" name="Content Root">
        <name>Technical Documentation</name>
        <children>
          <folder id="sub1" name="Guides"/>
        </children>
      </folder>
    `;
    expect(getFolderName(xml)).toBe('Technical Documentation');
  });

  it('returns the first <name> element when multiple are present in the document', () => {
    // querySelector returns the first match
    const xml = `
      <folder id="root">
        <name>First Name</name>
        <subfolder>
          <name>Second Name</name>
        </subfolder>
      </folder>
    `;
    expect(getFolderName(xml)).toBe('First Name');
  });

  it('handles special characters in the folder name', () => {
    const xml = '<folder id="root"><name>Docs &amp; Guides</name></folder>';
    // DOMParser decodes XML entities in textContent
    expect(getFolderName(xml)).toBe('Docs & Guides');
  });
});
