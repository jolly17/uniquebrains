# Onboarding Flow for New OAuth Users

## ✅ What Was Added

I've implemented a proper onboarding flow that differentiates between sign-in and sign-up for OAuth users.

## How It Works Now

### Sign In (Existing User)
1. User clicks "Continue with Google" on **Login page**
2. Google authentication
3. Profile already exists (duplicate key error)
4. **Redirect directly to dashboard** based on role

### Sign Up (New User)
1. User clicks "Continue with Google" on **Register page**
2. Google authentication
3. Profile is created with name and email
4. **Redirect to Onboarding page** 🎉
5. User completes onboarding:
   - Selects role (Student/Instructor/Parent)
   - Fills in learning style (for students)
   - Fills in teaching approach (for instructors)
6. Redirect to appropriate dashboard

## Files Created

### 1. `src/pages/Onboarding.jsx`
- Welcome screen for new users
- Role selection (Student, Instructor, Parent)
- Learning style questionnaire (for students)
- Teaching approach (for instructors)
- Can skip and complete later

### 2. `src/pages/Onboarding.css`
- Beautiful, responsive styling
- Matches existing design system
- Mobile-friendly

### 3. Updated `src/pages/AuthCallback.jsx`
- Detects new vs returning users
- Redirects new users to onboarding
- Redirects returning users to dashboard

### 4. Updated `src/App.jsx`
- Added `/onboarding` route

## Features

### Role Selection
Users choose their role:
- 🎓 **Student** - Learn new skills
- 👨‍🏫 **Instructor** - Teach and inspire
- 👨‍👩‍👧‍👦 **Parent** - Manage children's learning

### Learning Style (Students)
Optional questionnaire about:
- Autism Spectrum
- ADHD
- Dyslexia
- Dysgraphia
- Dyscalculia
- Other

### Teaching Approach (Instructors)
Optional text area to describe:
- Teaching style
- Specializations
- Experience with neurodiverse learners

### Skip Option
Users can skip onboarding and complete it later from their profile page.

## Testing

### Test as New User

1. **Delete your profile** in Supabase:
   ```sql
   DELETE FROM profiles WHERE email = 'your@email.com';
   ```

2. **Sign in with Google** from Register page

3. **You should see**:
   - Welcome message with your name
   - Role selection cards
   - Learning style questionnaire
   - Complete Setup button

4. **Complete onboarding**:
   - Select a role
   - Fill in preferences (optional)
   - Click "Complete Setup"

5. **Verify**:
   - Redirected to appropriate page
   - Profile updated in database
   - Name shows in profile section

### Test as Returning User

1. **Sign out**

2. **Sign in with Google** from Login page

3. **You should**:
   - Skip onboarding
   - Go directly to dashboard
   - See your existing profile data

## User Experience

### New User Journey
```
Register Page
    ↓
Click "Continue with Google"
    ↓
Google Authentication
    ↓
Profile Created
    ↓
🎉 Onboarding Page 🎉
    ↓
Select Role & Preferences
    ↓
Dashboard
```

### Returning User Journey
```
Login Page
    ↓
Click "Continue with Google"
    ↓
Google Authentication
    ↓
Profile Exists
    ↓
Dashboard (Skip Onboarding)
```

## Benefits

✅ **Better UX** - New users get a personalized welcome
✅ **Data Collection** - Gather learning preferences upfront
✅ **Role Selection** - Users choose their role during signup
✅ **Optional** - Can skip and complete later
✅ **Differentiation** - Clear difference between sign-in and sign-up

## What's Stored

After onboarding, the profile is updated with:
- `role` - Selected role (student/instructor/parent)
- `bio` - Learning style or teaching approach notes

## Next Steps

You can enhance this further by:
1. Adding more onboarding steps (interests, goals, etc.)
2. Storing neurodiversity profile in a separate table
3. Adding progress indicators
4. Sending welcome email after onboarding
5. Showing onboarding completion status in profile

## Summary

**Before**: OAuth sign-in and sign-up were identical
**After**: New users go through onboarding, returning users skip it

The onboarding flow makes the signup experience much more personalized and helps collect important information about learning preferences! 🎉
