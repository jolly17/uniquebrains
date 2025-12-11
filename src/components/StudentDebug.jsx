import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function StudentDebug() {
  const { user, profile, students } = useAuth()
  const [debugInfo, setDebugInfo] = useState({})
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    const info = {}

    // Check user and profile
    info.user = user ? { id: user.id, email: user.email } : 'No user'
    info.profile = profile ? { id: profile.id, role: profile.role } : 'No profile'
    info.studentsFromContext = students

    // Check if students table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('students')
        .select('count')
        .limit(1)
      
      info.studentsTableExists = !tableError
      info.tableError = tableError?.message
    } catch (err) {
      info.studentsTableExists = false
      info.tableError = err.message
    }

    // Try to fetch students directly
    if (user?.id) {
      try {
        const { data: directStudents, error: directError } = await supabase
          .from('students')
          .select('*')
          .eq('parent_id', user.id)

        info.directStudentsFetch = directStudents
        info.directFetchError = directError?.message
      } catch (err) {
        info.directFetchError = err.message
      }
    }

    // Check RLS policies
    try {
      const { data: rlsCheck, error: rlsError } = await supabase
        .rpc('check_rls_policies', { table_name: 'students' })
      
      info.rlsPolicies = rlsCheck
      info.rlsError = rlsError?.message
    } catch (err) {
      info.rlsError = err.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  useEffect(() => {
    if (user && profile) {
      runDebug()
    }
  }, [user, profile])

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      maxWidth: '400px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Student Debug Info</h4>
      <button onClick={runDebug} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Debug'}
      </button>
      <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '300px' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}

export default StudentDebug