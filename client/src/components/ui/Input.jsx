import { useState } from 'react'

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  hint,
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            color: '#2D2D2D',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: '"Noto Sans", sans-serif',
            marginBottom: '6px',
          }}
        >
          {label}
          {required && (
            <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>
          )}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: `1.5px solid ${error ? '#EF4444' : focused ? '#FF6B00' : '#E5E5E5'}`,
          borderRadius: '8px',
          padding: '10px 14px',
          width: '100%',
          fontSize: '14px',
          fontFamily: '"Noto Sans", sans-serif',
          color: '#2D2D2D',
          background: disabled ? '#F5F5F5' : '#FFFFFF',
          outline: 'none',
          transition: 'border-color 0.3s ease',
          cursor: disabled ? 'not-allowed' : 'text',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span
          style={{
            color: '#EF4444',
            fontSize: '12px',
            fontFamily: '"Noto Sans", sans-serif',
            marginTop: '4px',
          }}
        >
          {error}
        </span>
      )}
      {!error && hint && (
        <span
          style={{
            color: '#6B6B6B',
            fontSize: '12px',
            fontFamily: '"Noto Sans", sans-serif',
            marginTop: '4px',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  )
}
