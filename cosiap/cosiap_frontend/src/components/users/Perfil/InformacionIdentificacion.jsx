import SectionContainer from "@/components/common/ui/SectionContainers/SectionContainer";
import Label_InputForm from "@/components/users/Perfil/Label_InputForm";
import ModalConfirmation from "@/components/common/ui/Modals/ModalConfirmation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { IdentificationValidationSchema } from "@/components/FormsValidations";
import api, { apiUrl } from "@/api";
import Label_InputFile from "./Label_InputFile";

export default function InformacionIdentificacion( {datosSolicitante, setDatosSolicitante, setViewPageLoader, setShowAlertSuccesful} ){
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
        resolver: yupResolver(IdentificationValidationSchema), // Resolver para la validación con Yup
    });

    // Función para resetear los datos del formulario con los valores actuales del solicitante
    const resetData = () => reset({
        RFC: datosSolicitante.RFC || "",
        curp: datosSolicitante.curp || "",
        INE: "",
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
            // Crear una instancia de FormData
            const formData = new FormData();
            
            // Agregar los datos del formulario
            formData.append("RFC", data.RFC);
            formData.append("curp", data.curp);

            // Si hay un archivo INE, agregarlo
            if (data.INE && data.INE.length > 0) {
                formData.append("INE", data.INE[0]); // Archivo INE
            }

            // Realizar la petición con el FormData
            const response = await api.usuarios.solicitantes.update(datosSolicitante.id, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            //Obtenemos de nuevo los datos del solicitante
            //obtenerInformacionSolicitante();
            
            // Cerrar modal de confirmación y deshabilitar la edición
            setShowModalConfirmation(false);
            setIsEditing(false);
            setModifiedFields({}); // Vaciar los campos modificados
            setShowAlertSuccesful(true);
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
        <SectionContainer
            title = "Información de identificación"
        >
            <form onSubmit={handleSubmit(handleFormSubmission)} className="w-full">
                <div className="flex flex-wrap justify-center p-2 lg:p-6 lg:mx-[5%]">
                    <div className="grow p-2 sm:px-16 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.RFC ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="RFC"
                            id=""
                            name="RFC"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.RFC ? errors.RFC.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-16 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.curp ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="CURP"
                            id="curp"
                            name="curp"
                            type="text"
                            register={register}
                            isDisabled={true}
                            errors={errors.curp ? errors.curp.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-16 lg:max-w-[24rem]">
                        <Label_InputFile
                            urlFile = {datosSolicitante.INE || ""}
                            className={modifiedFields.INE ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="INE"
                            id="INE"
                            name="INE"
                            type="file"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.INE ? errors.INE.message : undefined}
                            onChange={handleInputChange}
                            message="Solamente archivos PDF"
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