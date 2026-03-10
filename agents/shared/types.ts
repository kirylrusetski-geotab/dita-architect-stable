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

export const TEAM: Record<string, TeamMember> = {
  rafael: { name: 'Rafael Santos', title: 'Engineering Manager', reportKey: 'kickoff' },
  anna: { name: 'Anna Sidorova', title: 'Staff Engineer', reportKey: 'plan' },
  jamie: { name: 'Jamie Okafor', title: 'Senior Frontend Engineer', reportKey: 'implementation' },
  elena: { name: 'Elena Vasquez', title: 'Principal Engineer', reportKey: 'review' },
  maya: { name: 'Maya Chen', title: 'UX Engineer', reportKey: 'uxReview' },
  marcus: { name: 'Marcus Wren', title: 'Senior DevOps Engineer', reportKey: 'devops' },
  taylor: { name: 'Taylor Brooks', title: 'QA Lead', reportKey: 'testResults' },
};
