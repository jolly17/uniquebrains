# How to Test Realtime Features

## Quick Start (5 minutes)

### Step 1: Start Your Dev Server
```bash
npm run dev
```

### Step 2: Navigate to Test Page
Open your browser and go to:
```
http://localhost:5173/realtime-test
```

### Step 3: Get a Course ID

**Option A: Use Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Click "Table Editor" → "courses"
3. Copy any course ID (UUID format)

**Option B: Use Browser Console**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this code:
```javascript
const { data } = await supabase.from('courses').select('id, title').limit(5)
console.log(data)
```
4. Copy any course ID from the results

**Option C: Create a Test Course**
1. Sign in as an instructor
2. Go to "Create Course"
3. Fill in the form and create a course
4. Copy the course ID from the URL

### Step 4: Enter Course ID
1. Paste the course ID into the input field
2. Click "Start Test"

### Step 5: Open Second Window
1. Open a new browser window (or incognito window)
2. Go to `http://localhost:5173/realtime-test`
3. Sign in as a different user (or same user in incognito)
4. Enter the SAME course ID
5. Click "Start Test"

### Step 6: Test Messaging
1. Send a message in Window 1
2. Watch it appear instantly in Window 2! 🎉
3. Send a message in Window 2
4. Watch it appear instantly in Window 1! 🎉

## What You Should See

### ✅ Success Indicators
- Connection status shows "🟢 Connected"
- Messages appear in < 1 second
- Online user count shows "2 online" (or more)
- Messages persist after page refresh
- Timestamps are accurate

### ❌ If Something's Wrong

**"🔴 Disconnected" Status**
- Check Supabase Dashboard → Settings → API → Realtime is enabled
- Verify your `.env` file has correct Supabase credentials
- Check browser console for errors

**Messages Not Appearing**
- Verify both users are using the SAME course ID
- Check that you have access to the course (enrolled or instructor)
- Open browser console and look for errors
- Verify RLS policies allow reading messages

**"Unauthorized" Error**
- Make sure you're enrolled in the course OR you're the instructor
- Check RLS policies in Supabase Dashboard

## Advanced Testing

### Test Reconnection
1. Open DevTools → Network tab
2. Click "Offline" to simulate network loss
3. Wait 5 seconds
4. Click "Online" to restore connection
5. Verify it reconnects automatically

### Test Presence
1. Open 3+ browser windows
2. Sign in as different users
3. All join the same course
4. Watch the online count update in real-time

### Test Performance
1. Send 10 messages rapidly
2. All should appear instantly
3. Check Network tab for WebSocket connection (not HTTP polling)

### Test Cleanup
1. Open DevTools → Console
2. Navigate away from the test page
3. Look for "Channel unsubscribed" messages
4. Verify no memory leaks (Memory tab)

## Troubleshooting

### Problem: Can't Find Course ID
**Solution:** Create a test course first:
1. Sign in as instructor
2. Go to `/instructor/create-course`
3. Create a simple course
4. Use that course ID for testing

### Problem: "Course not found"
**Solution:** 
- Verify the course exists in your database
- Check that the course ID is correct (UUID format)
- Make sure you're enrolled or are the instructor

### Problem: Messages Not Syncing
**Solution:**
1. Check Supabase Dashboard → Database → Realtime
2. Verify "messages" table has Realtime enabled
3. Check RLS policies allow INSERT and SELECT
4. Look for errors in browser console

### Problem: "Max reconnection attempts reached"
**Solution:**
- Check your internet connection
- Verify Supabase project is active (not paused)
- Check Supabase status page
- Restart your dev server

## Browser Console Checks

### Good Signs ✅
```
Channel course:xxx:messages status: SUBSCRIBED
New message received via realtime: {...}
Presence sync: {...}
Message sent and broadcast: xxx
```

### Bad Signs ❌
```
Error setting up course message channel
Max reconnection attempts reached
Unauthorized: You do not have access to this course
WebSocket connection failed
```

## Testing Checklist

- [ ] Connection status shows "🟢 Connected"
- [ ] Messages appear instantly (< 1 second)
- [ ] Online user count updates correctly
- [ ] Messages persist after page refresh
- [ ] Reconnection works after network drop
- [ ] Multiple users can chat simultaneously
- [ ] No errors in browser console
- [ ] Channels clean up on page navigation

## Next Steps

Once testing is successful:

1. **Integrate into existing components:**
   - Update `CourseChat.jsx` to use realtime
   - Update `StudentChat.jsx` to use realtime
   - See `REALTIME_INTEGRATION_CHECKLIST.md`

2. **Add to production:**
   - Test with real users
   - Monitor performance
   - Set up error tracking

3. **Enhance features:**
   - Add typing indicators
   - Add read receipts
   - Add message reactions

## Need Help?

- **Documentation:** See `src/services/REALTIME_GUIDE.md`
- **Examples:** See `src/components/RealtimeChatExample.jsx`
- **Architecture:** See `.kiro/specs/backend-architecture/design.md`
- **Supabase Docs:** https://supabase.com/docs/guides/realtime

## Quick Demo Video Script

1. Open test page
2. Enter course ID
3. Show connection status
4. Open second window
5. Show online count increase
6. Send message in window 1
7. Show instant appearance in window 2
8. Send message in window 2
9. Show instant appearance in window 1
10. Close one window
11. Show online count decrease

That's it! You now have working realtime features! 🎉
