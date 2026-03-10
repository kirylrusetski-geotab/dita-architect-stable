import path from 'node:path';
import { query, type SDKResultSuccess, type SDKResultError } from '@anthropic-ai/claude-agent-sdk';
import type { AgentDefinition, PipelineContext, PipelineResult } from './shared/types.ts';
import { writeReport, readReport, cleanReports, REPORT_FILES } from './shared/file-comm.ts';
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

export async function orchestrate(userRequest: string): Promise<PipelineResult> {
  cleanReports();
  log('Generating codebase context...');
  const codebaseContext = generateCodebaseContext(PROJECT_ROOT);

  const ctx: PipelineContext = {
    userRequest,
    codebaseContext,
    projectRoot: PROJECT_ROOT,
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
    retries: { reviewRetry: false, devopsRetry: false, testRetry: false },
  };

  // Step 1: Rafael — Kickoff
  log('--- Step 1: Rafael Santos (Kickoff) ---');
  result.kickoff = await runAgent(techLeadKickoff, ctx);
  ctx.reports.kickoff = readReport(REPORT_FILES.kickoff);

  // Step 2: Anna — Architecture Plan
  log('--- Step 2: Anna Sidorova (Architecture Plan) ---');
  result.plan = await runAgent(architect, ctx);
  ctx.reports.plan = readReport(REPORT_FILES.plan);

  // Step 3: Jamie — Implementation
  log('--- Step 3: Jamie Okafor (Implementation) ---');
  result.implementation = await runAgent(developer, ctx);
  ctx.reports.implementation = readReport(REPORT_FILES.implementation);

  // Step 4: Elena — Code Review
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

  // Step 5: Maya — UX Review (advisory, does not block)
  log('--- Step 5: Maya Chen (UX Review) ---');
  result.uxReview = await runAgent(uxAdvisor, ctx);
  ctx.reports.uxReview = readReport(REPORT_FILES.uxReview);

  // Step 6: Marcus — Build Verification (hard gate)
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

  // Step 7: Taylor — Testing
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

  // Step 8: Rafael — Wrapup
  log('--- Step 8: Rafael Santos (Wrapup) ---');
  result.wrapup = await runAgent(techLeadWrapup, ctx);
  ctx.reports.wrapup = readReport(REPORT_FILES.wrapup);

  result.success = !hasBlockingIssues(ctx.reports.review)
    && !hasBuildFailure(ctx.reports.devops)
    && !hasTestFailures(ctx.reports.testResults);

  return result;
}
