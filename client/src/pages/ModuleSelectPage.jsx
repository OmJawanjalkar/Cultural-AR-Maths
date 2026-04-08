import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import ModuleCard from '../components/modules/ModuleCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { quizService } from '../services/quizService'
import { dashboardService } from '../services/dashboardService'

const MODULE_ID_MAP = {
  geometry: 'temple',
  symmetry: 'rangoli',
  arithmetic: 'sabzi_mandi',
  'all': 'general',
  '3d-geometry': 'geometry_3d',
}

// Category options shown in the Quick Quiz inline picker
const QUIZ_CATEGORIES = [
  { label: 'Temple Geometry',  icon: '🕌', route: '/quiz/geometry' },
  { label: 'Rangoli Symmetry', icon: '🌸', route: '/quiz/symmetry' },
  { label: 'Sabzi Arithmetic', icon: '🥬', route: '/quiz/arithmetic' },
  { label: '3D Geometry',      icon: '📐', route: '/quiz/3d-geometry' },
  { label: 'All Topics',       icon: '🧠', route: '/quiz/all' },
]

const BASE_MODULES = [
  {
    id: 'geometry',
    icon: '🕌',
    title: 'Temple Architecture Explorer',
    description: 'Learn geometry through sacred Indian architecture. Calculate areas, perimeters, and volumes.',
    color: '#FF6B00',
    arRoute: '/ar/temple',
    quizRoute: '/quiz/geometry',
  },
  {
    id: 'symmetry',
    icon: '🌸',
    title: 'Rangoli & Kolam Symmetry Lab',
    description: 'Discover axes of symmetry and rotational patterns in traditional Indian art forms.',
    color: '#800020',
    arRoute: '/ar/rangoli',
    quizRoute: '/quiz/symmetry',
  },
  {
    id: 'arithmetic',
    icon: '🥬',
    title: 'Sabzi Mandi Arithmetic',
    description: 'Practice mental math and arithmetic in a virtual Indian market setting.',
    color: '#22C55E',
    arRoute: '/ar/sabzi',
    quizRoute: '/quiz/arithmetic',
  },
  {
    id: '3d-geometry',
    icon: '📐',
    title: '3D Geometry Playground',
    description: 'Explore three-dimensional shapes in augmented reality with interactive models.',
    color: '#D4A017',
    arRoute: '/ar/geometry',
    quizRoute: '/quiz/3d-geometry',
  },
  {
    id: 'all',
    icon: '🧠',
    title: 'Quick Quiz',
    description: 'Test your skills across all topics with our adaptive quiz engine.',
    color: '#800020',
    quizRoute: '/quiz/all',
    categories: QUIZ_CATEGORIES,
  },
]

const WEAK_TOPIC_MODULES = {
  geometry: 'geometry',
  symmetry: 'symmetry',
  arithmetic: 'arithmetic',
  mensuration: '3d-geometry',
  percentages: 'all',
}

export default function ModuleSelectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modules, setModules] = useState(BASE_MODULES.map((m) => ({ ...m, progress: 0 })))
  const [weakAreas, setWeakAreas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        // Try to get history to compute progress
        const histRes = await quizService.getHistory(null, 100)
        // Backend returns { attempts: [...], stats: {...} }
        const attempts = histRes?.data?.data?.attempts || histRes?.data?.data || []

        // Build progressMap keyed by FRONTEND module id
        // Backend attempt has module: 'temple' etc., map back to frontend id
        const backendToFrontend = Object.fromEntries(
          Object.entries(MODULE_ID_MAP).map(([fId, bId]) => [bId, fId])
        )
        const progressMap = {}
        attempts.forEach((a) => {
          const backendMod = a.module || 'general'
          const frontendId = backendToFrontend[backendMod] || 'all'
          if (!progressMap[frontendId]) progressMap[frontendId] = { correct: 0, total: 0 }
          progressMap[frontendId].total += 1
          if (a.is_correct) progressMap[frontendId].correct += 1
        })

        if (mounted) {
          setModules(
            BASE_MODULES.map((m) => {
              const stats = progressMap[m.id]
              const progress = stats ? Math.round((stats.correct / Math.max(stats.total, 1)) * 100) : 0
              return { ...m, progress }
            })
          )
        }
      } catch {
        // keep default progress = 0
      }

      // Try dashboard for weak areas
      try {
        const dashRes = await dashboardService.getStudentDashboard()
        const data = dashRes?.data?.data || dashRes?.data || {}
        if (mounted && data.weak_areas) {
          setWeakAreas(data.weak_areas)
        }
      } catch {
        // ignore
      }

      if (mounted) setLoading(false)
    }

    loadData()
    return () => { mounted = false }
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'Student'
  const karma = user?.karma_points || 0

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', fontFamily: '"Noto Sans", sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Greeting */}
        <div
          className="animate-fade-in-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <h1
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '600',
              fontSize: '26px',
              color: '#2D2D2D',
              margin: 0,
            }}
          >
            Namaste, {firstName}! 🙏
          </h1>

          {/* Karma badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212,160,23,0.12)',
              color: '#D4A017',
              border: '1px solid rgba(212,160,23,0.3)',
              borderRadius: '24px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            <Star size={14} fill="#D4A017" color="#D4A017" />
            {karma.toLocaleString()} Karma
          </div>
        </div>

        <p
          className="animate-fade-in-up"
          style={{ color: '#6B6B6B', fontSize: '15px', marginBottom: '32px', animationDelay: '0.05s', animationFillMode: 'both' }}
        >
          Choose a module to continue your learning journey
        </p>

        {/* Module Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '48px',
            }}
          >
            {modules.map((mod) => (
              <div key={mod.id} className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
                <ModuleCard module={mod} />
              </div>
            ))}
          </div>
        )}

        {/* Weak Areas section */}
        {weakAreas.length > 0 && (
          <div
            className="animate-fade-in-up"
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(255,107,0,0.07)',
              border: '1px solid rgba(255,107,0,0.1)',
            }}
          >
            <h2
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '16px',
                color: '#2D2D2D',
                margin: '0 0 16px',
              }}
            >
              📉 Your Weak Areas — Practice These Topics
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {weakAreas.map((area) => {
                const moduleId = area.module_id || WEAK_TOPIC_MODULES[area.topic?.toLowerCase()] || 'all'
                return (
                  <button
                    key={area.topic}
                    onClick={() => navigate(`/quiz/${moduleId}`)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '24px',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#EF4444',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: '"Poppins", sans-serif',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                  >
                    {area.topic}
                    {area.score !== undefined && (
                      <span style={{ marginLeft: '6px', opacity: 0.7 }}>({area.score}%)</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
