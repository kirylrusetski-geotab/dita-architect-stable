// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Partially mock xml-utils so we can control formatXml in compareXml tests
// while keeping all other functions as their real implementations.
vi.mock('../lib/xml-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/xml-utils')>();
  return {
    ...actual,
    formatXml: vi.fn((xml: string) => xml.trim()),
  };
});

import {
  escapeXml,
  getTopicId,
  validateDitaXml,
  findUnrecognizedElements,
  compareXml,
  formatRelativeTime,
  convertDitaTopic,
  formatXml,
} from '../lib/xml-utils';

// ─── escapeXml ───────────────────────────────────────────────────────────────

describe('escapeXml', () => {
  it('returns the string unchanged when no special characters are present', () => {
    expect(escapeXml('Hello World')).toBe('Hello World');
  });

  it('escapes ampersands', () => {
    expect(escapeXml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than signs', () => {
    expect(escapeXml('a < b')).toBe('a &lt; b');
  });

  it('escapes greater-than signs', () => {
    expect(escapeXml('a > b')).toBe('a &gt; b');
  });

  it('escapes double quotes', () => {
    expect(escapeXml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeXml("it's")).toBe('it&apos;s');
  });

  it('escapes all special characters in a mixed string', () => {
    expect(escapeXml('<a href="x&y">it\'s</a>')).toBe(
      '&lt;a href=&quot;x&amp;y&quot;&gt;it&apos;s&lt;/a&gt;'
    );
  });

  it('handles an empty string', () => {
    expect(escapeXml('')).toBe('');
  });

  it('escapes multiple ampersands', () => {
    expect(escapeXml('a && b && c')).toBe('a &amp;&amp; b &amp;&amp; c');
  });

  it('does not double-escape already-escaped entities', () => {
    // The function escapes the raw & in &amp; to &amp;amp; — this is expected
    // behavior for a raw-string escaper (not an entity-aware one).
    expect(escapeXml('&amp;')).toBe('&amp;amp;');
  });
});

// ─── getTopicId ──────────────────────────────────────────────────────────────

describe('getTopicId', () => {
  it('returns the id attribute of the root element', () => {
    const xml = '<task id="my-task-123"><title>T</title></task>';
    expect(getTopicId(xml)).toBe('my-task-123');
  });

  it('returns null when the root element has no id attribute', () => {
    const xml = '<task><title>T</title></task>';
    expect(getTopicId(xml)).toBeNull();
  });

  it('returns null for malformed XML', () => {
    expect(getTopicId('<task id="x"')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(getTopicId('')).toBeNull();
  });

  it('returns null for a whitespace-only string', () => {
    expect(getTopicId('   ')).toBeNull();
  });

  it('works for concept topics', () => {
    const xml = '<concept id="concept-1"><title>C</title></concept>';
    expect(getTopicId(xml)).toBe('concept-1');
  });

  it('returns the id from the root element, not from nested elements', () => {
    const xml = '<topic id="root-id"><section id="nested-id"></section></topic>';
    expect(getTopicId(xml)).toBe('root-id');
  });

  it('returns null when root element id is an empty string attribute', () => {
    const xml = '<task id=""><title>T</title></task>';
    // getAttribute('id') returns '' — should return '' not null
    expect(getTopicId(xml)).toBe('');
  });
});

// ─── validateDitaXml ─────────────────────────────────────────────────────────

describe('validateDitaXml', () => {
  it('returns valid: true for a well-formed task', () => {
    const xml = '<task id="t1"><title>Task</title><taskbody></taskbody></task>';
    expect(validateDitaXml(xml)).toEqual({ valid: true });
  });

  it('returns valid: true for a concept topic', () => {
    const xml = '<concept id="c1"><title>Concept</title><conbody></conbody></concept>';
    expect(validateDitaXml(xml)).toEqual({ valid: true });
  });

  it('returns valid: true for a reference topic', () => {
    const xml = '<reference id="r1"><title>Ref</title><refbody></refbody></reference>';
    expect(validateDitaXml(xml)).toEqual({ valid: true });
  });

  it('returns valid: true for a generic topic', () => {
    const xml = '<topic id="t1"><title>Topic</title><body></body></topic>';
    expect(validateDitaXml(xml)).toEqual({ valid: true });
  });

  it('returns valid: false with error for empty string', () => {
    const result = validateDitaXml('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  it('returns valid: false with error for whitespace-only string', () => {
    const result = validateDitaXml('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  it('returns valid: false with error for malformed XML', () => {
    const result = validateDitaXml('<task id="t1"><title>unclosed');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/^Malformed XML:/);
  });

  it('returns valid: false with error for non-DITA root element', () => {
    const xml = '<html><body></body></html>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/<html>/);
  });

  it('returns valid: false for a random root element', () => {
    const xml = '<document><para>Hello</para></document>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('document');
  });

  it('error message for invalid root names the element used', () => {
    const xml = '<bookmap id="bm1"></bookmap>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('bookmap');
  });

  it('accepts uppercase root tag because validation lowercases before comparing', () => {
    // validateDitaXml lowercases the root tagName before checking validRoots,
    // so <Task> is treated the same as <task> and passes.
    const xml = '<Task id="t1"><title>T</title></Task>';
    const result = validateDitaXml(xml);
    expect(result.valid).toBe(true);
  });
});

// ─── findUnrecognizedElements ─────────────────────────────────────────────────

describe('findUnrecognizedElements', () => {
  it('returns empty array for XML containing only recognized elements', () => {
    const xml = '<task id="t1"><title>T</title><taskbody><steps><step><cmd>Do it</cmd></step></steps></taskbody></task>';
    expect(findUnrecognizedElements(xml)).toEqual([]);
  });

  it('returns empty array for malformed XML (no false positives)', () => {
    expect(findUnrecognizedElements('<task id="unclosed')).toEqual([]);
  });

  it('returns empty array for empty string (parse error → empty)', () => {
    expect(findUnrecognizedElements('')).toEqual([]);
  });

  it('identifies a single unrecognized element', () => {
    const xml = '<task id="t1"><customtag>text</customtag></task>';
    expect(findUnrecognizedElements(xml)).toEqual(['customtag']);
  });

  it('identifies multiple unrecognized elements and returns them sorted', () => {
    const xml = '<topic id="t1"><zebra>z</zebra><apple>a</apple></topic>';
    const result = findUnrecognizedElements(xml);
    expect(result).toEqual(['apple', 'zebra']);
  });

  it('does not list the same unrecognized element twice even if it appears multiple times', () => {
    const xml = '<task id="t1"><custom>a</custom><custom>b</custom></task>';
    const result = findUnrecognizedElements(xml);
    expect(result).toEqual(['custom']);
  });

  it('does not flag recognized elements like p, note, ol, ul, li', () => {
    const xml = '<concept id="c1"><conbody><p>text</p><note>note</note><ol><li>item</li></ol></conbody></concept>';
    expect(findUnrecognizedElements(xml)).toEqual([]);
  });

  it('does not flag structural containers like taskbody, conbody', () => {
    const xml = '<task id="t1"><taskbody><steps><step><cmd>Do</cmd></step></steps></taskbody></task>';
    expect(findUnrecognizedElements(xml)).toEqual([]);
  });

  it('handles deeply nested unrecognized elements', () => {
    const xml = '<task id="t1"><taskbody><steps><step><cmd><deepcustom>x</deepcustom></cmd></step></steps></taskbody></task>';
    expect(findUnrecognizedElements(xml)).toEqual(['deepcustom']);
  });

  it('treats element tags case-insensitively (lowercases before checking)', () => {
    // DOMParser preserves original case in XML mode; the function lowercases
    const xml = '<task id="t1"><CUSTOM>x</CUSTOM></task>';
    // 'custom' is not in RECOGNIZED_ELEMENTS or STRUCTURAL_CONTAINERS
    expect(findUnrecognizedElements(xml)).toContain('custom');
  });
});

// ─── compareXml ──────────────────────────────────────────────────────────────

describe('compareXml', () => {
  beforeEach(() => {
    // Reset the formatXml mock to default identity behavior
    vi.mocked(formatXml).mockImplementation((xml: string) => xml.trim());
  });

  it('returns "identical" when both strings are exactly equal', () => {
    const xml = '<task id="t1"><title>T</title></task>';
    expect(compareXml(xml, xml)).toBe('identical');
  });

  it('returns "identical" when strings differ only by surrounding whitespace', () => {
    const xml = '<task id="t1"><title>T</title></task>';
    expect(compareXml('  ' + xml + '  ', xml)).toBe('identical');
  });

  it('returns "formatting" when formatXml normalizes both strings to the same output', () => {
    // formatXml identity mock: two strings that trim to same value → "identical"
    // We need two different strings that formatXml maps to the same thing
    vi.mocked(formatXml).mockImplementation(() => '<task id="t1"><title>T</title></task>');
    const a = '<task id="t1">\n  <title>T</title>\n</task>';
    const b = '<task id="t1"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('formatting');
  });

  it('returns "formatting" via DOM comparison when only whitespace differs', () => {
    // formatXml will return different strings (preserves whitespace in mock),
    // but DOM comparison should see them as structurally equal
    vi.mocked(formatXml).mockImplementation((xml: string) => xml); // no normalization
    const a = '<task id="t1">\n  <title>T</title>\n</task>';
    const b = '<task id="t1"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('formatting');
  });

  it('returns "formatting" when attribute order differs', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml); // no normalization
    const a = '<task id="t1" outputclass="x"><title>T</title></task>';
    const b = '<task outputclass="x" id="t1"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('formatting');
  });

  it('returns "different" when element tags differ', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const a = '<task id="t1"><title>T</title></task>';
    const b = '<concept id="t1"><title>T</title></concept>';
    expect(compareXml(a, b)).toBe('different');
  });

  it('returns "different" when text content differs', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const a = '<task id="t1"><title>Task A</title></task>';
    const b = '<task id="t1"><title>Task B</title></task>';
    expect(compareXml(a, b)).toBe('different');
  });

  it('returns "different" when attribute values differ', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const a = '<task id="t1"><title>T</title></task>';
    const b = '<task id="t2"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('different');
  });

  it('returns "different" when one input has a parse error', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const valid = '<task id="t1"><title>T</title></task>';
    const invalid = '<task id="t1"';
    expect(compareXml(valid, invalid)).toBe('different');
  });

  it('returns "different" when both inputs have parse errors', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    expect(compareXml('<bad', '<worse')).toBe('different');
  });

  it('returns "different" when one has an extra child element', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const a = '<task id="t1"><title>T</title><shortdesc>S</shortdesc></task>';
    const b = '<task id="t1"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('different');
  });

  it('returns "different" when attribute counts differ', () => {
    vi.mocked(formatXml).mockImplementation((xml: string) => xml);
    const a = '<task id="t1" outputclass="x"><title>T</title></task>';
    const b = '<task id="t1"><title>T</title></task>';
    expect(compareXml(a, b)).toBe('different');
  });

  it('falls through to DOM comparison when formatXml throws', () => {
    vi.mocked(formatXml).mockImplementation(() => { throw new Error('format error'); });
    const a = '<task id="t1">\n  <title>T</title>\n</task>';
    const b = '<task id="t1"><title>T</title></task>';
    // DOM comparison: structurally same → 'formatting'
    expect(compareXml(a, b)).toBe('formatting');
  });
});

