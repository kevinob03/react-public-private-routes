import { GoogleGenAI } from '@google/genai'

export const AREAS_PERMITIDAS = ['Tecnología', 'Datos', 'Diseño', 'Negocios', 'Psicología', 'Comunicación']
export const GEMINI_MODEL = 'gemini-3.5-flash'

const resultadoSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    perfil: {
      type: 'string',
      description: 'Nombre breve y orientativo del perfil, sin afirmaciones absolutas.',
    },
    resumen: {
      type: 'string',
      description: 'Resumen prudente que comienza desde la evidencia de las respuestas.',
    },
    areas: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nombre: { type: 'string', enum: AREAS_PERMITIDAS },
          afinidad: { type: 'integer', minimum: 0, maximum: 100 },
          explicacion: { type: 'string' },
        },
        required: ['nombre', 'afinidad', 'explicacion'],
      },
    },
    fortalezas: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string' },
    },
    sugerencias: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: { type: 'string' },
    },
  },
  required: ['perfil', 'resumen', 'areas', 'fortalezas', 'sugerencias'],
}

function textoValido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

export function validarRespuestas(respuestas) {
  return Array.isArray(respuestas)
    && respuestas.length >= 18
    && respuestas.length <= 20
    && respuestas.every((respuesta) => (
      textoValido(respuesta?.pregunta)
      && textoValido(respuesta?.bloque)
      && Number.isInteger(respuesta?.valor)
      && respuesta.valor >= 1
      && respuesta.valor <= 5
    ))
}

export function validarResultado(resultado) {
  if (!resultado || !textoValido(resultado.perfil) || !textoValido(resultado.resumen)) return false
  if (!Array.isArray(resultado.areas) || resultado.areas.length !== 3) return false
  if (!Array.isArray(resultado.fortalezas) || resultado.fortalezas.length < 3 || !resultado.fortalezas.every(textoValido)) return false
  if (!Array.isArray(resultado.sugerencias) || resultado.sugerencias.length < 2 || !resultado.sugerencias.every(textoValido)) return false

  const nombres = new Set()
  let afinidadAnterior = 101
  for (const area of resultado.areas) {
    if (!AREAS_PERMITIDAS.includes(area?.nombre) || nombres.has(area.nombre)) return false
    if (!Number.isInteger(area.afinidad) || area.afinidad < 0 || area.afinidad > 100) return false
    if (!textoValido(area.explicacion) || area.afinidad > afinidadAnterior) return false
    nombres.add(area.nombre)
    afinidadAnterior = area.afinidad
  }

  return true
}

function construirPrompt(respuestas) {
  return `Actúa como asistente de exploración vocacional. Analiza únicamente las respuestas proporcionadas.

La escala es: 1 = Nada, 2 = Poco, 3 = Neutral, 4 = Bastante, 5 = Mucho.
Las únicas áreas válidas son: ${AREAS_PERMITIDAS.join(', ')}.

Devuelve las tres áreas de mayor afinidad, ordenadas de mayor a menor. Basa cada explicación en patrones observables de las respuestas. Usa lenguaje orientativo como "según tus respuestas" y "podrías explorar". No diagnostiques, no prometas éxito, no afirmes conocer una vocación perfecta y no recomiendes cursos concretos.

Respuestas del cuestionario:
${JSON.stringify(respuestas)}`
}

export async function analizarOrientacion(respuestas) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY ausente')
    error.code = 'MISSING_API_KEY'
    throw error
  }

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: construirPrompt(respuestas),
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: resultadoSchema,
      temperature: 0.3,
    },
  })

  if (!textoValido(response.text)) throw new Error('Respuesta vacía del modelo')

  let resultado
  try {
    resultado = JSON.parse(response.text)
  } catch {
    throw new Error('Respuesta no válida del modelo')
  }

  if (!validarResultado(resultado)) throw new Error('La respuesta no cumple el formato esperado')
  return resultado
}
