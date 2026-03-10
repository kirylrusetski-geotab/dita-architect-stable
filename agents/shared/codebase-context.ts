import fs from 'node:fs';
import path from 'node:path';

const SOURCE_DIRS = ['types', 'constants', 'hooks', 'lib', 'sync', 'components'];
const ROOT_SOURCE_FILES = [
  'App.tsx',
  'dita-architect.tsx',
  'index.tsx',
  'textAnalysis.ts',
];

export function generateCodebaseContext(projectRoot: string): string {
  const sections: string[] = [];

  sections.push('# DITA Architect - Codebase Context');
  sections.push('');
  sections.push('A browser-based DITA XML authoring tool with a Lexical WYSIWYG editor, Monaco XML code editor, bidirectional sync, and Heretto CMS integration.');
  sections.push('');

  // List root source files
  sections.push('## Root Source Files');
  for (const file of ROOT_SOURCE_FILES) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      sections.push(`- \`${file}\``);
    }
  }
  sections.push('');

  // List files in each source directory
  for (const dir of SOURCE_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) continue;

    sections.push(`## ${dir}/`);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    for (const file of files) {
      sections.push(`- \`${dir}/${file}\``);
    }
    sections.push('');
  }

  // List test files
  const testsDir = path.join(projectRoot, 'tests');
  if (fs.existsSync(testsDir)) {
    sections.push('## tests/');
    const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
    for (const file of testFiles) {
      sections.push(`- \`tests/${file}\``);
    }
    sections.push('');
  }

  // Include key architectural file contents
  const keyFiles = [
    'types/tab.ts',
    'types/heretto.ts',
    'constants/dita.ts',
    'constants/heretto.ts',
    'lib/xml-utils.ts',
  ];

  sections.push('## Key File Contents');
  sections.push('');

  for (const relPath of keyFiles) {
    const filePath = path.join(projectRoot, relPath);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    // Include first 100 lines to keep context manageable
    const lines = content.split('\n').slice(0, 100);
    sections.push(`### ${relPath}`);
    sections.push('```typescript');
    sections.push(lines.join('\n'));
    if (content.split('\n').length > 100) {
      sections.push('// ... (truncated)');
    }
    sections.push('```');
    sections.push('');
  }

  return sections.join('\n');
}
