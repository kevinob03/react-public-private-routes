# CourseHub

Plataforma de cursos desarrollada con React + Vite para practicar rutas públicas y privadas, Context API, React Router, JSON Server y una orientación vocacional asistida por IA.

## Tecnologías

- React y Vite
- React Router DOM
- Context API
- JSON Server
- Express
- SDK oficial `@google/genai`
- CSS

## Rutas

Rutas públicas:

- `/`
- `/login`
- `/registro`
- `/cursos`
- `/cursos/:id`

Rutas privadas:

- `/dashboard`
- `/perfil`
- `/perfil/configuracion`
- `/orientacion`
- `/dashboard/usuarios` — requiere rol de administrador

`PrivateRoutes` consulta el estado de autenticación desde `AuthContext`. Si no existe una sesión válida, redirige al login y conserva la ruta solicitada para regresar después. La sesión se restaura desde `localStorage` al recargar la aplicación.

## Orientación Vocacional con IA

El módulo presenta 20 preguntas locales organizadas en intereses, habilidades, preferencias de trabajo y entorno y motivaciones. Las respuestas se envían al backend local, que consulta Gemini y exige un resultado JSON estructurado con un perfil orientativo, tres áreas de afinidad, fortalezas y sugerencias.

La arquitectura es:

```text
React → POST /api/orientacion → Express → Gemini
  ↓                                      ↓
Resultado y cursos ← JSON validado ←─────┘
  ↓
JSON Server / resultadosVocacionales
```

Gemini analiza únicamente el perfil. CourseHub relaciona después las áreas devueltas con `curso.areaVocacional` para seleccionar cursos del catálogo propio.

## Catálogo externo — Microsoft Learn

CourseHub consume las rutas de aprendizaje del catálogo público de Microsoft Learn mediante el backend Express y solicita los metadatos en español (`es-es`). No requiere una cuenta de Azure, suscripción ni credenciales.

El adaptador transforma cada curso externo al modelo interno de CourseHub:

- Genera un ID con prefijo `microsoft-learn-` para evitar colisiones con cursos locales.
- Solo incluye resultados realmente disponibles en español.
- Traduce los niveles `beginner`, `intermediate` y `advanced`.
- Clasifica temas tecnológicos en las áreas vocacionales de CourseHub.
- Conserva la imagen, URL oficial y duración cuando están disponibles.

Los cursos externos muestran claramente el proveedor `Microsoft Learn`. CourseHub no realiza ni simula una inscripción oficial: el botón final abre Microsoft Learn en una pestaña nueva. El catálogo carga 20 resultados externos por página y mantiene los cursos locales como respaldo.

Gemini continúa analizando únicamente las respuestas vocacionales. React usa después `areaVocacional` para combinar recomendaciones locales y de Microsoft Learn; nunca envía el catálogo externo ni sus URLs al modelo.

### Configurar la API key de Gemini

La clave nunca se incluye en React ni utiliza un nombre `VITE_`. Solo el proceso Node puede leerla mediante `process.env.GEMINI_API_KEY`.

1. Copia `.env.example` como `.env` en la raíz del proyecto.
2. Sustituye el valor de ejemplo:

```dotenv
GEMINI_API_KEY=tu_api_key_real
```

El archivo `.env` está ignorado por Git. `.env.example` solo contiene un marcador y puede mantenerse en el repositorio.

## Ejecutar el proyecto

Instala las dependencias una vez:

```bash
npm install
```

Abre tres terminales en la raíz del proyecto:

```bash
# Frontend en http://localhost:5173
npm run dev
```

```bash
# Catálogo, inscripciones e historial en http://localhost:3001
npm run server
```

```bash
# Backend privado de Gemini en http://localhost:3002
npm run ai
```

JSON Server y el backend de IA deben estar activos para completar y guardar una orientación.

## Validación

```bash
npm run lint
npm run build
```

## Estructura principal

```text
server/
├── services/
│   └── geminiService.js
└── index.js
src/
├── components/
├── context/
├── data/
├── pages/
├── routes/
├── App.jsx
└── main.jsx
```
