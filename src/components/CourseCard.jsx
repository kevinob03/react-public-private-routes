import { useState } from 'react'
import { Link } from 'react-router-dom'

function CourseCard(course) {
  const { id, titulo, nombre, profesor, categoria, nivel, duracion, progreso, imagen, proveedor, inscritos, esExterno } = course
  const [imageAvailable, setImageAvailable] = useState(Boolean(imagen))
  const courseName = titulo ?? nombre
  const showProgress = !esExterno && typeof progreso === 'number'

  return (
    <article className="course-card">
      <div className={`course-card__cover ${imageAvailable ? 'course-card__cover--image' : ''}`}>
        {imageAvailable ? <img src={imagen} alt={courseName} onError={() => setImageAvailable(false)} /> : <span aria-hidden="true">{categoria?.slice(0, 1) ?? 'C'}</span>}
      </div>
      <div className="course-card__body">
        <div className="course-card__tags">
          <span className="tag">{categoria}</span>
          {proveedor ? <span className="tag tag--provider">{proveedor}</span> : null}
        </div>
        <h3>{courseName}</h3>
        {profesor ? <p>Por {profesor}</p> : proveedor ? <p>Contenido ofrecido por {proveedor}</p> : null}
        {(nivel || duracion) ? <p className="course-card__meta">{[nivel, duracion].filter(Boolean).join(' · ')}</p> : null}
        {typeof inscritos === 'number' ? <p className="course-card__enrollment">{new Intl.NumberFormat('es').format(inscritos)} estudiantes inscritos</p> : null}
        {showProgress ? (
          <>
            <div className="progress__heading"><span>Progreso</span><strong>{progreso}%</strong></div>
            <div className="progress" role="progressbar" aria-label={`Progreso de ${courseName}`} aria-valuenow={progreso} aria-valuemin="0" aria-valuemax="100">
              <span style={{ width: `${progreso}%` }} />
            </div>
          </>
        ) : null}
        <Link className="button button--small button--full course-card__button" to={`/cursos/${id}`} state={esExterno ? { curso: course } : undefined}>Ver curso</Link>
      </div>
    </article>
  )
}

export default CourseCard
