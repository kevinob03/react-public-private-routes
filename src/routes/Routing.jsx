import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import NotFound from '../pages/NotFound.jsx'
import Perfil from '../pages/Perfil.jsx'
import Registro from '../pages/Registro.jsx'
import PrivateRoutes from './PrivateRoutes.jsx'

function Routing() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Routing
