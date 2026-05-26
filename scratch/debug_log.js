const fs = require('fs');
const readline = require('readline');

const CONVERSATIONS = [
  { id: '54794f5a-7ffd-4382-9bd0-5a0286cc7fb8', name: 'Team Management' },
  { id: 'e63a3893-26fa-443d-bf86-19d943c63719', name: 'Resend Email Service' }
];

async function extract() {
  for (const conv of CONVERSATIONS) {
    console.log(`\n=== ALL TOOL CALLS: ${conv.name} (${conv.id}) ===`);
    const logPath = `/Users/naomiklock/.gemini/antigravity-ide/brain/${conv.id}/.system_generated/logs/transcript.jsonl`;
    if (!fs.existsSync(logPath)) continue;
    
    const fileStream = fs.createReadStream(logPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let stepNum = 0;
    for await (const line of rl) {
      stepNum++;
      try {
        const data = JSON.parse(line);
        if (data.tool_calls && Array.isArray(data.tool_calls)) {
          for (const tc of data.tool_calls) {
            const toolName = tc.name || (tc.function && tc.function.name);
            const args = tc.args || (tc.function && tc.function.arguments && JSON.parse(tc.function.arguments)) || {};
            
            console.log(`  Step ${stepNum}: [${toolName}] Target: ${args.TargetFile || args.targetFile || args.CommandLine || args.commandLine || 'N/A'}`);
          }
        }
      } catch (err) {}
    }
  }
}

extract().catch(console.error);
