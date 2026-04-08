import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const inputStyle = (field) => ({
    border: `1.5px solid ${focusedField === field ? '#FF6B00' : '#E5E5E5'}`,
    borderRadius: '8px',
    padding: '10px 14px',
    width: '100%',
    fontSize: '14px',
    fontFamily: '"Noto Sans", sans-serif',
    color: '#2D2D2D',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: '6px',
    fontFamily: '"Poppins", sans-serif',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required.'); return }
    if (!password) { setError('Password is required.'); return }
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      onSuccess && onSuccess(user)
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '700',
        fontSize: '24px',
        color: '#FF6B00',
        margin: '0 0 6px 0',
      }}>
        Welcome Back
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#6B6B6B',
        margin: '0 0 24px 0',
        fontFamily: '"Noto Sans", sans-serif',
      }}>
        Sign in to continue learning
      </p>

      {error && (
        <div
          className="animate-shake"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid #EF4444',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#EF4444',
            fontFamily: '"Noto Sans", sans-serif',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="you@example.com"
            style={inputStyle('email')}
            autoComplete="email"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              style={{ ...inputStyle('password'), paddingRight: '42px' }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                color: '#6B6B6B',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Sign In
        </Button>
      </form>
    </div>
  )
}
