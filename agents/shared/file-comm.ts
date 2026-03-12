import fs from 'node:fs';
import path from 'node:path';
import type { PipelineHealthReport } from './types.ts';

const REPORTS_DIR = path.resolve(import.meta.dirname, '..', '.reports');
const CHECKPOINT_FILE = path.join(REPORTS_DIR, 'pipeline-state.json');
const PIPELINE_HEALTH_FILE = path.join(REPORTS_DIR, 'pipeline-health.json');
const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');
const PROJECT_LOG_FILE = path.join(PROJECT_ROOT, 'PROJECT_LOG.md');

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

export interface PipelineCheckpoint {
  userRequest: string;
  completedStep: number;
  retries: { reviewRetry: boolean; devopsRetry: boolean; testRetry: boolean };
  timestamp: string;
}

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

export function saveCheckpoint(checkpoint: PipelineCheckpoint): void {
  ensureReportsDir();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
}

export function loadCheckpoint(userRequest: string): PipelineCheckpoint | null {
  if (!fs.existsSync(CHECKPOINT_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8')) as PipelineCheckpoint;
    if (data.userRequest === userRequest) return data;
    return null;
  } catch {
    return null;
  }
}

export function clearCheckpoint(): void {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }
}

export function cleanReports(): void {
  if (fs.existsSync(REPORTS_DIR)) {
    fs.rmSync(REPORTS_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export function readProjectLog(): string {
  if (!fs.existsSync(PROJECT_LOG_FILE)) return '';
  return fs.readFileSync(PROJECT_LOG_FILE, 'utf-8');
}

export function appendProjectLog(entry: string): void {
  const timestamp = new Date().toISOString();
  const header = `\n---\n\n### ${timestamp}\n\n`;
  fs.appendFileSync(PROJECT_LOG_FILE, header + entry + '\n', 'utf-8');
}

export function writePipelineHealth(health: PipelineHealthReport): void {
  ensureReportsDir();
  fs.writeFileSync(PIPELINE_HEALTH_FILE, JSON.stringify(health, null, 2), 'utf-8');
}

export function readPipelineHealth(): PipelineHealthReport | null {
  if (!fs.existsSync(PIPELINE_HEALTH_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(PIPELINE_HEALTH_FILE, 'utf-8')) as PipelineHealthReport;
  } catch {
    return null;
  }
}
