import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = path.resolve(import.meta.dirname, '..', '.reports');

export const REPORT_FILES = {
  kickoff: 'kickoff.md',
  plan: 'plan.md',
  implementation: 'implementation.md',
  review: 'review.md',
  uxReview: 'ux-review.md',
  devops: 'devops.md',
  testResults: 'test-results.md',
  wrapup: 'wrapup.md',
} as const;

function ensureReportsDir(): void {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export function writeReport(name: string, content: string): void {
  ensureReportsDir();
  fs.writeFileSync(path.join(REPORTS_DIR, name), content, 'utf-8');
}

export function readReport(name: string): string {
  const filePath = path.join(REPORTS_DIR, name);
  if (!fs.existsSync(filePath)) {
    return '';
  }
  return fs.readFileSync(filePath, 'utf-8');
}

export function cleanReports(): void {
  if (fs.existsSync(REPORTS_DIR)) {
    fs.rmSync(REPORTS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}
