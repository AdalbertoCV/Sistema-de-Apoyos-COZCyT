import SectionContainer from "@/components/common/ui/SectionContainers/SectionContainer";
import Label_InputForm from "@/components/users/Perfil/Label_InputForm";
import Label_SelectForm from "./Label_SelectForm";
import ModalConfirmation from "@/components/common/ui/Modals/ModalConfirmation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { PersonalInformationValidationSchema } from "@/components/FormsValidations";
import api from "@/api";

export default function InformacionPersonal({ datosSolicitante, obtenerInformacionSolicitante, setViewPageLoader, setShowAlertSuccesful }) {
    // Estados
    const [isEditing, setIsEditing] = useState(false); // Estado para controlar si está en modo edición
    const [modifiedFields, setModifiedFields] = useState({}); // Campos que han sido modificados
    const [showModalConfirmation, setShowModalConfirmation] = useState(false); // Control para mostrar el modal de confirmación
    // Hook para manejar formularios
    const {
        register, // Registra los inputs en el formulario
        handleSubmit, // Maneja el envío del formulario
        reset, // Método para resetear los valores del formulario
        formState: { errors, isSubmitting } // Estado del formulario: errores y si se está enviando
    } = useForm({
        resolver: yupResolver(PersonalInformationValidationSchema), // Resolver para la validación con Yup
        defaultValues: {
            nombre: "",
            ap_paterno: "",
            ap_materno: "",
            sexo: "",
            telefono: "",
            email: ""
        }
    });

    // Función para resetear los datos del formulario con los valores actuales del solicitante
    const resetData = () => reset({
        nombre: datosSolicitante.nombre || "",
        ap_paterno: datosSolicitante.ap_paterno || "",
        ap_materno: datosSolicitante.ap_materno || "",
        sexo: datosSolicitante.sexo || "",
        telefono: datosSolicitante.telefono || "",
        email: datosSolicitante.email || ""
    });

    // useEffect que se ejecuta cada vez que los datos del solicitante cambian
    useEffect(() => {
        resetData(); // Resetea los datos cuando cambia datosSolicitante
    }, [datosSolicitante, reset]);

    // Función que maneja el envío del formulario
    const handleFormSubmission = async (data) => {
        if (!isEditing) {
            return; // Si no está en modo edición, no se envía el formulario
        }
        
        setViewPageLoader(true); // Muestra un loader mientras se realiza la petición
        try {
            // Actualizar los datos del solicitante
            const response = await api.usuarios.solicitantes.update(datosSolicitante.id, data);
            
            //Obtenemos de nuevo los datos del solicitante
            obtenerInformacionSolicitante();

            // Cerrar modal de confirmación y deshabilitar la edición
            setShowModalConfirmation(false);
            setIsEditing(false);
            setModifiedFields({}); // Vaciar los campos modificados
            setShowAlertSuccesful(true)
        } catch (error) {
        } finally {
            setViewPageLoader(false); // Quitar el loader al finalizar
        }
    };

    // Función para manejar los cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Actualizar el estado de campos modificados
        setModifiedFields((InputsPrev) => ({
            ...InputsPrev,
            [name]: value !== datosSolicitante[name] // Solo marcar como modificado si el valor es diferente al original
        }));
    };

    // Función para cancelar la edición
    const handleCancelEdition = () => {
        setIsEditing(false); // Deshabilitar el modo edición
        resetData(); // Restablecer los datos originales
        setModifiedFields({}); // Limpiar los campos modificados
    };

    // Función para manejar el clic de "Guardar" con validación
    const handleSaveClick = (data) => {
        if (Object.values(modifiedFields).some((isModified) => isModified)) {
            setShowModalConfirmation(true); // Mostrar el modal de confirmación si no hay errores
        }
    };

    return (
        <SectionContainer title="Información personal">
            <form onSubmit={handleSubmit(handleFormSubmission)}>
                <div className="flex flex-wrap justify-center p-2 lg:p-6 min-w-fit">
                    <div className="grow p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.nombre ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Nombre"
                            id="nombre"
                            name="nombre"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.nombre ? errors.nombre.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.ap_paterno ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Apellido Paterno"
                            id="ap_paterno"
                            name="ap_paterno"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.ap_paterno ? errors.ap_paterno.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.ap_materno ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Apellido Materno"
                            id="ap_materno"
                            name="ap_materno"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.ap_materno ? errors.ap_materno.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8">
                        <Label_SelectForm
                            className={modifiedFields.sexo ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Sexo"
                            id="sexo"
                            name="sexo"
                            type="text"
                            options={[
                                { value: "", label: "Seleccione" },
                                { value: "M", label: "Masculino" },
                                { value: "F", label: "Femenino" },
                            ]}
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.sexo ? errors.sexo.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.telefono ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Telefono"
                            id="telefono"
                            name="telefono"
                            type="tel"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.telefono ? errors.telefono.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.email ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Correo electronico"
                            id="email"
                            name="email"
                            type="email"
                            register={register}
                            isDisabled={true}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
                
                <div className="flex justify-center pb-3 sm:pb-4">
                    {isEditing && (
                        <div className="flex px-4">
                            <button
                                type="button"
                                className='py-1 px-4 bg-[var(--error)] hover:bg-[var(--error-f)] text-white font-semibold rounded-full focus:outline-none'
                                onClick={handleCancelEdition}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                    <div className="flex px-4">
                        {/* Botón para habilitar edición o guardar */}
                        <button
                            type="button"
                            disabled={isEditing && !Object.values(modifiedFields).some((isModified) => isModified)}
                            className={`py-1 px-4 ${isEditing ? 'bg-[var(--exito-f)] hover:bg-[var(--exito-btn)]' : 'bg-[var(--informacion)] hover:bg-[var(--informacion-f)]'} text-white font-semibold rounded-full focus:outline-none`}
                            onClick={isEditing ? handleSubmit(handleSaveClick) : () => setIsEditing(true)}
                        >
                            {isEditing ? 'Guardar' : 'Editar'}
                        </button>
                    </div>
                </div>

                {showModalConfirmation && (
                    <ModalConfirmation
                        nameIcon="help"
                        title="¿Estás seguro de que deseas guardar los cambios?"
                        description="Los cambios no se guardarán si no confirmas"
                    >
                        <button
                            type="button"
                            className='py-1 px-8 bg-[var(--gris-3)] hover:bg-[var(--gris-6)] text-dark hover:text-white font-semibold rounded-lg focus:outline-none'
                            onClick={() => setShowModalConfirmation(false)}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className='py-1 px-8 bg-[var(--exito-f)] hover:bg-[var(--exito-btn)] text-white font-semibold rounded-lg focus:outline-none'
                        >
                            Guardar
                        </button>
                    </ModalConfirmation>
                )}
            </form>
        </SectionContainer>
    );
}
