# CourseHub

Plataforma de cursos desarrollada con React + Vite para practicar rutas públicas y privadas, Context API, React Router y consumo de datos mediante JSON Server.

## Tecnologías

- React
- Vite
- React Router DOM
- Context API
- JSON Server
- CSS

## Rutas públicas

- `/`
- `/login`
- `/registro`

## Rutas privadas

- `/dashboard`
- `/perfil`

## Cómo funciona PrivateRoutes

`PrivateRoutes` consulta el estado de autenticación desde `AuthContext`.

Si el usuario está autenticado, `Outlet` permite mostrar la ruta privada solicitada. Si no está autenticado, `Navigate` lo redirige a `/login`.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

En otra terminal:

```bash
npm run server
```

Vite ejecuta el frontend y JSON Server proporciona los datos de cursos y estudiantes en el puerto 3001.

## Estructura

```text
src/
├── components/  Componentes reutilizables
├── pages/       Páginas de la aplicación
├── routes/      Configuración y protección de rutas
├── context/     Estado global de autenticación
├── App.jsx
└── main.jsx
```
