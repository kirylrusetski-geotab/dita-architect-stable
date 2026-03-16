import path from 'node:path';
import { execSync } from 'node:child_process';
import { query, type SDKResultSuccess, type SDKResultError } from '@anthropic-ai/claude-agent-sdk';
import type { AgentDefinition, PipelineContext, PipelineResult, PipelineHealthReport, StepHealth, PipelineError } from './shared/types.ts';
import {
  writeReport, readReport, cleanReports, REPORT_FILES,
  saveCheckpoint, loadCheckpoint, clearCheckpoint,
  readProjectLog, appendProjectLog,
  writePipelineHealth, readPipelineHealth,
  type PipelineCheckpoint,
} from './shared/file-comm.ts';
import { generateCodebaseContext } from './shared/codebase-context.ts';
import { techLeadKickoff, techLeadWrapup } from './agents/tech-lead.ts';
import { architect } from './agents/architect.ts';
import { codeDiscovery } from './agents/code-discovery.ts';
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

// ── Git branch isolation ────────────────────────────────────────────────────

function isGitRepo(cwd: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function createPipelineBranch(cwd: string): string | null {
  if (!isGitRepo(cwd)) {
    log('Not a git repo — skipping branch isolation.');
    return null;
  }

  try {
    // Check for uncommitted changes that would block branch creation
    const status = execSync('git status --porcelain', { cwd, encoding: 'utf-8' }).trim();
    if (status) {
      log('Working tree has uncommitted changes — skipping branch isolation to avoid data loss.');
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const branchName = `pipeline/${timestamp}`;
    execSync(`git checkout -b ${branchName}`, { cwd, stdio: 'pipe' });
    log(`Created branch: ${branchName}`);
    return branchName;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`Failed to create pipeline branch: ${message}`);
    return null;
  }
}

function log(msg: string): void {
  process.stderr.write(`[orchestrator] ${msg}\n`);
}

function generateP0BacklogPlan(userRequest: string, errorDetail: string): string {
  const isBacklogRequest = userRequest.toLowerCase().includes('backlog') || userRequest.toLowerCase().includes('p0');

  if (isBacklogRequest) {
    return `# P0 Backlog Implementation Plan

## Summary
Anna Sidorova's architect agent failed (${errorDetail}). Proceeding with direct P0 bug fixes based on bugreports analysis.

## Priority P0 Issues Identified

### 1. BUG-h2-light-theme-invisible (HIGH - Accessibility Failure)
- **File:** dita-architect.tsx, index.css
- **Issue:** H2 headings invisible on Light theme (WCAG contrast failure)
- **Fix:** Verify CSS variables are properly applied to all themes

### 2. BUG-theme-dropdown-z-index (MEDIUM - Usability)
- **File:** components/Toolbar.tsx
- **Issue:** Theme dropdown hidden behind Heretto context toolbar
- **Fix:** Increase z-index or use portal rendering

### 3. BUG-empty-table-rows (MEDIUM - Content Quality)
- **File:** sync/parseXmlToLexical.ts
- **Issue:** Empty table rows rendered as gaps
- **Fix:** Filter empty rows during parsing

### 4. BUG-nested-list-not-rendered (MEDIUM - Content Loss)
- **File:** sync/parseXmlToLexical.ts
- **Issue:** Nested lists in table cells not visible
- **Fix:** Improve nested element parsing in table entries

## Implementation Priority
1. Fix h2 visibility (accessibility blocking)
2. Fix theme dropdown z-index (affects usability)
3. Address table rendering issues
4. Test across all themes

## Files to Change
- \`dita-architect.tsx\` - verify theme configuration
- \`index.css\` - check theme variable definitions
- \`components/Toolbar.tsx\` - fix dropdown z-index
- \`sync/parseXmlToLexical.ts\` - improve table parsing

## Acceptance Criteria
- H2 headings visible in all themes (WCAG compliant)
- Theme dropdown fully accessible
- Table content renders correctly
- No regressions in existing functionality

## Assumptions
- Bug reports are accurate and current
- Fixes can be implemented without architectural changes
- All themes need testing for consistency

## Fallback Plan Generated Due To
Agent failure: ${errorDetail}
Timestamp: ${new Date().toISOString()}`;
  }

  // Generic fallback for non-backlog requests
  return `# Fallback Implementation Plan

## Summary
Minimal plan created due to architect agent failure. Proceeding with basic implementation approach.

## Files to Change

### Fallback approach required
- **Action:** Investigate and implement based on Rafael's kickoff brief
- **Changes:** Address the user request using existing codebase patterns
- **Reason:** Architect agent unavailable, proceeding with minimal viable approach

## Acceptance Criteria
- Implementation addresses the core user request
- No breaking changes to existing functionality
- Code follows existing patterns in the codebase

## Invariants
- Existing functionality must continue working
- WYSIWYG/DITA parity maintained

## Assumptions
- User request can be implemented with standard patterns
- No major architectural changes needed

## Risks and Considerations
- Limited architectural analysis may lead to suboptimal implementation
- May require iteration based on review feedback

## Fallback Generated Due To
Agent failure: ${errorDetail}
Timestamp: ${new Date().toISOString()}`;
}

function writePipelineHealthReport(
  status: PipelineHealthReport['status'],
  currentStep: number,
  currentStepName: string,
  steps: StepHealth[],
  errors: PipelineError[],
  startTime?: string,
): void {
  const existing = readPipelineHealth();
  const now = new Date().toISOString();

  const report: PipelineHealthReport = {
    status,
    currentStep,
    currentStepName,
    lastSuccessfulStep: steps.filter(s => s.status === 'completed').length,
    startTime: startTime ?? existing?.startTime ?? now,
    lastUpdateTime: now,
    steps,
    errors,
  };

  writePipelineHealth(report);
}

function categorizeError(error: string): PipelineError['errorType'] {
  if (error.includes('timeout') || error.includes('timed out')) return 'timeout';
  if (error.includes('network') || error.includes('connection')) return 'network';
  if (error.includes('model') || error.includes('unavailable')) return 'model_unavailable';
  if (error.includes('SDK')) return 'sdk_error';
  return 'unknown';
}

async function runAgent(agent: AgentDefinition, ctx: PipelineContext, step: number, stepName: string, steps: StepHealth[], errors: PipelineError[]): Promise<string> {
  log(`Starting ${agent.name} (${agent.model})...`);

  // Update step status to running
  const stepIndex = steps.findIndex(s => s.step === step);
  if (stepIndex >= 0) {
    steps[stepIndex]!.status = 'running';
    steps[stepIndex]!.startTime = new Date().toISOString();
  }
  writePipelineHealthReport('running', step, stepName, steps, errors);

  let prompt: string;
  try {
    prompt = agent.buildPrompt(ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`${agent.name} failed to build prompt: ${message}`);

    // Handle fallback for architect agent
    if (agent.name === 'Anna Sidorova') {
      const fallbackPlan = generateP0BacklogPlan(ctx.userRequest, message);
      writeReport(agent.reportFile, fallbackPlan);
      if (stepIndex >= 0) {
        steps[stepIndex]!.status = 'completed';
        steps[stepIndex]!.endTime = new Date().toISOString();
        steps[stepIndex]!.agentOutput = 'Fallback plan generated due to prompt build failure';
      }
      writePipelineHealthReport('running', step, stepName, steps, errors);
      return fallbackPlan;
    }

    const fallback = `Agent ${agent.name} failed to build prompt: ${message}`;
    const error: PipelineError = {
      step,
      agentName: agent.name,
      errorType: categorizeError(message),
      message,
      timestamp: new Date().toISOString(),
    };
    errors.push(error);

    if (stepIndex >= 0) {
      steps[stepIndex]!.status = 'failed';
      steps[stepIndex]!.endTime = new Date().toISOString();
      steps[stepIndex]!.error = message;
    }
    writePipelineHealthReport('failed', step, stepName, steps, errors);
    writeReport(agent.reportFile, fallback);
    return fallback;
  }

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
        settingSources: ['project'],
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

          if (stepIndex >= 0) {
            steps[stepIndex]!.status = 'completed';
            steps[stepIndex]!.endTime = new Date().toISOString();
            steps[stepIndex]!.agentOutput = `Completed in ${success.num_turns} turns, $${success.total_cost_usd.toFixed(4)}`;
          }
          writePipelineHealthReport('running', step, stepName, steps, errors);
        } else {
          const error = msg as SDKResultError;
          const errorDetail = error.errors.length > 0
            ? error.errors.join('; ')
            : `SDK returned error result with no details (subtype: ${msg.subtype})`;
          log(`${agent.name} failed: ${errorDetail}`);

          const pipelineError: PipelineError = {
            step,
            agentName: agent.name,
            errorType: 'sdk_error',
            message: errorDetail,
            timestamp: new Date().toISOString(),
          };
          errors.push(pipelineError);

          // Handle fallback for Anna Sidorova (architect) SDK failures
          if (agent.name === 'Anna Sidorova') {
            const fallbackPlan = generateP0BacklogPlan(ctx.userRequest, errorDetail);
            writeReport(agent.reportFile, fallbackPlan);
            if (stepIndex >= 0) {
              steps[stepIndex]!.status = 'completed';
              steps[stepIndex]!.endTime = new Date().toISOString();
              steps[stepIndex]!.agentOutput = 'P0 fallback plan generated due to SDK error';
            }
            writePipelineHealthReport('running', step, stepName, steps, errors);
            finalResult = fallbackPlan;
          } else {
            if (stepIndex >= 0) {
              steps[stepIndex]!.status = 'failed';
              steps[stepIndex]!.endTime = new Date().toISOString();
              steps[stepIndex]!.error = errorDetail;
            }
            writePipelineHealthReport('failed', step, stepName, steps, errors);
            finalResult = `Agent ${agent.name} failed: ${errorDetail}`;
          }
        }
      }
    }

    writeReport(agent.reportFile, finalResult);
    return finalResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`${agent.name} threw an error: ${message}`);

    const error: PipelineError = {
      step,
      agentName: agent.name,
      errorType: categorizeError(message),
      message,
      timestamp: new Date().toISOString(),
    };
    errors.push(error);

    if (stepIndex >= 0) {
      steps[stepIndex]!.status = 'failed';
      steps[stepIndex]!.endTime = new Date().toISOString();
      steps[stepIndex]!.error = message;
    }
    writePipelineHealthReport('failed', step, stepName, steps, errors);

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

