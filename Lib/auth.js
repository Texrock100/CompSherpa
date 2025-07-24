'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('compsherpa_session')
    if (session) {
      try {
        const userData = JSON.parse(session)
        setUser(userData)
      } catch (error) {
        localStorage.removeItem('compsherpa_session')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email) => {
    try {
      // For now, just create a simple session
      const userData = { email, id: Date.now().toString() }
      localStorage.setItem('compsherpa_session', JSON.stringify(userData))
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = () => {
    localStorage.removeItem('compsherpa_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 