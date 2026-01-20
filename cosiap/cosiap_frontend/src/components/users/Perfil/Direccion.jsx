import SectionContainer from "@/components/common/ui/SectionContainers/SectionContainer";
import Label_InputForm from "@/components/users/Perfil/Label_InputForm";
import Label_SelectForm from "./Label_SelectForm";
import ModalConfirmation from "@/components/common/ui/Modals/ModalConfirmation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { DirectionInformationValidationSchema } from "@/components/FormsValidations";
import api from "@/api";


export default function Direccion({ datosSolicitante, obtenerInformacionSolicitante, setViewPageLoader, setShowAlertSuccesful }){
    // Estados
    const [isEditing, setIsEditing] = useState(false); // Estado para controlar si está en modo edición
    const [modifiedFields, setModifiedFields] = useState({}); // Campos que han sido modificados
    const [showModalConfirmation, setShowModalConfirmation] = useState(false); // Control para mostrar el modal de confirmación
    const [listaEstados, setListaEstados] = useState([]);
    const [listaMunicipios, setListaMunicipios] = useState([]);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState();
    const [municipioSeleccionado, setMunicipioSeleccionado] = useState();
    // Hook para manejar el formulario
    const {
        register, // Registra los inputs en el formulario
        handleSubmit, // Maneja el envío del formulario
        reset, // Método para resetear los valores del formulario
        formState: { errors, isSubmitting } // Estado del formulario: errores y si se está enviando
    } = useForm({
        resolver: yupResolver(DirectionInformationValidationSchema), // Resolver para la validación con Yup
        defaultValues: {
            direccion: "",
            estado: "",
            municipio: "",
            codigo_postal: "",
            poblacion: ""
        }
    });

    // Función para resetear los datos del formulario con los valores actuales del solicitante
    const resetData = () => reset({
        direccion: datosSolicitante.direccion || "",
        estado:  (datosSolicitante.municipio ? (datosSolicitante.municipio.estado.id) : ""),
        municipio: (datosSolicitante.municipio ? (datosSolicitante.municipio.id) : ""),
        codigo_postal: datosSolicitante.codigo_postal || "",
        poblacion: datosSolicitante.poblacion || ""
    });

    const obtenerMunicipios = async () => {
        setViewPageLoader(true)
        try {
            const response = await api.usuarios.municipios.get();
            setListaMunicipios(response.data);
        } catch (error) {
        }finally{
            setViewPageLoader(false)
        }
    };

    const obtenerEstados = async () => {
        setViewPageLoader(true)
        try {
            const response = await api.usuarios.estados.get();
            setListaEstados(response.data);
        } catch (error) {
        }finally{
            setViewPageLoader(false)
        }
    };

    useEffect(() => {
        obtenerEstados();
        obtenerMunicipios();
    }, []);

    // useEffect que se ejecuta cada vez que los datos del solicitante cambian
    useEffect(() => {
        resetData(); // Resetea los datos cuando cambia datosSolicitante
        if (datosSolicitante.municipio){
            setEstadoSeleccionado(datosSolicitante.municipio.estado.id);
            setMunicipioSeleccionado(datosSolicitante.municipio.id);
        }
    }, [datosSolicitante]);

    // Función que maneja el envío del formulario
    const handleFormSubmission = async (data) => {
        if (!isEditing) {
            return; // Si no está en modo edición, no se envía el formulario
        }

        //Eliminamos el estado en el data
        delete data.estado;

        //Convertimos a entero el id del municipio
        data.municipio = parseInt(data.municipio);
        
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
        // Si el usuario selecciona un estado, guardamos el valor del estado seleccionado
        if (name === "estado") {
            setEstadoSeleccionado(value); // Guardar el estado seleccionado
            setMunicipioSeleccionado(undefined)
        }
        // Si el usuario selecciona un municipio, guardamos el valor del municipio seleccionado
        if (name === "municipio") {
            setMunicipioSeleccionado(value); // Guardar el estado seleccionado
        }
    };
    // Función para cancelar la edición
    const handleCancelEdition = () => {
        setIsEditing(false); // Deshabilitar el modo edición
        resetData(); // Restablecer los datos originales
        setModifiedFields({}); // Limpiar los campos modificados
        if (datosSolicitante.municipio){
            setEstadoSeleccionado(datosSolicitante.municipio.estado.id);
            setMunicipioSeleccionado(datosSolicitante.municipio.id);
        }
    };

    // Función para manejar el clic de "Guardar" con validación
    const handleSaveClick = (data) => {
        if (Object.values(modifiedFields).some((isModified) => isModified)) {
            setShowModalConfirmation(true); // Mostrar el modal de confirmación si no hay errores
        }
    };

    return (
        <>
        <SectionContainer
            title="Dirección"
        >
            <form onSubmit={handleSubmit(handleFormSubmission)}>

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

                <div className="flex flex-wrap justify-center p-2 lg:p-6 min-w-fit">
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_InputForm
                            className={modifiedFields.direccion ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Dirección"
                            id="direccion"
                            name="direccion"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.direccion ? errors.direccion.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_SelectForm
                            className={modifiedFields.estado ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Estado"
                            id="estado"
                            name="estado"
                            type="text"
                            options={[
                                { value: "", label: "Seleccione" },
                                ...listaEstados.map((estado) => ({
                                    value: estado.id, 
                                    label: estado.nombre
                                }))
                            ]}
                            value={estadoSeleccionado ? estadoSeleccionado : ""}
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.estado ? errors.estado.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow p-2 sm:px-8 lg:max-w-[19rem]">
                        <Label_SelectForm
                            className={modifiedFields.municipio ? "ring-4 ring-[var(--precaucion)]" : ""}
                            label="Municipio"
                            id="municipio"
                            name="municipio"
                            type="text"
                            options={[
                                { value: "", label: "Seleccione" },
                                ...(estadoSeleccionado// Si existe el estado seleccionado, filtrar municipios
                                    ? listaMunicipios
                                    .filter(municipio => municipio.estado === parseInt(estadoSeleccionado))
                                    .map((municipio) => ({
                                        value: municipio.id, 
                                        label: municipio.nombre
                                    }))
                                    : []) // Si no hay estado seleccionado, devolver solo la opción "Seleccione"
                                ]}
                            value={municipioSeleccionado ? municipioSeleccionado : ""}
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.municipio ? errors.municipio.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="grow lg:grow-0 lg:flex lg:w-[19rem] p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.poblacion ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Población"
                            id="poblacion"
                            name="poblacion"
                            type="tel"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.poblacion ? errors.poblacion.message : undefined
                            }
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grow lg:grow-0 lg:flex lg:w-[19rem] p-2 sm:px-8">
                        <Label_InputForm
                            className={modifiedFields.codigo_postal ? "ring-4 ring-[var(--precaucion)]" : ""} 
                            label="Código Postal"
                            id="codigo_postal"
                            name="codigo_postal"
                            type="text"
                            register={register}
                            isDisabled={!isEditing}
                            errors={
                                errors.codigo_postal ? errors.codigo_postal.message : undefined
                            }
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
            </form>
        </SectionContainer>
        </>
    );
}