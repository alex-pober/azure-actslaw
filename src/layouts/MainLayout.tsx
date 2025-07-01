import { Outlet, Link, useLocation } from 'react-router'

export default function MainLayout() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 🔝 HEADER - Appears on every page using this layout */}
      <header className="bg-blue-600 text-white shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">
              ACTS Law Firm
            </Link>
            <div className="space-x-6">
              <Link 
                to="/" 
                className={`hover:text-blue-200 ${location.pathname === '/' ? 'underline' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className={`hover:text-blue-200 ${location.pathname === '/services' ? 'underline' : ''}`}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className={`hover:text-blue-200 ${location.pathname === '/about' ? 'underline' : ''}`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`hover:text-blue-200 ${location.pathname === '/contact' ? 'underline' : ''}`}
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 📄 MAIN CONTENT - This is where pages get rendered */}
      <main className="flex-1 bg-gray-50">
        {/* The <Outlet /> is where the current page component gets inserted */}
        <Outlet />
      </main>

      {/* 🔻 FOOTER - Appears on every page using this layout */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 ACTS Law Firm. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <span>📧 info@actslaw.com</span>
            <span>📞 (555) 123-4567</span>
          </div>
        </div>
      </footer>
    </div>
  )
}