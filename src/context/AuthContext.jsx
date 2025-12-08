/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Uses Supabase Auth with helper functions
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { createContext, useContext, useState, useEffect } from 'react'
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
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const subscription = onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user || null)
      
      if (session?.user) {
        getCurrentUserProfile().then(({ profile }) => {
          if (profile) {
            setProfile(profile)
          }
        })
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

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

  const addStudent = (studentData) => {
    const newStudent = {
      id: `student-${Date.now()}`,
      ...studentData,
      enrolledCourses: [],
      createdAt: new Date().toISOString()
    }
    
    const updatedStudents = [...students, newStudent]
    setStudents(updatedStudents)
    localStorage.setItem(`students_${user.id}`, JSON.stringify(updatedStudents))
    localStorage.setItem('students', JSON.stringify(updatedStudents))
    
    // Set as active if first student
    if (updatedStudents.length === 1) {
      setActiveStudent(newStudent)
      localStorage.setItem('activeStudent', JSON.stringify(newStudent))
    }
    
    return newStudent
  }

  const updateStudent = (studentId, updates) => {
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, ...updates } : s
    )
    setStudents(updatedStudents)
    localStorage.setItem(`students_${user.id}`, JSON.stringify(updatedStudents))
    localStorage.setItem('students', JSON.stringify(updatedStudents))
    
    // Update active student if it's the one being updated
    if (activeStudent?.id === studentId) {
      const updated = updatedStudents.find(s => s.id === studentId)
      setActiveStudent(updated)
      localStorage.setItem('activeStudent', JSON.stringify(updated))
    }
  }

  const deleteStudent = (studentId) => {
    const updatedStudents = students.filter(s => s.id !== studentId)
    setStudents(updatedStudents)
    localStorage.setItem(`students_${user.id}`, JSON.stringify(updatedStudents))
    localStorage.setItem('students', JSON.stringify(updatedStudents))
    
    // Update active student if deleted
    if (activeStudent?.id === studentId) {
      const newActive = updatedStudents[0] || null
      setActiveStudent(newActive)
      localStorage.setItem('activeStudent', JSON.stringify(newActive))
    }
  }

  const switchStudent = (studentId) => {
    const student = students.find(s => s.id === studentId)
    if (student) {
      setActiveStudent(student)
      localStorage.setItem('activeStudent', JSON.stringify(student))
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
      switchStudent
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
