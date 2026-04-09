import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Deseas cerrar la sesion actual?')
    if (!confirmed) {
      return
    }

    await logout()
  }

  return (
    <nav className="navbar-custom">
      <div className="navbar-brand">
        <div>
          <p>SSC | Publicaciones</p>
          <h2>Portal institucional</h2>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-summary">
          <span className={`role-pill role-${user.role}`}>
            {user.role === 'admin' ? 'Administrador' : 'Usuario normal'}
          </span>
          <strong>{user.name}</strong>
          <small>{user.accountNumber}</small>
        </div>

        <button type="button" className="secondary-button" onClick={() => void handleLogout()}>
          Salir
        </button>
      </div>
    </nav>
  )
}

export default Navbar
