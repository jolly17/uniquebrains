# UniqueBrains User Stories

> **Purpose**: This document defines the core user stories that must work after any architectural change. Run `npm test` to verify all stories are functional.

---

## 📚 Course Stories

### US-001: Browse Courses
**As a** visitor  
**I want to** browse available courses  
**So that** I can find courses that interest me

**Acceptance Criteria:**
- [ ] Courses page loads without errors
- [ ] Published courses are displayed
- [ ] Course cards show title, description, instructor, category
- [ ] Category filter works
- [ ] Search filter works
- [ ] Clicking a course navigates to detail page

**Test:** `npm test -- --grep "US-001"`

---

### US-002: View Course Details
**As a** visitor  
**I want to** view course details  
**So that** I can decide if I want to enroll

**Acceptance Criteria:**
- [ ] Course detail page loads with course info
- [ ] Instructor name is displayed
- [ ] Course description is shown
- [ ] Session schedule is visible (if available)
- [ ] Enroll button is visible for logged-in users

**Test:** `npm test -- --grep "US-002"`

---

### US-003: Enroll in Course
**As a** logged-in user  
**I want to** enroll in a course  
**So that** I can access the course content

**Acceptance Criteria:**
- [ ] Enroll button is clickable
- [ ] Enrollment is saved to database
- [ ] User sees confirmation message
- [ ] Course appears in "My Courses"
- [ ] Enrollment count increases

**Test:** `npm test -- --grep "US-003"`

---

### US-004: View My Courses
**As a** logged-in user  
**I want to** see my enrolled courses  
**So that** I can access my learning

**Acceptance Criteria:**
- [ ] My Courses page loads
- [ ] Only enrolled courses are shown
- [ ] Course cards link to course detail
- [ ] Empty state shown if no enrollments

**Test:** `npm test -- --grep "US-004"`

---

## 💬 Community Stories

### US-005: Browse Community Topics
**As a** visitor  
**I want to** browse community topics  
**So that** I can find discussions that interest me

**Acceptance Criteria:**
- [ ] Community page loads without errors
- [ ] Topics are displayed with cover images
- [ ] Topic cards show name and description
- [ ] Question count is displayed
- [ ] Clicking a topic navigates to topic page

**Test:** `npm test -- --grep "US-005"`

---

### US-006: View Topic Questions
**As a** visitor  
**I want to** view questions in a topic  
**So that** I can read community discussions

**Acceptance Criteria:**
- [ ] Topic page loads with questions
- [ ] Questions show title and author
- [ ] Answer count is displayed
- [ ] Questions are sorted by date

**Test:** `npm test -- --grep "US-006"`

---

### US-007: Ask a Question
**As a** logged-in user  
**I want to** ask a question  
**So that** I can get help from the community

**Acceptance Criteria:**
- [ ] Ask question form is accessible
- [ ] Title and content fields work
- [ ] Question is saved to database
- [ ] User sees confirmation
- [ ] Question appears in topic

**Test:** `npm test -- --grep "US-007"`

---

### US-008: Answer a Question
**As a** logged-in user  
**I want to** answer a question  
**So that** I can help others in the community

**Acceptance Criteria:**
- [ ] Answer form is visible on question page
- [ ] Answer is saved to database
- [ ] Answer appears under question
- [ ] Answer count updates

**Test:** `npm test -- --grep "US-008"`

---

## 📖 Content Stories

### US-009: Browse Content
**As a** visitor  
**I want to** browse educational content  
**So that** I can learn about neurodiversity

**Acceptance Criteria:**
- [ ] Content page loads without errors
- [ ] Content cards are displayed
- [ ] Cards show title and description
- [ ] Clicking a card navigates to content page

**Test:** `npm test -- --grep "US-009"`

---

### US-010: View Content Article
**As a** visitor  
**I want to** read a content article  
**So that** I can learn about a specific topic

**Acceptance Criteria:**
- [ ] Article page loads
- [ ] Content is displayed correctly
- [ ] Navigation works (back button)

**Test:** `npm test -- --grep "US-010"`

---

## 🏥 Care Stories

