/**
 * XML and DITA Utility Functions
 *
 * This module provides a comprehensive collection of utility functions for working with
 * XML and DITA (Darwin Information Typing Architecture) content within the DITA Architect project.
 *
 * Main functionalities include:
 * - XML escaping and validation
 * - DITA topic ID extraction and validation
 * - Element recognition and validation against DITA standards
 * - Semantic XML comparison and formatting detection
 * - DITA topic type conversion (task, concept, reference)
 * - Time formatting utilities
 */
import { RECOGNIZED_ELEMENTS, STRUCTURAL_CONTAINERS } from '../constants/heretto';
import { formatXml } from '../components/MonacoDitaEditor';

export const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const getTopicId = (xml: string): string | null => {
  if (!xml || !xml.trim()) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) return null;
  const root = doc.documentElement;
  if (!root) return null;
  return root.getAttribute('id');
};

export const validateDitaXml = (content: string): { valid: boolean; error?: string } => {
  if (!content.trim()) return { valid: false, error: 'File is empty' };

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return { valid: false, error: 'Malformed XML: ' + (parseError.textContent || 'parse error') };
  }

  const root = doc.documentElement;
  const rootTag = root.tagName.toLowerCase();
  const validRoots = ['task', 'concept', 'reference', 'topic'];
  if (!validRoots.includes(rootTag)) {
    return { valid: false, error: `Root element <${rootTag}> is not a valid DITA topic type` };
  }

  return { valid: true };
};

export const findUnrecognizedElements = (xmlString: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  if (doc.querySelector('parsererror')) return [];

  const unrecognized = new Set<string>();
  const walk = (node: Element) => {
    const tag = node.tagName.toLowerCase();
    if (!RECOGNIZED_ELEMENTS.has(tag) && !STRUCTURAL_CONTAINERS.has(tag)) {
      unrecognized.add(tag);
    }
    for (const child of Array.from(node.children)) {
      walk(child);
    }
  };
  walk(doc.documentElement);
  return Array.from(unrecognized).sort();
};

/**
 * Compare two XML strings semantically, ignoring whitespace and attribute order.
 * Returns 'identical' if strings match, 'formatting' if only formatting differs,
 * or 'different' if the content is structurally different.
 */
export const compareXml = (a: string, b: string): 'identical' | 'formatting' | 'different' => {
  if (a.trim() === b.trim()) return 'identical';

  // Tier 1: normalize through formatXml
  try {
    if (formatXml(a) === formatXml(b)) return 'formatting';
  } catch { /* fall through to DOM comparison */ }

  // Tier 2: DOM structural comparison
  const parser = new DOMParser();
  const docA = parser.parseFromString(a, 'text/xml');
  const docB = parser.parseFromString(b, 'text/xml');
  if (docA.querySelector('parsererror') || docB.querySelector('parsererror')) return 'different';

  const nodesEqual = (na: Node, nb: Node): boolean => {
    if (na.nodeType !== nb.nodeType) return false;

    if (na.nodeType === Node.TEXT_NODE) {
      return (na.textContent || '').trim() === (nb.textContent || '').trim();
    }

    if (na.nodeType === Node.ELEMENT_NODE) {
      const ea = na as Element, eb = nb as Element;
      if (ea.tagName !== eb.tagName) return false;

      // Compare attributes (order-independent)
      if (ea.attributes.length !== eb.attributes.length) return false;
      for (let i = 0; i < ea.attributes.length; i++) {
        const attr = ea.attributes[i];
        if (eb.getAttribute(attr.name) !== attr.value) return false;
      }

      // Compare children (skip whitespace-only text nodes)
      const childrenA = Array.from(ea.childNodes).filter(n => !(n.nodeType === Node.TEXT_NODE && !(n.textContent || '').trim()));
      const childrenB = Array.from(eb.childNodes).filter(n => !(n.nodeType === Node.TEXT_NODE && !(n.textContent || '').trim()));
      if (childrenA.length !== childrenB.length) return false;
      return childrenA.every((child, i) => nodesEqual(child, childrenB[i]));
    }

    return true; // comments, processing instructions, etc.
  };

  return nodesEqual(docA.documentElement, docB.documentElement) ? 'formatting' : 'different';
};

