import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [role, setRole] = useState('usuario')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    if (!correo.trim() || !contrasena.trim()) {
      setError('Completa el correo y la contraseña.')
      return
    }

    setError('')
    login({ email: correo.trim(), role })
    navigate(location.state?.from ?? '/dashboard', { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__icon">C</div>
        <h1>Bienvenido de nuevo</h1>
        <p>Ingresa tus datos para continuar aprendiendo.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>Correo electrónico<input type="email" name="correo" value={correo} onChange={(event) => setCorreo(event.target.value)} placeholder="nombre@correo.com" autoComplete="email" /></label>
          <label>Contraseña<input type="password" name="contrasena" value={contrasena} onChange={(event) => setContrasena(event.target.value)} placeholder="••••••••" autoComplete="current-password" /></label>
          <label>Rol para la demostración<select name="role" value={role} onChange={(event) => setRole(event.target.value)}><option value="usuario">Usuario</option><option value="admin">Administrador</option></select></label>
          {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
          <button className="button button--full" type="submit">Iniciar sesión</button>
        </form>
        <p className="auth-card__footer">¿No tienes una cuenta? <Link to="/registro">Regístrate</Link></p>
      </section>
    </main>
  )
}

export default Login
