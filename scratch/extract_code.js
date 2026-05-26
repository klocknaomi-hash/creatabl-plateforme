const fs = require('fs');
const readline = require('readline');
const path = require('path');

const CONVERSATIONS = [
  { id: '54794f5a-7ffd-4382-9bd0-5a0286cc7fb8', name: 'Team Management' },
  { id: 'e63a3893-26fa-443d-bf86-19d943c63719', name: 'Resend Email Service' }
];

async function extract() {
  for (const conv of CONVERSATIONS) {
    console.log(`\n=== Extracting from: ${conv.name} (${conv.id}) ===`);
    const logPath = `/Users/naomiklock/.gemini/antigravity-ide/brain/${conv.id}/.system_generated/logs/transcript.jsonl`;
    if (!fs.existsSync(logPath)) {
      console.log(`Log file not found at: ${logPath}`);
      continue;
    }
    
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
            
            if (toolName === 'write_to_file') {
              const target = args.TargetFile || args.targetFile;
              const content = args.CodeContent || args.codeContent;
              if (target && content) {
                console.log(`[WRITE] Step ${stepNum}: File -> ${target}`);
                // Print a small snippet or save it
                const basename = path.basename(target);
                const outDir = path.join(__dirname, 'extracted', conv.id);
                fs.mkdirSync(outDir, { recursive: true });
                fs.writeFileSync(path.join(outDir, basename), content);
                console.log(`Saved to extracted/${conv.id}/${basename}`);
              }
            } else if (toolName === 'replace_file_content' || toolName === 'multi_replace_file_content') {
              const target = args.TargetFile || args.targetFile;
              console.log(`[EDIT] Step ${stepNum} (${toolName}): File -> ${target}`);
              // Print arguments to see edit details
              const outDir = path.join(__dirname, 'extracted', conv.id);
              fs.mkdirSync(outDir, { recursive: true });
              const editLog = path.join(outDir, `edit_${stepNum}_${path.basename(target)}.json`);
              fs.writeFileSync(editLog, JSON.stringify(args, null, 2));
              console.log(`Saved edit details to ${editLog}`);
            }
          }
        }
      } catch (err) {
        // Ignored line errors
      }
    }
  }
}

extract().catch(console.error);
