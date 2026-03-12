export type AgentModel = string;

export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'dontAsk';

export interface AgentDefinition {
  name: string;
  model: AgentModel;
  tools: string[];
  permissionMode: PermissionMode;
  maxTurns: number;
  buildPrompt: (context: PipelineContext) => string;
  reportFile: string;
}

export interface PipelineContext {
  userRequest: string;
  codebaseContext: string;
  projectRoot: string;
  projectLog: string;
  reports: {
    kickoff?: string;
    plan?: string;
    implementation?: string;
    review?: string;
    uxReview?: string;
    devops?: string;
    testResults?: string;
    wrapup?: string;
  };
}

export interface PipelineResult {
  success: boolean;
  kickoff: string;
  plan: string;
  implementation: string;
  review: string;
  uxReview: string;
  devops: string;
  testResults: string;
  wrapup: string;
  retries: {
    reviewRetry: boolean;
    devopsRetry: boolean;
    testRetry: boolean;
  };
}

export interface TeamMember {
  name: string;
  title: string;
  reportKey: keyof PipelineContext['reports'];
}

export const COMPANY = 'Cybergymnastics Inc.';

// ─── Message from Kiryl to the team ──────────────────────────────────
// This is your all-hands message. Every agent receives it.
// Speak to your team here — who you are, what you're building, what matters.

export const STAKEHOLDER_MESSAGE = `Hey team, my name is Kiryl, I'm the founder of Cybergymnastics Inc. I'll be honest, I'm not much of a developer, designer, or salesman. I'm just a technical writer who saw a problem and wanted to build an elegant solution. I've assembled you all to help me build that elegant solution.

You each have a special set of skills that add to the workflow we have in place. If you have a question about anything, don't hesitate to reach out to me and we can discuss it. I am relying on your expertise in your respective specialties to build DITA Architect.

DITA Architect is currently an MVP product. It's to be used by other technical writers to quickly and easily take content and convert it to DITA. User experience and WYSIWYG/DITA parity is paramount. Over the course of the next few months we will flesh out its features, fix issues, and build a fully-fledged application from which users can work from without problems. Our goal isn't to replace current WYSIWYG or XML editors, our goal is to create a platform for technical writers that is more efficient and user friendly than Heretto. Thank you, looking forward to building together.

Standing team decisions:
1. WYSIWYG/DITA parity is the top-priority acceptance criterion for every feature.
2. When there's a trade-off between developer convenience and writer experience, writer experience wins.`;

export const COMPANY_CULTURE = `## Cybergymnastics Engineering Culture
- Simplicity wins. Don't abstract until you have three real use cases.
- TypeScript strict. No \`any\`. No unused variables or dead code.
- The user of DITA Architect is a DITA expert. Don't dumb down the UX.
- Tests are specifications. Name them like prose, not like code.
- Zero TypeScript warnings is a hard requirement.
- A feature that doesn't work correctly is worse than no feature.
- Kiryl is the only maintainer. Write code he can read and maintain alone.
- Prefer editing existing files over creating new ones.
- Follow existing patterns in the codebase — consistency over cleverness.`;

export const TEAM: Record<string, TeamMember> = {
  rafael: { name: 'Rafael Santos', title: 'Engineering Manager', reportKey: 'kickoff' },
  anna: { name: 'Anna Sidorova', title: 'Staff Engineer', reportKey: 'plan' },
  jamie: { name: 'Jamie Okafor', title: 'Senior Frontend Engineer', reportKey: 'implementation' },
  elena: { name: 'Elena Vasquez', title: 'Principal Engineer', reportKey: 'review' },
  maya: { name: 'Maya Chen', title: 'UX Engineer', reportKey: 'uxReview' },
  marcus: { name: 'Marcus Wren', title: 'Senior DevOps Engineer', reportKey: 'devops' },
  taylor: { name: 'Taylor Brooks', title: 'QA Lead', reportKey: 'testResults' },
};

export interface PipelineHealthReport {
  status: 'running' | 'failed' | 'completed';
  currentStep: number;
  currentStepName: string;
  lastSuccessfulStep: number;
  startTime: string;
  lastUpdateTime: string;
  steps: StepHealth[];
  errors: PipelineError[];
}

export interface StepHealth {
  step: number;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  error?: string;
  agentOutput?: string;
}

export interface PipelineError {
  step: number;
  agentName: string;
  errorType: 'sdk_error' | 'timeout' | 'network' | 'model_unavailable' | 'unknown';
  message: string;
  timestamp: string;
}
