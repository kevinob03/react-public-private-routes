import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard.jsx'
import StatCard from '../components/StatCard.jsx'

const estadisticas = [
  { id: 1, icono: '▣', valor: '3', etiqueta: 'Cursos inscritos' },
  { id: 2, icono: '✓', valor: '1', etiqueta: 'Cursos completados' },
  { id: 3, icono: '◷', valor: '24', etiqueta: 'Horas estudiadas' },
]

function Dashboard() {
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function cargarCursos() {
      try {
        const response = await fetch('http://localhost:3001/cursos', { signal: controller.signal })
        if (!response.ok) throw new Error('No se pudieron cargar los cursos')
        setCursos(await response.json())
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudieron cargar los cursos. Comprueba JSON Server.')
      } finally {
        if (!controller.signal.aborted) setCargando(false)
      }
    }

    cargarCursos()
    return () => controller.abort()
  }, [])

  return (
    <main className="page container">
      <header className="page-heading"><span className="eyebrow">Panel del estudiante</span><h1>Hola, estudiante 👋</h1><p>Continúa aprendiendo donde lo dejaste.</p></header>
      <section className="stats-grid" aria-label="Resumen académico">
        {estadisticas.map((estadistica) => <StatCard key={estadistica.id} {...estadistica} />)}
      </section>
      <section className="dashboard-section">
        <div className="section-heading"><div><h2>Mis cursos</h2><p>Retoma tus lecciones y continúa avanzando.</p></div></div>
        {cargando ? <p className="status-message">Cargando cursos...</p> : null}
        {error ? <p className="status-message status-message--error" role="alert">{error}</p> : null}
        {!cargando && !error ? <div className="course-grid">{cursos.map((curso) => <CourseCard key={curso.id} {...curso} />)}</div> : null}
      </section>
    </main>
  )
}

export default Dashboard
