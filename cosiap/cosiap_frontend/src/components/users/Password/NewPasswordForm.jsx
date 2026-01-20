import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewPasswordValidationSchema } from "@/components/FormsValidations";
import { RegisterInputPassword } from "@/components/users/Register/RegisterInputPassword";
import ErrorDisplay from "@/components/common/ui/ErrorDisplay";
import { useNavigate } from "react-router-dom";
import api from "@/api";

export default function NewPasswordForm ({uid, token, setViewPageLoader}){
    // Para cambiar de url
    const navigate = useNavigate();

    // Para cambiar de componente si la creación de la nueva contraseña fue exitosa
    const [successChangePassword, setSuccessChangePassword] = useState(false);
    // Error de la creacion de contraseña desde back
    const [errorNewPassword, setErrorNewPassword] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(NewPasswordValidationSchema),
    });

    const handleFormSubmission = async (data) => {
        setViewPageLoader(true);
        try {
            const response = await api.usuarios.nuevaPassword(uid, token, data)
            setSuccessChangePassword(true);
        } catch (error) {
            setErrorNewPassword(error.response.data.messages.error);
        }
        setViewPageLoader(false);
    }

    return (
        successChangePassword ? 
            (
                <>
                    <div className="text-center">
                        <div className="mt-6 uppercase relative">
                            <p className="font-bold text-xl">¡CAMBIO DE CONTRASEÑA REALIZADO CON EXITO!</p>
                        </div>
                        <div className="mt-6 uppercase relative">
                            <p className="font-bold text-base">SE HA REESTABLECIDO TU CONTRASEÑA, INICIA SESIÓN CON TUS CREDENCIALES</p>
                        </div>
                        <div className="mt-10">
                            <button className="uppercase py-2 px-4 bg-[var(--principal-f)] text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75" onClick={() => navigate('/authentication')}>
                                Iniciar sesión
                            </button>
                        </div>
                    </div>
                </>
            ) 
        : 
            (
                <> 
                    <ErrorDisplay errors={errorNewPassword}/>
                    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmission)}>
                        <div className="relative mt-8">
                            <RegisterInputPassword 
                                id="password"
                                name="password"
                                placeholder="CONTRASEÑA"
                                register={register}
                                errors={ 
                                    errors.password ? errors.password.message : undefined  // Si no hay errores de la validadion Yup
                                }
                            />
                        </div>
                        <div className="relative">
                            <RegisterInputPassword 
                                id="confirmar_password"
                                name="confirmar_password"
                                type="text"
                                placeholder="CONFIRMAR CONTRASEÑA"
                                register={register}
                                errors={ 
                                    errors.confirmar_password ? errors.confirmar_password.message : undefined  // Si no hay errores de la validadion Yup
                                }
                            />
                        </div>
                        <div className="text-center">
                            <button type="submit" disabled={isSubmitting} className="uppercase py-2 px-4 bg-principal_f text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75">
                                Cambiar contraseña
                            </button>
                        </div>
                    </form>
                </>
                
            )
    );
}