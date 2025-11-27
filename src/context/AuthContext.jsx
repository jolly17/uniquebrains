import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role = 'student') => {
    // Mock login - replace with actual API call
    // In a real app, the backend would handle multiple profiles per email
    const mockUser = {
      id: `${Date.now()}-${role}`,
      email,
      firstName: 'John',
      lastName: 'Doe',
      role: role,
      profilePicture: null,
      neurodiversityProfile: [],
      otherNeeds: ''
    }
    
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
    return mockUser
  }

  const register = async (userData) => {
    // Mock registration - replace with actual API call
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: 'student',
      profilePicture: null
    }
    
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return newUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
