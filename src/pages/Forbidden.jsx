import { Link } from 'react-router-dom'

function Forbidden() {
  return (
    <main className="not-found forbidden">
      <span>403</span>
      <h1>Acceso denegado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <Link className="button" to="/dashboard">Volver al dashboard</Link>
    </main>
  )
}

export default Forbidden
