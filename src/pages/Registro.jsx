import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Registro() {
  const [formulario, setFormulario] = useState({ nombre: '', correo: '', contrasena: '', confirmacion: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setFormulario((datosActuales) => ({ ...datosActuales, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const { nombre, correo, contrasena, confirmacion } = formulario

    if (!nombre.trim() || !correo.trim() || !contrasena || !confirmacion) {
      setError('Completa todos los campos.')
      return
    }
    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setEnviando(true)
    try {
      const response = await fetch('http://localhost:3001/estudiantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), correo: correo.trim(), areaInteres: 'Desarrollo Web' }),
      })
      if (!response.ok) throw new Error('No se pudo completar el registro')
      navigate('/login')
    } catch {
      setError('No se pudo conectar con JSON Server. Comprueba que esté ejecutándose.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__icon">C</div>
        <h1>Crea tu cuenta</h1>
        <p>Empieza hoy tu camino de aprendizaje.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label>Nombre completo<input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} placeholder="Tu nombre" autoComplete="name" required /></label>
          <label>Correo electrónico<input type="email" name="correo" value={formulario.correo} onChange={handleChange} placeholder="nombre@correo.com" autoComplete="email" required /></label>
          <label>Contraseña<input type="password" name="contrasena" value={formulario.contrasena} onChange={handleChange} placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength="8" required /></label>
          <label>Confirmar contraseña<input type="password" name="confirmacion" value={formulario.confirmacion} onChange={handleChange} placeholder="Repite tu contraseña" autoComplete="new-password" minLength="8" required /></label>
          {error ? <p className="form-message form-message--error" role="alert">{error}</p> : null}
          <button className="button button--full" type="submit" disabled={enviando}>{enviando ? 'Creando cuenta...' : 'Crear cuenta'}</button>
        </form>
        <p className="auth-card__footer">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
      </section>
    </main>
  )
}

export default Registro
