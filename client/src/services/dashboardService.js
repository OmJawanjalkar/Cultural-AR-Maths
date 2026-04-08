import api from './api'

export const dashboardService = {
  getStudentDashboard: () => api.get('/student/dashboard'),

  getTeacherAnalytics: () => api.get('/teacher/dashboard'),

  /**
   * Fetch the leaderboard for a class.
   *
   * Priority order:
   *   1. /leaderboard/class/<classId>  — if we have a classId
   *   2. /leaderboard                  — global fallback (no classId)
   *
   * Never returns an empty promise — always hits the network so the context
   * can decide whether to use the result or keep stale data.
   */
  getLeaderboard: (classId) => {
    if (classId) return api.get(`/leaderboard/class/${classId}`)
    return api.get('/leaderboard')
  },
}
