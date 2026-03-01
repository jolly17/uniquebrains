# Session Start Routine

## Purpose
This routine helps me get familiar with the codebase at the start of each session to work more efficiently and avoid repeatedly reading files during work.

## Routine (5-10 minutes)

### 1. Read the Task List
- Check `.kiro/specs/care-roadmap/REMAINING_TASKS.md` to see what's pending
- Identify priority tasks
- Understand what was completed previously

### 2. Review Key Files
Quickly scan the main components we'll be working with:
- `src/pages/MilestonePage.jsx` - Main listing page for care resources
- `src/pages/ResourceDetailPage.jsx` - Detail view for individual resources
- `src/components/ResourceCard.jsx` - Card component for resource listings
- `src/components/ReviewModal.jsx` - Modal for writing reviews
- `src/services/careResourceService.js` - Service layer for API calls
- Any other relevant files based on pending tasks

### 3. Check Project Structure
- Understand how components connect
- Note the data flow (props, state, context)
- Identify shared utilities and services

### 4. Note Patterns
- See how similar features are implemented
- Compare courses vs care resources patterns
- Understand styling conventions (CSS classes, component structure)
- Note authentication patterns (useAuth hook usage)

## Working Principles After Routine

1. **Read files once, act decisively** - Trust the context I have, don't re-read unnecessarily
2. **Test locally before committing** - Always run build check to catch syntax errors
3. **Batch related changes** - Fix multiple related issues in one commit
4. **Use simpler tools** - PowerShell commands when I know exactly what to change
5. **Be concise** - Less explanation, more action
6. **Start with diagnostics** - Run `getDiagnostics` when errors are reported

## Expected Outcome

With this context loaded, I should be able to:
- Know exactly where code is located
- Understand how components interact
- Make changes confidently without re-reading
- Work faster and more efficiently
- Avoid syntax errors by understanding the patterns

## Notes

- This routine should be done at the START of each new session
- If the session is a continuation with context, skip this routine
- Update this file if new patterns or key files emerge


---

## Context Transfer Session Workarounds

**IMPORTANT**: After a context transfer (when conversation gets too long and is restarted), some file editing tools may have path resolution issues.

### Known Issues After Context Transfer
- `strReplace` tool may fail with path errors (tries to write to AppData temp directories)
- File editing tools may prepend incorrect temp directory paths
- Shell commands (`executePwsh`) continue to work normally

### Tool Status Check
At the start of a context transfer session, test the tools:
```
1. Try fsWrite on a test file - if this works, basic file creation is OK
2. Try strReplace on an existing file - if this fails, use workarounds below
```

### Workarounds for File Editing

**What Works:**
- ✅ `fsWrite` - Creating new files
- ✅ `fsAppend` - Appending to existing files (may fail in context transfer)
- ✅ `executePwsh` - Shell commands (always reliable)
- ✅ `readFile`, `readMultipleFiles` - Reading files
- ✅ `editCode` - AST-based code editing (preferred for .js/.jsx/.ts files)
- ✅ Creating and running Node.js scripts (.cjs files)

**What May Be Broken:**
- ❌ `strReplace` - Path resolution issues
- ❌ `fsAppend` - May have path issues in context transfer
- ❌ Editing existing non-code files directly

### Development Strategy When Tools Are Broken

1. **For code files (.js, .jsx, .ts)**: 
   - Use `editCode` tool with AST operations
   - This is the most reliable for code changes

2. **For complex multi-file edits or special characters (★, ←, ×)**:
   - Create a Node.js script (`.cjs` extension for CommonJS)
   - Use `fs.readFileSync` and `fs.writeFileSync`
   - Run with `node script_name.cjs`
   - Example: `fix_review_modal.cjs`

3. **For simple text replacements**:
   - Use PowerShell commands with proper encoding
   - Example: `(Get-Content file.txt) -replace 'old', 'new' | Set-Content file.txt`

4. **For new files**:
   - Use `fsWrite` - confirmed working even when other tools fail

5. **For appending or editing existing files**:
   - Create a Node.js script to read, modify, and write back

### Script Template for Complex Edits

When tools fail, create a `.cjs` script:

```javascript
const fs = require('fs');

// Read file
let content = fs.readFileSync('path/to/file.js', 'utf8');

// Make changes
content = content.replace(/pattern/g, 'replacement');

// Write back
fs.writeFileSync('path/to/file.js', content, 'utf8');

console.log('✓ Fixed file successfully');
```

Run with: `node script_name.cjs`

