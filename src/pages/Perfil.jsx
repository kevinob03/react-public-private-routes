import { useEffect, useState } from 'react'

function Perfil() {
  const [estudiante, setEstudiante] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarEstudiante() {
      try {
        const response = await fetch('http://localhost:3001/estudiantes/1', { signal: controller.signal })
        if (!response.ok) throw new Error('No se pudo cargar el estudiante')
        setEstudiante(await response.json())
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudo cargar el perfil. Comprueba JSON Server.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarEstudiante()
    return () => controller.abort()
  }, [])

  const nombre = estudiante?.nombre ?? 'Estudiante'
  const inicial = nombre.slice(0, 1).toUpperCase()

  return (
    <main className="page container profile-page">
      <header className="page-heading"><span className="eyebrow">Tu cuenta</span><h1>Mi perfil</h1><p>Consulta tu información y tu avance académico.</p></header>
      {cargando ? <p className="status-message">Cargando perfil...</p> : null}
      {error ? <p className="status-message status-message--error" role="alert">{error}</p> : null}
      {!cargando && !error ? (
        <div className="profile-grid">
          <aside className="profile-card profile-summary"><div className="avatar">{inicial}</div><h2>{nombre}</h2><p>{estudiante.correo}</p><span className="tag">Miembro activo</span></aside>
          <section className="profile-card profile-details">
            <h2>Información personal</h2>
            <dl><div><dt>Nombre completo</dt><dd>{nombre}</dd></div><div><dt>Correo electrónico</dt><dd>{estudiante.correo}</dd></div><div><dt>Área de interés</dt><dd>{estudiante.areaInteres}</dd></div></dl>
          </section>
          <section className="profile-card profile-progress">
            <h2>Progreso académico</h2>
            <div className="profile-stats"><div><strong>3</strong><span>Cursos activos</span></div><div><strong>1</strong><span>Completado</span></div><div><strong>24 h</strong><span>Estudiadas</span></div></div>
            <div className="progress__heading"><span>Progreso general</span><strong>65%</strong></div><div className="progress"><span style={{ width: '65%' }} /></div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default Perfil
