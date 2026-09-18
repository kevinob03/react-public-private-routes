import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Configuracion from '../pages/Configuracion.jsx'
import CursoDetalle from '../pages/CursoDetalle.jsx'
import Cursos from '../pages/Cursos.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Forbidden from '../pages/Forbidden.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import NotFound from '../pages/NotFound.jsx'
import Orientacion from '../pages/Orientacion.jsx'
import Perfil from '../pages/Perfil.jsx'
import Registro from '../pages/Registro.jsx'
import Usuarios from '../pages/Usuarios.jsx'
import GuestRoutes from './GuestRoutes.jsx'
import PrivateRoutes from './PrivateRoutes.jsx'

function Routing() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/cursos/:id" element={<CursoDetalle />} />

        <Route element={<GuestRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>

        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/configuracion" element={<Configuracion />} />
          <Route path="/orientacion" element={<Orientacion />} />
          <Route path="/403" element={<Forbidden />} />
        </Route>

        <Route element={<PrivateRoutes requiredRole="admin" />}>
          <Route path="/dashboard/usuarios" element={<Usuarios />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routing
