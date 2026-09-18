import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { obtenerPaginaMicrosoftLearn } from './services/microsoftLearnService.js'
import { analizarOrientacion, validarRespuestas } from './services/geminiService.js'

const app = express()
const PORT = 3002

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    microsoftLearnConfigured: true,
  })
})

app.get('/api/microsoft-learn/courses', async (request, response) => {
  const requestedLimit = Number.parseInt(request.query.limit, 10)
  const requestedOffset = Number.parseInt(request.query.offset, 10)
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20
  const offset = Number.isInteger(requestedOffset) ? Math.max(requestedOffset, 0) : 0

  try {
    const data = await obtenerPaginaMicrosoftLearn({ limit, offset })
    return response.json(data)
  } catch (error) {
    console.error('Error al consultar Microsoft Learn:', error.message)
    return response.status(502).json({ mensaje: 'No pudimos cargar los cursos externos de Microsoft Learn en este momento.' })
  }
})

app.post('/api/orientacion', async (request, response) => {
  const { respuestas } = request.body ?? {}

  if (!validarRespuestas(respuestas)) {
    return response.status(400).json({ mensaje: 'Las respuestas del cuestionario están incompletas o no son válidas.' })
  }

  try {
    const resultado = await analizarOrientacion(respuestas)
    return response.json(resultado)
  } catch (error) {
    if (error.code === 'MISSING_API_KEY') {
      return response.status(503).json({ mensaje: 'El servicio de orientación todavía no está configurado.' })
    }

    return response.status(502).json({ mensaje: 'No pudimos analizar tu orientación en este momento. Inténtalo nuevamente.' })
  }
})

app.use((_request, response) => {
  response.status(404).json({ mensaje: 'Recurso no encontrado.' })
})

app.listen(PORT, () => {
  console.log(`Backend de orientación disponible en http://localhost:${PORT}`)
})
