import { Outlet, Link, useLocation } from 'react-router'
import { useIsAuthenticated } from '@azure/msal-react'
import UserProfile from '../components/UserProfile'
import SmartAdvocateSearch from '../components/SmartAdvocateSearch'
import { useSmartAdvocate } from '../contexts/SmartAdvocateContext'

export default function MainLayout() {
  const location = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const { bearerToken, isConnected } = useSmartAdvocate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 🔝 MODERN HEADER - FileVine inspired */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/acts-law-logo.svg"
                alt="ACTS Law"
                className="h-15 w-auto"
              />
            </Link>

            {/* Center - SmartAdvocate Search (only when connected) */}
            <div className="flex-1 flex justify-center px-8">
              {isAuthenticated && isConnected && bearerToken && (
                <SmartAdvocateSearch bearerToken={bearerToken} />
              )}
            </div>

            {/* Right - Navigation and User Profile */}
            <div className="flex items-center space-x-8">
              {isAuthenticated && (
                <div className="hidden md:flex space-x-6">
                  <Link
                    to="/home"
                    className={`text-sm font-medium transition-colors duration-200 ${
                      location.pathname === '/home'
                        ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dashboard
                  </Link>
                </div>
              )}

              {/* User Profile or Sign In */}
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">Please sign in to continue</p>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* 📄 MAIN CONTENT - Modern container */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 🔻 MODERN FOOTER */}
      {/* <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-600">&copy; 2025 ACTS Law Firm. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="mailto:info@actslaw.com" className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@actslaw.com</span>
              </a>
              <a href="tel:+15551234567" className="text-sm text-slate-500 hover:text-slate-700 flex items-center space-x-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(555) 123-4567</span>
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
