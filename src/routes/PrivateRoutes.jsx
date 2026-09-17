import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function PrivateRoutes({ requiredRole }) {
  const { authStatus, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (authStatus === 'checking') {
    return <main className="session-check">Verificando sesión…</main>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}

export default PrivateRoutes
