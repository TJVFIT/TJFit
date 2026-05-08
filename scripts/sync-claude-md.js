const fs = require('fs');
fs.copyFileSync('AGENTS.md', 'CLAUDE.md');
console.log('CLAUDE.md synced from AGENTS.md');
