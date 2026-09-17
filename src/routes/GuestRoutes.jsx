import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function GuestRoutes() {
  const { authStatus, isAuthenticated } = useAuth()

  if (authStatus === 'checking') {
    return <main className="session-check">Verificando sesión…</main>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

export default GuestRoutes
