import { useState } from "react";
import { useForm } from "react-hook-form";
import { ResetPasswordValidationSchema } from "@/components/FormsValidations";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterInput } from "@/components/users/Register/RegisterInput";
import { useNavigate } from "react-router-dom";
import api from "@/api";

export default function ResetPasswordForm({ setViewPageLoader }){
    const navigate = useNavigate();

    const [emailSent, setEmailSent] = useState(false);
    const [formError, setFormError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(ResetPasswordValidationSchema),
    });

    const handleFormSubmission = async (data) => {
        setViewPageLoader(true);
        try {
            const response = await api.usuarios.restablecerPassword(data);
            
        } catch (error) {
        }
        setEmailSent(true);
        setViewPageLoader(false);
    }
    return (
        emailSent ? (
            <>
                <div className="uppercase text-center">
                    <p className="font-semibold my-8">
                        ¡Correo enviado con exito! <br /> Revisa tu bandeja para seguir con el proceso de restablecimiento
                    </p>
                </div>
                <div className="text-center mt-10">
                    <button className="uppercase py-2 px-4 bg-[var(--principal-f)] text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75" onClick={() => navigate('/authentication')}>
                        Iniciar sesión
                    </button>
                </div>
            </>
        ) : (
            <>
                <form className="space-y-3" onSubmit={handleSubmit(handleFormSubmission)}>
                    <div className="relative my-8">
                        <RegisterInput 
                            id="email"
                            name="email"
                            type="text"
                            placeholder="CORREO ELECTRONICO"
                            register={register}
                            errors={ 
                                errors.email ? errors.email.message :  // Si no hay errores de la validadion Yup
                                formError.messages ? formError.messages : undefined // Mostrara los errores enviados desde back si lo hay
                            }
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" disabled={isSubmitting} className="uppercase py-2 px-4 bg-principal_f text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75">
                            Restablecer
                        </button>
                    </div>
                </form>
                <p className="uppercase cursor-pointer no-underline hover:underline mt-2 text-center text-sm text-[var(--principal-mf)]" onClick={() => navigate('/authentication')}>
                    Iniciar sesión
                </p>
            </>
        )
        
    );
}