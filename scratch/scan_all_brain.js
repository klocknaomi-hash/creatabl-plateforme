const fs = require('fs');
const path = require('path');
const readline = require('readline');

const brainDir = '/Users/naomiklock/.gemini/antigravity-ide/brain';

async function scan() {
  const dirs = fs.readdirSync(brainDir);
  console.log(`Found ${dirs.length} directories in brain/`);
  
  const fileMap = {};
  
  for (const dir of dirs) {
    const logPath = path.join(brainDir, dir, '.system_generated/logs/transcript.jsonl');
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
            
            if (toolName === 'write_to_file') {
              let target = args.TargetFile || args.targetFile;
              let content = args.CodeContent || args.codeContent;
              if (target && content) {
                target = target.replace(/"/g, '').trim();
                if (target.includes('creatabl-ia')) {
                  if (!fileMap[target]) fileMap[target] = [];
                  fileMap[target].push({
                    dir,
                    stepNum,
                    type: 'write',
                    contentLength: content.length,
                    timestamp: data.created_at || ''
                  });
                }
              }
            } else if (toolName === 'replace_file_content' || toolName === 'multi_replace_file_content') {
              let target = args.TargetFile || args.targetFile;
              if (target) {
                target = target.replace(/"/g, '').trim();
                if (target.includes('creatabl-ia')) {
                  if (!fileMap[target]) fileMap[target] = [];
                  fileMap[target].push({
                    dir,
                    stepNum,
                    type: 'edit',
                    args,
                    timestamp: data.created_at || ''
                  });
                }
              }
            }
          }
        }
      } catch (err) {}
    }
  }
  
  const targets = Object.keys(fileMap).sort();
  console.log('\n=== FILE WRITES/EDITS REGISTRY (creatabl-ia) ===');
  for (const target of targets) {
    console.log(`\nFile: ${target}`);
    for (const record of fileMap[target]) {
      console.log(`  [${record.type.toUpperCase()}] session: ${record.dir} step: ${record.stepNum} (${record.timestamp})`);
      if (record.contentLength) console.log(`    Length: ${record.contentLength}`);
    }
  }
}

scan().catch(console.error);
