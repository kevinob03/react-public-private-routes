function StatCard({ icono, valor, etiqueta }) {
  return (
    <article className="stat-card">
      <span className="stat-card__icon" aria-hidden="true">{icono}</span>
      <div><strong>{valor}</strong><p>{etiqueta}</p></div>
    </article>
  )
}

export default StatCard
