import path from 'node:path';
import { query, type SDKResultSuccess, type SDKResultError } from '@anthropic-ai/claude-agent-sdk';
import type { AgentDefinition, PipelineContext, PipelineResult } from './shared/types.ts';
import {
  writeReport, readReport, cleanReports, REPORT_FILES,
  saveCheckpoint, loadCheckpoint, clearCheckpoint,
  readProjectLog, appendProjectLog,
  type PipelineCheckpoint,
} from './shared/file-comm.ts';
import { generateCodebaseContext } from './shared/codebase-context.ts';
import { techLeadKickoff, techLeadWrapup } from './agents/tech-lead.ts';
import { architect } from './agents/architect.ts';
import { developer } from './agents/developer.ts';
import { codeReviewer } from './agents/code-reviewer.ts';
import { uxAdvisor } from './agents/ux-advisor.ts';
import { devopsEngineer } from './agents/devops.ts';
import { qaEngineer } from './agents/qa-engineer.ts';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');

function buildCleanEnv(): Record<string, string | undefined> {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  return env;
}

function log(msg: string): void {
  process.stderr.write(`[orchestrator] ${msg}\n`);
}

async function runAgent(agent: AgentDefinition, ctx: PipelineContext): Promise<string> {
  log(`Starting ${agent.name} (${agent.model})...`);

  const prompt = agent.buildPrompt(ctx);

  try {
    const run = query({
      prompt,
      options: {
        model: agent.model,
        allowedTools: agent.tools,
        permissionMode: agent.permissionMode,
        ...(agent.permissionMode === 'bypassPermissions' && {
          allowDangerouslySkipPermissions: true,
        }),
        cwd: ctx.projectRoot,
        maxTurns: agent.maxTurns,
        env: buildCleanEnv(),
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `You are ${agent.name}. Work within the DITA Architect project at ${ctx.projectRoot}. Stay in character.`,
        },
      },
    });

    let finalResult = '';

    for await (const msg of run) {
      if (msg.type === 'result') {
        if (msg.subtype === 'success') {
          const success = msg as SDKResultSuccess;
          finalResult = success.result;
          log(`${agent.name} completed (${success.num_turns} turns, $${success.total_cost_usd.toFixed(4)})`);
        } else {
          const error = msg as SDKResultError;
          log(`${agent.name} failed: ${error.errors.join('; ')}`);
          finalResult = `Agent ${agent.name} failed: ${error.errors.join('; ')}`;
        }
      }
    }

    writeReport(agent.reportFile, finalResult);
    return finalResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`${agent.name} threw an error: ${message}`);
    const fallback = `Agent ${agent.name} encountered an error: ${message}`;
    writeReport(agent.reportFile, fallback);
    return fallback;
  }
}

