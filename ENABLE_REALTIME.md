# Enable Supabase Realtime

## The Problem

Messages are being saved to the database, but they don't appear in real-time. You have to refresh the page to see new messages. This means **Supabase Realtime is not enabled**.

## Quick Fix (2 minutes)

### Step 1: Run Diagnostics

Go to: **http://localhost:5173/realtime-debug**

Click **"🚀 Run Diagnostics"**

Look for this result:
- ❌ **Channel Subscription** - Error: Subscription timeout or Channel error

This confirms Realtime is not enabled.

### Step 2: Enable Realtime in Supabase

1. **Go to your Supabase Dashboard**
   - https://supabase.com/dashboard

2. **Navigate to Database → Replication**
   - Click "Database" in the left sidebar
   - Click "Replication" tab

3. **Enable replication for the `messages` table**
   - Find the `messages` table in the list
   - Toggle the switch to **ON** (it will turn green)
   - You should see: "Replication enabled for messages"

4. **Wait 30 seconds**
   - Supabase needs time to apply the changes
   - The replication setup happens in the background

5. **Run diagnostics again**
   - Go back to: http://localhost:5173/realtime-debug
   - Click "Run Diagnostics"
   - You should now see: ✅ **Channel Subscription** - Status: SUBSCRIBED

### Step 3: Test Realtime

1. Go to: http://localhost:5173/realtime-test
2. Enter your course ID
3. Open a second window
4. Send a message in window 1
5. **It should appear instantly in window 2!** ✨

---

## Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│ Supabase Dashboard                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Database → Replication                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Table Name          │ Replication │ Actions         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ profiles            │ ⚪ OFF      │ [Enable]        │   │
│  │ courses             │ ⚪ OFF      │ [Enable]        │   │
│  │ messages            │ ⚪ OFF      │ [Enable] ← CLICK│   │
│  │ enrollments         │ ⚪ OFF      │ [Enable]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  After clicking Enable:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ messages            │ 🟢 ON       │ [Disable]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## What is Replication?

Supabase Realtime uses PostgreSQL's replication feature to broadcast database changes via WebSocket. When you:

1. **Insert a message** → Database triggers a change event
2. **Replication captures it** → Sends to Realtime server
3. **Realtime broadcasts** → All subscribed clients receive it instantly
4. **Your app updates** → Message appears without refresh

Without replication enabled, step 2 doesn't happen, so messages only appear on refresh.

---

## Alternative: Enable via SQL

If you prefer SQL, you can enable replication with:

```sql
-- Enable replication for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Verify it's enabled
SELECT schemaname, tablename, replica_identity 
FROM pg_tables 
WHERE tablename = 'messages';
```

---

## Troubleshooting

### "I don't see the Replication tab"

**Solution:** You might be on an older Supabase project. Try:
1. Go to **Settings → API**
2. Look for "Realtime" section
3. Enable "Realtime API"

### "Replication is enabled but still not working"

**Check these:**
1. **Wait 30-60 seconds** after enabling
2. **Refresh your app** (hard refresh: Ctrl+Shift+R)
3. **Check browser console** for WebSocket errors
4. **Run diagnostics** to see specific error

### "Channel subscription times out"

**Possible causes:**
1. Firewall blocking WebSocket connections
2. Corporate network blocking port 443 WebSocket
3. Browser extension blocking WebSocket
4. Supabase project paused (free tier inactivity)

**Solutions:**
- Try different network (mobile hotspot)
- Disable browser extensions
- Check Supabase project status

### "WebSocket connection failed"

**Check:**
1. Your `.env` file has correct `VITE_SUPABASE_URL`
2. The URL is accessible (try opening in browser)
3. No typos in the URL
4. Project is not paused

---

## Verify It's Working

### Browser Console (F12)

You should see logs like:
```
Channel course:xxx:messages status: SUBSCRIBED ✅
New message received via realtime: {...} ✅
Presence sync: {...} ✅
```

### Network Tab

You should see:
- WebSocket connection to `wss://your-project.supabase.co/realtime/v1/websocket`
- Status: 101 Switching Protocols
- Type: websocket

### Diagnostics Page

All tests should pass:
- ✅ Supabase Connection
- ✅ Authentication
- ✅ Messages Table Access
- ✅ Channel Creation
- ✅ Channel Subscription ← Most important!
- ✅ Realtime Client

---

## Next Steps

Once Realtime is enabled:

1. ✅ Messages appear instantly (< 1 second)
2. ✅ Online user count updates in real-time
3. ✅ No page refresh needed
4. ✅ Multiple users can chat simultaneously

---

## Quick Links

- **Diagnostics:** http://localhost:5173/realtime-debug
- **Test Page:** http://localhost:5173/realtime-test
- **Setup Page:** http://localhost:5173/realtime-setup
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Realtime Docs:** https://supabase.com/docs/guides/realtime

---

## Summary

**Problem:** Messages only appear on refresh
**Cause:** Supabase Realtime not enabled
**Solution:** Enable replication for `messages` table in Supabase Dashboard
**Time:** 2 minutes
**Result:** Instant message delivery! ✨
