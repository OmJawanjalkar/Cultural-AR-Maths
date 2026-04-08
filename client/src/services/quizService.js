import api from './api'

export const quizService = {
  getNextQuestion: (module, excludeIds = []) => {
    const params = new URLSearchParams({ module })
    if (excludeIds.length) params.set('exclude_ids', excludeIds.join(','))
    return api.get(`/quiz/next?${params}`)
  },
  submitAnswer: (data) => api.post('/quiz/submit', data),
  getHistory: (module = null, limit = 20) => {
    const params = new URLSearchParams({ limit })
    if (module) params.set('module', module)
    return api.get(`/quiz/history?${params}`)
  },
  logSession: (data) => api.post('/session/log', data),
  getSessionSummary: (module = null) => {
    const params = module ? `?module=${module}` : ''
    return api.get(`/session/summary${params}`)
  },
}
