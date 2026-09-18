import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getRememberedMicrosoftLearnCourse } from '../services/microsoftLearnService.js'

const STUDENT_ID = '1'

function CursoDetalle() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState('')
  const isExternalId = id.startsWith('microsoft-learn-')
  const navigationCourse = location.state?.curso

  useEffect(() => {
    const controller = new AbortController()

    async function loadCourse() {
      setLoading(true)
      setError('')
      setNotFound(false)

      if (isExternalId) {
        const externalCourse = navigationCourse?.id === id ? navigationCourse : getRememberedMicrosoftLearnCourse(id)
        if (externalCourse) setCourse(externalCourse)
        else setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const courseResponse = await fetch(`http://localhost:3001/cursos/${id}`, { signal: controller.signal })
        if (courseResponse.status === 404) {
          setNotFound(true)
          return
        }
        if (!courseResponse.ok) throw new Error('No se pudo cargar el curso')
        setCourse(await courseResponse.json())

        if (isAuthenticated) {
          const enrollmentResponse = await fetch('http://localhost:3001/inscripciones', { signal: controller.signal })
          if (!enrollmentResponse.ok) throw new Error('No se pudo comprobar la inscripción')
          const enrollments = await enrollmentResponse.json()
          setEnrollment(enrollments.find((item) => String(item.estudianteId) === STUDENT_ID && String(item.cursoId) === String(id)) ?? null)
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setError('No se pudo cargar el curso. Comprueba que JSON Server esté ejecutándose.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCourse()
    return () => controller.abort()
  }, [id, isAuthenticated, isExternalId, navigationCourse])

  async function handleEnrollment() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    setEnrolling(true)
    setEnrollmentError('')
    try {
      const verification = await fetch('http://localhost:3001/inscripciones')
      if (!verification.ok) throw new Error('No se pudo comprobar la inscripción')
      const existing = await verification.json()
      const currentEnrollment = existing.find((item) => String(item.estudianteId) === STUDENT_ID && String(item.cursoId) === String(id))

      if (currentEnrollment) {
        setEnrollment(currentEnrollment)
        return
      }

      const response = await fetch('http://localhost:3001/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudianteId: STUDENT_ID, cursoId: id, progreso: 0 }),
      })
      if (!response.ok) throw new Error('No se pudo crear la inscripción')
      setEnrollment(await response.json())
    } catch {
      setEnrollmentError('No se pudo completar la inscripción. Inténtalo de nuevo.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <main className="page container"><p className="status-message">Cargando curso...</p></main>
  if (error) return <main className="page container"><p className="status-message status-message--error" role="alert">{error}</p><Link className="button detail-back" to="/cursos">Volver a cursos</Link></main>
  if (notFound || !course) return <main className="not-found course-not-found"><span>Curso</span><h1>Curso no encontrado</h1><p>Vuelve al catálogo para cargar nuevamente la información disponible.</p><Link className="button" to="/cursos">Volver a cursos</Link></main>

  return (
    <main className="page container course-detail">
      <Link className="detail-link" to="/cursos">← Volver a cursos</Link>
      <article className="course-detail__card">
        {course.imagen ? <img className="course-detail__image" src={course.imagen} alt={course.titulo} onError={(event) => { event.currentTarget.hidden = true }} /> : null}
        <div className="course-detail__header">
          <div>
            <div className="course-card__tags"><span className="tag">{course.categoria}</span>{course.proveedor ? <span className="tag tag--provider">{course.proveedor}</span> : null}</div>
            <h1>{course.titulo}</h1>
            {course.profesor ? <p>Por {course.profesor}</p> : course.proveedor ? <p>Contenido ofrecido por {course.proveedor}</p> : null}
          </div>
          <div className="course-detail__facts">
            <span><strong>Nivel</strong>{course.nivel}</span>
            <span><strong>{course.esExterno ? 'Esfuerzo' : 'Duración'}</strong>{course.esExterno ? (course.esfuerzo ?? 'No especificado') : course.duracion}</span>
            {typeof course.inscritos === 'number' ? <span><strong>Inscritos</strong>{new Intl.NumberFormat('es').format(course.inscritos)}</span> : null}
          </div>
        </div>
        <div className="course-detail__content">
          <section><h2>Acerca del curso</h2><p>{course.descripcion}</p></section>
          {!course.esExterno && Array.isArray(course.modulos) ? <section><h2>Módulos</h2><ol className="module-list">{course.modulos.map((module) => <li key={module}>{module}</li>)}</ol></section> : null}
          {course.esExterno ? (
            <section className="external-course-action">
              <p>Este contenido pertenece a Microsoft Learn. CourseHub no gestiona la inscripción ni el progreso en el sitio externo.</p>
              {course.urlExterna ? <a className="button" href={course.urlExterna} target="_blank" rel="noopener noreferrer">Ver en Microsoft Learn</a> : <p className="status-message">Microsoft Learn no proporcionó un enlace para este curso.</p>}
            </section>
          ) : (
            <>
              {enrollment ? (
                <section>
                  <div className="progress__heading"><span>Tu progreso</span><strong>{enrollment.progreso}%</strong></div>
                  <div className="progress" role="progressbar" aria-label={`Progreso de ${course.titulo}`} aria-valuenow={enrollment.progreso} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${enrollment.progreso}%` }} /></div>
                </section>
              ) : typeof course.progreso === 'number' ? <section><div className="progress__heading"><span>Progreso del curso</span><strong>{course.progreso}%</strong></div><div className="progress"><span style={{ width: `${course.progreso}%` }} /></div></section> : null}
              {enrollmentError ? <p className="form-message form-message--error" role="alert">{enrollmentError}</p> : null}
              <button className="button enrollment-button" type="button" onClick={handleEnrollment} disabled={Boolean(enrollment) || enrolling}>{enrollment ? 'Ya estás inscrito' : enrolling ? 'Inscribiendo...' : 'Inscribirme al curso'}</button>
            </>
          )}
        </div>
      </article>
    </main>
  )
}

export default CursoDetalle
