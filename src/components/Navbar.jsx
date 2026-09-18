import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { authStatus, isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar__content">
        <NavLink className="brand" to="/" aria-label="CourseHub, página de inicio">
          <span className="brand__icon">C</span>
          Course<span>Hub</span>
        </NavLink>

        <nav className="navbar__links" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/cursos">Cursos</NavLink>
          {authStatus === 'checking' ? null : isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/orientacion">Orientación IA</NavLink>
              <NavLink to="/perfil">Mi Perfil</NavLink>
              {user?.role === 'admin' ? <NavLink to="/dashboard/usuarios">Usuarios</NavLink> : null}
              <button className="button button--small button--outline" type="button" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink className="button button--small" to="/registro">Registrarse</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
