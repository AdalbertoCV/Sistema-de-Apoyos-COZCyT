import ModalConfirmation from "@/components/common/ui/Modals/ModalConfirmation";
import SectionContainer from "@/components/common/ui/SectionContainers/SectionContainer";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Label_InputForm from "../Perfil/Label_InputForm";
import Label_SelectForm from "../Perfil/Label_SelectForm";
import api from "@/api";
import Label_InputFile from "../Perfil/Label_InputFile";
import { DatosBancariosValidationSchema } from "@/components/FormsValidations";

export default function DatosBancarios({obtenerInformacionSolicitante, datosSolicitante, setViewPageLoader, setShowAlertSuccesful }){
    // Estados
    const [isEditing, setIsEditing] = useState(false); // Estado para controlar si está en modo edición
    const [modifiedFields, setModifiedFields] = useState({}); // Campos que han sido modificados
    const [showModalConfirmation, setShowModalConfirmation] = useState(false);
    const [datosBancarios, setDatosBancarios] = useState([]); // Campos que han sido modificados

    //Opciones de regimen
    const regimen_choices = [
        {value: "1", label:"Régimen Simplificado de Confianza"},
        {value: "2", label:"Sueldos y salarios e ingresos asimilados a salarios"},
        {value: "3", label:"Régimen de Actividades Empresariales y Profesionales"},
        {value: "4", label:"Régimen de Incorporación Fiscal"},
        {value: "5", label:"Enajenación de bienes"},
        {value: '6', label:'Régimen de Actividades Empresariales con ingresos a través de Plataformas Tecnológicas'},
        {value: '7', label:'Régimen de Arrendamiento'},
        {value: '8', label:'Intereses'},
        {value: '9', label:'Obtención de premios'},
        {value: '10', label: 'Dividendos'},
        {value: '11', label: 'Demás Ingresos'},
        {value: '12', label: 'Sin obligaciones fiscales'}
        
    ]

    // Hook para manejar el formulario
    const {
        register, // Registra los inputs en el formulario
        handleSubmit, // Maneja el envío del formulario
        reset, // Método para resetear los valores del formulario
        formState: { errors, isSubmitting } // Estado del formulario: errores y si se está enviando
    } = useForm({
        resolver: yupResolver(DatosBancariosValidationSchema), // Resolver para la validación con Yup
    });

    // Función para resetear los datos del formulario con los valores actuales del solicitante
    const resetData = () => reset({
        nombre_banco: datosSolicitante.datos_bancarios ? (datosSolicitante.datos_bancarios.nombre_banco || "") : "",
        cuenta_bancaria: datosSolicitante.datos_bancarios ? (datosSolicitante.datos_bancarios.cuenta_bancaria || "") : "",
        clabe_bancaria: datosSolicitante.datos_bancarios ? (datosSolicitante.datos_bancarios.clabe_bancaria || "") : "",
        doc_estado_cuenta: "",
        doc_constancia_sat: "",
        codigo_postal_fiscal: datosSolicitante.datos_bancarios ? (datosSolicitante.datos_bancarios.codigo_postal_fiscal || "") : "",
        regimen: datosSolicitante.datos_bancarios ? (datosSolicitante.datos_bancarios.regimen || "") : "",
    });
    // useEffect que se ejecuta cada vez que los datos del solicitante cambian
    useEffect(() => {
        if(datosSolicitante.datos_bancarios){
            setDatosBancarios(datosSolicitante.datos_bancarios);
        }
        resetData(); // Resetea los datos cuando cambia datosSolicitante
    }, [datosSolicitante, reset]);

    // Función que maneja el envío del formulario
    const handleFormSubmission = async (data) => {
        
        setViewPageLoader(true); // Muestra un loader mientras se realiza la petición
        try {
            // Crear una instancia de FormData
            const formData = new FormData();
            
            // Agregar campos al objeto 'datos_bancarios' usando notación de corchetes
            formData.append('nombre_banco', data.nombre_banco)
            formData.append('cuenta_bancaria', data.cuenta_bancaria)
            formData.append('clabe_bancaria', data.clabe_bancaria)
            if (data.doc_estado_cuenta){ //Si el input del estado de cuenta no es nulo, modificaron el campo
                formData.append('doc_estado_cuenta', data.doc_estado_cuenta[0]);
            }
            if (data.doc_constancia_sat){ //Si el input de la constancia SAT no es nulo
                formData.append('doc_constancia_sat', data.doc_constancia_sat[0]);
            }
            
            formData.append('codigo_postal_fiscal', data.codigo_postal_fiscal)
            formData.append('regimen', data.regimen)

            if(datosSolicitante.datos_bancarios){//Si existen los datos bancarios, significan que se van a actualizar
                const response = await api.usuarios.datos_bancarios.update(datosSolicitante.datos_bancarios.id, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }else{ //Se van a crear
                const response = await api.usuarios.datos_bancarios.post(formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

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
            [name]: value !== datosBancarios[name] // Solo marcar como modificado si el valor es diferente al original
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
        <>
            <SectionContainer title="Datos Bancarios" >
            <form onSubmit={handleSubmit(handleFormSubmission)} className="w-full">
                <div className="flex flex-wrap justify-center p-2 lg:p-6 lg:mx-[5%]">
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.nombre_banco ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Nombre del banco"
                            id="nombre_banco"
                            name="nombre_banco"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.nombre_banco ? errors.nombre_banco.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.cuenta_bancaria ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Cuenta Bancaria"
                            id="cuenta_bancaria"
                            name="cuenta_bancaria"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.cuenta_bancaria ? errors.cuenta_bancaria.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.clabe_bancaria ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Clave Bancaria"
                            id="clabe_bancaria"
                            name="clabe_bancaria"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.clabe_bancaria ? errors.clabe_bancaria.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.codigo_postal_fiscal ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Codigo Postal Fiscal"
                            id="codigo_postal_fiscal"
                            name="codigo_postal_fiscal"
                            type="tel"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.codigo_postal_fiscal ? errors.codigo_postal_fiscal.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="grow p-2 sm:px-8 w-full lg:max-w-[19rem]">
                        <Label_SelectForm
                            className={modifiedFields.regimen ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Regimen"
                            id="regimen"
                            name="regimen"
                            register={register}
                            isDisabled={!isEditing}
                            options={[
                                { value: "", label: "Seleccione" },
                                ...regimen_choices.map(
                                    (item) => ({ value: item.value, label: item.label })
                                )
                            ]}   
                            errors={
                                errors.regimen ? errors.regimen.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="grow lg:grow-0 lg:flex lg:w-[19rem] p-2 sm:mx-8">
                        <Label_InputFile
                            urlFile = {datosBancarios.doc_estado_cuenta || ""}
                            className={modifiedFields.doc_estado_cuenta ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Estado de cuenta"
                            id="doc_estado_cuenta"
                            name="doc_estado_cuenta"
                            type="file"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.doc_estado_cuenta ? errors.doc_estado_cuenta.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow lg:grow-0 lg:flex lg:w-[19rem] p-2 sm:mx-8">
                        <Label_InputFile
                            urlFile = {datosBancarios.doc_constancia_sat || ""}
                            className={modifiedFields.doc_constancia_sat ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Constancia de situación fiscal"
                            id="doc_constancia_sat"
                            name="doc_constancia_sat"
                            type="file"
                            register={register}
                            isDisabled={!isEditing}
                            errors={errors.doc_constancia_sat ? errors.doc_constancia_sat.message : undefined}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                </div>
                <div className="flex justify-center pb-3 sm:pb-4">
                    {
                        isEditing && (
                            <div className="flex px-4">
                                <button
                                    type="button"
                                    className='py-1 px-4 bg-[var(--error)] hover:bg-[var(--error-f)] text-white font-semibold rounded-full focus:outline-none'
                                    onClick={handleCancelEdition}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )
                    }
                    <div className="flex px-4">
                        {/* Botón para habilitar edición o guardar */}
                        <button
                            type="button"
                            // Deshabilitar si no hay campos modificados
                            disabled={isEditing && !Object.values(modifiedFields).some((isModified) => isModified)}
                            className={`py-1 px-4 
                                ${isEditing ? 'bg-[var(--exito-f)] hover:bg-[var(--exito-btn)]' : 'bg-[var(--informacion)] hover:bg-[var(--informacion-f)]' }
                                text-white font-semibold rounded-full focus:outline-none`}
                                onClick={isEditing ? handleSubmit(handleSaveClick) : () => setIsEditing(true)}
                        >
                            {isEditing ? 'Guardar' : 'Editar'}
                        </button>
                    </div>
                </div>
                {
                    showModalConfirmation && (
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
                    )
                }
            </form>
            </SectionContainer>
        </>
    );
}