function hasBlockingIssues(reviewContent: string): boolean {
  const verdictMatch = reviewContent.match(/##\s*Verdict\s*\n+\s*(PASS|FAIL)/i);
  if (verdictMatch) {
    return verdictMatch[1]!.toUpperCase() === 'FAIL';
  }
  const blockingSection = reviewContent.match(/##\s*Blocking Issues\s*\n([\s\S]*?)(?=\n##|$)/i);
  if (blockingSection) {
    const content = blockingSection[1]!.trim();
    return content !== '' && content.toLowerCase() !== 'none';
  }
  return false;
}

function hasBuildFailure(buildContent: string): boolean {
  const verdictMatch = buildContent.match(/##\s*Verdict\s*\n+\s*(BUILD OK|BUILD FAIL)/i);
  if (verdictMatch) {
    return verdictMatch[1]!.toUpperCase() === 'BUILD FAIL';
  }
  return false;
}

function hasTestFailures(testContent: string): boolean {
  const verdictMatch = testContent.match(/##\s*Verdict\s*\n+\s*(ALL PASS|FAILURES)/i);
  if (verdictMatch) {
    return verdictMatch[1]!.toUpperCase() === 'FAILURES';
  }
  return false;
}

function checkpoint(step: number, userRequest: string, retries: PipelineResult['retries']): void {
  saveCheckpoint({
    userRequest,
    completedStep: step,
    retries,
    timestamp: new Date().toISOString(),
  });
}

type ReportKey = keyof PipelineContext['reports'];
type StringResultKey = 'kickoff' | 'plan' | 'implementation' | 'review' | 'uxReview' | 'devops' | 'testResults';

function reloadReports(ctx: PipelineContext, result: PipelineResult, upToStep: number): void {
  const reportMap: { step: number; key: ReportKey; resultKey: StringResultKey }[] = [
    { step: 1, key: 'kickoff', resultKey: 'kickoff' },
    { step: 2, key: 'plan', resultKey: 'plan' },
    { step: 3, key: 'implementation', resultKey: 'implementation' },
    { step: 4, key: 'review', resultKey: 'review' },
    { step: 5, key: 'uxReview', resultKey: 'uxReview' },
    { step: 6, key: 'devops', resultKey: 'devops' },
    { step: 7, key: 'testResults', resultKey: 'testResults' },
  ];
  for (const { step, key, resultKey } of reportMap) {
    if (step <= upToStep) {
      const content = readReport(REPORT_FILES[key]);
      ctx.reports[key] = content;
      result[resultKey] = content;
    }
  }
}

export async function orchestrate(userRequest: string): Promise<PipelineResult> {
  const existing = loadCheckpoint(userRequest);
  const resumeFrom = existing ? existing.completedStep + 1 : 1;

  if (existing) {
    log(`Resuming pipeline from step ${resumeFrom} (checkpoint: ${existing.timestamp})`);
  } else {
    cleanReports();
  }

  log('Generating codebase context...');
  const codebaseContext = generateCodebaseContext(PROJECT_ROOT);

  log('Reading project log...');
  const projectLog = readProjectLog();

  const ctx: PipelineContext = {
    userRequest,
    codebaseContext,
    projectRoot: PROJECT_ROOT,
    projectLog,
    reports: {},
  };

  const result: PipelineResult = {
    success: false,
    kickoff: '',
    plan: '',
    implementation: '',
    review: '',
    uxReview: '',
    devops: '',
    testResults: '',
    wrapup: '',
    retries: existing?.retries ?? { reviewRetry: false, devopsRetry: false, testRetry: false },
  };

  // Reload all reports from disk for completed steps
  if (resumeFrom > 1) {
    reloadReports(ctx, result, existing!.completedStep);
  }

  // Step 1: Rafael — Kickoff
  if (resumeFrom <= 1) {
    log('--- Step 1: Rafael Santos (Kickoff) ---');
    result.kickoff = await runAgent(techLeadKickoff, ctx);
    ctx.reports.kickoff = readReport(REPORT_FILES.kickoff);
    checkpoint(1, userRequest, result.retries);
  }

  // Step 2: Anna — Architecture Plan
  if (resumeFrom <= 2) {
    log('--- Step 2: Anna Sidorova (Architecture Plan) ---');
    result.plan = await runAgent(architect, ctx);
    ctx.reports.plan = readReport(REPORT_FILES.plan);
    checkpoint(2, userRequest, result.retries);
  }

  // Step 3: Jamie — Implementation
  if (resumeFrom <= 3) {
    log('--- Step 3: Jamie Okafor (Implementation) ---');
    result.implementation = await runAgent(developer, ctx);
    ctx.reports.implementation = readReport(REPORT_FILES.implementation);
    checkpoint(3, userRequest, result.retries);
  }

  // Step 4: Elena — Code Review
  if (resumeFrom <= 4) {
    log('--- Step 4: Elena Vasquez (Code Review) ---');
    result.review = await runAgent(codeReviewer, ctx);
    ctx.reports.review = readReport(REPORT_FILES.review);

    // Step 4b: If blocking issues, Jamie re-implements + Elena re-reviews
    if (hasBlockingIssues(ctx.reports.review)) {
      log('Elena found blocking issues. Jamie re-implementing...');
      result.retries.reviewRetry = true;
      result.implementation = await runAgent(developer, ctx);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.review = await runAgent(codeReviewer, ctx);
      ctx.reports.review = readReport(REPORT_FILES.review);
    }
    checkpoint(4, userRequest, result.retries);
  }

  // Step 5: Maya — UX Review (advisory, does not block)
  if (resumeFrom <= 5) {
    log('--- Step 5: Maya Chen (UX Review) ---');
    result.uxReview = await runAgent(uxAdvisor, ctx);
    ctx.reports.uxReview = readReport(REPORT_FILES.uxReview);
    checkpoint(5, userRequest, result.retries);
  }

  // Step 6: Marcus — Build Verification (hard gate)
  if (resumeFrom <= 6) {
    log('--- Step 6: Marcus Wren (Build Verification) ---');
    result.devops = await runAgent(devopsEngineer, ctx);
    ctx.reports.devops = readReport(REPORT_FILES.devops);

    // Step 6b: If build fails, Jamie re-implements + Marcus re-verifies
    if (hasBuildFailure(ctx.reports.devops)) {
      log('Marcus reports BUILD FAIL. Jamie re-implementing...');
      result.retries.devopsRetry = true;
      result.implementation = await runAgent(developer, ctx);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.devops = await runAgent(devopsEngineer, ctx);
      ctx.reports.devops = readReport(REPORT_FILES.devops);
    }
    checkpoint(6, userRequest, result.retries);
  }

  // Step 7: Taylor — Testing
  if (resumeFrom <= 7) {
    log('--- Step 7: Taylor Brooks (Testing) ---');
    result.testResults = await runAgent(qaEngineer, ctx);
    ctx.reports.testResults = readReport(REPORT_FILES.testResults);

    // Step 7b: If test failures, Jamie re-implements + Taylor re-tests
    if (hasTestFailures(ctx.reports.testResults)) {
      log('Taylor reports test failures. Jamie re-implementing...');
      result.retries.testRetry = true;
      result.implementation = await runAgent(developer, ctx);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.testResults = await runAgent(qaEngineer, ctx);
      ctx.reports.testResults = readReport(REPORT_FILES.testResults);
    }
    checkpoint(7, userRequest, result.retries);
  }

  // Step 8: Rafael — Wrapup
  log('--- Step 8: Rafael Santos (Wrapup) ---');
  result.wrapup = await runAgent(techLeadWrapup, ctx);
  ctx.reports.wrapup = readReport(REPORT_FILES.wrapup);

  // Extract and append project log entry from Rafael's wrapup
  const logMatch = ctx.reports.wrapup.match(/## Project Log Entry\s*\n([\s\S]*?)(?=\n---\s*$|$)/);
  if (logMatch) {
    const logEntry = logMatch[1]!.trim();
    if (logEntry) {
      log('Appending project log entry...');
      appendProjectLog(logEntry);
    }
  }

  result.success = !hasBlockingIssues(ctx.reports.review ?? '')
    && !hasBuildFailure(ctx.reports.devops ?? '')
    && !hasTestFailures(ctx.reports.testResults ?? '');

  // Pipeline complete — clear checkpoint
  clearCheckpoint();

  return result;
}
