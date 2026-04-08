import { useParams, useNavigate } from 'react-router-dom'
import QuizSession from '../components/quiz/QuizSession'

const MODULE_NAMES = {
  geometry:     '🕌 Temple Architecture',
  symmetry:     '🌸 Rangoli Symmetry',
  arithmetic:   '🥬 Sabzi Mandi',
  all:          '🧠 Quick Quiz',
  'all-topics': '🧠 Quick Quiz',
  '3d-geometry': '📐 3D Geometry',
}

/**
 * QuizPage — full-screen focused quiz mode.
 * Delegates all session logic to QuizSession.
 */
export default function QuizPage() {
  const { module } = useParams()
  const navigate = useNavigate()

  const moduleName = MODULE_NAMES[module] || `Quiz: ${module}`

  return (
    <QuizSession
      module={module}
      moduleName={moduleName}
      onExit={(path) => navigate(path || '/modules')}
    />
  )
}
