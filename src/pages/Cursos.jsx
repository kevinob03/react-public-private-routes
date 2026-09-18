import { useEffect, useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard.jsx'
import { getMicrosoftLearnCourses } from '../services/microsoftLearnService.js'

const CATEGORIES = ['Todos', 'Tecnología', 'Datos', 'Diseño', 'Negocios', 'Psicología', 'Comunicación']
const EXTERNAL_PAGE_SIZE = 14
const LOCAL_COURSES_PER_PAGE = 6

function interleaveCourses(externalCourses, localCourses) {
  const mixed = []
  const longestList = Math.max(externalCourses.length, localCourses.length)

  for (let index = 0; index < longestList; index += 1) {
    if (externalCourses[index]) mixed.push(externalCourses[index])
    if (localCourses[index]) mixed.push(localCourses[index])
  }

  return mixed
}

function Cursos() {
  const [localCourses, setLocalCourses] = useState([])
  const [externalCourses, setExternalCourses] = useState([])
  const [hasMoreExternal, setHasMoreExternal] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [loadingLocal, setLoadingLocal] = useState(true)
  const [loadingExternal, setLoadingExternal] = useState(true)
  const [localError, setLocalError] = useState('')
  const [externalError, setExternalError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadLocalCourses() {
      try {
        const response = await fetch('http://localhost:3001/cursos', { signal: controller.signal })
        if (!response.ok) throw new Error('No se pudieron cargar los cursos locales')
        setLocalCourses(await response.json())
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') setLocalError('No se pudo cargar el catálogo de CourseHub. Comprueba que JSON Server esté ejecutándose.')
      } finally {
        if (!controller.signal.aborted) setLoadingLocal(false)
      }
    }

    loadLocalCourses()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    let active = true

    async function loadExternalCourses() {
      setLoadingExternal(true)
      setExternalError('')
      try {
        const data = await getMicrosoftLearnCourses({ limit: EXTERNAL_PAGE_SIZE, offset: (page - 1) * EXTERNAL_PAGE_SIZE })
        if (!active) return
        setExternalCourses(data.courses)
        setHasMoreExternal(data.hasMore)
      } catch {
        if (!active) return
        setExternalCourses([])
        setExternalError('No pudimos cargar los cursos externos de Microsoft Learn. Puedes continuar explorando los cursos de CourseHub.')
      } finally {
        if (active) setLoadingExternal(false)
      }
    }

    loadExternalCourses()
    return () => { active = false }
  }, [page])

  useEffect(() => {
    if (!loadingExternal) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [loadingExternal, page])

  const filteredCourses = useMemo(() => {
    const localStart = ((page - 1) * LOCAL_COURSES_PER_PAGE) % Math.max(localCourses.length, 1)
    const localPageCourses = localCourses.length === 0
      ? []
      : Array.from(
          { length: Math.min(LOCAL_COURSES_PER_PAGE, localCourses.length) },
          (_, index) => localCourses[(localStart + index) % localCourses.length],
        )
    const availableCourses = interleaveCourses(externalCourses, localPageCourses)
    const term = search.trim().toLocaleLowerCase('es')

    return availableCourses.filter((course) => {
      const matchesCategory = category === 'Todos' || course.categoria === category
      const content = `${course.titulo ?? ''} ${course.profesor ?? ''} ${course.categoria ?? ''} ${course.proveedor ?? 'CourseHub'}`.toLocaleLowerCase('es')
      return matchesCategory && content.includes(term)
    })
  }, [category, externalCourses, localCourses, page, search])

  const showEmpty = !loadingLocal && !loadingExternal && !localError && filteredCourses.length === 0

  function changePage(nextPage) {
    setPage(Math.max(nextPage, 1))
  }

  return (
    <main className="page container">
      <header className="page-heading">
        <span className="eyebrow">Catálogo híbrido</span>
        <h1>Explorar cursos</h1>
        <p>Descubre cursos de CourseHub y rutas de aprendizaje en español ofrecidas por Microsoft Learn.</p>
      </header>

      <section className="catalog-filters" aria-label="Filtros del catálogo">
        <label className="search-field">
          <span>Buscar</span>
          <input type="search" placeholder="Buscar cursos..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label className="filter-field">
          <span>Categoría</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </section>

      {loadingLocal ? <p className="status-message">Cargando cursos de CourseHub...</p> : null}
      {localError ? <p className="status-message status-message--error" role="alert">{localError}</p> : null}
      {loadingExternal ? <p className="status-message catalog-notice">Cargando cursos de Microsoft Learn...</p> : null}
      {externalError ? <p className="status-message status-message--warning" role="status">{externalError}</p> : null}
      {showEmpty ? <p className="status-message">No hay cursos que coincidan con la búsqueda y categoría seleccionadas.</p> : null}

      {filteredCourses.length > 0 ? (
        <div className="course-grid catalog-grid">
          {filteredCourses.map((course) => <CourseCard key={course.id} {...course} />)}
        </div>
      ) : null}

      {!externalError && (page > 1 || hasMoreExternal) ? (
        <nav className="catalog-pagination" aria-label="Paginación de cursos de Microsoft Learn">
          <button className="button button--outline button--small" type="button" disabled={page === 1 || loadingExternal} onClick={() => changePage(page - 1)}>Anterior</button>
          <span>Página {page} · Microsoft Learn</span>
          <button className="button button--outline button--small" type="button" disabled={!hasMoreExternal || loadingExternal} onClick={() => changePage(page + 1)}>Siguiente</button>
        </nav>
      ) : null}
    </main>
  )
}

export default Cursos
