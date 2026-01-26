# Dual Role Support Feature Spec

## Overview
This spec implements dual role support for the UniqueBrains platform, allowing users to function as both instructors and parents within a single account. The feature enables seamless role switching without requiring multiple accounts or complex database schema changes.

## Problem Statement
Currently, users can only have ONE role (instructor OR parent), not both. This creates friction for users who want to:
- Teach courses AND manage their children's learning
- Enroll in courses as a learner while also being an instructor
- Access both instructor and parent features without maintaining separate accounts

## Solution
Implement path-based portal separation that:
1. Uses `/teach` and `/learn` URL paths for clear role separation
2. Detects user capabilities based on activities (courses created, enrollments)
3. Provides portal switching links when both capabilities exist
4. Maintains portal preference across sessions
5. Adapts navigation and dashboard based on active portal
6. Requires NO database schema changes

## Key Features
- ✅ Path-based portal separation (/teach and /learn)
- ✅ Portal detection based on user activities
- ✅ Simple portal switcher links (not prominent toggle)
- ✅ Persistent portal preference (localStorage)
- ✅ Portal-specific dashboards and navigation
- ✅ Completely separate portals (no mid-workflow switching)
- ✅ Shared marketplace with portal-specific CTAs
- ✅ Instructors can enroll in courses
- ✅ Parents can create courses
- ✅ Universal child management (all users)
- ✅ Renamed "Student Management" to "Child Management"
- ✅ No breaking changes to existing functionality

## Documents
- **requirements.md** - User stories and acceptance criteria
- **design.md** - Technical architecture and implementation details
- **tasks.md** - Detailed implementation task list
- **DECISIONS.md** - Design decisions and rationale
- **ARCHITECTURE.md** - Visual diagrams and architecture overview

## Quick Start
1. Read `requirements.md` to understand user needs
2. Review `design.md` for technical approach
3. Follow `tasks.md` for implementation steps

## Status
📋 **Status**: Ready for Implementation  
🎯 **Priority**: High (URGENT - Next Session)  
📅 **Target**: Current Sprint  
👤 **Owner**: TBD

## Dependencies
- Existing authentication system (AuthContext)
- Profile management system
- Course creation and enrollment services
- Navigation and routing system

## Success Metrics
- Users can switch between roles without errors
- No increase in authentication-related support tickets
- Reduced need for multiple accounts
- Increased user engagement in both roles

## Related Issues
- PROJECT_BOARD.md - Dual Role Support (URGENT)
- Current blocker for users wanting both instructor and parent capabilities

## Timeline Estimate
- **Phase 1-2** (Core + Portal Switcher): 2-3 days
- **Phase 3-4** (Routing + Dashboards): 2-3 days
- **Phase 5-6** (Marketplace + Auth): 2-3 days
- **Phase 7** (Parent Course Creation): 1 day
- **Phase 8-9** (Testing + Polish): 2-3 days
- **Total**: 9-13 days

## Notes
- No database migrations required
- Backward compatible with existing users
- Can be rolled back easily if issues arise
- Foundation for future multi-role enhancements
