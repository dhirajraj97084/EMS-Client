import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear token and redirect to login
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      
      // Redirect to login page
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.message) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }

    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
}

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  getDepartmentStats: () => api.get('/employees/departments/stats'),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getChartData: () => api.get('/dashboard/employees/chart'),
  search: (query, type) => api.get('/dashboard/search', { params: { query, type } }),
}

export default api
