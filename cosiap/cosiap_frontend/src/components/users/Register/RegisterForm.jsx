import { RegisterInput } from "./RegisterInput";
import { RegisterInputPassword } from "./RegisterInputPassword";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterValidationSchema } from "@/components/FormsValidations";
import api from "@/api"; // Asegúrate de importar tu instancia de API


export default function RegisterForm( {setSentEmail, setViewPageLoader} ) {
    const [registerErrorMessage, setRegisterErrorMessage] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(RegisterValidationSchema),
    });

    const handleFormSubmission = async (data) => {
        setViewPageLoader(true);
        try {
          const response = await api.usuarios.post(data);
          setSentEmail(true);
        } catch (error) {
          setRegisterErrorMessage(error.response.data);
        }
        setViewPageLoader(false);
      };

    return (
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-3" onSubmit={handleSubmit(handleFormSubmission)}>
                {/* <ErrorDisplay errors={registerErrorMessage} /> */}
                <div className="relative mt-1">
                    <RegisterInput 
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="NOMBRE"
                        register={register}
                        
                        errors={
                            errors.nombre ? errors.nombre.message : undefined
                        }
                    />
                </div>
                <div className="relative mt-1">
                    <RegisterInput 
                        id="curp"
                        name="curp"
                        type="text"
                        placeholder="CURP"
                        register={register}
                        errors={
                            errors.curp ? errors.curp.message : // Si no hay errores de la validadion Yup
                            registerErrorMessage.curp ? registerErrorMessage.curp[0] : undefined // Mostrara los errores enviados desde back si lo hay
                        }
                    />
                </div>
                <div className="relative mt-1">
                    <RegisterInput 
                        id="email"
                        name="email"
                        type="text"
                        placeholder="CORREO ELECTRONICO"
                        register={register}
                        errors={ 
                            errors.email ? errors.email.message : // Si no hay errores de la validadion Yup
                            registerErrorMessage.email ? registerErrorMessage.email[0] : undefined // Mostrara los errores enviados desde back si lo hay
                        }
                    />
                </div>
                <div className="relative mt-1">
                    <RegisterInputPassword 
                        id="password"
                        name="password"
                        placeholder="CONTRASEÑA"
                        register={register}
                        errors={errors.password ? errors.password.message : undefined}
                    />
                </div>
                <div className="relative mt-1">
                    <RegisterInputPassword 
                        id="confirmar_password"
                        name="confirmar_password"
                        placeholder="CONFIRMACION DE CONTRASEÑA"
                        register={register}
                        errors={errors.confirmar_password ? errors.confirmar_password.message : undefined}
                    />
                </div>
                <div className="text-center">
                    <button type="submit" disabled={isSubmitting} className="uppercase py-2 px-4 bg-principal_f text-white font-semibold rounded-full shadow-md hover:bg-principal_mf focus:outline-none focus:ring focus:bg-principal_mf focus:ring-opacity-75">
                        Registrarme
                    </button>
                </div>
            </form>
        </div>
    );
}