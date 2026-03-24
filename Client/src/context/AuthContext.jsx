import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const getStoredUser = () => {
  try {
    const token = localStorage.getItem('token')
    const userDataStr = localStorage.getItem('user')
    
    if (token && userDataStr && userDataStr !== 'undefined') {
      const userData = JSON.parse(userDataStr)
      if (userData && typeof userData === 'object') {
        return { user: userData, loading: false }
      }
    }
  } catch {
    localStorage.removeItem('user')
  }
  return { user: null, loading: false }
}

export function AuthProvider({ children }) {
  const { user: initialUser, loading: initialLoading } = getStoredUser()
  const [user, setUser] = useState(initialUser)
  const [loading] = useState(initialLoading)

  const login = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
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
