# DITA Architect Development Pipeline

You are the orchestrator for the DITA Architect multi-agent development pipeline. Execute the following steps sequentially for this development request:

**User Request:** $ARGUMENTS

---

## Step 0: Initialize

1. Clean previous reports:
```bash
rm -f agents/.reports/*.md
```

2. Read team context from `agents/shared/team-context.md`.

3. Read `PROJECT_LOG.md` from the project root (if it exists).

4. Generate codebase context by:
   - Listing files in these source directories: `types/`, `constants/`, `hooks/`, `lib/`, `sync/`, `components/`, `tests/`
   - Reading these key architectural files (first 100 lines each): `types/tab.ts`, `types/heretto.ts`, `constants/dita.ts`, `constants/heretto.ts`, `lib/xml-utils.ts`
   - Listing root source files: `App.tsx`, `dita-architect.tsx`, `index.tsx`, `textAnalysis.ts`

Store the team context, project log, and codebase context — you'll pass them to each agent.

---

## Step 1: Rafael Santos — Kickoff

Use the Task tool to launch the `rafael-kickoff` agent with subagent_type "general-purpose".

Task message must include:
- The team context (from `agents/shared/team-context.md`)
- The user request: `$ARGUMENTS`
- The project log (from `PROJECT_LOG.md`)
- The codebase context (generated in Step 0)

After the agent completes, read `agents/.reports/kickoff.md`.

---

## Step 2: Anna Sidorova — Architecture Plan

Use the Task tool to launch the `anna-architect` agent.

Task message must include:
- The team context
- The user request
- The codebase context
- Rafael's kickoff brief (from `agents/.reports/kickoff.md`)

After the agent completes, read `agents/.reports/plan.md`.

---

## Step 3: Code Discovery

Use the Task tool to launch the `code-discovery` agent.

Task message must include:
- Anna's architecture plan (from `agents/.reports/plan.md`)
- The codebase context

After the agent completes, read `agents/.reports/discovery.md`.

---

## Step 3.5: Git Branch Isolation

Before Jamie implements, create a feature branch to isolate changes:

```bash
git status --porcelain
```

If the working tree is clean (no output), create a branch:
```bash
git checkout -b pipeline/$(date +%Y-%m-%dT%H-%M-%S)
```

Record the branch name for Rafael's wrapup.

If the working tree has uncommitted changes, skip branch creation to avoid data loss. Note this for the wrapup.

---

## Step 4: Jamie Okafor — Implementation

Use the Task tool to launch the `jamie-developer` agent.

Task message must include:
- The team context
- The user request
- Anna's plan (from `agents/.reports/plan.md`)
- Code discovery summary (from `agents/.reports/discovery.md`)

After the agent completes, read `agents/.reports/implementation.md`.

---

## Step 5: Elena Vasquez — Code Review

Use the Task tool to launch the `elena-code-reviewer` agent.

Task message must include:
- The team context
- Anna's plan (from `agents/.reports/plan.md`)
- Jamie's implementation summary (from `agents/.reports/implementation.md`)

After the agent completes, read `agents/.reports/review.md`.

### Retry Gate: Elena FAIL

Read Elena's report. If the `## Verdict` section says **FAIL**:

1. Re-launch Jamie (`jamie-developer` agent) with the original task message PLUS Elena's review feedback (from `agents/.reports/review.md`). Tell Jamie: "Elena flagged blocking issues. Fix them."
2. After Jamie completes, read `agents/.reports/implementation.md`.
3. Re-launch Elena (`elena-code-reviewer` agent) with updated implementation.
4. Read `agents/.reports/review.md`.
5. If still FAIL after retry, note this as a retry warning for the wrapup. Do NOT retry again.

---

## Step 6: Maya Chen — UX Review (Advisory)

Use the Task tool to launch the `maya-ux-advisor` agent.

Task message must include:
- The team context
- Anna's plan (from `agents/.reports/plan.md`)
- Jamie's implementation summary (from `agents/.reports/implementation.md`)
- Elena's code review (from `agents/.reports/review.md`)

After the agent completes, read `agents/.reports/ux-review.md`.

Maya's verdict does NOT block the pipeline. Her concerns flow into Rafael's wrapup as follow-up items.

---

## Step 7: Marcus Wren — Build Verification

Use the Task tool to launch the `marcus-devops` agent.

Task message must include:
- The team context (Message from Kiryl section only)
- Jamie's implementation summary (from `agents/.reports/implementation.md`)
- The project root path for running build commands

After the agent completes, read `agents/.reports/devops.md`.

### Retry Gate: Marcus BUILD FAIL

Read Marcus's report. If the `## Verdict` section says **BUILD FAIL**:

1. Re-launch Jamie (`jamie-developer` agent) with the original task message PLUS Marcus's build report (from `agents/.reports/devops.md`). Tell Jamie: "Marcus's build verification failed. Fix the build."
2. After Jamie completes, read `agents/.reports/implementation.md`.
3. Re-launch Marcus (`marcus-devops` agent) with updated implementation.
4. Read `agents/.reports/devops.md`.
5. If still BUILD FAIL after retry, note this as a retry warning for the wrapup. Do NOT retry again.

---

## Step 8: Taylor Brooks — Testing

Use the Task tool to launch the `taylor-qa-engineer` agent.

Task message must include:
- The team context
- Anna's plan (from `agents/.reports/plan.md`)
- Jamie's implementation summary (from `agents/.reports/implementation.md`)
- Elena's code review (from `agents/.reports/review.md`)

After the agent completes, read `agents/.reports/test-results.md`.

### Retry Gate: Taylor FAILURES

Read Taylor's report. If the `## Verdict` section says **FAILURES**:

1. Re-launch Jamie (`jamie-developer` agent) with the original task message PLUS Taylor's test results (from `agents/.reports/test-results.md`). Tell Jamie: "Taylor's tests showed failures. Fix the issues."
2. After Jamie completes, read `agents/.reports/implementation.md`.
3. Re-launch Taylor (`taylor-qa-engineer` agent) with updated implementation.
4. Read `agents/.reports/test-results.md`.
5. If still FAILURES after retry, note this as a retry warning for the wrapup. Do NOT retry again.

---

## Step 9: Rafael Santos — Wrapup

Use the Task tool to launch the `rafael-wrapup` agent.

Task message must include:
- The team context
- The user request
- Rafael's kickoff brief (from `agents/.reports/kickoff.md`)
- Anna's plan (from `agents/.reports/plan.md`)
- Jamie's implementation summary (from `agents/.reports/implementation.md`)
- Elena's code review (from `agents/.reports/review.md`)
- Maya's UX review (from `agents/.reports/ux-review.md`)
- Marcus's build verification (from `agents/.reports/devops.md`)
- Taylor's test results (from `agents/.reports/test-results.md`)
- Pipeline branch name (if created in Step 3.5)
- Any retry warnings (if any retry gate still failed after the second attempt)

After the agent completes, read `agents/.reports/wrapup.md`.

---

## Step 10: Project Log Update

Read `agents/.reports/wrapup.md`. Extract the content under the `## Project Log Entry` heading (everything after that heading until the end or the next `---`).

If a project log entry exists, append it to `PROJECT_LOG.md` with a timestamp header:

```
---

### [ISO timestamp]

[extracted log entry content]
```

---

## Final: Report to User

Summarize the pipeline outcome:
- Read `agents/.reports/wrapup.md` and present Rafael's ship report.
- If a pipeline branch was created, tell the user: "Changes are on branch `[branch-name]`. Review with `git diff main...[branch-name]` and merge when satisfied."
- If any retry gates failed on the second attempt, flag this explicitly.
