import { useNavigate } from "react-router-dom";
export default function NoAutorizado()  {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="uppercase flex flex-col text-center space-y-5 mx-6">
        <div className="text-5xl lg:text-5xl font-bold font-mono">
          Acceso no autorizado
        </div>
        <div className="text-lg font-mono">
          No tienes los permisos necesarios para acceder a esta página.
        </div>
        <div className="flex justify-center">
          <a className="cursor-pointer flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-semibold border-2 border-[var(--principal-f)] text-[var(--principal-mf)] hover:text-white hover:bg-[var(--principal-f)]"
          onClick={() => navigate("/")}
          >
              <span className="material-symbols-outlined">
                  home 
              </span>
              <span>
                  Regresar al inicio
              </span>
          </a>
        </div>
      </div>
    </div>
  );
}
