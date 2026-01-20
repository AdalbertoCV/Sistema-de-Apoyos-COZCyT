import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginValidationSchema } from "@/components/FormsValidations";
import api from "@/api";
import { LoginInputCURP } from '@/components/users/Login/LoginInputCURP';
import { LoginInputPassword } from "@/components/users/Login/LoginInputPassword";
import { useState, useEffect } from "react";
import { ErrorDisplay } from '@/components/common/ui/ErrorDisplay';
import { useAutenticacion } from "@/components/common/utility/Autenticador";
import { useNavigate } from "react-router-dom";

export function LoginForm({ setViewPageLoader }) {
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const { setToken, setIsAdmin, configurarInterceptors, setUid } = useAutenticacion();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(LoginValidationSchema),
    });

    // Escuchar los cambios en los campos de entrada (autocompletados)
    useEffect(() => {
        const curpInput = document.querySelector("input[name='curp']");
        const passwordInput = document.querySelector("input[name='password']");
        
        // Si el navegador autocompleta los campos, actualizamos react-hook-form
        const handleInputChange = () => {
            if (curpInput && passwordInput) {
                setValue("curp", curpInput.value);
                setValue("password", passwordInput.value);
            }
        };

        if (curpInput && passwordInput) {
            // Escuchar eventos de cambio
            curpInput.addEventListener("input", handleInputChange);
            passwordInput.addEventListener("input", handleInputChange);

            // Limpiar los eventos cuando el componente se desmonte
            return () => {
                curpInput.removeEventListener("input", handleInputChange);
                passwordInput.removeEventListener("input", handleInputChange);
            };
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        setViewPageLoader(true);

        try {
            const response = await api.usuarios.token.login(data);    
            setToken(response.data.access);
            configurarInterceptors(response.data.access);

            const responseAd = await api.usuarios.admin.is_admin();
            setIsAdmin(responseAd.data.user_is_admin);

            const responseUid = await api.usuarios.getId();
            setUid(responseUid.data.user_id);

            navigate('/inicio');
        } catch (error) {
            setLoginError(error.response?.data?.detail || "Error de inicio de sesión");
        }
        setViewPageLoader(false);
    };

    return (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <ErrorDisplay errors={loginError} />

                <div className="mt-2 relative">
                    <LoginInputCURP
                        name="curp"
                        type="text"
                        placeholder="CURP"
                        className="pl-10"
                        register={register}
                        errors={errors.curp ? errors.curp.message : undefined}
                    />
                </div>
                <div className="mt-2 relative">
                    <LoginInputPassword
                        name="password"
                        placeholder="CONTRASEÑA"
                        className="pl-10"
                        register={register}
                        errors={errors.password ? errors.password.message : undefined}
                    />
                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        className="py-2 px-4 bg-principal_f text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75"
                        disabled={isSubmitting}
                    >
                        INICIAR SESIÓN
                    </button>
                </div>
            </form>
        </div>
    );
}
