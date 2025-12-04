import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [students, setStudents] = useState([])
  const [activeStudent, setActiveStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user')
    const storedStudents = localStorage.getItem('students')
    const storedActiveStudent = localStorage.getItem('activeStudent')
    
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents))
    }
    if (storedActiveStudent) {
      setActiveStudent(JSON.parse(storedActiveStudent))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role = 'parent') => {
    // Mock login - replace with actual API call
    const mockUser = {
      id: `${Date.now()}-${role}`,
      email,
      firstName: 'John',
      lastName: 'Doe',
      role: role,
      profilePicture: null
    }
    
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    
    // Load students for this parent
    if (role === 'parent') {
      const storedStudents = localStorage.getItem(`students_${mockUser.id}`)
      if (storedStudents) {
        const studentList = JSON.parse(storedStudents)
        setStudents(studentList)
        if (studentList.length > 0) {
          setActiveStudent(studentList[0])
          localStorage.setItem('activeStudent', JSON.stringify(studentList[0]))
        }
      }
    }
    
    return mockUser
  }

  const register = async (userData) => {
    // Mock registration - replace with actual API call
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      profilePicture: null
    }
    
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return newUser
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

  const logout = () => {
    setUser(null)
    setStudents([])
    setActiveStudent(null)
    localStorage.removeItem('user')
    localStorage.removeItem('students')
    localStorage.removeItem('activeStudent')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      students, 
      activeStudent, 
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
