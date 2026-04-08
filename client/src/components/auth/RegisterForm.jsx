import { useState } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

function calculateStrength(pwd) {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score
}

const strengthLabels = ['', 'Weak', 'Fair', 'Medium', 'Strong']
const strengthColors = ['', '#EF4444', '#FF6B00', '#D4A017', '#22C55E']

export default function RegisterForm({ onSuccess, defaultRole = 'student' }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(defaultRole)
  const [classCode, setClassCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const passwordStrength = password ? calculateStrength(password) : 0

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
    if (!name.trim()) { setError('Full name is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    if (!password) { setError('Password is required.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const user = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        class_code: classCode.trim() || undefined,
      })
      onSuccess && onSuccess(user)
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.')
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
        Create Account
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#6B6B6B',
        margin: '0 0 20px 0',
        fontFamily: '"Noto Sans", sans-serif',
      }}>
        Join Cultural AR Maths and start learning
      </p>

      {/* Role Toggle */}
      <div style={{
        display: 'flex',
        background: '#F5F5F5',
        borderRadius: '10px',
        padding: '4px',
        marginBottom: '20px',
        gap: '4px',
      }}>
        {['student', 'teacher'].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '8px',
              border: role === r ? 'none' : '1.5px solid #E5E5E5',
              background: role === r ? '#FF6B00' : '#FFFFFF',
              color: role === r ? '#FFFFFF' : '#6B6B6B',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: '"Poppins", sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

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
        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholder="Your full name"
            style={inputStyle('name')}
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
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

        {/* Password with strength */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="reg-password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="At least 8 characters"
              style={{ ...inputStyle('password'), paddingRight: '42px' }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '0',
                color: '#6B6B6B', display: 'flex', alignItems: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength bars */}
          {password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: passwordStrength >= level
                        ? strengthColors[passwordStrength]
                        : '#E5E5E5',
                      transition: 'background 0.3s ease',
                    }}
                  />
                ))}
              </div>
              <span style={{
                fontSize: '11px',
                color: strengthColors[passwordStrength] || '#6B6B6B',
                fontFamily: '"Noto Sans", sans-serif',
                fontWeight: '600',
              }}>
                {strengthLabels[passwordStrength]}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="reg-confirm">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="Repeat your password"
              style={{
                ...inputStyle('confirm'),
                paddingRight: '42px',
                borderColor: confirmPassword && confirmPassword !== password
                  ? '#EF4444'
                  : focusedField === 'confirm' ? '#FF6B00' : '#E5E5E5',
              }}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: 'absolute', right: '12px', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '0',
                color: '#6B6B6B', display: 'flex', alignItems: 'center',
              }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px', fontFamily: '"Noto Sans", sans-serif' }}>
              Passwords do not match
            </p>
          )}
        </div>

        {/* Student: class code */}
        {role === 'student' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="reg-classcode">Class Code (optional)</label>
            <input
              id="reg-classcode"
              type="text"
              value={classCode}
              onChange={e => setClassCode(e.target.value)}
              onFocus={() => setFocusedField('classCode')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter class code from teacher"
              style={inputStyle('classCode')}
            />
          </div>
        )}

        {/* Teacher: info box */}
        {role === 'teacher' && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: 'rgba(212,160,23,0.1)',
            border: '1px solid rgba(212,160,23,0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
          }}>
            <Info size={16} style={{ color: '#D4A017', flexShrink: 0, marginTop: '1px' }} />
            <p style={{
              fontSize: '13px',
              color: '#2D2D2D',
              margin: 0,
              fontFamily: '"Noto Sans", sans-serif',
              lineHeight: '1.5',
            }}>
              Your class code will be generated after registration.
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
      </form>
    </div>
  )
}
