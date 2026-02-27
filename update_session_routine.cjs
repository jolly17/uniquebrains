const fs = require('fs');

const content = fs.readFileSync('.kiro/SESSION_START_ROUTINE.md', 'utf8');

const addition = `

---

## Context Transfer Session Workarounds

**IMPORTANT**: After a context transfer (when conversation gets too long and is restarted), some file editing tools may have path resolution issues.

### Known Issues After Context Transfer
- \`strReplace\` tool may fail with path errors (tries to write to AppData temp directories)
- File editing tools may prepend incorrect temp directory paths
- Shell commands (\`executePwsh\`) continue to work normally

### Tool Status Check
At the start of a context transfer session, test the tools:
\`\`\`
1. Try fsWrite on a test file - if this works, basic file creation is OK
2. Try strReplace on an existing file - if this fails, use workarounds below
\`\`\`

### Workarounds for File Editing

**What Works:**
- ✅ \`fsWrite\` - Creating new files
- ✅ \`fsAppend\` - Appending to existing files (may fail in context transfer)
- ✅ \`executePwsh\` - Shell commands (always reliable)
- ✅ \`readFile\`, \`readMultipleFiles\` - Reading files
- ✅ \`editCode\` - AST-based code editing (preferred for .js/.jsx/.ts files)
- ✅ Creating and running Node.js scripts (.cjs files)

**What May Be Broken:**
- ❌ \`strReplace\` - Path resolution issues
- ❌ \`fsAppend\` - May have path issues in context transfer
- ❌ Editing existing non-code files directly

### Development Strategy When Tools Are Broken

1. **For code files (.js, .jsx, .ts)**: 
   - Use \`editCode\` tool with AST operations
   - This is the most reliable for code changes

2. **For complex multi-file edits or special characters (★, ←, ×)**:
   - Create a Node.js script (\`.cjs\` extension for CommonJS)
   - Use \`fs.readFileSync\` and \`fs.writeFileSync\`
   - Run with \`node script_name.cjs\`
   - Example: \`fix_review_modal.cjs\`

3. **For simple text replacements**:
   - Use PowerShell commands with proper encoding
   - Example: \`(Get-Content file.txt) -replace 'old', 'new' | Set-Content file.txt\`

4. **For new files**:
   - Use \`fsWrite\` - confirmed working even when other tools fail

5. **For appending or editing existing files**:
   - Create a Node.js script to read, modify, and write back

### Script Template for Complex Edits

When tools fail, create a \`.cjs\` script:

\`\`\`javascript
const fs = require('fs');

// Read file
let content = fs.readFileSync('path/to/file.js', 'utf8');

// Make changes
content = content.replace(/pattern/g, 'replacement');

// Write back
fs.writeFileSync('path/to/file.js', content, 'utf8');

console.log('✓ Fixed file successfully');
\`\`\`

Run with: \`node script_name.cjs\`

### Verification After Edits
Always verify changes were applied:
1. Read the file back with \`readFile\`
2. Check specific lines that were changed
3. Run \`npm run build\` to catch syntax errors
4. Don't assume changes worked - always verify
`;

fs.writeFileSync('.kiro/SESSION_START_ROUTINE.md', content + addition, 'utf8');

console.log('✓ Updated SESSION_START_ROUTINE.md with context transfer workarounds');
