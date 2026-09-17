import { useEffect, useState } from 'react'

function Usuarios() {
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarEstudiantes() {
      try {
        const response = await fetch('http://localhost:3001/estudiantes', { signal: controller.signal })
        if (!response.ok) throw new Error('No se pudieron cargar los estudiantes')
        setEstudiantes(await response.json())
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudieron cargar los estudiantes. Comprueba JSON Server.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarEstudiantes()
    return () => controller.abort()
  }, [])

  return (
    <main className="page container">
      <header className="page-heading"><span className="eyebrow">Administración</span><h1>Gestión de usuarios</h1><p>Consulta los estudiantes registrados en CourseHub.</p></header>
      {cargando ? <p className="status-message">Cargando estudiantes...</p> : null}
      {error ? <p className="status-message status-message--error" role="alert">{error}</p> : null}
      {!cargando && !error ? (
        <section className="table-card">
          <div className="users-table" role="table" aria-label="Estudiantes registrados">
            <div className="users-table__row users-table__header" role="row">
              <span role="columnheader">Nombre</span><span role="columnheader">Correo</span><span role="columnheader">Área de interés</span>
            </div>
            {estudiantes.map((estudiante) => (
              <div className="users-table__row" role="row" key={estudiante.id}>
                <span role="cell" data-label="Nombre">{estudiante.nombre}</span>
                <span role="cell" data-label="Correo">{estudiante.correo}</span>
                <span role="cell" data-label="Área de interés">{estudiante.areaInteres}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default Usuarios