### US-011: View Care Roadmap
**As a** visitor  
**I want to** view the care roadmap  
**So that** I can understand the care journey

**Acceptance Criteria:**
- [ ] Care page loads without errors
- [ ] Milestones are displayed
- [ ] Milestone cards are clickable
- [ ] Navigation between milestones works

**Test:** `npm test -- --grep "US-011"`

---

### US-012: View Milestone Resources
**As a** visitor  
**I want to** view resources for a milestone  
**So that** I can find relevant services

**Acceptance Criteria:**
- [ ] Milestone page loads
- [ ] Resources are displayed
- [ ] Filter by location works
- [ ] Resource details are accessible

**Test:** `npm test -- --grep "US-012"`

---

## 🔐 Authentication Stories

### US-013: User Registration
**As a** visitor  
**I want to** create an account  
**So that** I can access member features

**Acceptance Criteria:**
- [ ] Registration form loads
- [ ] Email/password fields work
- [ ] Validation errors are shown
- [ ] Account is created on submit
- [ ] User is redirected after registration

**Test:** `npm test -- --grep "US-013"`

---

### US-014: User Login
**As a** registered user  
**I want to** log in  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] Login form loads
- [ ] Email/password fields work
- [ ] Error shown for invalid credentials
- [ ] User is logged in on success
- [ ] User is redirected to dashboard

**Test:** `npm test -- --grep "US-014"`

---

### US-015: User Logout
**As a** logged-in user  
**I want to** log out  
**So that** I can secure my account

**Acceptance Criteria:**
- [ ] Logout button is visible
- [ ] Clicking logout clears session
- [ ] User is redirected to home page
- [ ] Protected routes are no longer accessible

**Test:** `npm test -- --grep "US-015"`

---

### US-016: OAuth Login
**As a** visitor  
**I want to** log in with Google  
**So that** I can use my existing account

**Acceptance Criteria:**
- [ ] Google login button is visible
- [ ] Clicking redirects to Google
- [ ] Callback handles authentication
- [ ] User profile is created/updated

**Test:** `npm test -- --grep "US-016"`

---

## 👤 Profile Stories

### US-017: View Profile
**As a** logged-in user  
**I want to** view my profile  
**So that** I can see my account information

**Acceptance Criteria:**
- [ ] Profile page loads
- [ ] User information is displayed
- [ ] Edit fields are available

**Test:** `npm test -- --grep "US-017"`

---

### US-018: Edit Profile
**As a** logged-in user  
**I want to** edit my profile  
**So that** I can update my information

**Acceptance Criteria:**
- [ ] Profile fields are editable
- [ ] Changes are saved to database
- [ ] Success message is shown
- [ ] Updated info is displayed

**Test:** `npm test -- --grep "US-018"`

---

## 🧭 Navigation Stories

### US-019: Main Navigation
**As a** visitor  
**I want to** navigate between pages  
**So that** I can explore the platform

**Acceptance Criteria:**
- [ ] Header navigation is visible
- [ ] All nav links work
- [ ] Active page is highlighted
- [ ] Mobile menu works

**Test:** `npm test -- --grep "US-019"`

---

### US-020: Footer Navigation
**As a** visitor  
**I want to** access footer links  
**So that** I can find additional information

**Acceptance Criteria:**
- [ ] Footer is visible
- [ ] Links to legal pages work
- [ ] Contact information is displayed

**Test:** `npm test -- --grep "US-020"`

---

## 🔄 Running Tests

### Run All User Story Tests
```bash
npm test
```

### Run Specific Story
```bash
npm test -- --grep "US-001"
```

### Run Story Category
```bash
# Course stories
npm test -- --grep "US-00[1-4]"

# Community stories
npm test -- --grep "US-00[5-8]"

# Auth stories
npm test -- --grep "US-01[3-6]"
```

### Run with Coverage
```bash
npm run test:coverage
```

---

## 📋 Pre-Release Checklist

Before any major release, verify:

- [ ] All unit tests pass (`npm test`)
- [ ] All user stories are functional (manual check)
- [ ] No console errors in browser
- [ ] Mobile responsive works
- [ ] Authentication flows work
- [ ] Database operations succeed

---

*Last Updated: March 2026*