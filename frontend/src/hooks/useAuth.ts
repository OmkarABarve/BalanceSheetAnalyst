import { useState, useEffect } from 'react'
import { User } from '../types'
import { signIn, signUp, getCurrentUser, /*signOut*/ } from '../services/authAPI'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking current user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const signInUser = async (email: string, password: string) => {
    try {
      const result = await signIn({ email, password })
      
      if (result.data?.user) {
        setUser(result.data.user)
        return { data: result.data, error: null }
      }
      
      return { data: null, error: result.error || 'Sign in failed' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error: 'Network error occurred' }
    }
  }

  const signUpUser = async (email: string, password: string) => {
    try {
      const result = await signUp({ email, password })
      return { data: result.data, error: result.error }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error: 'Network error occurred' }
    }
  }

  const signOutUser = async () => {
    try {
      const result = await signOut()
      
      if (!result.error) {
        setUser(null)
        return { error: null }
      }
      
      return { error: result.error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'Network error occurred' }
    }
  }

  return {
    user,
    loading,
    signIn: signInUser,
    signUp: signUpUser,
   // signOut: signOutUser,
  }
}
