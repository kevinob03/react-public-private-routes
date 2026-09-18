import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ESTUDIANTE_ID = '1'

function Perfil() {
  const [estudiante, setEstudiante] = useState(null)
  const [ultimoResultado, setUltimoResultado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorOrientacion, setErrorOrientacion] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarPerfil() {
      try {
        const estudianteResponse = await fetch(`http://localhost:3001/estudiantes/${ESTUDIANTE_ID}`, { signal: controller.signal })
        if (!estudianteResponse.ok) throw new Error('No se pudo cargar el estudiante')
        setEstudiante(await estudianteResponse.json())

        try {
          const resultadosResponse = await fetch('http://localhost:3001/resultadosVocacionales', { signal: controller.signal })
          if (!resultadosResponse.ok) throw new Error('No se pudo cargar la orientación')
          const resultados = await resultadosResponse.json()
          const propios = resultados
            .filter((resultado) => String(resultado.estudianteId) === ESTUDIANTE_ID)
            .sort((resultadoA, resultadoB) => new Date(resultadoB.fecha) - new Date(resultadoA.fecha))
          setUltimoResultado(propios[0] ?? null)
        } catch (resultadoError) {
          if (resultadoError.name !== 'AbortError') setErrorOrientacion('No pudimos consultar tu último resultado vocacional.')
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudo cargar el perfil. Comprueba JSON Server.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarPerfil()
    return () => controller.abort()
  }, [])

  const nombre = estudiante?.nombre ?? 'Estudiante'
  const inicial = nombre.slice(0, 1).toUpperCase()
  const areaPrincipal = ultimoResultado?.areas?.[0]

  return (
    <main className="page container profile-page">
      <header className="page-heading page-heading--actions">
        <div><span className="eyebrow">Tu cuenta</span><h1>Mi perfil</h1><p>Consulta tu información y tu avance académico.</p></div>
        <Link className="button button--outline" to="/perfil/configuracion">Configuración</Link>
      </header>
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
          <section className="profile-card profile-orientation">
            <div><span className="eyebrow">Descubre tus intereses</span><h2>Orientación vocacional</h2></div>
            {errorOrientacion ? <p className="form-message form-message--error" role="alert">{errorOrientacion}</p> : ultimoResultado ? (
              <div className="profile-orientation__result">
                <p>Último resultado</p><strong>{ultimoResultado.perfil}</strong>
                {areaPrincipal ? <span>Mayor afinidad: {areaPrincipal.nombre} — {areaPrincipal.afinidad}%</span> : null}
              </div>
            ) : <p>Aún no has realizado tu orientación vocacional.</p>}
            <Link className="button button--small" to="/orientacion">{ultimoResultado ? 'Ver / repetir orientación' : 'Realizar test'}</Link>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default Perfil
