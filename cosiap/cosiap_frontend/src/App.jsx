import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PaginaHead } from "@/components/common/utility/PaginaHead";
import { Autenticador } from "@/components/common/utility/Autenticador";
import { useAutenticacion } from "@/components/common/utility/Autenticador";

import {
  LoginRequiredRoute,
  IsAdminRequiredRoute,
  IsLogged,
  IsSolicitanteRequiredRoute,
} from "@/components/common/utility/LoginRequiredRoute";
import "./App.css";
import PageLoader from "@/components/common/ui/PageLoader";

// Importaciones de componentes de autenticacion
import { Login } from "@/components/users/Login/Login";
import Register from "@/components/users/Register/Register";
import ResetPassword from "@/components/users/Password/ResetPassword";
import NoAutorizado from "@/components/users/NoAutorizado";
import PageNotFound from "@/components/users/PageNotFound";

import Inicio from "@/components/Inicio";
import { useState, useEffect } from "react";
// Importaciones de layoutsBase
import LayoutBaseAuthenticator from "@/components/common/layouts/LayoutBaseAuthenticator";
import LayoutBaseNavigation from "@/components/common/layouts/LayoutBaseNavigation";
import Modalidades from "@/components/modalidades/Modalidades";
import CreateModalidad from "./components/modalidades/CrearModalidad";
import EditModalidad from "./components/modalidades/EditarModalidad";
import SolicitarModalidad from "./components/modalidades/SolicitarModalidad";
import Perfil from '@/components/users/Perfil/Perfil';
import ListaSolicitudes from "./components/solicitudes/HistorialSolicitudes";
import EditarSolicitud from "./components/solicitudes/EditarSolicitud";
import VisualizarSolicitud from "./components/solicitudes/VerSolicitud";
import Solicitudes from "./components/SolicitudesAdmin/Solicitudes";
import ListaUsuarios from "./components/admin/TablaUsuarios";
import ListaSolicitudesSolicitante from "./components/admin/HistorialAdmin";
import ListaAdmins from "./components/admin/TablaAdministradores";
import CrearAdmin from "./components/admin/CrearAdministrador";
import ListaFormatos from "./components/plantillas/ListaFormatos";
import CrearFormato from "./components/plantillas/CrearPlantilla";
import useColor from "./components/useColor";
import EditarColorLogo from "./components/design/colorLogo";
import DescargarManual from "./components/plantillas/manual";
import DetallesSolicitud from "./components/SolicitudesAdmin/DetallesSolicitud";
function App() {
  const [viewPageLoader, setViewPageLoader] = useState(false);

  const colors = useColor();

  useEffect(() => {
      if (colors) {
            document.documentElement.style.setProperty('--color-principal', colors.color_principal);
            document.documentElement.style.setProperty('--principal-mf', colors.principal_mf);
            document.documentElement.style.setProperty('--principal-f', colors.principal_f);
            document.documentElement.style.setProperty('--principal', colors.principal);
            document.documentElement.style.setProperty('--principal-c', colors.principal_c);
            document.documentElement.style.setProperty('--principal-mc', colors.principal_mc);
        }
    }, [colors]);


  return (
    <BrowserRouter>
      <PaginaHead>
        <title>Sistema de apoyos COZCyT</title>
        <link
          rel="icon"
          href="http://localhost:8000/static/images/cosiap_favicon.png"
        />
        <link
          rel="stylesheet"
          href="http://localhost:8000/static/css/colores.css"
        />
      </PaginaHead>

      {viewPageLoader && <PageLoader />}

      <Autenticador setViewPageLoader={setViewPageLoader}>
        <RoutesApp setViewPageLoader={setViewPageLoader} />
      </Autenticador>
    </BrowserRouter>
  );
}

function RoutesApp({ setViewPageLoader }) {
  const { token } = useAutenticacion();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={token === null ? "/authentication" : "/inicio"} />
        }
      />
      {/* Rutas públicas */}
      {/* Componente del layout */}
      <Route element={<IsLogged />}>
        <Route element={<LayoutBaseAuthenticator />}>
          {/* Componentes hijos del layout autenticador */}
          <Route
            path="/authentication"
            element={<Login setViewPageLoader={setViewPageLoader} />}
          />
          <Route
            path="/authentication/register"
            element={<Register setViewPageLoader={setViewPageLoader} />}
          />
          <Route
            path="/authentication/reset_password"
            element={<ResetPassword setViewPageLoader={setViewPageLoader} />}
          />
        </Route>
      </Route>
      {/* Rutas protegidas */}
      <Route element={<LoginRequiredRoute />}>
        {/* Componentes del layout de navegación */}
        <Route element={<LayoutBaseNavigation />}>
          {/* Componentes hijos del layout autenticador */}

          {/* Cualquier usuario puede acceder a estas url */}
          <Route path="/inicio" element={<Inicio />} />
          <Route
            path="/modalidades"
            element={<Modalidades setViewPageLoader={setViewPageLoader} />}
          />
          <Route element={ <IsSolicitanteRequiredRoute setViewPageLoader={setViewPageLoader} />}>
            <Route path="/solicitar/:id" element={<SolicitarModalidad/>} />
            <Route path="/historial" element={<ListaSolicitudes />} />
            <Route path="/ayuda/manual" element={<DescargarManual />} />
            <Route path="/editar-solicitud/:id" element={<EditarSolicitud />} />
            <Route path="/ver-solicitud/:id" element={<VisualizarSolicitud/>} />
            <Route path="/perfil" element={<Perfil setViewPageLoader={setViewPageLoader} />} />
          </Route>
          {/* Solo administradores pueden acceder a estas url */}
          <Route
            element={
              <IsAdminRequiredRoute setViewPageLoader={setViewPageLoader} />
            }
          >
            <Route path="/usuarios" element={<ListaUsuarios />} />
            <Route path="/solicitudes" element={<Solicitudes setViewPageLoader={setViewPageLoader} />} />
            <Route path="/solicitudes/detalles-solicitud/:id_solicitud" element={<DetallesSolicitud setViewPageLoader={setViewPageLoader} />} />
            <Route path="/crear-modalidad" element={<CreateModalidad/>} />
            <Route path="/editar-modalidad/:id" element={<EditModalidad/>} />
            <Route path="/historial-solicitante/:id" element={<ListaSolicitudesSolicitante/>} />
            <Route path="/visualizar-solicitud/:id" element={<VisualizarSolicitud/>} />
            <Route path="/administradores" element={<ListaAdmins/>} />
            <Route path="/nuevo-administrador" element={<CrearAdmin setViewPageLoader={setViewPageLoader}/>} />
            <Route path="/formatos" element={<ListaFormatos/>} />
            <Route path="/crear-formato" element={<CrearFormato/>} />
            <Route path="/editar-estilo" element={<EditarColorLogo/>} />
          </Route>
        </Route>

        <Route path="/no-autorizado" element={<NoAutorizado />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