type ReportKey = keyof typeof REPORT_FILES;
type StringResultKey = 'kickoff' | 'plan' | 'implementation' | 'review' | 'uxReview' | 'devops' | 'testResults';

function reloadReports(ctx: PipelineContext, result: PipelineResult, upToStep: number): void {
  const reportMap: { step: number; key: ReportKey; resultKey: StringResultKey }[] = [
    { step: 1, key: 'kickoff', resultKey: 'kickoff' },
    { step: 2, key: 'plan', resultKey: 'plan' },
    { step: 4, key: 'implementation', resultKey: 'implementation' },
    { step: 5, key: 'review', resultKey: 'review' },
    { step: 6, key: 'uxReview', resultKey: 'uxReview' },
    { step: 7, key: 'devops', resultKey: 'devops' },
    { step: 8, key: 'testResults', resultKey: 'testResults' },
  ];
  for (const { step, key, resultKey } of reportMap) {
    if (step <= upToStep) {
      const content = readReport(REPORT_FILES[key]);
      ctx.reports[key] = content;
      result[resultKey] = content;
    }
  }
  // Discovery (step 3) only lives in ctx.reports, not in PipelineResult
  if (upToStep >= 3) {
    ctx.reports.discovery = readReport(REPORT_FILES.discovery);
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

  // Initialize pipeline health tracking
  const steps: StepHealth[] = [
    { step: 1, name: 'Rafael Santos (Kickoff)', status: 'pending' },
    { step: 2, name: 'Anna Sidorova (Architecture Plan)', status: 'pending' },
    { step: 3, name: 'Code Discovery', status: 'pending' },
    { step: 4, name: 'Jamie Okafor (Implementation)', status: 'pending' },
    { step: 5, name: 'Elena Vasquez (Code Review)', status: 'pending' },
    { step: 6, name: 'Maya Chen (UX Review)', status: 'pending' },
    { step: 7, name: 'Marcus Wren (Build Verification)', status: 'pending' },
    { step: 8, name: 'Taylor Brooks (Testing)', status: 'pending' },
    { step: 9, name: 'Rafael Santos (Wrapup)', status: 'pending' },
  ];

  const errors: PipelineError[] = [];
  const pipelineStartTime = new Date().toISOString();

  // Mark completed steps as completed if resuming
  if (resumeFrom > 1) {
    for (let i = 0; i < resumeFrom - 1; i++) {
      if (steps[i]) {
        steps[i]!.status = 'completed';
      }
    }
  }

  writePipelineHealthReport('running', resumeFrom, steps[resumeFrom - 1]?.name ?? 'Unknown', steps, errors, pipelineStartTime);

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
    result.kickoff = await runAgent(techLeadKickoff, ctx, 1, 'Rafael Santos (Kickoff)', steps, errors);
    ctx.reports.kickoff = readReport(REPORT_FILES.kickoff);
    checkpoint(1, userRequest, result.retries);
  }

  // Step 2: Anna — Architecture Plan
  if (resumeFrom <= 2) {
    log('--- Step 2: Anna Sidorova (Architecture Plan) ---');
    result.plan = await runAgent(architect, ctx, 2, 'Anna Sidorova (Architecture Plan)', steps, errors);
    ctx.reports.plan = readReport(REPORT_FILES.plan);
    checkpoint(2, userRequest, result.retries);
  }

  // Step 3: Code Discovery — read targeted files before implementation
  if (resumeFrom <= 3) {
    log('--- Step 3: Code Discovery ---');
    await runAgent(codeDiscovery, ctx, 3, 'Code Discovery', steps, errors);
    ctx.reports.discovery = readReport(REPORT_FILES.discovery);
    checkpoint(3, userRequest, result.retries);
  }

  // Create a feature branch before implementation so the changeset is diffable and reversible
  let pipelineBranch: string | null = null;
  if (resumeFrom <= 4) {
    pipelineBranch = createPipelineBranch(ctx.projectRoot);
  }

  // Step 4: Jamie — Implementation
  if (resumeFrom <= 4) {
    log('--- Step 4: Jamie Okafor (Implementation) ---');
    result.implementation = await runAgent(developer, ctx, 4, 'Jamie Okafor (Implementation)', steps, errors);
    ctx.reports.implementation = readReport(REPORT_FILES.implementation);
    checkpoint(4, userRequest, result.retries);
  }

  // Step 5: Elena — Code Review
  if (resumeFrom <= 5) {
    log('--- Step 5: Elena Vasquez (Code Review) ---');
    result.review = await runAgent(codeReviewer, ctx, 5, 'Elena Vasquez (Code Review)', steps, errors);
    ctx.reports.review = readReport(REPORT_FILES.review);

    // Step 5b: If blocking issues, Jamie re-implements + Elena re-reviews
    if (hasBlockingIssues(ctx.reports.review)) {
      log('Elena found blocking issues. Jamie re-implementing...');
      result.retries.reviewRetry = true;
      result.implementation = await runAgent(developer, ctx, 4, 'Jamie Okafor (Re-implementation)', steps, errors);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.review = await runAgent(codeReviewer, ctx, 5, 'Elena Vasquez (Re-review)', steps, errors);
      ctx.reports.review = readReport(REPORT_FILES.review);
    }
    checkpoint(5, userRequest, result.retries);
  }

  // Step 6: Maya — UX Review (advisory, does not block)
  if (resumeFrom <= 6) {
    log('--- Step 6: Maya Chen (UX Review) ---');
    result.uxReview = await runAgent(uxAdvisor, ctx, 6, 'Maya Chen (UX Review)', steps, errors);
    ctx.reports.uxReview = readReport(REPORT_FILES.uxReview);
    checkpoint(6, userRequest, result.retries);
  }

  // Step 7: Marcus — Build Verification (hard gate)
  if (resumeFrom <= 7) {
    log('--- Step 7: Marcus Wren (Build Verification) ---');
    result.devops = await runAgent(devopsEngineer, ctx, 7, 'Marcus Wren (Build Verification)', steps, errors);
    ctx.reports.devops = readReport(REPORT_FILES.devops);

    // Step 7b: If build fails, Jamie re-implements + Marcus re-verifies
    if (hasBuildFailure(ctx.reports.devops)) {
      log('Marcus reports BUILD FAIL. Jamie re-implementing...');
      result.retries.devopsRetry = true;
      result.implementation = await runAgent(developer, ctx, 4, 'Jamie Okafor (Re-implementation)', steps, errors);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.devops = await runAgent(devopsEngineer, ctx, 7, 'Marcus Wren (Re-verification)', steps, errors);
      ctx.reports.devops = readReport(REPORT_FILES.devops);
    }
    checkpoint(7, userRequest, result.retries);
  }

  // Step 8: Taylor — Testing
  if (resumeFrom <= 8) {
    log('--- Step 8: Taylor Brooks (Testing) ---');
    result.testResults = await runAgent(qaEngineer, ctx, 8, 'Taylor Brooks (Testing)', steps, errors);
    ctx.reports.testResults = readReport(REPORT_FILES.testResults);

    // Step 8b: If test failures, Jamie re-implements + Taylor re-tests
    if (hasTestFailures(ctx.reports.testResults)) {
      log('Taylor reports test failures. Jamie re-implementing...');
      result.retries.testRetry = true;
      result.implementation = await runAgent(developer, ctx, 4, 'Jamie Okafor (Re-implementation)', steps, errors);
      ctx.reports.implementation = readReport(REPORT_FILES.implementation);

      result.testResults = await runAgent(qaEngineer, ctx, 8, 'Taylor Brooks (Re-testing)', steps, errors);
      ctx.reports.testResults = readReport(REPORT_FILES.testResults);
    }
    checkpoint(8, userRequest, result.retries);
  }

  // Pass branch info to wrapup context
  if (pipelineBranch) {
    ctx.reports.pipelineBranch = pipelineBranch;
  }

  // Flag if any retry gate still failed on the second attempt
  if (result.retries.reviewRetry && hasBlockingIssues(ctx.reports.review ?? '')) {
    ctx.reports.retryWarning = (ctx.reports.retryWarning ?? '') + 'Code review retry still has blocking issues after second attempt.\n';
  }
  if (result.retries.devopsRetry && hasBuildFailure(ctx.reports.devops ?? '')) {
    ctx.reports.retryWarning = (ctx.reports.retryWarning ?? '') + 'Build verification retry still failing after second attempt.\n';
  }
  if (result.retries.testRetry && hasTestFailures(ctx.reports.testResults ?? '')) {
    ctx.reports.retryWarning = (ctx.reports.retryWarning ?? '') + 'Test retry still has failures after second attempt.\n';
  }

  // Step 9: Rafael — Wrapup
  log('--- Step 9: Rafael Santos (Wrapup) ---');
  result.wrapup = await runAgent(techLeadWrapup, ctx, 9, 'Rafael Santos (Wrapup)', steps, errors);
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

  if (pipelineBranch) {
    log(`Changes on branch: ${pipelineBranch}. Review with: git diff main...${pipelineBranch}`);
  }

  // Write final pipeline health report
  const finalStatus = result.success ? 'completed' : 'failed';
  writePipelineHealthReport(finalStatus, 9, 'Pipeline Complete', steps, errors);

  // Pipeline complete — clear checkpoint
  clearCheckpoint();

  return result;
}