export type DitaTopicType = 'task' | 'concept' | 'reference';

const BODY_TAG_MAP: Record<string, string> = {
  task: 'taskbody',
  concept: 'conbody',
  reference: 'refbody',
  topic: 'body',
};

const DOCTYPE_MAP: Record<DitaTopicType, string> = {
  task: '<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">',
  concept: '<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">',
  reference: '<!DOCTYPE reference PUBLIC "-//OASIS//DTD DITA Reference//EN" "reference.dtd">',
};

/**
 * Convert task-specific elements to generic block equivalents:
 *   <steps>/<step>/<cmd>  →  <ol>/<li>
 *   <prereq>              →  <p>
 */
function convertTaskElementsInPlace(parent: Element, doc: Document): void {
  const steps = Array.from(parent.querySelectorAll('steps'));
  for (const stepsEl of steps) {
    const ol = doc.createElement('ol');
    const stepChildren = Array.from(stepsEl.querySelectorAll('step'));
    for (const step of stepChildren) {
      const li = doc.createElement('li');
      const cmd = step.querySelector('cmd');
      if (cmd) {
        while (cmd.firstChild) li.appendChild(cmd.firstChild);
      } else {
        while (step.firstChild) li.appendChild(step.firstChild);
      }
      ol.appendChild(li);
    }
    stepsEl.parentNode?.replaceChild(ol, stepsEl);
  }

  const prereqs = Array.from(parent.querySelectorAll('prereq'));
  for (const prereq of prereqs) {
    const p = doc.createElement('p');
    while (prereq.firstChild) p.appendChild(prereq.firstChild);
    prereq.parentNode?.replaceChild(p, prereq);
  }
}

/**
 * Convert a DITA XML string from its current topic type to `targetType`.
 *
 * Returns `{ ok: true, xml: string }` on success, or `{ ok: false, reason: string }`
 * if the input is invalid or already the target type.
 */
export function convertDitaTopic(
  xmlContent: string,
  targetType: DitaTopicType,
): { ok: true; xml: string } | { ok: false; reason: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  const root = doc.documentElement;

  if (!root || root.tagName === 'html' || root.tagName === 'parsererror') {
    return { ok: false, reason: 'invalid-xml' };
  }

  const currentType = root.tagName.toLowerCase();
  if (currentType === targetType) {
    return { ok: false, reason: 'same-type' };
  }

  const newRoot = doc.createElement(targetType);
  Array.from(root.attributes).forEach(attr => {
    newRoot.setAttribute(attr.name, attr.value);
  });

  const oldBodyTag = BODY_TAG_MAP[currentType] ?? 'body';
  const newBodyTag = BODY_TAG_MAP[targetType];

  let bodyFound = false;
  while (root.firstChild) {
    const child = root.firstChild;
    if (
      child.nodeType === Node.ELEMENT_NODE &&
      (child as Element).tagName.toLowerCase() === oldBodyTag
    ) {
      bodyFound = true;
      const newBody = doc.createElement(newBodyTag);
      while (child.firstChild) {
        newBody.appendChild(child.firstChild);
      }
      if (currentType === 'task' && targetType !== 'task') {
        convertTaskElementsInPlace(newBody, doc);
      }
      newRoot.appendChild(newBody);
      root.removeChild(child);
    } else {
      newRoot.appendChild(child);
    }
  }

  // If the source had no body element, append an empty one so the converted
  // document remains structurally valid.
  if (!bodyFound) {
    newRoot.appendChild(doc.createElement(newBodyTag));
  }

  const serializer = new XMLSerializer();
  const newXml =
    `<?xml version="1.0" encoding="UTF-8"?>\n${DOCTYPE_MAP[targetType]}\n` +
    serializer.serializeToString(newRoot);

  return { ok: true, xml: newXml };
}

export const formatRelativeTime = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