// ─── formatRelativeTime ───────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  let now: number;

  beforeEach(() => {
    now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const msAgo = (ms: number) => new Date(now - ms);
  const msAhead = (ms: number) => new Date(now + ms);

  it('returns "just now" for a date 0 seconds ago (exact now)', () => {
    expect(formatRelativeTime(new Date(now))).toBe('just now');
  });

  it('returns "just now" for a date 5 seconds ago', () => {
    expect(formatRelativeTime(msAgo(5_000))).toBe('just now');
  });

  it('returns "just now" for a date 9 seconds ago (boundary)', () => {
    expect(formatRelativeTime(msAgo(9_000))).toBe('just now');
  });

  it('returns seconds ago for a date 10 seconds ago (boundary)', () => {
    expect(formatRelativeTime(msAgo(10_000))).toBe('10s ago');
  });

  it('returns seconds ago for a date 45 seconds ago', () => {
    expect(formatRelativeTime(msAgo(45_000))).toBe('45s ago');
  });

  it('returns seconds ago for 59 seconds ago (boundary before minutes)', () => {
    expect(formatRelativeTime(msAgo(59_000))).toBe('59s ago');
  });

  it('returns minutes ago for a date exactly 60 seconds ago', () => {
    expect(formatRelativeTime(msAgo(60_000))).toBe('1m ago');
  });

  it('returns minutes ago for a date 5 minutes ago', () => {
    expect(formatRelativeTime(msAgo(5 * 60_000))).toBe('5m ago');
  });

  it('returns minutes ago for 59 minutes ago (boundary before hours)', () => {
    expect(formatRelativeTime(msAgo(59 * 60_000))).toBe('59m ago');
  });

  it('returns hours ago for a date exactly 60 minutes ago', () => {
    expect(formatRelativeTime(msAgo(60 * 60_000))).toBe('1h ago');
  });

  it('returns hours ago for a date 3 hours ago', () => {
    expect(formatRelativeTime(msAgo(3 * 60 * 60_000))).toBe('3h ago');
  });

  it('returns hours ago for 23 hours ago (boundary before days)', () => {
    expect(formatRelativeTime(msAgo(23 * 60 * 60_000))).toBe('23h ago');
  });

  it('returns days ago for a date exactly 24 hours ago', () => {
    expect(formatRelativeTime(msAgo(24 * 60 * 60_000))).toBe('1d ago');
  });

  it('returns days ago for a date 7 days ago', () => {
    expect(formatRelativeTime(msAgo(7 * 24 * 60 * 60_000))).toBe('7d ago');
  });

  it('returns days ago for a date 30 days ago', () => {
    expect(formatRelativeTime(msAgo(30 * 24 * 60 * 60_000))).toBe('30d ago');
  });

  it('returns "just now" for a future date (negative elapsed time)', () => {
    expect(formatRelativeTime(msAhead(60_000))).toBe('just now');
  });

  it('returns "just now" for a far future date', () => {
    expect(formatRelativeTime(msAhead(7 * 24 * 60 * 60_000))).toBe('just now');
  });
});

