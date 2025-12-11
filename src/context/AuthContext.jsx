/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Uses Supabase Auth with helper functions
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut,
  getCurrentSession,
  getCurrentUserProfile,
  onAuthStateChange
} from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [activeStudent, setActiveStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    getCurrentSession().then(({ session, user }) => {
      if (session && user) {
        setSession(session)
        setUser(user)
        
        // Fetch user profile
        getCurrentUserProfile().then(({ profile }) => {
          if (profile) {
            setProfile(profile)
            
            // If user is a parent, load their students
            if (profile.role === 'parent') {
              loadStudents(user.id)
            }
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const subscription = onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        getCurrentUserProfile().then(({ profile }) => {
          if (profile) {
            setProfile(profile)
            
            // If user is a parent, load their students
            if (profile.role === 'parent') {
              loadStudents(session.user.id)
            }
          }
        })
      } else {
        setProfile(null)
        setStudents([])
        setActiveStudent(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadStudents = async (parentId) => {
    try {
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading students:', error)
        return
      }

      setStudents(studentsData || [])
      
      // Set first student as active if none selected
      if (studentsData && studentsData.length > 0 && !activeStudent) {
        setActiveStudent(studentsData[0])
      }
    } catch (err) {
      console.error('Load students error:', err)
    }
  }

  const login = async (email, password) => {
    const { user, session, profile, error } = await authSignIn(email, password)
    
    if (error) {
      console.error('Login error:', error)
      return { error }
    }
    
    setUser(user)
    setSession(session)
    setProfile(profile)
    
    return { user, profile, error: null }
  }

  const register = async (userData) => {
    const { user, session, error } = await authSignUp(userData)
    
    if (error) {
      console.error('Registration error:', error)
      return { error }
    }
    
    setUser(user)
    setSession(session)
    
    // Fetch profile
    if (user) {
      const { profile } = await getCurrentUserProfile()
      setProfile(profile)
    }
    
    return { user, error: null }
  }

  const addStudent = async (studentData) => {
    console.log('➕ Adding student:', studentData)
    console.log('👤 Current user:', user?.id, 'Role:', profile?.role)
    
    if (!user || profile?.role !== 'parent') {
      console.error('❌ Only parents can add students')
      return { error: 'Only parents can add students' }
    }

    try {
      // Create student in dedicated students table
      const studentRecord = {
        parent_id: user.id, // Link to parent
        first_name: studentData.firstName,
        last_name: profile?.last_name || studentData.lastName || 'Student',
        age: parseInt(studentData.age),
        date_of_birth: studentData.dateOfBirth || null,
        grade_level: studentData.gradeLevel || null,
        neurodiversity_profile: studentData.neurodiversityProfile || [],
        other_needs: studentData.otherNeeds || null,
        interests: studentData.interests || [],
        bio: studentData.bio || null
      }

      console.log('📝 Student record to insert:', studentRecord)

      const { data: newStudent, error } = await supabase
        .from('students')
        .insert([studentRecord])
        .select()
        .single()

      console.log('💾 Insert result:', { newStudent, error })

      if (error) {
        console.error('❌ Error creating student:', error)
        return { error: error.message }
      }

      // Update local state
      const updatedStudents = [...students, newStudent]
      setStudents(updatedStudents)
      console.log('✅ Students updated:', updatedStudents.length)
      
      // Set as active if first student
      if (updatedStudents.length === 1) {
        setActiveStudent(newStudent)
        console.log('🎯 Set as active student:', newStudent)
      }

      return { student: newStudent, error: null }
    } catch (err) {
      console.error('💥 Student creation error:', err)
      return { error: err.message }
    }
  }

  const updateStudent = async (studentId, updates) => {
    if (!user || profile?.role !== 'parent') {
      console.error('Only parents can update students')
      return { error: 'Only parents can update students' }
    }

    try {
      const { data: updatedStudent, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .eq('parent_id', user.id) // Ensure parent owns this student
        .select()
        .single()

      if (error) {
        console.error('Error updating student:', error)
        return { error: error.message }
      }

      // Update local state
      const updatedStudents = students.map(s => 
        s.id === studentId ? updatedStudent : s
      )
      setStudents(updatedStudents)
      
      // Update active student if it's the one being updated
      if (activeStudent?.id === studentId) {
        setActiveStudent(updatedStudent)
      }

      return { student: updatedStudent, error: null }
    } catch (err) {
      console.error('Student update error:', err)
      return { error: err.message }
    }
  }

  const deleteStudent = async (studentId) => {
    if (!user || profile?.role !== 'parent') {
      console.error('Only parents can delete students')
      return { error: 'Only parents can delete students' }
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId)
        .eq('parent_id', user.id) // Ensure parent owns this student

      if (error) {
        console.error('Error deleting student:', error)
        return { error: error.message }
      }

      // Update local state
      const updatedStudents = students.filter(s => s.id !== studentId)
      setStudents(updatedStudents)
      
      // Update active student if deleted
      if (activeStudent?.id === studentId) {
        const newActive = updatedStudents[0] || null
        setActiveStudent(newActive)
      }

      return { error: null }
    } catch (err) {
      console.error('Student deletion error:', err)
      return { error: err.message }
    }
  }

  const switchStudent = (studentId) => {
    if (studentId === null) {
      // Switch to parent
      setActiveStudent(null)
    } else {
      const student = students.find(s => s.id === studentId)
      if (student) {
        setActiveStudent(student)
      }
    }
  }

  const refreshStudents = async () => {
    if (user && profile?.role === 'parent') {
      await loadStudents(user.id)
    }
  }

  const logout = async () => {
    const { error } = await authSignOut()
    
    if (error) {
      console.error('Logout error:', error)
      return { error }
    }
    
    setUser(null)
    setSession(null)
    setProfile(null)
    setStudents([])
    setActiveStudent(null)
    
    return { error: null }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ 
      user,
      profile,
      session,
      students, 
      activeStudent, 
      loading,
      login, 
      register, 
      logout,
      addStudent,
      updateStudent,
      deleteStudent,
      switchStudent,
      refreshStudents
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
