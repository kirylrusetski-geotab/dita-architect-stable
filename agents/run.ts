import { orchestrate } from './orchestrator.ts';

const userRequest = process.argv[2];

if (!userRequest) {
  console.error('Usage: npx tsx agents/run.ts "Your development request"');
  process.exit(1);
}

console.log(`Processing request: "${userRequest}"\n`);

const result = await orchestrate(userRequest);

// Rafael's wrapup is the final output
console.log('\n' + result.wrapup);

process.exit(result.success ? 0 : 1);
