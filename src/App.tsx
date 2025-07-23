// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import Services from './pages/Services'
import Dashboard from './admin/pages/Dashboard'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'

// Lazy load pages for better performance

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏗️ Public pages use MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />           {/* / */}
          <Route path="services" element={<Services />} />  {/* /services */}
          <Route path="about" element={<About />} />         {/* /about */}
          <Route path="login" element={<Login />} />         {/* /login */}
        </Route>
        
        {/* 🏗️ Admin pages use DashboardLayout */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />     {/* /admin/dashboard */}
          {/* More admin routes would go here */}
        </Route>
        
        {/* 🏗️ Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App