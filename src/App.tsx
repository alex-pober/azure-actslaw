// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router'
import MainLayout from './layouts/MainLayout'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import Login from './pages/Login'
import CaseDetails from './pages/CaseDetails'
import AuthenticationGuard from './components/AuthenticationGuard'
import { SmartAdvocateProvider } from './contexts/SmartAdvocateContext'
import { CaseProvider } from './contexts/CaseContext'

// Lazy load pages for better performance

function App() {
  return (
    <SmartAdvocateProvider>
      <CaseProvider>
        <BrowserRouter>
          <Routes>
            {/* 🏗️ Login route - accessible without authentication */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Login />} />           {/* / */}
            </Route>
            
            {/* 🏗️ Protected routes */}
            <Route path="/" element={<AuthenticationGuard><MainLayout /></AuthenticationGuard>}>
              <Route path="home" element={<Home />} />           {/* /home */}
              <Route path="case/:caseId" element={<CaseDetails />} />  {/* /case/{caseId} */}
            </Route>
            
            {/* 🏗️ Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CaseProvider>
    </SmartAdvocateProvider>
  )
}

export default App