import './App.css'
import AdminDashboard from './components/AdminDashboard'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import UserPortal from './components/UserPortal'
import { AuthProvider, useAuth } from './context/AuthContext'

const AppContent = () => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">{isAdmin ? <AdminDashboard /> : <UserPortal />}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <PrivateRoute>
        <AppContent />
      </PrivateRoute>
    </AuthProvider>
  )
}

export default App