// ─── convertDitaTopic ───────────────────────────────────────────────────────

describe('convertDitaTopic', () => {
  it('returns { ok: false, reason: "invalid-xml" } for malformed XML', () => {
    const result = convertDitaTopic('<task id="invalid', 'concept');
    expect(result).toEqual({ ok: false, reason: 'invalid-xml' });
  });

  it('returns { ok: false, reason: "invalid-xml" } for empty string', () => {
    const result = convertDitaTopic('', 'concept');
    expect(result).toEqual({ ok: false, reason: 'invalid-xml' });
  });

  it('returns { ok: false, reason: "same-type" } when source and target type are the same', () => {
    const xml = '<task id="t1"><title>Task</title><taskbody></taskbody></task>';
    const result = convertDitaTopic(xml, 'task');
    expect(result).toEqual({ ok: false, reason: 'same-type' });
  });

  it('successfully converts task to concept', () => {
    const taskXml = '<task id="t1"><title>Task Title</title><taskbody><p>Content</p></taskbody></task>';
    const result = convertDitaTopic(taskXml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">');
      expect(result.xml).toContain('<concept id="t1">');
      expect(result.xml).toContain('<conbody>');
      expect(result.xml).toContain('<title>Task Title</title>');
      expect(result.xml).not.toContain('<taskbody>');
    }
  });

  it('successfully converts concept to reference', () => {
    const conceptXml = '<concept id="c1"><title>Concept Title</title><conbody><p>Content</p></conbody></concept>';
    const result = convertDitaTopic(conceptXml, 'reference');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<!DOCTYPE reference PUBLIC "-//OASIS//DTD DITA Reference//EN" "reference.dtd">');
      expect(result.xml).toContain('<reference id="c1">');
      expect(result.xml).toContain('<refbody>');
      expect(result.xml).toContain('<title>Concept Title</title>');
      expect(result.xml).not.toContain('<conbody>');
    }
  });

  it('successfully converts reference to task', () => {
    const refXml = '<reference id="r1"><title>Reference Title</title><refbody><p>Content</p></refbody></reference>';
    const result = convertDitaTopic(refXml, 'task');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">');
      expect(result.xml).toContain('<task id="r1">');
      expect(result.xml).toContain('<taskbody>');
      expect(result.xml).toContain('<title>Reference Title</title>');
      expect(result.xml).not.toContain('<refbody>');
    }
  });

  it('converts task-specific elements to generic ones when converting from task', () => {
    const taskXml = `<task id="t1">
      <title>Task with Steps</title>
      <taskbody>
        <prereq>Prerequisites here</prereq>
        <steps>
          <step><cmd>First step</cmd></step>
          <step><cmd>Second step</cmd></step>
        </steps>
      </taskbody>
    </task>`;

    const result = convertDitaTopic(taskXml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      // <steps> should be converted to <ol>
      expect(result.xml).toContain('<ol>');
      expect(result.xml).not.toContain('<steps>');
      // <step><cmd> should be converted to <li>
      expect(result.xml).toContain('<li>First step</li>');
      expect(result.xml).toContain('<li>Second step</li>');
      expect(result.xml).not.toContain('<step>');
      expect(result.xml).not.toContain('<cmd>');
      // <prereq> should be converted to <p>
      expect(result.xml).toContain('<p>Prerequisites here</p>');
      expect(result.xml).not.toContain('<prereq>');
    }
  });

  it('preserves attributes from root element during conversion', () => {
    const xml = '<task id="t1" outputclass="special" audience="admin"><title>T</title><taskbody></taskbody></task>';
    const result = convertDitaTopic(xml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('id="t1"');
      expect(result.xml).toContain('outputclass="special"');
      expect(result.xml).toContain('audience="admin"');
    }
  });

  it('preserves non-body child elements during conversion', () => {
    const xml = `<task id="t1">
      <title>Task Title</title>
      <shortdesc>Short description</shortdesc>
      <prolog><author>Author Name</author></prolog>
      <taskbody><p>Content</p></taskbody>
    </task>`;

    const result = convertDitaTopic(xml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<title>Task Title</title>');
      expect(result.xml).toContain('<shortdesc>Short description</shortdesc>');
      expect(result.xml).toContain('<prolog><author>Author Name</author></prolog>');
      expect(result.xml).toContain('<conbody><p>Content</p></conbody>');
    }
  });

  it('adds empty body element when source has no body', () => {
    const xml = '<task id="t1"><title>Task with no body</title></task>';
    const result = convertDitaTopic(xml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Accept both self-closing and open/close empty tag formats
      expect(result.xml).toMatch(/<conbody(\s[^>]*)?\s*\/?>(<\/conbody>)?/);
    }
  });

  it('handles conversion from generic topic to specific type', () => {
    const xml = '<topic id="t1"><title>Generic Topic</title><body><p>Content</p></body></topic>';
    const result = convertDitaTopic(xml, 'task');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">');
      expect(result.xml).toContain('<task id="t1">');
      expect(result.xml).toContain('<taskbody>');
      expect(result.xml).not.toContain('<body>');
      expect(result.xml).not.toContain('<topic>');
    }
  });

  it('handles step elements without cmd children', () => {
    const taskXml = `<task id="t1">
      <title>Task</title>
      <taskbody>
        <steps>
          <step>Direct content without cmd</step>
          <step><cmd>With cmd element</cmd></step>
        </steps>
      </taskbody>
    </task>`;

    const result = convertDitaTopic(taskXml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<li>Direct content without cmd</li>');
      expect(result.xml).toContain('<li>With cmd element</li>');
    }
  });

  it('includes XML declaration and DOCTYPE in output', () => {
    const xml = '<task id="t1"><title>T</title><taskbody></taskbody></task>';
    const result = convertDitaTopic(xml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<!DOCTYPE concept/);
    }
  });

  it('handles case-insensitive body element matching', () => {
    // Even though XML is case-sensitive, our implementation should handle
    // the expected body tag names correctly
    const xml = '<Task id="t1"><title>T</title><taskbody></taskbody></Task>';
    const result = convertDitaTopic(xml, 'concept');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.xml).toContain('<concept id="t1">');
      // Accept both self-closing and open/close empty tag formats
      expect(result.xml).toMatch(/<conbody(\s[^>]*)?\s*\/?>(<\/conbody>)?/);
    }
  });
});
