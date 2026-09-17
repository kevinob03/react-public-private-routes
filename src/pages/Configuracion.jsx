const secciones = [
  { id: 1, titulo: 'Preferencias de cuenta', texto: 'Administra las preferencias generales de tu experiencia en CourseHub.' },
  { id: 2, titulo: 'Notificaciones', texto: 'Elige cómo deseas recibir novedades sobre tus cursos y progreso.' },
  { id: 3, titulo: 'Privacidad', texto: 'Consulta las opciones relacionadas con la privacidad de tu cuenta.' },
]

function Configuracion() {
  return (
    <main className="page container">
      <header className="page-heading"><span className="eyebrow">Tu cuenta</span><h1>Configuración</h1><p>Revisa las preferencias principales de tu cuenta.</p></header>
      <div className="settings-grid">
        {secciones.map((seccion) => (
          <section className="profile-card" key={seccion.id}>
            <h2>{seccion.titulo}</h2>
            <p>{seccion.texto}</p>
          </section>
        ))}
      </div>
    </main>
  )
}

export default Configuracion
