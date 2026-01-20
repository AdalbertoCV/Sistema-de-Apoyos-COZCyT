import LayoutBaseAuthenticator from '@/components/common/layouts/LayoutBaseAuthenticator';
import { useNavigate } from "react-router-dom";

import { LoginForm } from './LoginForm';


export function Login( {setViewPageLoader} ) {
    const navigate = useNavigate();

    return (
        <>
            <LoginForm setViewPageLoader={setViewPageLoader}/>
            <p className="uppercase mt-5 scroll-mt-10 text-center text-sm text-gray-500">
                ¿Haz olvidado tu contraseña?
            </p>
            <p className="uppercase cursor-pointer no-underline hover:underline mt-2 text-center text-sm text-[var(--principal-mf)]" onClick={() => navigate('reset_password')}>
                Restablecer contraseña
            </p>
            <p className="uppercase mt-2 text-center text-sm text-gray-500">
                ¿Aun no tienes cuenta?
            </p>
            <p className="uppercase cursor-pointer no-underline hover:underline mt-2 text-center text-sm text-[var(--principal-mf)]" onClick={() => navigate('register')}>
                Registrate
            </p>
        </>
        
    );
}