import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { LiveDataProvider } from './contexts/LiveDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* LiveDataProvider sits inside AuthProvider so it can read user/token via useAuth */}
      <LiveDataProvider>
        <App />
      </LiveDataProvider>
    </AuthProvider>
  </StrictMode>,
)
