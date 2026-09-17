import { Link } from 'react-router-dom'
import CourseCard from '../components/CourseCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const cursosDestacados = [
  { id: 1, nombre: 'Desarrollo Web con React', profesor: 'Carlos Mendoza', categoria: 'Frontend', progreso: 65 },
  { id: 2, nombre: 'Diseño de Interfaces UI/UX', profesor: 'Elena Rostova', categoria: 'Diseño', progreso: 40 },
  { id: 3, nombre: 'Bases de Datos Relacionales', profesor: 'Javier Paredes', categoria: 'Datos', progreso: 90 },
]

function Home() {
  const { authStatus } = useAuth()

  return (
    <main>
      <section className="hero">
        <div className="container hero__content">
          <div className="hero__copy">
            <span className="eyebrow">Tu aprendizaje, en un solo lugar</span>
            <h1>Aprende a tu ritmo.<br /><span>Construye tu futuro.</span></h1>
            <p>CourseHub permite acceder a cursos, seguir el progreso y organizar el aprendizaje de forma sencilla.</p>
            <div className="button-row">
              <a className="button" href="#cursos">Explorar cursos</a>
              {authStatus === 'unauthenticated' ? <Link className="button button--outline" to="/login">Iniciar sesión</Link> : null}
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <div className="hero-card hero-card--main"><span>Progreso semanal</span><strong>8.5 horas</strong><div className="mini-chart"><i /><i /><i /><i /><i /></div></div>
            <div className="hero-card hero-card--floating"><span>Curso completado</span><strong>✓ ¡Excelente!</strong></div>
          </div>
        </div>
      </section>

      <section className="section container" id="cursos">
        <div className="section-heading"><div><span className="eyebrow">Sigue creciendo</span><h2>Cursos destacados</h2></div><p>Descubre contenidos diseñados para desarrollar habilidades que puedes aplicar.</p></div>
        <div className="course-grid">
          {cursosDestacados.map((curso) => <CourseCard key={curso.id} {...curso} />)}
        </div>
      </section>
    </main>
  )
}

export default Home
