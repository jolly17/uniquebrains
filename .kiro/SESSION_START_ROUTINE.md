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
