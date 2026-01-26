# Dual Role Support - Design Decisions

## Decision Summary
This document captures the key design decisions made for the dual role support feature.

## 1. Role Switching During Workflows
**Question**: Should we allow role switching mid-workflow (e.g., while creating a course)?

**Decision**: ❌ **NO** - Dashboards will be distinct and separate

**Rationale**:
- Prevents confusion and data loss
- Maintains clear separation of concerns
- Simplifies implementation and testing
- Users complete workflows in one role, then switch

**Implementation**:
- Role toggle only available on dashboard pages
- Disabled or hidden during active workflows
- Clear navigation boundaries between roles

---

## 2. Notifications for Dual-Role Users
**Question**: How do we handle notifications for dual-role users?

**Decision**: ✅ **Show on either dashboard** - No role-specific filtering

**Rationale**:
- Simpler implementation
- Users see all relevant notifications regardless of current role
- Reduces risk of missing important updates
- Notifications naturally relate to the content being viewed

**Implementation**:
- Single notification system
- No role-based filtering logic needed
- Notifications appear contextually on relevant dashboards

---

## 3. Chat/Messaging Identity
**Question**: Should chat/messaging show different identities based on role?

**Decision**: ✅ **Separated by dashboard** - Sessions, homework, chat are role-specific

**Rationale**:
- Instructor chat is for courses they teach
- Parent chat is for courses they/children are enrolled in
- Natural separation prevents confusion
- Aligns with distinct dashboard architecture

**Implementation**:
- Instructor dashboard: Chat for courses user teaches
- Parent dashboard: Chat for courses user/children are enrolled in
- No unified chat identity needed
- Chat context determined by dashboard

---

## 4. Role-Specific Profile Information
**Question**: Do we need role-specific profile information?

**Decision**: ❌ **NOT necessary** - Single profile works for both roles

**Rationale**:
- Reduces complexity
- Both roles can use same profile fields (bio, learning style, etc.)
- Child management is universal, not role-specific
- Avoids duplicate data entry

**Implementation**:
- Single profile table and UI
- No role-specific profile sections
- Learning style and preferences apply to both roles
- Child management available to all users

---

## 5. Child Management Access
**Question**: Should child management be role-specific?

**Decision**: ✅ **Universal access** - Available to all users regardless of role

**Rationale**:
- Instructors may have children who need courses
- Organic discovery when instructors enroll in courses
- Simplifies user experience
- Reduces artificial barriers

**Implementation**:
- Child management in profile section (not dashboard-specific)
- Available to both instructors and parents
- Instructors discover naturally when enrolling
- No role checks required for child management

---

## 6. Terminology: Student vs Child
**Question**: What terminology should we use to avoid confusion?

**Decision**: ✅ **"Child Management"** instead of "Student Management"

**Rationale**:
- "Student" is ambiguous (course student vs. user's child)
- "Child" clearly refers to user's own children
- Reduces confusion for instructors
- More accurate and family-friendly

**Implementation**:
- Rename all "Student Management" to "Child Management"
- Update navigation labels
- Update page titles and headings
- Update button text and UI labels
- Update documentation

---

## 7. Portal Separation: Subdomain vs Path-Based
**Question**: Should we use subdomains (teach.uniquebrains.org) or paths (/teach)?

**Decision**: ✅ **Path-based routing** (/teach and /learn)

**Rationale**:
- Works immediately with GitHub Pages (no DNS setup)
- Simpler to implement and maintain
- Same codebase, just different routes
- Easy to bookmark and share
- Can upgrade to subdomains later if needed

**Implementation**:
```
uniquebrains.org/teach → Teaching portal
uniquebrains.org/learn → Learning portal
```

**Benefits**:
- ✅ Zero infrastructure changes needed
- ✅ Works with free GitHub Pages hosting
- ✅ Clear URL structure
- ✅ Easy to test and develop locally
- ✅ Can migrate to subdomains later without code changes

---

## 8. Portal Switching UI: Toggle vs Link
**Question**: Should we use a prominent toggle or simple link for switching?

**Decision**: ✅ **Simple link in footer** (not prominent toggle)

**Rationale**:
- Most users will only use one portal
- Path-based URLs make switching natural (just change URL)
- Link is less intrusive than toggle
- Clearer mental model (different URLs = different places)

**Implementation**:
- Footer link: "Switch to Teaching Portal →"
- Also available in profile dropdown
- Only shown when user has both portal capabilities

**Benefits**:
- ✅ Doesn't clutter navigation
- ✅ Clear action (navigate to different portal)
- ✅ Aligns with path-based architecture
- ✅ Easy to discover but not distracting

---

## Architecture Decisions

### Path-Based Portal Separation
- **Decision**: Use `/teach` and `/learn` paths for role separation
- **Rationale**: Clear URLs, easy to bookmark, no DNS setup needed
- **Trade-off**: Path-based vs. subdomain (simpler, works with GitHub Pages)
- **Implementation**: Detect path on load, set active role accordingly

### Portal Switching via Links
- **Decision**: Provide "Switch to Teaching/Learning Portal" links in footer/profile
- **Rationale**: Simple, discoverable, no prominent toggle needed
- **Trade-off**: Extra navigation vs. in-page toggle (clearer mental model)

### Application-Layer Role Management
- **Decision**: Manage dual roles in application layer, not database
- **Rationale**: No breaking changes, easier rollback, faster implementation
- **Trade-off**: Slightly more complex application logic vs. simpler database queries

### Role Detection via Activities
- **Decision**: Detect roles based on courses created and enrollments
- **Rationale**: Automatic, no manual role assignment needed
- **Trade-off**: Requires queries on login vs. stored role array

### Shared Marketplace with Role-Specific CTAs
- **Decision**: One marketplace accessible from both portals
- **Rationale**: All users see all courses, buttons adapt to role
- **Trade-off**: Shared vs. separate marketplaces (simpler, less duplication)

### Distinct Dashboard Architecture
- **Decision**: Completely separate instructor and parent dashboards
- **Rationale**: Clear separation, no content mixing, easier to maintain
- **Trade-off**: Some code duplication vs. complex conditional rendering

---

## Future Considerations

### Potential Enhancements
1. **Role-specific notifications** - If user feedback indicates need
2. **Unified chat identity** - If users want single identity across roles
3. **Role-specific profile sections** - If distinct information needed
4. **Mid-workflow role switching** - If users request this capability
5. **Database schema migration** - For true multi-role support at scale

### When to Revisit
- After 3 months of user feedback
- If >30% of users have dual roles
- If support tickets indicate confusion
- If performance issues arise from role detection queries

---

## Decision Log

| Date | Decision | Made By | Status |
|------|----------|---------|--------|
| 2026-01-26 | No mid-workflow portal switching | User | ✅ Final |
| 2026-01-26 | Notifications on either dashboard | User | ✅ Final |
| 2026-01-26 | Chat separated by dashboard | User | ✅ Final |
| 2026-01-26 | No role-specific profile info | User | ✅ Final |
| 2026-01-26 | Universal child management | User | ✅ Final |
| 2026-01-26 | Rename to "Child Management" | User | ✅ Final |
| 2026-01-26 | Path-based routing (/teach, /learn) | User | ✅ Final |
| 2026-01-26 | Simple link (not toggle) for switching | User | ✅ Final |

---

**Last Updated**: January 26, 2026  
**Status**: All decisions finalized, ready for implementation
