import LayoutBaseAuthenticator from '@/components/common/layouts/LayoutBaseAuthenticator';
import { useNavigate, useLocation } from "react-router-dom";


import { useState, useEffect } from "react";
import RegisterForm from "./RegisterForm";

export default function Register({setViewPageLoader} ) {
    const [sentEmail, setSentEmail] = useState(false);
    // Para cambiar de url
    const navigate = useNavigate();
    // Contiene la informacion de la url actual
    const location = useLocation();

    const [verifySuccess, setVerifySuccess] = useState(null);

    useEffect(() => {
        //Parametros mandados de la url, con clave - valor
        const queryParams = new URLSearchParams(location.search);
        //  isEmpty será true si queryParams no tiene ningún parámetro y false si tiene al menos uno.
        const isEmpty = ![...queryParams].length;

        if (!isEmpty){//Contiene parametros
            
            handleAccountVerificatión(queryParams);
  

            // Limpia los parámetros de la URL
            // Redirige a la misma página sin parámetros
            navigate(location.pathname, { replace: true });
        }//No contiene parametros

    }, [location.search]); // Si location cambia, se ejecutara el useEffect

    //Funcion para procesar los parametros de una verificación de la cuenta
    const handleAccountVerificatión = (queryParams) => {
        // Verificación de cuenta
        if (queryParams.has('status') && queryParams.has('message')){ //Si fueron mandados los parametros de verificación
            const status = queryParams.get('status');                
            // true = verificacion exitosa, false = verificacion fallida
            setVerifySuccess(status === 'success');
        }
    }

    return (
        
        verifySuccess === null ? (
            !sentEmail ? (
                <>
                    <RegisterForm setSentEmail={setSentEmail} setViewPageLoader={setViewPageLoader}/>
                    <p className="uppercase cursor-pointer no-underline hover:underline mt-2 text-center text-sm text-[var(--principal-mf)]" onClick={() => navigate('/authentication')}>
                        Iniciar sesión
                    </p>
                </>
            ) : (
                <>
                    <div className="space-y-4 text-center">
                        <div className="mt-6 uppercase relative">
                            <p className="font-bold text-xl">¡Correo de confirmación <br />enviado!</p>
                        </div>
                        <div className="mt-6 uppercase relative">
                            <p className="font-bold text-base">Se ha enviado un correo <br />electrónico para confirmar la <br />creación de tu cuenta.</p>
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <button className="uppercase py-2 px-4 bg-[var(--principal-f)] text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75" onClick={() => navigate('/authentication')}>
                            Iniciar sesión
                        </button>
                    </div>
                </>
            )
        ) : 
        (
            <>
                <div className="space-y-4 text-center">
                    <div className="mt-6 uppercase relative">
                        <p className="font-bold text-xl">
                            {verifySuccess ? (
                                <>
                                    ¡Haz confirmado la
                                    creación de tu cuenta!
                                </>
                            ) : (
                                <>
                                    Lo sentimos, tu token
                                    de verificación ha expirado.
                                </>
                            )}
                        </p>
                    </div>
                    <div className="mt-6 uppercase relative">
                        <p className="font-bold text-base">
                            {verifySuccess ? (
                                <>
                                    Ahora puedes iniciar sesión con <br />
                                    tus credenciales
                                </>
                            ) : (
                                <>
                                    Realiza de nuevo tu registro para<br />
                                    un nuevo enlace de verificación
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-center mt-10">
                    <button className="uppercase py-2 px-4 bg-[var(--principal-f)] text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75" onClick={() => navigate('/authentication')}>
                        Iniciar sesión
                    </button>
                </div>
            </>
        )
    
    );
}