import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RealtimeChatExample from '../components/RealtimeChatExample'
import './RealtimeTest.css'

/**
 * Test page for realtime features
 * Access at: /realtime-test
 */
function RealtimeTest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [testCourseId, setTestCourseId] = useState(searchParams.get('courseId') || '')
  const [isTestingChat, setIsTestingChat] = useState(false)

  if (!user) {
    return (
      <div className="realtime-test-page">
        <div className="test-container">
          <h1>🔒 Authentication Required</h1>
          <p>Please sign in to test realtime features.</p>
        </div>
      </div>
    )
  }

  const handleStartTest = () => {
    if (!testCourseId.trim()) {
      alert('Please enter a course ID')
      return
    }
    setIsTestingChat(true)
  }

  const handleStopTest = () => {
    setIsTestingChat(false)
  }

  return (
    <div className="realtime-test-page">
      <div className="test-header">
        <h1>🧪 Realtime Features Test</h1>
        <p>Test the Supabase Realtime implementation</p>
      </div>

      {!isTestingChat ? (
        <div className="test-setup">
          <div className="test-card">
            <h2>Setup Test</h2>
            
            <div className="user-info">
              <h3>Current User</h3>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>ID:</strong> {user.id}</p>
            </div>

            <div className="course-input">
              <h3>Enter Course ID</h3>
              <p>You can use any course ID from your database, or create a test course first.</p>
              
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>⚠️ Getting "Unauthorized" error?</p>
                <p style={{ margin: '0.5rem 0' }}>You need to be enrolled in the course or be the instructor.</p>
                <button
                  onClick={() => navigate('/realtime-setup')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                  }}
                >
                  🛠️ Go to Setup Page
                </button>
              </div>
              
              <input
                type="text"
                value={testCourseId}
                onChange={(e) => setTestCourseId(e.target.value)}
                placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                className="course-id-input"
              />
              <button 
                onClick={handleStartTest}
                className="btn btn-primary"
                disabled={!testCourseId.trim()}
              >
                Start Test
              </button>
            </div>

            <div className="test-instructions">
              <h3>📋 Testing Instructions</h3>
              <ol>
                <li>Enter a valid course ID above (or create a test course)</li>
                <li>Click "Start Test" to open the realtime chat</li>
                <li>Open this page in another browser window (or incognito)</li>
                <li>Sign in as a different user in the second window</li>
                <li>Enter the same course ID in both windows</li>
                <li>Send messages and watch them appear instantly!</li>
              </ol>

              <div className="test-tips">
                <h4>💡 What to Look For:</h4>
                <ul>
                  <li>✅ Connection status shows "🟢 Connected"</li>
                  <li>✅ Messages appear in &lt;1 second</li>
                  <li>✅ Online user count updates</li>
                  <li>✅ Messages persist after page refresh</li>
                  <li>✅ Reconnection works after network drop</li>
                </ul>
              </div>

              <div className="test-tips warning">
                <h4>⚠️ Prerequisites:</h4>
                <ul>
                  <li>Supabase Realtime must be enabled in your project</li>
                  <li>The course must exist in your database</li>
                  <li>You must be enrolled in the course (or be the instructor)</li>
                  <li>RLS policies must allow you to read/write messages</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="test-card">
            <h2>Quick Course Lookup</h2>
            <p>If you don't have a course ID handy, you can:</p>
            <ol>
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to Table Editor → courses</li>
              <li>Copy any course ID</li>
              <li>Or create a test course in your app first</li>
            </ol>

            <div className="test-tips info">
              <h4>🔍 Alternative: Use Browser Console</h4>
              <p>Open browser console and run:</p>
              <pre>
{`// Get your courses
const { data } = await supabase
  .from('courses')
  .select('id, title')
  .limit(5)
console.log(data)`}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="test-chat-container">
          <div className="test-controls">
            <button 
              onClick={handleStopTest}
              className="btn btn-secondary"
            >
              ← Back to Setup
            </button>
            <div className="test-info">
              <span>Testing Course ID: <code>{testCourseId}</code></span>
            </div>
          </div>

          <div className="test-chat-wrapper">
            <RealtimeChatExample courseId={testCourseId} />
          </div>

          <div className="test-footer">
            <div className="test-tips success">
              <h4>✅ Testing Tips:</h4>
              <ul>
                <li>Open this same page in another browser window</li>
                <li>Sign in as a different user</li>
                <li>Use the same course ID: <code>{testCourseId}</code></li>
                <li>Send messages back and forth</li>
                <li>Watch the online user count change</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="test-documentation">
        <h2>📚 Documentation</h2>
        <div className="doc-links">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('See: src/services/REALTIME_GUIDE.md') }}>
            📖 Realtime Guide
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('See: REALTIME_IMPLEMENTATION_SUMMARY.md') }}>
            📋 Implementation Summary
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('See: REALTIME_INTEGRATION_CHECKLIST.md') }}>
            ✅ Integration Checklist
          </a>
        </div>
      </div>
    </div>
  )
}

export default RealtimeTest
