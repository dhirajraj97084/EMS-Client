import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.data)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { user: userData, token } = response.data.data
        
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        setUser(userData)
        setIsAuthenticated(true)
        
        toast.success('Login successful!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Login failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      if (response.data.success) {
        setUser(response.data.data)
        toast.success('Profile updated successfully!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Profile update failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      const message = error.response?.data?.message || 'Profile update failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        toast.success('Password changed successfully!')
        return { success: true }
      } else {
        toast.error(response.data.message || 'Password change failed')
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error('Password change error:', error)
      const message = error.response?.data?.message || 'Password change failed. Please try again.'
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    changePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
