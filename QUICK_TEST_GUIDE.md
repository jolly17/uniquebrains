# 🚀 Quick Test Guide (2 Minutes)

## The Fastest Way to Test Realtime Features

### 1️⃣ Start Your App
```bash
npm run dev
```

### 2️⃣ Open Test Page
Go to: **http://localhost:5173/realtime-test**

### 3️⃣ Get a Course ID

**Easiest Method - Browser Console:**
1. Press `F12` to open DevTools
2. Go to Console tab
3. Paste this code:
```javascript
// Import supabase
import { supabase } from './src/lib/supabase.js'

// Get courses
const { data } = await supabase.from('courses').select('id, title').limit(1)
console.log('Course ID:', data[0]?.id)
```

**Or use Supabase Dashboard:**
- Go to Supabase → Table Editor → courses
- Copy any course ID

### 4️⃣ Test It!

**Window 1:**
1. Enter the course ID
2. Click "Start Test"
3. Type a message: "Hello from Window 1!"
4. Press Send

**Window 2 (new browser window):**
1. Go to same URL: `http://localhost:5173/realtime-test`
2. Sign in (can be same or different user)
3. Enter the SAME course ID
4. Click "Start Test"
5. **Watch the message appear instantly!** ✨

**Window 1 again:**
1. Type: "Testing realtime!"
2. Press Send
3. **See it appear in Window 2 instantly!** 🎉

### 5️⃣ What You Should See

```
Window 1                          Window 2
┌─────────────────────┐          ┌─────────────────────┐
│ 🟢 Connected        │          │ 🟢 Connected        │
│ 👥 2 online         │          │ 👥 2 online         │
│                     │          │                     │
│ You: Hello!         │   →→→    │ John: Hello!        │
│ [Send]              │          │ [Send]              │
└─────────────────────┘          └─────────────────────┘
```

## ✅ Success Checklist

- [ ] Connection shows "🟢 Connected"
- [ ] Online count shows "2 online"
- [ ] Messages appear in < 1 second
- [ ] Both windows can send/receive
- [ ] No errors in console

## ❌ Troubleshooting

**Problem:** "🔴 Disconnected"
- Check Supabase Realtime is enabled
- Verify `.env` has correct credentials

**Problem:** "Unauthorized"
- Make sure you're enrolled in the course
- Or you're the instructor of the course

**Problem:** Messages not appearing
- Verify both windows use SAME course ID
- Check browser console for errors

## 🎯 That's It!

If messages appear instantly in both windows, **realtime is working!** 🎉

Now you can integrate it into your actual chat components.

See `REALTIME_INTEGRATION_CHECKLIST.md` for next steps.
