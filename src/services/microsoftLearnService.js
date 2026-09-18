const COURSEHUB_API_URL = 'http://localhost:3002/api/microsoft-learn/courses'
const SESSION_PREFIX = 'coursehub_microsoft_learn_'
const pageCache = new Map()

const DATA_SUBJECTS = new Set(['data-analysis', 'data-engineering', 'data-management', 'data-science', 'machine-learning'])
const DESIGN_SUBJECTS = new Set(['design', 'ux-design', 'web-design'])
const BUSINESS_SUBJECTS = new Set(['business-applications', 'business-analysis', 'business-strategy'])

const LEVEL_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

function cleanString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function encodeId(value) {
  return btoa(value).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

function getIds(items) {
  return Array.isArray(items)
    ? items.map((item) => typeof item === 'string' ? item : item?.id).filter(Boolean)
    : []
}

export function mapMicrosoftLearnCourseToVocationalArea(course) {
  const subjects = getIds(course?.subjects)
  if (subjects.some((subject) => DATA_SUBJECTS.has(subject) || subject.includes('data') || subject.includes('artificial-intelligence'))) return 'Datos'
  if (subjects.some((subject) => DESIGN_SUBJECTS.has(subject) || subject.includes('design'))) return 'Diseño'
  if (subjects.some((subject) => BUSINESS_SUBJECTS.has(subject) || subject.includes('business'))) return 'Negocios'
  return 'Tecnología'
}

export function adaptMicrosoftLearnCourse(course) {
  if (!course || typeof course !== 'object') return null
  const externalId = cleanString(course.uid) ?? cleanString(course.id)
  const title = cleanString(course.title)
  if (!externalId || !title) return null

  const duration = Number.isFinite(course.duration_in_minutes) ? course.duration_in_minutes : null
  const level = Array.isArray(course.levels) ? course.levels[0] : null
  const areaVocacional = mapMicrosoftLearnCourseToVocationalArea(course)

  return {
    id: `microsoft-learn-${encodeId(externalId)}`,
    externalId,
    titulo: title,
    descripcion: cleanString(course.summary) ?? 'Microsoft Learn no proporcionó una descripción para este contenido.',
    profesor: null,
    categoria: areaVocacional,
    areaVocacional,
    nivel: LEVEL_LABELS[level] ?? 'No especificado',
    duracion: duration === null ? 'Duración no especificada' : `${duration} minutos`,
    esfuerzo: duration === null ? null : `${duration} minutos`,
    imagen: cleanString(course.icon_url),
    proveedor: 'Microsoft Learn',
    urlExterna: cleanString(course.url),
    esExterno: true,
  }
}

function rememberCourse(course) {
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${course.id}`, JSON.stringify(course))
  } catch {
    // El estado de navegación mantiene disponible el detalle si sessionStorage está bloqueado.
  }
}

export function getRememberedMicrosoftLearnCourse(id) {
  try {
    const course = JSON.parse(sessionStorage.getItem(`${SESSION_PREFIX}${id}`))
    return course?.esExterno === true && course.id === id ? course : null
  } catch {
    return null
  }
}

export async function getMicrosoftLearnCourses({ limit = 20, offset = 0, signal } = {}) {
  const cacheKey = `${limit}:${offset}`
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey)

  const request = fetch(`${COURSEHUB_API_URL}?limit=${limit}&offset=${offset}`, { signal })
    .then(async (response) => {
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.mensaje || 'No se pudieron cargar los cursos de Microsoft Learn')
      if (!data || !Array.isArray(data.results) || typeof data.hasMore !== 'boolean') throw new Error('Respuesta inesperada de Microsoft Learn')

      const courses = data.results.map(adaptMicrosoftLearnCourse).filter(Boolean)
      courses.forEach(rememberCourse)
      return { courses, hasMore: data.hasMore }
    })
    .catch((error) => {
      pageCache.delete(cacheKey)
      throw error
    })

  pageCache.set(cacheKey, request)
  return request
}
