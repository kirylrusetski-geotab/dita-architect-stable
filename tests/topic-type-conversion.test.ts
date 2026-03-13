import { convertDitaTopic, validateDitaXml } from '../lib/xml-utils';

describe('Topic Type Conversion', () => {
  const conceptXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">
<concept id="test-concept">
  <title>Test Concept</title>
  <conbody>
    <p>This is a concept topic with some content.</p>
    <ul>
      <li>First item</li>
      <li>Second item</li>
    </ul>
  </conbody>
</concept>`;

  const taskXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE task PUBLIC "-//OASIS//DTD DITA Task//EN" "task.dtd">
<task id="test-task">
  <title>Test Task</title>
  <taskbody>
    <steps>
      <step>
        <cmd>First step</cmd>
      </step>
      <step>
        <cmd>Second step</cmd>
      </step>
    </steps>
  </taskbody>
</task>`;

  const referenceXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE reference PUBLIC "-//OASIS//DTD DITA Reference//EN" "reference.dtd">
<reference id="test-reference">
  <title>Test Reference</title>
  <refbody>
    <section>
      <title>Reference Section</title>
      <p>Reference content here.</p>
    </section>
  </refbody>
</reference>`;

  describe('concept to task conversion', () => {
    it('should convert concept to task with required steps element', () => {
      const result = convertDitaTopic(conceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<task id="test-concept">');
        expect(result.xml).toContain('<taskbody>');
        expect(result.xml).toContain('<steps>');
        expect(result.xml).toContain('<step>');
        expect(result.xml).toContain('<cmd>');
        expect(result.xml).toContain('<!DOCTYPE task PUBLIC');
      }
    });

    it('should preserve all content when converting concept to task', () => {
      const result = convertDitaTopic(conceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('Test Concept');
        expect(result.xml).toContain('This is a concept topic with some content.');
        expect(result.xml).toContain('<ul>');
        expect(result.xml).toContain('<li>First item</li>');
        expect(result.xml).toContain('<li>Second item</li>');
      }
    });

    it('should create valid DITA XML when converting concept to task', () => {
      const result = convertDitaTopic(conceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const validation = validateDitaXml(result.xml);
        expect(validation.valid).toBe(true);
      }
    });
  });

  describe('reference to task conversion', () => {
    it('should convert reference to task with required steps element', () => {
      const result = convertDitaTopic(referenceXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<task id="test-reference">');
        expect(result.xml).toContain('<taskbody>');
        expect(result.xml).toContain('<steps>');
        expect(result.xml).toContain('<step>');
        expect(result.xml).toContain('<cmd>');
        expect(result.xml).toContain('<!DOCTYPE task PUBLIC');
      }
    });

    it('should preserve reference content when converting to task', () => {
      const result = convertDitaTopic(referenceXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('Test Reference');
        expect(result.xml).toContain('Reference Section');
        expect(result.xml).toContain('Reference content here.');
      }
    });
  });

  describe('task to concept conversion', () => {
    it('should convert task to concept and convert task elements to generic equivalents', () => {
      const result = convertDitaTopic(taskXml, 'concept');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<concept id="test-task">');
        expect(result.xml).toContain('<conbody>');
        expect(result.xml).toContain('<ol>');
        expect(result.xml).toContain('<li>First step</li>');
        expect(result.xml).toContain('<li>Second step</li>');
        expect(result.xml).toContain('<!DOCTYPE concept PUBLIC');
        expect(result.xml).not.toContain('<steps>');
        expect(result.xml).not.toContain('<step>');
        expect(result.xml).not.toContain('<cmd>');
      }
    });
  });

  describe('task to reference conversion', () => {
    it('should convert task to reference and convert task elements to generic equivalents', () => {
      const result = convertDitaTopic(taskXml, 'reference');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<reference id="test-task">');
        expect(result.xml).toContain('<refbody>');
        expect(result.xml).toContain('<ol>');
        expect(result.xml).toContain('<li>First step</li>');
        expect(result.xml).toContain('<li>Second step</li>');
        expect(result.xml).toContain('<!DOCTYPE reference PUBLIC');
        expect(result.xml).not.toContain('<steps>');
        expect(result.xml).not.toContain('<step>');
        expect(result.xml).not.toContain('<cmd>');
      }
    });
  });

  describe('concept to reference conversion', () => {
    it('should convert concept to reference successfully', () => {
      const result = convertDitaTopic(conceptXml, 'reference');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<reference id="test-concept">');
        expect(result.xml).toContain('<refbody>');
        expect(result.xml).toContain('Test Concept');
        expect(result.xml).toContain('<!DOCTYPE reference PUBLIC');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty concept to task conversion', () => {
      const emptyConceptXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">
<concept id="empty-concept">
  <title>Empty Concept</title>
</concept>`;

      const result = convertDitaTopic(emptyConceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.xml).toContain('<task id="empty-concept">');
        expect(result.xml).toContain('<taskbody>');
        expect(result.xml).toContain('<steps>');
        expect(result.xml).toContain('<step>');
        expect(result.xml).toContain('<cmd>Add your task step here</cmd>');
      }
    });

    it('should reject same-type conversion', () => {
      const result = convertDitaTopic(conceptXml, 'concept');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('same-type');
      }
    });

    it('should reject invalid XML', () => {
      const invalidXml = '<unclosed>tag without proper structure';
      const result = convertDitaTopic(invalidXml, 'task');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('invalid-xml');
      }
    });

    it('should handle concept with existing body to task conversion', () => {
      const result = convertDitaTopic(conceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // Should add steps element even when body already exists
        expect(result.xml).toContain('<steps>');
        expect(result.xml).toContain('<cmd>Add your task step here</cmd>');
        // Should preserve existing content
        expect(result.xml).toContain('This is a concept topic with some content.');
      }
    });
  });

  describe('DTD compliance', () => {
    it('should produce valid DITA task XML that passes basic validation', () => {
      const result = convertDitaTopic(conceptXml, 'task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const validation = validateDitaXml(result.xml);
        expect(validation.valid).toBe(true);

        // Parse and verify task structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.xml, 'text/xml');
        const taskElement = doc.querySelector('task');
        const taskBody = doc.querySelector('taskbody');
        const stepsElement = doc.querySelector('steps');

        expect(taskElement).toBeTruthy();
        expect(taskBody).toBeTruthy();
        expect(stepsElement).toBeTruthy();
        expect(doc.querySelector('parsererror')).toBeFalsy();
      }
    });

    it('should produce valid DITA concept XML when converting from task', () => {
      const result = convertDitaTopic(taskXml, 'concept');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const validation = validateDitaXml(result.xml);
        expect(validation.valid).toBe(true);

        // Parse and verify concept structure
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.xml, 'text/xml');
        const conceptElement = doc.querySelector('concept');
        const conBody = doc.querySelector('conbody');

        expect(conceptElement).toBeTruthy();
        expect(conBody).toBeTruthy();
        expect(doc.querySelector('parsererror')).toBeFalsy();
      }
    });
  });
});