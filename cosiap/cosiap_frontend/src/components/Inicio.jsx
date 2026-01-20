import { useAutenticacion } from "@/components/common/utility/Autenticador";
import MainContainer from "@/components/common/utility/MainContainer";
import '@/App.css'
import { useNavigate } from 'react-router-dom';
import { apiUrl } from "@/api";
import SectionContainer from "./common/ui/SectionContainers/SectionContainer";

export default function Inicio() {
  const { isAdmin } = useAutenticacion();
  const navigate = useNavigate();

  return (
    <SectionContainer title="Bienvenido a COSIAP">
      <div className="flex flex-wrap w-full bg-[var(--principal-mc)]">
        <div className="flex-1 flex flex-col items-center justify-center space-y-2 min-w-80 px-8 text-center py-2">
          <span className="font-bold text-[var(--principal-mf)] text-2xl">SISTEMA COSIAP</span>
          <p>
            {isAdmin ? "Como Administrador podrás:" : "Como solicitante podrás aspirar a un apoyo económico relacionado con una modalidad vigente en el periodo actual."}
          </p>
          <ul className="flex flex-col home-ul text-start">
            {isAdmin ? (
              <>
                <li>Gestionar las modalidades de apoyo pertenecientes a una convocatoria.</li>
                <li>Gestionar usuarios (Administradores y Solicitantes)</li>
                <li>Gestionar solicitudes de apoyos.</li>
                <li>Gestionar reportes de solicitudes (filtros y configuraciones personalizadas)</li>
                <li>Gestionar formatos personalizados para la realizacion de solicitudes.</li>
              </>
            ) : (
              <>
                <li>Existe la posibilidad de que tu solicitud sea rechazada.</li>
                <li>No puedes adquirir más de dos apoyos en menos de un año.</li>
              </>
            )}
          </ul>
          <button className="start-button" onClick={() => navigate(isAdmin ? '/modalidades' : '/perfil')}>COMENZAR</button>
        </div>
        <div className="flex items-center justify-center w-full h-auto lg:w-96">
          <img
            src={`${apiUrl}/static/images/${isAdmin ? `Admin_Home.jpeg` : 'Solicitante_Home.webp'}`}
            alt={isAdmin ? "Home Admin" : "Home Solicitante"}
            className="w-auto h-auto"
          />
        </div>
      </div>
    </SectionContainer>
  );
}