### Verification After Edits
Always verify changes were applied:
1. Read the file back with `readFile`
2. Check specific lines that were changed
3. Run `npm run build` to catch syntax errors
4. Don't assume changes worked - always verify

## Today's Learnings (Session End - 2025-02-27)

### CSS Debugging Best Practices
1. **Check computed styles in browser DevTools** - User reported .stat-value {color: #fff} which wasn't in source
2. **CSS specificity issues** - When color doesn't show, add !important to override conflicting rules
3. **CSS variables can be overridden** - var(--primary-color) might not work if overridden elsewhere
4. **Always verify built CSS** - Check docs/assets/*.css to see actual compiled output

### React Component Patterns
1. **Hover state management** - Pass hoveredResourceId state down through multiple components
2. **Event handlers** - Use onMouseEnter/onMouseLeave for hover, pass callbacks up to parent
3. **Conditional className** - Use template literals for dynamic classes

### Mobile Responsive Design
1. **Use viewport units for mobile** - 70vh for tablet, 60vh for mobile provides better UX than fixed pixels
2. **Always include min-height fallback** - min-height: 500px ensures usability on small screens
3. **Test multiple breakpoints** - 768px (tablet), 480px (mobile), 1024px (desktop)

### Stats Calculation Patterns
1. **Progress is typically 0-100%** - Divide by 100 to get decimal, multiply by total to get completed count
2. **Reduce with accumulator** - Use .reduce((sum, item) => sum + calculation, 0) for totals
3. **Handle missing data** - Always use || 0 or default values for undefined/null

### Geocoding & Address Handling
1. **Clean input data** - Remove newline characters and extra spaces before geocoding
2. **Implement fallback strategies** - Try full address  remove suite  city+state  zipcode  country
3. **Detect online services** - Check for "online", "virtual", "n/a" in address field
4. **Suite/building numbers break geocoding** - Detect patterns like "STE", "Suite", "Bldg", "Floor", "#"

### Map Features Implementation
1. **Debounce map movement** - Use 500ms timeout to avoid excessive API calls
2. **Fetch resources in bounds** - Query with gte/lte on lat/lng for visible area
3. **MapEventHandler component** - Separate component to listen to Leaflet's moveend event
4. **Hover highlighting** - Sync state between map markers and resource cards bidirectionally

### Development Workflow Improvements
1. **Run scripts immediately** - Don't wait for confirmation, execute right away
2. **Build after every change** - Catch errors early with npm run build
3. **Commit with descriptive messages** - Include what was fixed and why
4. **Hard refresh after deployment** - Ctrl+Shift+R to bypass cache

### Common Pitfalls to Avoid
1. **Don't assume CSS variables work** - Check computed styles, use explicit colors if needed
2. **Don't skip verification** - Always read files back after editing
3. **Don't forget duplicate declarations** - Search for existing code before adding new
4. **Don't use complex regex in scripts** - Keep replacements simple and targeted
5. **Don't forget to update both component and CSS** - Hover requires changes in both places

### Key Files Modified Today
- src/pages/MilestonePage.jsx - Added hover state, map movement filtering
- src/components/ResourceCard.jsx - Added hover props and handlers
- src/components/ResourceListings.jsx - Pass hover props to cards
- src/pages/MilestonePage.css - Mobile map height (70vh/60vh)
- src/components/InteractiveMap.css - Mobile map height adjustments
- src/pages/MyCourses.jsx - Fixed stats calculation
- src/pages/MyCourses.css - Fixed stat-value color with !important
- src/lib/geocoding.js - Comprehensive fallback strategies

### CRITICAL: CSS Conflicts Across Multiple Files (Added after stat-value fix)
**Problem**: Multiple CSS files defining the same class (.stat-value) caused conflicts
**Root Cause**: CSS cascade - last loaded file wins, causing unpredictable colors
**Files with conflicts found**:
- MyCourses.css - color: #4f46e5 (purple)
- AdminCareResources.css - color: #1a1a1a (dark gray)
- Community.css - color: #2C3744 (dark blue-gray)
- AdminDashboard.css - color: var(--primary-color)

**Proper Solution**: Scope selectors to component containers
- .my-courses .stat-value instead of .stat-value
- .admin-care-resources .stat-value instead of .stat-value
- .community-page .stat-value instead of .stat-value

**Lesson**: When CSS doesn't work as expected:
1. Search ALL CSS files for the selector: grepSearch with pattern .stat-value
2. Check for multiple definitions across different files
3. Use scoped selectors (parent class + child class) to prevent conflicts
4. Don't rely on !important alone - it's a band-aid, not a fix
