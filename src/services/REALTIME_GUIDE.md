# Realtime Features Guide

This guide explains how to use the Supabase Realtime features implemented for the UniqueBrains platform.

## Overview

The realtime service provides:
- **Message Broadcasting**: Instant message delivery to all course participants
- **Presence Tracking**: See who's online in a course
- **Connection Management**: Automatic reconnection and resource cleanup
- **Notification Channels**: Real-time user notifications

## Architecture

### Requirements Validation
- ✅ **Requirement 5.1**: WebSocket connections for real-time data
- ✅ **Requirement 5.2**: Message broadcasting within 1 second
- ✅ **Requirement 5.3**: Connection state management and reconnection
- ✅ **Requirement 5.4**: Presence detection (online/offline status)
- ✅ **Requirement 5.5**: Resource cleanup within 30 seconds

### How It Works

1. **Database Changes → Realtime Events**: When a message is inserted into the database, Supabase automatically broadcasts it to all subscribed clients via WebSocket
2. **No Polling**: Unlike the old implementation, there's no need to poll for new messages
3. **Automatic Reconnection**: If connection drops, the system automatically attempts to reconnect
4. **Resource Cleanup**: All channels are properly cleaned up when components unmount

## Usage

### 1. Course Messages (React Hook)

The easiest way to use realtime messages in a React component:

```javascript
import { useCourseMessages } from '../hooks/useRealtime'
import { sendMessage } from '../services/messageService'

function ChatComponent({ courseId }) {
  const { isConnected } = useCourseMessages(courseId, {
    onMessage: (newMessage) => {
      console.log('New message:', newMessage)
      // Update your UI with the new message
    },
    onUpdate: (updatedMessage) => {
      console.log('Message updated:', updatedMessage)
    },
    onDelete: (deletedMessage) => {
      console.log('Message deleted:', deletedMessage)
    }
  })

  const handleSend = async () => {
    // Send message - it will be broadcast automatically
    await sendMessage(courseId, { content: 'Hello!' }, userId)
  }

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {/* Your chat UI */}
    </div>
  )
}
```

### 2. Presence Tracking (React Hook)

Track who's online in a course:

```javascript
import { usePresence } from '../hooks/useRealtime'

function CourseParticipants({ courseId, userId }) {
  const { presenceState, isConnected } = usePresence(
    courseId,
    userId,
    { full_name: 'John Doe', role: 'student' },
    {
      onJoin: (key, newPresences) => {
        console.log('User joined:', newPresences)
      },
      onLeave: (key, leftPresences) => {
        console.log('User left:', leftPresences)
      }
    }
  )

  const onlineUsers = Object.keys(presenceState).length

  return (
    <div>
      <p>{onlineUsers} users online</p>
      {/* Display online users */}
    </div>
  )
}
```

### 3. Notifications (React Hook)

Receive real-time notifications:

```javascript
import { useNotifications } from '../hooks/useRealtime'

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])

  const { isConnected } = useNotifications(userId, (notification) => {
    console.log('New notification:', notification)
    setNotifications(prev => [...prev, notification])
  })

  return (
    <div>
      <span>🔔 {notifications.length}</span>
    </div>
  )
}
```

### 4. Connection Management (React Hook)

Monitor and control connection state:

```javascript
import { useConnectionManager } from '../hooks/useRealtime'

function App() {
  const { 
    connectionState, 
    isConnected, 
    reconnect 
  } = useConnectionManager({
    onStateChange: (newState) => {
      console.log('Connection state:', newState)
    },
    onReconnect: () => {
      console.log('Reconnected successfully')
    },
    onReconnectFailed: (error) => {
      console.error('Reconnection failed:', error)
    }
  })

  return (
    <div>
      <div>Status: {connectionState}</div>
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  )
}
```

## Direct Service Usage (Without Hooks)

If you need more control, you can use the services directly:

### Course Message Channel

```javascript
import { setupCourseMessageChannel } from '../services/realtimeService'

const channel = setupCourseMessageChannel('course-id', {
  onMessage: (msg) => console.log('New message:', msg),
  onUpdate: (msg) => console.log('Updated:', msg),
  onDelete: (msg) => console.log('Deleted:', msg)
})

// Later, clean up
await channel.unsubscribe()
```

### Presence Tracking

