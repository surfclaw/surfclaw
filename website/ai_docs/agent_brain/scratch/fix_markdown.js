const fs = require('fs');
const path = require('path');

const dirs = [
  'C:/Users/YG/Desktop/surfrobot/ai_docs',
  'C:/Users/YG/.gemini/antigravity/brain/4b26bc69-c605-4ba0-be4e-fdd77a9c5ef7'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.md')) {
      const filepath = path.join(dir, file);
      let content = fs.readFileSync(filepath, 'utf8');
      
      // Wrap $SRBT in backticks if not already wrapped
      content = content.replace(/`?\$SRBT`?/g, '`$SRBT`');
      
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Processed:', filepath);
    }
  });
});
