/**
 * LiveDataContext — single source of truth for real-time student performance
 * and leaderboard data. All dashboard and leaderboard pages consume this
 * context instead of fetching independently.
 *
 * Refresh strategy:
 *   1. On mount (when token is present)
 *   2. Every POLL_INTERVAL ms (default 30 s) while the user is active
 *   3. Immediately when the 'sanskritimath:quiz_complete' DOM event fires
 *
 * For teachers: derives the leaderboard from the class analytics response
 *               (ranks student_list by karma_points), so one request serves both
 *               the teacher dashboard and the leaderboard page.
 *
 * For students: hits /leaderboard/class/<classId> if available, then falls back
 *               to /leaderboard (global), then keeps whatever data we had.
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react'
import { useAuth } from './AuthContext'
import { dashboardService } from '../services/dashboardService'

const POLL_INTERVAL = 30_000 // 30 seconds

const LiveDataContext = createContext(null)

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a sorted leaderboard array from the student_list returned by teacher analytics. */
function buildLeaderboardFromStudents(studentList = []) {
  return [...studentList]
    .sort((a, b) => (b.karma_points ?? 0) - (a.karma_points ?? 0))
    .map((s, i) => ({
      rank:          i + 1,
      user_id:       s.student_id || s._id || String(i),
      name:          s.name || 'Student',
      karma_points:  s.karma_points ?? 0,
      streak:        s.streak ?? 0,
      quizzes_taken: s.quizzes_taken ?? null,
      avg_score:     s.accuracy ?? s.avg_score ?? 0,
      weak_topic:    s.weak_topic || '—',
      last_active:   s.last_active || null,
    }))
}

/** Normalise a raw student_list entry to the shape TeacherDashboard expects. */
function normaliseStudent(s) {
  return {
    _id:           s.student_id || s._id || '',
    name:          s.name || 'Student',
    karma_points:  s.karma_points ?? 0,
    streak:        s.streak ?? 0,
    avg_score:     s.accuracy ?? s.avg_score ?? 0,
    quizzes_taken: s.quizzes_taken ?? null,
    weak_topic:    s.weak_topic || '—',
    last_active:   s.last_active || null,
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function LiveDataProvider({ children }) {
  const { user, token } = useAuth()

  // ── State ────────────────────────────────────────────────────────────────
  const [leaderboard, setLeaderboard]   = useState([])
  const [students,    setStudents]      = useState([])
  const [classStats,  setClassStats]    = useState({})
  const [lastUpdated, setLastUpdated]   = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError,  setFetchError]    = useState(null)

  // Prevent concurrent refreshes
  const refreshingRef = useRef(false)

  // ── Core fetch ───────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!token || refreshingRef.current) return
    refreshingRef.current = true
    setIsRefreshing(true)
    setFetchError(null)

    try {
      if (user?.role === 'teacher') {
        // ── Teacher path ──────────────────────────────────────────────────
        // One request gives us: class_code, class_summary, student_list
        const res = await dashboardService.getTeacherAnalytics()
        const d   = res?.data?.data || res?.data || {}
        const summary     = d.class_summary || {}
        const studentList = (d.student_list || []).map(normaliseStudent)

        if (studentList.length) setStudents(studentList)

        setClassStats({
          classCode:      d.class_code ?? '',
          totalStudents:  summary.total_students   ?? studentList.length,
          avgScore:       Math.round(summary.average_accuracy ?? 0),
          activeToday:    summary.active_today ?? 0,
          assignmentsSet: summary.assignments_set ?? 0,
        })

        // Derive a ranked leaderboard directly from the student list
        const derived = buildLeaderboardFromStudents(studentList.length ? studentList : [])
        if (derived.length) setLeaderboard(derived)

      } else {
        // ── Student path ──────────────────────────────────────────────────
        // Try class-specific leaderboard first, fall back to global
        const classId = user?.class_id || user?.class_code || ''
        let lbData = []

        try {
          const res = await dashboardService.getLeaderboard(classId)
          const raw = res?.data?.data || res?.data || []
          if (Array.isArray(raw) && raw.length) lbData = raw
        } catch {
          // Leaderboard fetch failed — keep previous data
        }

        if (lbData.length) {
          // Ensure each entry has a rank field
          const ranked = lbData.map((e, i) => ({
            ...e,
            rank: e.rank ?? i + 1,
          }))
          setLeaderboard(ranked)
        }
      }

      setLastUpdated(new Date())
    } catch (err) {
      setFetchError(err?.message || 'Failed to refresh data')
      // Do NOT clear existing data on error — keep stale data visible
    } finally {
      refreshingRef.current = false
      setIsRefreshing(false)
    }
  }, [token, user?.role, user?.class_id, user?.class_code]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial fetch on login ────────────────────────────────────────────────
  useEffect(() => {
    if (token) refresh()
  }, [token, refresh])

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    const id = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [token, refresh])

  // ── Event-driven refresh (quiz completion) ────────────────────────────────
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('sanskritimath:quiz_complete', handler)
    return () => window.removeEventListener('sanskritimath:quiz_complete', handler)
  }, [refresh])

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    leaderboard,
    students,
    classStats,
    lastUpdated,
    isRefreshing,
    fetchError,
    refresh,
  }

  return (
    <LiveDataContext.Provider value={value}>
      {children}
    </LiveDataContext.Provider>
  )
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

export function useLiveData() {
  const ctx = useContext(LiveDataContext)
  if (!ctx) throw new Error('useLiveData must be used inside <LiveDataProvider>')
  return ctx
}