```javascript
import { setupPresenceTracking } from '../services/realtimeService'

const presence = setupPresenceTracking(
  'course-id',
  'user-id',
  { full_name: 'John Doe', role: 'student' },
  {
    onSync: (state) => console.log('Presence state:', state),
    onJoin: (key, presences) => console.log('Joined:', presences),
    onLeave: (key, presences) => console.log('Left:', presences)
  }
)

// Update presence
await presence.track({ status: 'typing' })

// Get current state
const state = presence.getPresenceState()

// Clean up
await presence.unsubscribe()
```

### Custom Event Broadcasting

```javascript
import { broadcastEvent, sendTypingIndicator } from '../services/messageService'

// Send typing indicator
await sendTypingIndicator('course-id', 'user-id', true)

// Send custom event
await broadcastEvent('course-id', 'custom-event', { data: 'value' })
```

## Connection Management

### Automatic Reconnection

The system automatically attempts to reconnect if the connection drops:
- Maximum 5 reconnection attempts
- Exponential backoff (2s, 4s, 6s, 8s, 10s)
- Automatic cleanup after max attempts

### Manual Control

```javascript
import { 
  initializeConnectionManager,
  handleDisconnection,
  cleanupOnUnload 
} from '../services/realtimeService'

// Initialize manager
const manager = initializeConnectionManager({
  onStateChange: (state) => console.log('State:', state),
  onReconnect: () => console.log('Reconnected'),
  onReconnectFailed: (err) => console.error('Failed:', err)
})

// Manual disconnect
await manager.disconnect()

// Manual reconnect
await manager.reconnect()

// Cleanup (call in useEffect cleanup)
await cleanupOnUnload()
```

## Best Practices

### 1. Always Clean Up

```javascript
useEffect(() => {
  const channel = setupCourseMessageChannel(courseId, callbacks)
  
  return () => {
    channel.unsubscribe() // Always unsubscribe on unmount
  }
}, [courseId])
```

### 2. Handle Connection States

```javascript
const { isConnected } = useCourseMessages(courseId, callbacks)

// Disable send button when disconnected
<button disabled={!isConnected}>Send</button>
```

### 3. Avoid Duplicate Channels

The service automatically prevents duplicate channels, but it's best to:
- Use React hooks (they handle this automatically)
- Only create channels when needed
- Clean up properly

### 4. Optimize Presence Updates

```javascript
// Don't update presence too frequently
const debouncedTrack = debounce((status) => {
  presence.track({ status })
}, 1000)
```

## Migration from Polling

If you're migrating from the old polling-based approach:

### Before (Polling)
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    loadMessages() // Poll every 5 seconds
  }, 5000)
  
  return () => clearInterval(interval)
}, [])
```

### After (Realtime)
```javascript
const { isConnected } = useCourseMessages(courseId, {
  onMessage: (msg) => {
    setMessages(prev => [...prev, msg]) // Instant updates
  }
})
```

## Troubleshooting

### Messages Not Appearing

1. Check connection status: `isConnected` should be `true`
2. Verify RLS policies allow reading messages
3. Check browser console for errors
4. Ensure Supabase Realtime is enabled in your project

### Connection Keeps Dropping

1. Check network stability
2. Verify Supabase project is active
3. Check for rate limiting
4. Review browser console for errors

### Presence Not Working

1. Ensure you're calling `track()` after subscription
2. Check that presence callbacks are set up correctly
3. Verify multiple users are actually connected

## Performance Considerations

- **Channel Limits**: Supabase free tier supports up to 200 concurrent connections
- **Message Size**: Keep messages under 2000 characters
- **Presence Updates**: Don't update presence more than once per second
- **Cleanup**: Always unsubscribe to free resources

## Security

- All realtime channels respect Row Level Security (RLS) policies
- Users can only receive updates for data they have access to
- WebSocket connections are encrypted (TLS)
- Authentication is handled via JWT tokens

## Testing

See `RealtimeChatExample.jsx` for a complete working example.

To test:
1. Open the app in two browser windows
2. Sign in as different users
3. Send a message in one window
4. See it appear instantly in the other window

## Further Reading

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Supabase Presence Documentation](https://supabase.com/docs/guides/realtime/presence)
- [Backend Architecture Design](../../.kiro/specs/backend-architecture/design.md)
