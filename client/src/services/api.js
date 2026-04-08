import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    const status = error.response?.status
    const serverMsg = error.response?.data?.error
    let message
    if (serverMsg) {
      message = serverMsg
    } else if (status === 502 || status === 503) {
      message = 'Server is unreachable. Make sure Flask is running.'
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Check your connection.'
    } else if (!error.response) {
      message = 'Network error. Check that both servers are running and reachable.'
    } else {
      message = error.message || 'Something went wrong'
    }
    return Promise.reject(new Error(message))
  }
)

export default api
