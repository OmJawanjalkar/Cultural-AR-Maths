import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoadingSpinner from './components/ui/LoadingSpinner'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ModuleSelectPage from './pages/ModuleSelectPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import QuizPage from './pages/QuizPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import GeometryPlayground from './pages/ar/GeometryPlayground'
import TempleExplorer from './pages/ar/TempleExplorer'
import RangoliLab from './pages/ar/RangoliLab'
import SabziMandi from './pages/ar/SabziMandi'

function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8E7' }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!token || !user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'teacher'
    ? <Navigate to="/teacher-dashboard" replace />
    : <Navigate to="/student-dashboard" replace />
}

function GuestRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (token) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute><RegisterPage /></GuestRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardRedirect /></ProtectedRoute>
        } />
        <Route path="/student-dashboard" element={
          <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher-dashboard" element={
          <ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>
        } />

        <Route path="/modules" element={
          <ProtectedRoute><ModuleSelectPage /></ProtectedRoute>
        } />
        <Route path="/quiz/:module" element={
          <ProtectedRoute><QuizPage /></ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="/ar/geometry" element={
          <ProtectedRoute><GeometryPlayground /></ProtectedRoute>
        } />

        <Route path="/ar/temple" element={
          <ProtectedRoute><TempleExplorer /></ProtectedRoute>
        } />

        <Route path="/ar/rangoli" element={
          <ProtectedRoute><RangoliLab /></ProtectedRoute>
        } />

        <Route path="/ar/sabzi" element={
          <ProtectedRoute><SabziMandi /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
