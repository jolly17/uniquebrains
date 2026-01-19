import { useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Ultra-simple realtime test - just checks if WebSocket connects
 */
function SimpleRealtimeTest() {
  const [status, setStatus] = useState('Not started')
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  const testConnection = async () => {
    setStatus('Testing...')
    setLogs([])
    
    addLog('Creating channel...')
    const channel = supabase.channel('simple-test-' + Date.now())
    
    addLog('Subscribing to channel...')
    channel
      .on('broadcast', { event: 'test' }, (payload) => {
        addLog('✅ Received broadcast: ' + JSON.stringify(payload))
      })
      .subscribe((status, err) => {
        addLog(`Subscribe status: ${status}`)
        if (err) {
          addLog(`Error: ${JSON.stringify(err)}`)
        }
        
        if (status === 'SUBSCRIBED') {
          setStatus('✅ Connected!')
          addLog('✅ Successfully subscribed!')
          
          // Try to send a message
          setTimeout(async () => {
            addLog('Sending test broadcast...')
            const result = await channel.send({
              type: 'broadcast',
              event: 'test',
              payload: { message: 'Hello!' }
            })
            addLog(`Send result: ${result}`)
          }, 1000)
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('❌ Failed')
          addLog('❌ Channel error')
        } else if (status === 'TIMED_OUT') {
          setStatus('❌ Timeout')
          addLog('❌ Connection timed out')
        }
      })
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h1>🧪 Simple Realtime Test</h1>
      <p>This tests if Supabase Realtime WebSocket connection works</p>

      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Configuration</h3>
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <button
        onClick={testConnection}
        style={{
          padding: '1rem 2rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '2rem'
        }}
      >
        🚀 Test Connection
      </button>

      {logs.length > 0 && (
        <div style={{ background: '#2c3e50', color: '#ecf0f1', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <h3 style={{ color: '#ecf0f1', marginTop: 0 }}>Console Log:</h3>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.5rem' }}>{log}</div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
        <h3>⚠️ About the Cookie Warning</h3>
        <p>If you see: <code>Cookie "__cf_bm" has been rejected for invalid domain</code></p>
        <p><strong>This is normal and harmless!</strong> It's a Cloudflare cookie warning that doesn't affect functionality.</p>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#d1ecf1', borderRadius: '8px', border: '2px solid #17a2b8' }}>
        <h3>✅ What Success Looks Like</h3>
        <ul>
          <li>Status shows: "✅ Connected!"</li>
          <li>Log shows: "Subscribe status: SUBSCRIBED"</li>
          <li>Log shows: "✅ Successfully subscribed!"</li>
          <li>Log shows: "Send result: ok"</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8d7da', borderRadius: '8px', border: '2px solid #dc3545' }}>
        <h3>❌ If It Fails</h3>
        <p><strong>Check these:</strong></p>
        <ol>
          <li>Is your Supabase URL correct in <code>.env</code>?</li>
          <li>Is your project active (not paused)?</li>
          <li>Try refreshing the page</li>
          <li>Check browser console for other errors</li>
        </ol>
      </div>
    </div>
  )
}

export default SimpleRealtimeTest
