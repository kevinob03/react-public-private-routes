import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found"><span>404</span><h1>Página no encontrada</h1><p>Parece que la página que buscas no existe.</p><Link className="button" to="/">Volver al inicio</Link></main>
  )
}

export default NotFound
