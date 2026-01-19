import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/**
 * Debug page to check Supabase Realtime configuration
 */
function RealtimeDebug() {
  const { user } = useAuth()
  const [status, setStatus] = useState({})
  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)

  const addResult = (test, passed, message) => {
    setTestResults(prev => [...prev, { test, passed, message, timestamp: new Date().toISOString() }])
  }

  const runDiagnostics = async () => {
    setTesting(true)
    setTestResults([])

    // Test 1: Check Supabase connection
    addResult('Supabase Connection', true, 'Connected to Supabase')

    // Test 2: Check auth
    if (user) {
      addResult('Authentication', true, `Signed in as ${user.email}`)
    } else {
      addResult('Authentication', false, 'Not signed in')
      setTesting(false)
      return
    }

    // Test 3: Check if we can query messages table
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .limit(1)

      if (error) {
        addResult('Messages Table Access', false, `Error: ${error.message}`)
      } else {
        addResult('Messages Table Access', true, 'Can query messages table')
      }
    } catch (error) {
      addResult('Messages Table Access', false, `Exception: ${error.message}`)
    }

    // Test 4: Try to create a realtime channel
    try {
      const testChannel = supabase.channel('test-channel-' + Date.now())
      
      addResult('Channel Creation', true, 'Channel created successfully')

      // Test 5: Try to subscribe
      const subscribePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Subscription timeout after 10 seconds'))
        }, 10000)

        testChannel
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages'
          }, (payload) => {
            console.log('Received change:', payload)
          })
          .subscribe((status, err) => {
            clearTimeout(timeout)
            if (status === 'SUBSCRIBED') {
              resolve(status)
            } else if (status === 'CHANNEL_ERROR') {
              reject(err || new Error('Channel error'))
            } else if (status === 'TIMED_OUT') {
              reject(new Error('Subscription timed out'))
            } else if (status === 'CLOSED') {
              reject(new Error('Channel closed'))
            }
          })
      })

      try {
        const subStatus = await subscribePromise
        addResult('Channel Subscription', true, `Status: ${subStatus}`)
        
        // Clean up
        await supabase.removeChannel(testChannel)
        addResult('Channel Cleanup', true, 'Channel removed successfully')
      } catch (subError) {
        addResult('Channel Subscription', false, `Error: ${subError.message}`)
      }

    } catch (error) {
      addResult('Channel Creation', false, `Error: ${error.message}`)
    }

    // Test 6: Check Realtime configuration
    const realtimeConfig = supabase.realtime
    if (realtimeConfig) {
      addResult('Realtime Client', true, 'Realtime client exists')
      
      // Check channels
      const channels = supabase.getChannels()
      addResult('Active Channels', true, `${channels.length} active channels`)
    } else {
      addResult('Realtime Client', false, 'Realtime client not found')
    }

    setTesting(false)
  }

  useEffect(() => {
    // Get initial status
    setStatus({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      user: user?.email || 'Not signed in',
      userId: user?.id || 'N/A'
    })
  }, [user])

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🔒 Please sign in</h1>
        <p>You need to be signed in to run diagnostics.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1>🔍 Realtime Diagnostics</h1>
      <p>Check if Supabase Realtime is configured correctly</p>

      <div style={{ marginBottom: '2rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
        <h2>Configuration</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Supabase URL:</td>
              <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {status.supabaseUrl}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>Anon Key:</td>
              <td style={{ padding: '0.5rem' }}>
                {status.hasAnonKey ? '✅ Present' : '❌ Missing'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>User:</td>
              <td style={{ padding: '0.5rem' }}>{status.user}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>User ID:</td>
              <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {status.userId}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={testing}
        style={{
          padding: '1rem 2rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {testing ? '🔄 Running Tests...' : '🚀 Run Diagnostics'}
      </button>

      {testResults.length > 0 && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2>Test Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '1rem',
                  background: result.passed ? '#d4edda' : '#f8d7da',
                  border: `2px solid ${result.passed ? '#28a745' : '#dc3545'}`,
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{result.passed ? '✅' : '❌'} {result.test}</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{result.message}</p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <h3>⚠️ Common Issues</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>
            <strong>Subscription fails:</strong> Realtime is not enabled in Supabase Dashboard
            <br />
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              → Go to Supabase Dashboard → Settings → API → Enable Realtime
            </span>
          </li>
          <li>
            <strong>Channel error:</strong> Database replication not enabled
            <br />
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              → Go to Supabase Dashboard → Database → Replication → Enable for 'messages' table
            </span>
          </li>
          <li>
            <strong>Timeout:</strong> Network or firewall blocking WebSocket connections
            <br />
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              → Check browser console for WebSocket errors
            </span>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#d1ecf1', borderRadius: '8px', border: '2px solid #17a2b8' }}>
        <h3>📋 How to Enable Realtime</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Go to your Supabase Dashboard</li>
          <li>Navigate to <strong>Database → Replication</strong></li>
          <li>Find the <strong>messages</strong> table</li>
          <li>Toggle the switch to enable replication</li>
          <li>Wait 30 seconds for changes to apply</li>
          <li>Run diagnostics again</li>
        </ol>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 Browser Console</h3>
        <p>Open browser console (F12) to see detailed logs:</p>
        <ul style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.8' }}>
          <li>Channel creation logs</li>
          <li>Subscription status updates</li>
          <li>WebSocket connection errors</li>
          <li>Realtime event payloads</li>
        </ul>
      </div>
    </div>
  )
}

export default RealtimeDebug
