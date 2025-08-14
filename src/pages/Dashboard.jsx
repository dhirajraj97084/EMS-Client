import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { dashboardAPI } from '../services/api'
import {
  Users,
  UserCheck,
  TrendingUp,
  DollarSign,
  Calendar,
  Building,
  Activity
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, chartResponse] = await Promise.all([
        dashboardAPI.getStats(),
        user.role !== 'employee' ? dashboardAPI.getChartData() : Promise.resolve({ data: { data: {} } })
      ])
      
      setStats(statsResponse.data.data)
      if (chartResponse.data.data) {
        setChartData(chartResponse.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.firstName}! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        {user.role !== 'employee' && (
          <>
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.departmentStats?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Hires</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.recentHires?.length || 0}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Employee Info Card (for employees) */}
      {user.role === 'employee' && stats?.employeeInfo && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Department:</span>
              <span className="ml-2 font-medium text-gray-900">{stats.employeeInfo.department}</span>
            </div>
            <div className="flex items-center">
              <UserCheck className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Position:</span>
              <span className="ml-2 font-medium text-gray-900">{stats.employeeInfo.position}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Hire Date:</span>
              <span className="ml-2 font-medium text-gray-900">
                {new Date(stats.employeeInfo.hireDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section (for admin/manager) */}
      {user.role !== 'employee' && chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.departmentDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary Ranges */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.salaryRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Hires (for admin/manager) */}
      {user.role !== 'employee' && stats?.recentHires && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Hires</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentHires.map((hire, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {hire.user?.firstName?.charAt(0)}{hire.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {hire.user?.firstName} {hire.user?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hire.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hire.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(hire.hireDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
