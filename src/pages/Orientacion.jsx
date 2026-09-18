import { useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard.jsx'
import bloquesVocacionales from '../data/preguntasVocacionales.js'
import { getMicrosoftLearnCourses } from '../services/microsoftLearnService.js'

const ESTUDIANTE_ID = '1'
const ESCALA = [
  { valor: 1, etiqueta: 'Nada' },
  { valor: 2, etiqueta: 'Poco' },
  { valor: 3, etiqueta: 'Neutral' },
  { valor: 4, etiqueta: 'Bastante' },
  { valor: 5, etiqueta: 'Mucho' },
]

function Orientacion() {
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [fase, setFase] = useState('test')
  const [errorValidacion, setErrorValidacion] = useState('')
  const [errorAnalisis, setErrorAnalisis] = useState('')
  const [errorGuardado, setErrorGuardado] = useState('')
  const [errorCursos, setErrorCursos] = useState('')
  const [avisoCursosExternos, setAvisoCursosExternos] = useState('')
  const [resultado, setResultado] = useState(null)
  const [cursos, setCursos] = useState([])
  const bloqueActual = bloquesVocacionales[paso]

  const totalPreguntas = useMemo(
    () => bloquesVocacionales.reduce((total, bloque) => total + bloque.preguntas.length, 0),
    [],
  )
  const totalRespondidas = Object.keys(respuestas).length
  const progreso = Math.round((totalRespondidas / totalPreguntas) * 100)
  const pasoCompleto = bloqueActual.preguntas.every((pregunta) => respuestas[pregunta.id])

  function seleccionarRespuesta(preguntaId, valor) {
    setRespuestas((actuales) => ({ ...actuales, [preguntaId]: valor }))
    setErrorValidacion('')
  }

  function avanzar() {
    if (!pasoCompleto) {
      setErrorValidacion('Responde todas las preguntas de este bloque para continuar.')
      return
    }
    setPaso((actual) => Math.min(actual + 1, bloquesVocacionales.length - 1))
    setErrorValidacion('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retroceder() {
    setPaso((actual) => Math.max(actual - 1, 0))
    setErrorValidacion('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function guardarResultado(resultadoIA) {
    const response = await fetch('http://localhost:3001/resultadosVocacionales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estudianteId: ESTUDIANTE_ID,
        fecha: new Date().toISOString(),
        perfil: resultadoIA.perfil,
        resumen: resultadoIA.resumen,
        areas: resultadoIA.areas,
        fortalezas: resultadoIA.fortalezas,
        sugerencias: resultadoIA.sugerencias,
      }),
    })
    if (!response.ok) throw new Error('No se pudo guardar el resultado')
  }

  async function cargarRecomendaciones(resultadoIA) {
    const response = await fetch('http://localhost:3001/cursos')
    if (!response.ok) throw new Error('No se pudieron cargar los cursos')
    const cursosLocales = await response.json()
    let cursosMicrosoftLearn = []

    try {
      const paginaMicrosoftLearn = await getMicrosoftLearnCourses({ limit: 60, offset: 0 })
      cursosMicrosoftLearn = paginaMicrosoftLearn.courses
    } catch {
      setAvisoCursosExternos('No pudimos incluir cursos de Microsoft Learn en estas recomendaciones. Mostramos alternativas de CourseHub.')
    }

    const catalogo = [...cursosMicrosoftLearn, ...cursosLocales]
    const prioridad = new Map(resultadoIA.areas.map((area, indice) => [area.nombre, indice]))
    const recomendados = catalogo
      .filter((curso) => prioridad.has(curso.areaVocacional))
      .sort((cursoA, cursoB) => prioridad.get(cursoA.areaVocacional) - prioridad.get(cursoB.areaVocacional))
      .slice(0, 6)
    setCursos(recomendados)
  }

  async function analizarPerfil() {
    const todasCompletas = bloquesVocacionales.every((bloque) => bloque.preguntas.every((pregunta) => respuestas[pregunta.id]))
    if (!todasCompletas) {
      setErrorValidacion('Completa todas las preguntas antes de analizar tu perfil.')
      return
    }

    const respuestasParaAnalisis = bloquesVocacionales.flatMap((bloque) => bloque.preguntas.map((pregunta) => ({
      pregunta: pregunta.texto,
      bloque: bloque.titulo,
      valor: respuestas[pregunta.id],
    })))

    setFase('analizando')
    setErrorAnalisis('')
    setErrorGuardado('')
    setErrorCursos('')
    setAvisoCursosExternos('')

    try {
      const response = await fetch('http://localhost:3002/api/orientacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas: respuestasParaAnalisis }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.mensaje || 'No pudimos analizar tu orientación en este momento. Inténtalo nuevamente.')

      setResultado(data)
      setFase('resultado')

      const [guardado, recomendaciones] = await Promise.allSettled([
        guardarResultado(data),
        cargarRecomendaciones(data),
      ])
      if (guardado.status === 'rejected') setErrorGuardado('El resultado se muestra correctamente, pero no pudimos guardarlo en tu historial.')
      if (recomendaciones.status === 'rejected') setErrorCursos('No pudimos cargar los cursos recomendados en este momento.')
    } catch (error) {
      setErrorAnalisis(error.message || 'No pudimos analizar tu orientación en este momento. Inténtalo nuevamente.')
      setFase('test')
    }
  }

  function repetirTest() {
    setPaso(0)
    setRespuestas({})
    setResultado(null)
    setCursos([])
    setErrorAnalisis('')
    setErrorGuardado('')
    setErrorCursos('')
    setAvisoCursosExternos('')
    setErrorValidacion('')
    setFase('test')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (fase === 'analizando') {
    return (
      <main className="orientation-loading">
        <div className="loading-spinner" aria-hidden="true" />
        <h1>Analizando tus respuestas...</h1>
        <p>Estamos preparando un perfil orientativo a partir de tus elecciones.</p>
      </main>
    )
  }

  if (fase === 'resultado' && resultado) {
    return (
      <main className="page container orientation-result">
        <header className="orientation-hero">
          <span className="eyebrow">Perfil vocacional</span>
          <h1>{resultado.perfil}</h1>
          <p>{resultado.resumen}</p>
        </header>

        <section className="orientation-card">
          <h2>Áreas de mayor afinidad</h2>
          <div className="affinity-list">
            {resultado.areas.map((area) => (
              <article className="affinity-item" key={area.nombre}>
                <div className="affinity-item__heading"><strong>{area.nombre}</strong><span>{area.afinidad}%</span></div>
                <div className="affinity-bar" role="progressbar" aria-label={`Afinidad con ${area.nombre}`} aria-valuenow={area.afinidad} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${area.afinidad}%` }} /></div>
                <p>{area.explicacion}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="orientation-result__columns">
          <section className="orientation-card"><h2>Fortalezas observadas</h2><ul>{resultado.fortalezas.map((fortaleza) => <li key={fortaleza}>{fortaleza}</li>)}</ul></section>
          <section className="orientation-card"><h2>Sugerencias para explorar</h2><ul>{resultado.sugerencias.map((sugerencia) => <li key={sugerencia}>{sugerencia}</li>)}</ul></section>
        </div>

        {errorGuardado ? <p className="status-message status-message--warning" role="status">{errorGuardado}</p> : null}
        <p className="orientation-disclaimer">Este resultado es una orientación basada en tus respuestas y no sustituye una evaluación vocacional profesional.</p>

        <section className="orientation-courses">
          <div className="section-heading"><div><span className="eyebrow">Siguientes pasos</span><h2>Cursos recomendados para ti</h2></div><p>CourseHub relacionó tus áreas de mayor afinidad con nuestro catálogo.</p></div>
          {errorCursos ? <p className="status-message status-message--error" role="alert">{errorCursos}</p> : null}
          {avisoCursosExternos ? <p className="status-message status-message--warning" role="status">{avisoCursosExternos}</p> : null}
          {!errorCursos && cursos.length === 0 ? <p className="status-message">Cargando recomendaciones...</p> : null}
          {cursos.length > 0 ? <div className="course-grid">{cursos.map((curso) => <CourseCard key={curso.id} {...curso} />)}</div> : null}
        </section>

        <button className="button button--outline repeat-button" type="button" onClick={repetirTest}>Repetir orientación</button>
      </main>
    )
  }

  return (
    <main className="page container orientation-page">
      <header className="page-heading">
        <span className="eyebrow">Orientación Vocacional IA</span>
        <h1>Explora tus áreas de afinidad</h1>
        <p>Responde con sinceridad. No hay respuestas correctas o incorrectas.</p>
      </header>

      <section className="test-progress" aria-label={`Paso ${paso + 1} de ${bloquesVocacionales.length}`}>
        <div><span>Paso {paso + 1} de {bloquesVocacionales.length}</span><strong>{progreso}% respondido</strong></div>
        <div className="test-progress__bar"><span style={{ width: `${((paso + 1) / bloquesVocacionales.length) * 100}%` }} /></div>
      </section>

      {errorAnalisis ? <p className="status-message status-message--error" role="alert">{errorAnalisis}</p> : null}

      <section className="test-card">
        <header><span className="tag">{bloqueActual.titulo}</span><h2>{bloqueActual.titulo}</h2><p>{bloqueActual.descripcion}</p></header>
        <div className="question-list">
          {bloqueActual.preguntas.map((pregunta, indice) => (
            <fieldset className="question-card" key={pregunta.id}>
              <legend>{indice + 1}. {pregunta.texto}</legend>
              <div className="scale-options">
                {ESCALA.map((opcion) => (
                  <label className={respuestas[pregunta.id] === opcion.valor ? 'selected' : ''} key={opcion.valor}>
                    <input type="radio" name={pregunta.id} value={opcion.valor} checked={respuestas[pregunta.id] === opcion.valor} onChange={() => seleccionarRespuesta(pregunta.id, opcion.valor)} />
                    <strong>{opcion.valor}</strong><span>{opcion.etiqueta}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {errorValidacion ? <p className="form-message form-message--error" role="alert">{errorValidacion}</p> : null}
        <div className="test-actions">
          <button className="button button--outline" type="button" onClick={retroceder} disabled={paso === 0}>Anterior</button>
          {paso < bloquesVocacionales.length - 1
            ? <button className="button" type="button" onClick={avanzar}>Siguiente</button>
            : <button className="button" type="button" onClick={analizarPerfil}>Analizar mi perfil</button>}
        </div>
      </section>
    </main>
  )
}

export default Orientacion
