import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { employeeAPI } from '../services/api'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    userId: '',
    department: '',
    position: '',
    salary: '',
    phoneNumber: ''
  })

  const [availableUsers, setAvailableUsers] = useState([]) // Add this state
  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Engineering']

  useEffect(() => {
    fetchEmployees()
    fetchAvailableUsers() // Add this call
  }, [currentPage, searchTerm, departmentFilter])

  const fetchAvailableUsers = async () => {
    try {
      // Fetch users who are not already employees
      const response = await fetch('/api/auth/users/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch available users:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: departmentFilter
      }
      
      const response = await employeeAPI.getAll(params)
      setEmployees(response.data.data)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      toast.error('Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async (e) => {
    e.preventDefault()
    try {
      // Transform the data to match backend expectations
      const employeeData = {
        ...formData,
        salary: Number(formData.salary) // Convert to number
      }
      
      console.log('Sending employee data:', employeeData) // Debug log
      
      await employeeAPI.create(employeeData)
      toast.success('Employee created successfully!')
      setShowCreateModal(false)
      setFormData({
        employeeId: '',
        userId: '',
        department: '',
        position: '',
        salary: '',
        phoneNumber: ''
      })
      fetchEmployees()
    } catch (error) {
      console.error('Failed to create employee:', error)
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create employee. Please check all required fields.')
      }
    }
  }

  const handleEditEmployee = async (e) => {
    e.preventDefault()
    try {
      // Transform the data to match backend expectations
      const employeeData = {
        ...formData,
        salary: Number(formData.salary) // Convert to number
      }
      
      await employeeAPI.update(selectedEmployee._id, employeeData)
      toast.success('Employee updated successfully!')
      setShowEditModal(false)
      setSelectedEmployee(null)
      fetchEmployees()
    } catch (error) {
      console.error('Failed to update employee:', error)
      // Show specific error message
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to update employee. Please check all required fields.')
      }
    }
  }

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(id)
        toast.success('Employee deleted successfully!')
        fetchEmployees()
      } catch (error) {
        console.error('Failed to delete employee:', error)
      }
    }
  }

  const openEditModal = (employee) => {
    setSelectedEmployee(employee)
    setFormData({
      employeeId: employee.employeeId,
      userId: employee.user?._id || '',
      department: employee.department,
      position: employee.position,
      salary: employee.salary,
      phoneNumber: employee.phoneNumber
    })
    setShowEditModal(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  if (user.role === 'employee') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your organization's employees</p>
        </div>
        {user.role !== 'employee' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="input"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {employee.user?.firstName?.charAt(0)}{employee.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.user?.firstName} {employee.user?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${employee.salary?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'active' ? 'bg-green-100 text-green-800' :
                        employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteEmployee(employee._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    className="input"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select User Account</label>
                  <select
                    name="userId"
                    className="input"
                    value={formData.userId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select User Account</option>
                    {availableUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="department"
                    className="input"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    className="input"
                    value={formData.position}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    className="input"
                    value={formData.salary}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="input"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Employee</h3>
              <form onSubmit={handleEditEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    className="input"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select User Account</label>
                  <select
                    name="userId"
                    className="input"
                    value={formData.userId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select User Account</option>
                    {availableUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="department"
                    className="input"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    className="input"
                    value={formData.position}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    className="input"
                    value={formData.salary}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="input"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
