function CourseCard({ nombre, profesor, categoria, progreso }) {
  return (
    <article className="course-card">
      <div className="course-card__cover" aria-hidden="true">
        <span>{categoria.slice(0, 1)}</span>
      </div>
      <div className="course-card__body">
        <span className="tag">{categoria}</span>
        <h3>{nombre}</h3>
        <p>Por {profesor}</p>
        <div className="progress__heading">
          <span>Progreso</span>
          <strong>{progreso}%</strong>
        </div>
        <div className="progress" role="progressbar" aria-label={`Progreso de ${nombre}`} aria-valuenow={progreso} aria-valuemin="0" aria-valuemax="100">
          <span style={{ width: `${progreso}%` }} />
        </div>
      </div>
    </article>
  )
}

export default CourseCard
