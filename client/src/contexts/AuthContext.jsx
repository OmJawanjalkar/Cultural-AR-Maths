import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }
    try {
      const res = await api.get('/auth/me')
      dispatch({ type: 'SET_USER', payload: res.data.data })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  useEffect(() => { checkAuth() }, [checkAuth])

  // Re-fetch the user profile whenever a quiz session completes so that
  // karma_points and streak in the navbar (and elsewhere) reflect the
  // server-side values immediately rather than waiting for a page reload.
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await api.get('/auth/me')
        dispatch({ type: 'SET_USER', payload: res.data.data })
      } catch {
        // Silently ignore — stale local state is acceptable here
      }
    }
    window.addEventListener('sanskritimath:quiz_complete', handler)
    return () => window.removeEventListener('sanskritimath:quiz_complete', handler)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token } = res.data.data
    localStorage.setItem('token', token)
    // Fetch full profile so we have _id and all fields
    const profileRes = await api.get('/auth/me')
    const user = profileRes.data.data
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { token, user } })
    return user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token } = res.data.data
    localStorage.setItem('token', token)
    // Fetch full profile
    const profileRes = await api.get('/auth/me')
    const user = profileRes.data.data
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { token, user } })
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({ type: 'SET_USER', payload: updatedUser })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
