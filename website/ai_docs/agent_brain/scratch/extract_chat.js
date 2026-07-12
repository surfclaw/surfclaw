const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\YG\\.gemini\\antigravity\\brain\\4b26bc69-c605-4ba0-be4e-fdd77a9c5ef7';
const transcriptPath = path.join(brainDir, '.system_generated', 'logs', 'transcript_full.jsonl');
const outputPath = 'C:\\Users\\YG\\Desktop\\surfrobot\\ai_docs\\chat_history.md';

function parseTranscript() {
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript file not found:', transcriptPath);
    return;
  }

  const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
  let mdContent = '# SurfRobot Project - Chat History\n\nThis document compiles the chat history of the session to allow restoration or reference on another machine.\n\n---\n\n';

  let stepCount = 1;
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      const type = entry.type;
      const content = entry.content || '';
      
      if (type === 'USER_INPUT') {
        mdContent += `### 👤 User (Step ${stepCount})\n\n${content.trim()}\n\n---\n\n`;
        stepCount++;
      } else if (type === 'PLANNER_RESPONSE') {
        mdContent += `### 🤖 Assistant (Step ${stepCount})\n\n${content.trim()}\n\n---\n\n`;
        stepCount++;
      }
    } catch (e) {
      // Ignore parsing errors for malformed lines
    }
  }

  fs.writeFileSync(outputPath, mdContent, 'utf8');
  console.log('Chat history written to:', outputPath);
}

parseTranscript();
