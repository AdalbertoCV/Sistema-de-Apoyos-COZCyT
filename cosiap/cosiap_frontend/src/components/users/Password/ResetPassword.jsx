import LayoutBaseAuthenticator from "@/components/common/layouts/LayoutBaseAuthenticator";
import ResetPasswordForm from "./ResetPasswordForm";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NewPasswordForm from "./NewPasswordForm";

export default function ResetPassword({ setViewPageLoader }){
    // false se mantiene en el formulario de envio de correo
    // true se establece al formulario de creacion de nueva contraseña
    const [viewChangePasswordForm, setChangePasswordForm] = useState(false);
    // Definimos las variables necesarios en el componente de NewPassword
    const [uid, setUid] = useState('');
    const [token, setToken] = useState('');
    // Para cambiar de url
    const navigate = useNavigate();
    // Informacion de la url
    const location = useLocation();


    useEffect (() => {
        //Parametros mandados de la url, con clave - valor
        const queryParams = new URLSearchParams(location.search);
        //  isEmpty será true si queryParams no tiene ningún parámetro y false si tiene al menos uno.
        const isEmpty = ![...queryParams].length;

        if (!isEmpty){
            if (queryParams.has('uid') && queryParams.has('token')) { // Si la url contiene esos dos parametros
                handleParamsChangePassword(queryParams)
            }
            // Limpia los parámetros de la URL
            // Redirige a la misma página sin parámetros
            navigate(location.pathname, { replace: true });
        }

    },[location]); // Se ejecutara si location cambia

    // Funcion para procesar los parametros para cambiar la contraseña en la api
    const handleParamsChangePassword = (queryParams) => {
        // Obtenemos y establecemos los valores de los parametros
        setUid(queryParams.get('uid'));
        setToken(queryParams.get('token'));

        //Declaramos a true para confirmar que la url que se ingreso es para realizar un cambio de contraseña
        setChangePasswordForm(true);
    }
    
    return (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            {
                viewChangePasswordForm ? (
                    <>
                        <NewPasswordForm 
                            uid={uid}
                            token={token}
                            setViewPageLoader={setViewPageLoader}
                        />
                    </>
                ) : (
                    <>
                        <div className="mt-6 uppercase text-center">
                            <p className="font-bold">
                                Se le enviara un correo para restablecer la contraseña
                            </p>
                        </div>
                        <ResetPasswordForm 
                            setViewPageLoader={setViewPageLoader}
                        />
                    </>
                )
            }
        </div>
    );

}