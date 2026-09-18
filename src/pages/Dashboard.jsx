import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard.jsx'
import StatCard from '../components/StatCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const ESTUDIANTE_ID = '1'

function Dashboard() {
  const { user } = useAuth()
  const nombreRol = user?.role === 'admin' ? 'administrador' : 'estudiante'
  const [misCursos, setMisCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarMisCursos() {
      try {
        const [inscripcionesResponse, cursosResponse] = await Promise.all([
          fetch('http://localhost:3001/inscripciones', { signal: controller.signal }),
          fetch('http://localhost:3001/cursos', { signal: controller.signal }),
        ])
        if (!inscripcionesResponse.ok || !cursosResponse.ok) throw new Error('No se pudieron cargar las inscripciones')

        const [inscripciones, cursos] = await Promise.all([inscripcionesResponse.json(), cursosResponse.json()])
        const cursosPorId = new Map(cursos.map((curso) => [String(curso.id), curso]))
        const inscripcionesEstudiante = inscripciones.filter((inscripcion) => String(inscripcion.estudianteId) === ESTUDIANTE_ID)
        setMisCursos(inscripcionesEstudiante.flatMap((inscripcion) => {
          const curso = cursosPorId.get(String(inscripcion.cursoId))
          return curso ? [{ ...curso, progreso: inscripcion.progreso }] : []
        }))
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudieron cargar tus cursos. Comprueba JSON Server.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarMisCursos()
    return () => controller.abort()
  }, [])

  const completados = misCursos.filter((curso) => curso.progreso === 100).length
  const progresoPromedio = misCursos.length
    ? Math.round(misCursos.reduce((total, curso) => total + curso.progreso, 0) / misCursos.length)
    : 0
  const estadisticas = [
    { id: 1, icono: '▣', valor: String(misCursos.length), etiqueta: 'Cursos inscritos' },
    { id: 2, icono: '✓', valor: String(completados), etiqueta: 'Cursos completados' },
    { id: 3, icono: '◷', valor: `${progresoPromedio}%`, etiqueta: 'Progreso promedio' },
  ]

  return (
    <main className="page container">
      <header className="page-heading"><span className="eyebrow">Panel del estudiante</span><h1>Hola, {nombreRol} 👋</h1><p>Continúa aprendiendo donde lo dejaste.</p></header>
      <section className="stats-grid" aria-label="Resumen académico">
        {estadisticas.map((estadistica) => <StatCard key={estadistica.id} {...estadistica} />)}
      </section>
      <section className="dashboard-section">
        <div className="section-heading"><div><h2>Mis cursos</h2><p>Retoma tus lecciones y continúa avanzando.</p></div></div>
        {cargando ? <p className="status-message">Cargando tus cursos...</p> : null}
        {error ? <p className="status-message status-message--error" role="alert">{error}</p> : null}
        {!cargando && !error && misCursos.length === 0 ? <p className="status-message">Aún no estás inscrito en ningún curso.</p> : null}
        {!cargando && !error && misCursos.length > 0 ? <div className="course-grid">{misCursos.map((curso) => <CourseCard key={curso.id} {...curso} />)}</div> : null}
      </section>
    </main>
  )
}

export default Dashboard
