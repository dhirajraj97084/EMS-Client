import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Menu,
  X,
  Home,
  Users,
  User,
  LogOut,
  Bell,
  Search
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActiveRoute = (href) => {
    return location.pathname === href
  }

  const renderNavItem = (item, isMobile = false) => {
    const Icon = item.icon
    const Component = isMobile ? Link : Link
    
    return (
      <Component
        key={item.name}
        to={item.href}
        className={`sidebar-item ${isActiveRoute(item.href) ? 'active' : ''}`}
        onClick={isMobile ? () => setSidebarOpen(false) : undefined}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Component>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">EMS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => renderNavItem(item, true))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">Employee Management System</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => renderNavItem(item, false))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="sidebar-item w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
              <input
                type="text"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
            <div className="flex items-center gap-x-4">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
