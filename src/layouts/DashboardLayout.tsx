// 🏗️ SPECIALIZED LAYOUT - For admin/dashboard pages
// layouts/DashboardLayout.tsx
import { Outlet, Link, useLocation } from 'react-router'

export default function DashboardLayout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex">
      {/* 📊 SIDEBAR - Only appears in dashboard pages */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
          <nav className="space-y-2">
            <Link 
              to="/admin/dashboard" 
              className={`block p-2 rounded ${location.pathname === '/admin/dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              📊 Overview
            </Link>
            <Link 
              to="/admin/clients" 
              className={`block p-2 rounded ${location.pathname === '/admin/clients' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              👥 Clients
            </Link>
            <Link 
              to="/admin/cases" 
              className={`block p-2 rounded ${location.pathname === '/admin/cases' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              📋 Cases
            </Link>
          </nav>
        </div>
      </aside>

      {/* 📄 DASHBOARD CONTENT */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}