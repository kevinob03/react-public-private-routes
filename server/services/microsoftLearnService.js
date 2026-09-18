const API_URL = 'https://learn.microsoft.com/api/catalog/?locale=es-es'
const CACHE_DURATION_MS = 30 * 60 * 1000

let catalogCache = null

async function fetchCatalog() {
  const response = await fetch(API_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(45000),
  })

  if (!response.ok) throw new Error(`Microsoft Learn respondió con estado ${response.status}`)
  const data = await response.json()
  if (!data || !Array.isArray(data.learningPaths)) throw new Error('Microsoft Learn devolvió una respuesta inesperada')
  return data.learningPaths
}

export async function obtenerPaginaMicrosoftLearn({ limit, offset }) {
  if (!catalogCache || Date.now() - catalogCache.createdAt >= CACHE_DURATION_MS) {
    catalogCache = {
      createdAt: Date.now(),
      items: await fetchCatalog(),
    }
  }

  const results = catalogCache.items.slice(offset, offset + limit)
  return {
    results,
    count: catalogCache.items.length,
    hasMore: offset + limit < catalogCache.items.length,
  }
}
