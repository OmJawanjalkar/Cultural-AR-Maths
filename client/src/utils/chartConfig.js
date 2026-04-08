// Shared Recharts styling constants for Cultural AR Maths

export const COLORS = {
  saffron: '#FF6B00',
  maroon: '#800020',
  gold: '#D4A017',
  green: '#22C55E',
  grey: '#9CA3AF',
  lightGrey: '#E5E7EB',
  red: '#EF4444',
  blue: '#6366F1',
}

// Bar/line color based on performance value
export function performanceColor(value) {
  if (value >= 80) return COLORS.green
  if (value >= 60) return COLORS.saffron
  return COLORS.red
}

// Custom tooltip container style
export const tooltipStyle = {
  background: '#1F2937',
  border: 'none',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '12px',
  fontFamily: '"Noto Sans", sans-serif',
  padding: '8px 12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
}

// Custom tooltip label style
export const tooltipLabelStyle = {
  color: '#D1D5DB',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: '600',
  marginBottom: '4px',
}

// Axis tick text style
export const axisTickStyle = {
  fontSize: 11,
  fill: '#6B7280',
  fontFamily: '"Noto Sans", sans-serif',
}

// Chart grid stroke
export const gridStroke = 'rgba(0,0,0,0.06)'

// Default animation duration
export const ANIMATION_DURATION = 1000

// Gradient IDs used by chart components (defined inline in each chart's <defs>)
export const SAFFRON_GRADIENT_ID = 'saffronGradient'
export const MAROON_GRADIENT_ID = 'maroonGradient'
