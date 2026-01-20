import { useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

export default function LayoutBaseAuthenticator({children}) {

    // Contiene la informacion de la url actual
    const location = useLocation();
    
    const [sectionURL, setSectionURL] = useState("");

    useEffect(() => {
        setSectionURL(location.pathname.split('/').filter(Boolean).pop());
    }, [location]); // Si location cambia, se ejecutara el useEffect

    return (
        <>
        <div className="min-h-screen bg-white relative flex items-center justify-center">
            
            <div className="flex w-full min-h-screen ">
                <div className="bg-[var(--principal-mf)] w-full sm:w-8/12 min-h-screen">
                
                </div>
                <div className="min-h-screen bg-white flex flex-row sm:w-4/12 justify-around">
                    
                    <div className="bg-[var(--principal)] h-2/3 w-[17%] relative shadow-slate-400 shadow-2xl"></div>
                    <div className="bg-[var(--principal-c)] h-4/5 w-[14%] relative shadow-slate-400 shadow-2xl"></div>
                    <div className="bg-[var(--principal-f)] h-1/3 w-[15%] shadow-slate-400 shadow-2xl"></div>
                    
                </div>
            </div>
            
            {/* Contenido de authentication */}
            <div className="absolute inset-0 flex items-center justify-center">
            <div
                    className="bg-[var(--blanco)] px-6 pt-10 pb-8 shadow-black sm:mx-auto w-80 sm:w-96 sm:rounded-lg sm:px-10 shadow-2xl m-2 sm:absolute sm:left-1/4"
                    style={{
                        borderRadius: "60px",
                    }}
                >
                    <div className="mx-auto w-full max-w-fit">
                        <img
                            className="mx-auto h-10 w-auto"
                            src="http://localhost:8000/static/images/LogosGobierno.svg"
                            alt="company"
                        />
                        <h1
                            className="uppercase mt-10 text-center font-semibold text-3xl text-[var(--principal-mf)]"
                        >
                            {/* Dependiendo de la url es el titulo de la sección */}
                            { sectionURL === 'authentication' ? 'Iniciar sesión' : (
                                sectionURL === 'register' ? 'Registrarse' : (
                                    sectionURL === 'reset_password' ? 'Restablecer contraseña' : ''
                                )
                            ) }
                        </h1>
                    </div>
                    
                    <Outlet /> {/* Renderiza los componentes hijos */}
                </div>
                
            </div>
        </div>
        </>
    );
}