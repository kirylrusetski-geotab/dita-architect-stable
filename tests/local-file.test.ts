// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Inline the pure logic extracted from useLocalFile.ts so that tests do not
// pull in Monaco / React component chains.  When the real module changes, the
// tests should be updated to match.
// ---------------------------------------------------------------------------

/** Mirror of the extension-check in the drag-and-drop handleDrop handler */
function isAcceptedFileExtension(filename: string): boolean {
  return filename.endsWith('.dita') || filename.endsWith('.xml');
}

/** Mirror of the save-filename logic in handleSaveConfirm */
function buildFinalName(raw: string): string {
  const name = raw.trim() || 'topic.dita';
  return name.endsWith('.dita') || name.endsWith('.xml') ? name : `${name}.dita`;
}

// ---------------------------------------------------------------------------
// Mock out the heavy dependencies so we can import validateDitaXml / getTopicId
// ---------------------------------------------------------------------------
vi.mock('../constants/heretto', () => ({
  RECOGNIZED_ELEMENTS: new Set(['title', 'p', 'b']),
  STRUCTURAL_CONTAINERS: new Set(['topic', 'concept', 'task', 'reference']),
  HERETTO_ROOT_UUID: 'mock-uuid',
  herettoFolderCache: new Map(),
}));

vi.mock('../components/MonacoDitaEditor', () => ({
  formatXml: (xml: string) => xml,
  XmlError: {},
}));

// Now we can safely import the pure utility functions
import { validateDitaXml, getTopicId } from '../lib/xml-utils';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('isAcceptedFileExtension — drag-and-drop file filter', () => {
  it('accepts .dita files', () => {
    expect(isAcceptedFileExtension('my-topic.dita')).toBe(true);
  });

  it('accepts .xml files', () => {
    expect(isAcceptedFileExtension('config.xml')).toBe(true);
  });

  it('rejects .pdf files', () => {
    expect(isAcceptedFileExtension('document.pdf')).toBe(false);
  });

  it('rejects .txt files', () => {
    expect(isAcceptedFileExtension('readme.txt')).toBe(false);
  });

  it('rejects files with no extension', () => {
    expect(isAcceptedFileExtension('ditafile')).toBe(false);
  });

  it('rejects .DITA (case-sensitive — endsWith is case-sensitive)', () => {
    // The hook uses endsWith which is case-sensitive; document this behaviour
    expect(isAcceptedFileExtension('topic.DITA')).toBe(false);
  });

  it('rejects files whose name merely contains .dita in the middle', () => {
    expect(isAcceptedFileExtension('my.dita.bak')).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('buildFinalName — save filename logic', () => {
  it('passes through a name that already ends with .dita', () => {
    expect(buildFinalName('my-topic.dita')).toBe('my-topic.dita');
  });

  it('passes through a name that already ends with .xml', () => {
    expect(buildFinalName('my-topic.xml')).toBe('my-topic.xml');
  });

  it('appends .dita when name has no recognised extension', () => {
    expect(buildFinalName('my-topic')).toBe('my-topic.dita');
  });

  it('appends .dita when name ends with another extension like .txt', () => {
    expect(buildFinalName('my-topic.txt')).toBe('my-topic.txt.dita');
  });

  it('falls back to topic.dita for an empty string', () => {
    expect(buildFinalName('')).toBe('topic.dita');
  });

  it('falls back to topic.dita for a whitespace-only string', () => {
    expect(buildFinalName('   ')).toBe('topic.dita');
  });

  it('trims surrounding whitespace before deciding', () => {
    expect(buildFinalName('  my-topic  ')).toBe('my-topic.dita');
  });

  it('trims and keeps .dita extension when present', () => {
    expect(buildFinalName('  my-topic.dita  ')).toBe('my-topic.dita');
  });
});

// ---------------------------------------------------------------------------

describe('validateDitaXml — file validation', () => {
  it('rejects empty content', () => {
    const result = validateDitaXml('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  it('rejects whitespace-only content', () => {
    const result = validateDitaXml('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  it('rejects malformed XML', () => {
    const result = validateDitaXml('<task><unclosed>');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Malformed XML/);
  });

  it('rejects XML with an invalid DITA root element', () => {
    const result = validateDitaXml('<html><body></body></html>');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not a valid DITA topic type/);
  });

  it('rejects XML with an unknown root even if well-formed', () => {
    const result = validateDitaXml('<bookmap></bookmap>');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/bookmap/);
  });

  it('accepts a valid <topic> root element', () => {
    const xml = '<topic id="t1"><title>Hello</title></topic>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts a valid <task> root element', () => {
    const xml = '<task id="t1"><title>Do something</title></task>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid <concept> root element', () => {
    const xml = '<concept id="c1"><title>About</title></concept>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(true);
  });

  it('accepts a valid <reference> root element', () => {
    const xml = '<reference id="r1"><title>Ref</title></reference>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe('getTopicId — extracts id attribute from XML root', () => {
  it('returns the id attribute from a valid DITA topic', () => {
    const xml = '<topic id="my-topic-id"><title>Hello</title></topic>';
    expect(getTopicId(xml)).toBe('my-topic-id');
  });

  it('returns null when the root has no id attribute', () => {
    const xml = '<topic><title>Hello</title></topic>';
    expect(getTopicId(xml)).toBeNull();
  });

  it('returns null for malformed XML', () => {
    const xml = '<topic id="x"><unclosed>';
    expect(getTopicId(xml)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getTopicId('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(getTopicId('   ')).toBeNull();
  });
});
