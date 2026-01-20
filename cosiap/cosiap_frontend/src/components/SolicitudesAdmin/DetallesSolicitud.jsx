import api, { apiUrl } from "@/api";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ModalConfirmation from "../common/ui/Modals/ModalConfirmation";
import Alert from "../common/ui/Alert";
import ModalidadInfoContainer from "../common/ui/SectionContainers/MondalidadInfoContainer";

export default function DetallesSolicitud( {setViewPageLoader} ) {
    const { id_solicitud } = useParams();
    const [solicitud, setSolicitud] = useState(null);
    const [minuta, setMinuta] = useState(null);
    const [montoAprobado, setMontoAprobado] = useState(null);
    const [observacion, setObservacion] = useState(null);
    const [status, setStatus] = useState(null);
    const [showModal, setShowModal] = useState(false);

    //Estados para alertas
    const [showAlertSuccesful, setShowAlertSuccesful] = useState(false);
    const [showAlertError, setShowAlertError] = useState(false);
    //Variable para el mensaje de la alerta
    const [alertMessage, setAlertMessage] = useState('');

    const navigate = useNavigate();

    function regimen (value) {
        switch (value) {
            case "1":
                return "Régimen Simplificado de Confianza"
            case "2":
                return "Sueldos y salarios e ingresos asimilados a salarios"
            case "3":
                return "Régimen de Actividades Empresariales y Profesionales"
            case "4":
                return "Régimen de Incorporación Fiscal"
            case "5":
                return "Enajenación de bienes"
            case "6":
                return "Régimen de Actividades Empresariales con ingresos a través de Plataformas Tecnológicas"
            case "7":
                return "Régimen de Arrendamiento"
            case "8":
                return "Intereses"
            case "9":
                return "Obtención de premios"
            case "10":
                return "Dividendos"
            case "11":
                return "Demás Ingresos"
            case "12":
                return "Sin obligaciones fiscales"
            default:
                return value;
        }
    }

    const obtenerSolicitud = async() => {
        try {
            setViewPageLoader(true);
            
            const response = await api.solicitudes.getById(id_solicitud)

            //Actualizamos el monto aprobado
            setMontoAprobado(response.data.monto_aprobado)
            //Aactualizamos la observacion
            setObservacion(response.data.observacion)
            setStatus(response.data.status)
            setSolicitud(response.data)
        } catch (error) {
        } finally {
            setViewPageLoader(false);
        }
    }

    useEffect((() => {
        obtenerSolicitud()
    }), [id_solicitud])

    const handleStatusDocumentChange = (seccionKey, elementoKey, newStatus) => {
        // Actualiza el estado de la solicitud, cambiando el estado del elemento correspondiente
        const updatedSolicitud = { ...solicitud };
        updatedSolicitud.formulario.secciones[seccionKey].elementos[elementoKey].respuesta.status = newStatus;
        
        // Aquí actualizarías el estado o realizarías cualquier acción necesaria
        setSolicitud(updatedSolicitud);
        
    };

    const handleObservationDocumentChange = (seccionKey, elementoKey, newObservation) => {
        // Actualiza el estado de la solicitud, cambiando el estado del elemento correspondiente
        const updatedSolicitud = { ...solicitud };
        updatedSolicitud.formulario.secciones[seccionKey].elementos[elementoKey].respuesta.observacion = newObservation;
        
        // Aquí actualizarías el estado o realizarías cualquier acción necesaria
        setSolicitud(updatedSolicitud);
        
    };

    const handleMinutaChange = (event) => {
        const file = event.target.files[0];
        // Verifica si el archivo es un PDF
        if (file && file.type === "application/pdf") {
            setMinuta(file);
        } else {
            setMinuta(null);
            setAlertMessage("Solo puedes subir archivos PDF.")
            setShowAlertError(true); 
            event.target.value = ""; // Limpia el input de archivo
        }
    };

    const actualizarDatosSolicitud = async() => {
        try {
            //Creamos un data siempre y agregamos la minuta, observación, status y monto aprobado
            // Crear una instancia de FormData
            const formData = new FormData();
            formData.append('minuta', minuta);
            formData.append('observacion', observacion);
            formData.append('status', status);
            formData.append('monto_aprobado', montoAprobado);
            const data = {'field_updates': formData}
            const response = await api.solicitudes.update(id_solicitud, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
        }
    };

    const calificarDocumentos = async() => {
        try {
            let data = [];

            // Iteramos sobre cada sección del formulario
            Object.values(solicitud?.formulario.secciones).forEach((seccion) => {
                // Iteramos sobre cada elemento de la sección
                Object.values(seccion.elementos).forEach((elemento) => {
                    // Verificamos si el elemento es de tipo "documento" y tiene una respuesta
                    if (elemento.tipo === "documento" && elemento.respuesta) {
                        data.push({
                            id_respuesta: elemento.respuesta.id,
                            nuevo_status: elemento.respuesta.status, // Usamos un string vacío si no hay status
                            nueva_observacion: elemento.respuesta.observacion // Usamos un string vacío si no hay observación
                        });
                    }
                });
            });

            const response = await api.solicitudes.calificar_documentos(id_solicitud, {'check_documents': data});

        } catch (error) {
        }
    };



    const handleSaveChanges = async() => {
        setShowModal(false);
        try {
            setViewPageLoader(true);

            // Actualizamos los datos de la solicitud, excepto la minuta

            //Creamos la data con la observacion, status y monto_aprobado
            let datos = {
                observacion: observacion,
                status: status,
                monto_aprobado: montoAprobado
            }

            const response = await api.solicitudes.update(id_solicitud, {'field_updates': datos});
            
            if (minuta){
                //Agregamos la minuta en un form_data
                const formData = new FormData();
                formData.append('minuta', minuta);
                // Actualizamos la minuta
                const responseMinuta = await api.solicitudes.minuta.update(id_solicitud, formData,{
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

            }
            // const response = await api.solicitudes.update(id_solicitud, {'field_updates': data}, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });
            
            //Calificamos los documentos
            let data = [];

            // Iteramos sobre cada sección del formulario
            Object.values(solicitud?.formulario.secciones).forEach((seccion) => {
                // Iteramos sobre cada elemento de la sección
                Object.values(seccion.elementos).forEach((elemento) => {
                    // Verificamos si el elemento es de tipo "documento" y tiene una respuesta
                    if (elemento.tipo === "documento" && Object.keys(elemento.respuesta).length !== 0) {
                        data.push({
                            id_respuesta: elemento.respuesta.id,
                            nuevo_status: elemento.respuesta.status,
                            nueva_observacion: (elemento.respuesta.observacion)
                        });
                    }
                });
            });

            // Realiza la petición solo si hay elementos en data
            if (data.length > 0) {
                const responseDoc = await api.solicitudes.calificar_documentos(id_solicitud, { 'check_documents': data });
            }
            

            //Definimos el mensaje de la alerta
            setAlertMessage('¡Cambios guardados con exito!');
            setShowAlertSuccesful(true)
            
        } catch (error) {
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true)
        } finally {
            setViewPageLoader(false);
        }
    }

    return (
        <>
            {showAlertSuccesful && (
                <Alert
                    message={alertMessage}
                    type="success" // success
                    duration={5000} // Duración de 5 segundos
                    isVisible={showAlertSuccesful}
                    setIsVisible={setShowAlertSuccesful}
                />
            )}
            {showAlertError && (
                <Alert
                    message={alertMessage}
                    type="error" // success
                    duration={5000} // Duración de 5 segundos
                    isVisible={showAlertError}
                    setIsVisible={setShowAlertError}
                />
            )}
            
            {showModal && (
                <ModalConfirmation 
                    nameIcon="warning"
                    title="¿Estas seguro de guardar los cambios realizados"
                >
                    <button
                        type="button"
                        className='py-1 px-8 bg-[var(--gris-3)] hover:bg-[var(--gris-6)] text-dark hover:text-white font-semibold rounded-lg focus:outline-none'
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className='py-1 px-8 bg-green-300 hover:bg-green-500 text-white font-semibold rounded-lg focus:outline-none'
                        onClick={handleSaveChanges}
                    >
                        Guardar
                    </button>
                </ModalConfirmation>
            )}
            <ModalidadInfoContainer
                imagen={solicitud?.modalidad.imagen || ""}
                nombre={solicitud?.modalidad.nombre || ""}
                descripcion={solicitud?.modalidad.descripcion || ""}
                monto_maximo={solicitud?.modalidad.monto_maximo || ""}
            >
                {/* Contenedor con la información del solicitante */}
                <div className="flex flex-col items-center justify-center w-auto h-auto m-4 p-2 ring-2 ring-black rounded-xl">
                    <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                        <h1>Datos del solicitante</h1>
                    </div>
                    {/* Contenedor con la información personal del solicitante */}
                    <div className="text-center text-lg lg:text-2xl text-[var(--principal-mf)] font-semibold my-2 underline">
                        <h1>Informacion personal</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2">
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Nombre
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.nombre || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Apellido Paterno
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.ap_paterno || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Apellido Materno
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.ap_materno || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Sexo
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.sexo ? (solicitud.solicitante.sexo === 'M' ? 'Masculino' : solicitud.solicitante.sexo === 'F' ? 'Femenino' : 'Otro' ) : "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Telefono
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.telefono || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Correo electronico
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitesce-normal">
                                {solicitud?.solicitante.email || "(N/A)"}
                            </span>
                        </div>
                    </div>
                    {/* Contenedor con la información de direccion del solicitante */}
                    <div className="text-center text-lg lg:text-2xl text-[var(--principal-mf)] font-semibold my-2 underline">
                        <h1>Dirección</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2">
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Dirección
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.direccion || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Estado
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.municipio?.estado.nombre || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Municipio
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.municipio?.nombre || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Codigo Postal
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.codigo_postal || "(N/A)"}
                            </span>
                        </div>
                    </div>
                    {/* Contenedor con la información de identificacion del solicitante */}
                    <div className="text-center text-lg lg:text-2xl text-[var(--principal-mf)] font-semibold my-2 underline">
                        <h1>Información de identificación</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2">
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                RFC
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.RFC || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                CURP
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.curp || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                INE
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                            
                                {((solicitud?.solicitante.INE !== null) && (solicitud?.solicitante.INE !== undefined)) ? 
                                    (<a href={apiUrl + solicitud?.solicitante.INE} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        Ver archivo
                                    </a>)
                                : ("(N/A)")
                                }
                            </span>
                        </div>
                    </div>
                    {/* Contenedor con la información de identificacion del solicitante */}
                    <div className="text-center text-lg lg:text-2xl text-[var(--principal-mf)] font-semibold my-2 underline">
                        <h1>Datos bancarios</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2">
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Nombre del banco
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.datos_bancarios?.nombre_banco || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Cuenta bancaria
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.datos_bancarios?.cuenta_bancaria || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Clave bancaria
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.datos_bancarios?.clabe_bancaria || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Codigo Postal Fiscal
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.datos_bancarios?.codigo_postal_fiscal || "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Regimen
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.solicitante.datos_bancarios?.regimen ? regimen(solicitud?.solicitante.datos_bancarios?.regimen) : "(N/A)"}
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Estado de cuenta
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                            
                                {((solicitud?.solicitante.datos_bancarios?.doc_estado_cuenta !== null) && (solicitud?.solicitante.datos_bancarios?.doc_estado_cuenta !== undefined)) ? 
                                    (<a href={apiUrl + solicitud?.solicitante.datos_bancarios?.doc_estado_cuenta} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        Ver archivo
                                    </a>)
                                : ("(N/A)")
                                }
                            </span>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 my-2 sm:w-56">
                            <span className="text-center font-bold text-[var(--principal-mf)]">
                                Constancia de situación fiscal
                            </span>
                            <span className="text-center break-words overflow-hidden text-ellipsis whitespace-normal">
                            
                                {((solicitud?.solicitante.datos_bancarios?.doc_constancia_sat !== null) && (solicitud?.solicitante.datos_bancarios?.doc_constancia_sat !== undefined)) ? 
                                    (<a href={apiUrl + solicitud?.solicitante.datos_bancarios?.doc_constancia_sat} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        Ver archivo
                                    </a>)
                                : ("(N/A)")
                                }
                            </span>
                        </div>
                    </div>
                </div>
                {/* Contenedor del formulario*/}
                <div className="flex flex-col items-center justify-center w-auto h-auto m-4 p-2 ring-2 ring-black rounded-xl">
                {
                    Object.values(solicitud?.formulario?.secciones || {}).map((seccion, key) => (
                        <>
                            <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                                <h1>{seccion.nombre}</h1>
                            </div>
                            <div key={key} className="flex flex-wrap justify-center p-2 ">
                                {/* Elementos de la seccion */}
                                {Object.values(seccion?.elementos || {}).map((elemento, key) =>(
                                    elemento.tipo !== "documento" ? (
                                        <div key={key} className="flex flex-col items-center w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] bg-white rounded-2xl">
                                            <span className="font-semibold text-start break-words overflow-hidden text-ellipsis whitespace-normal">
                                                {elemento.nombre}
                                            </span>
                                            <span className="font-medium text-start break-words overflow-hidden text-ellipsis whitespace-normal">
                                                {elemento.respuesta?.valor || "(N/A)"}
                                            </span>
                                        </div>
                                    ) : (
                                        <div key={key} 
                                            className={`flex flex-col items-center w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] bg-white rounded-2xl ring-4 ring-gray-500
                                            ${elemento.respuesta?.valor && (elemento.respuesta?.status === "revisando" ? 'ring-gray-500' : elemento.respuesta?.status === "invalido" ? 'ring-red-500': 'ring-green-400' )}`}
                                        >
                                            <span className="font-semibold text-start break-words overflow-hidden text-ellipsis whitespace-normal">
                                                {elemento.nombre}
                                            </span>
                                            {elemento.respuesta?.valor ? (
                                                <>
                                                    <div className="flex justify-center items-center w-full my-4 mx-2">
                                                        <a href={`${apiUrl + elemento.respuesta?.valor}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--informacion-f)] text-white uppercase rounded-lg text-xs font-semibold">
                                                            VER DOCUMENTO
                                                        </a>
                                                    </div>
                                                    <span className="font-semibold text-[var(--principal-f)]">
                                                        Estatus
                                                    </span>
                                                    <div className="flex justify-center items-center w-full my-4 mx-2">
                                                        <select 
                                                            className={`p-2 uppercase rounded-lg text-xs px-8 bg-white font-bold
                                                            ${elemento.respuesta?.status === "revisando" ? 'text-gray-600' : elemento.respuesta?.status === "invalido" ? 'text-red-600' : 'text-green-600'} :`}
                                                            value={elemento.respuesta?.status}
                                                            onChange={(e) => handleStatusDocumentChange(seccion.id, elemento.id, e.target.value)}
                                                        >
                                                            <option key="revisando" value="revisando">
                                                                En revisión
                                                            </option>
                                                            <option key="invalido" value="invalido">
                                                                Inválido
                                                            </option>
                                                            <option key="valido" value="valido" >
                                                                Válido
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <span className="font-semibold text-[var(--principal-f)]">
                                                        Retroalimentación
                                                    </span>
                                                    <div className="flex justify-center items-center w-full my-4 mx-2">
                                                        <textarea
                                                            type="text"
                                                            id="descripcion"
                                                            value={elemento.respuesta?.observacion || ""}
                                                            onChange={(e) => handleObservationDocumentChange(seccion.id, elemento.id, e.target.value)}
                                                            className="p-2 rounded-lg text-base bg-white font-semibold w-[90%]"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="font-semibold mt-5">
                                                    El solicitante no ha subido su {elemento?.nombre}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ))
                }
                    <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                        <h1>Monto solicitado</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2 ">
                        <div className="flex flex-row items-center justify-center space-x-2 w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] bg-white rounded-2xl">
                            <span className="font-bold text-start text-lg break-words overflow-hidden text-ellipsis whitespace-normal">
                                $
                            </span>
                            <span className="font-bold text-start text-lg break-words overflow-hidden text-ellipsis whitespace-normal">
                                {solicitud?.monto_solicitado.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2, // Número mínimo de decimales
                                    maximumFractionDigits: 2, // Número máximo de decimales
                                })}
                            </span>
                            <span className="font-bold text-start text-lg break-words overflow-hidden text-ellipsis whitespace-normal">
                                MXN
                            </span>
                        </div>
                    </div>
                    
                </div>
                {/* Contenedor del convenio y minuta*/}
                <div className="flex flex-col items-center justify-center w-auto h-auto m-4 p-2 ring-2 ring-black rounded-xl">
                    <div className="flex flex-wrap justify-center p-2 ">
                        <div className="flex flex-col items-center w-full p-2 sm:w-96 lg:w-[27rem]">
                            <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                                <h1>Convenio</h1>
                            </div>
                            <div
                                className="flex flex-col items-center w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] bg-white rounded-2xl"
                            >
                                {solicitud?.convenio ? (<div className="flex justify-center items-center w-full my-4 mx-2">
                                    <a href={`${apiUrl + solicitud?.convenio}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--informacion-f)] text-white uppercase rounded-lg text-xs font-semibold">
                                        VER DOCUMENTO
                                    </a>
                                </div>) : (
                                    <span className="font-semibold">
                                        No hay convenio subido
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center w-full p-2 sm:w-96 lg:w-[27rem]">
                            <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                                <h1>Minuta</h1>
                            </div>
                            <div
                                className="flex flex-col items-center w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] bg-white rounded-2xl"
                            >
                                {solicitud?.minuta ? (<div className="flex justify-center items-center w-full my-4 mx-2">
                                    <a href={`${apiUrl + solicitud?.minuta?.archivo}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[var(--informacion-f)] text-white uppercase rounded-lg text-xs font-semibold">
                                        VER DOCUMENTO
                                    </a>
                                </div>) : (
                                    <span className="font-semibold">
                                        No hay minuta subida
                                    </span>
                                )}
                                <span className="font-semibold text-[var(--principal-f)] mt-3">
                                    {solicitud?.minuta ? "Actualizar " : "Subir "} minuta
                                </span>
                                <input 
                                    id="inputArchivoMinuta"
                                    name="inputArchivoMinuta"
                                    type="file"
                                    placeholder="subir archivo"
                                    onChange={handleMinutaChange}
                                    className="disabled:bg-gray-300 bg-white rounded-md text-sm border-0 overfl
                                        file:bg-[var(--principal-f)] file:mr-3 file:border-1 file:text-sm file:border-[var(--principal-mf)] 
                                        file:text-white file:rounded-l-[7px] file:py-[2px] file:px-3 mt-3 ring-1 ring-black"
                                    
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Contenedor del monto aprobado*/}
                <div className="flex flex-col items-center justify-center w-auto h-auto m-4 p-2 ring-2 ring-black rounded-xl">
                    <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                        <h1>Monto aprobado</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2 ">
                        <div className="flex flex-col bg-white w-full p-4 my-2 sm:m-6 sm:w-80 lg:w-[26rem] rounded-2xl space-y-2">
                            <div className="flex flex-row items-center justify-around space-x-2">
                                <span className="font-bold text-start text-lg break-words overflow-hidden text-ellipsis whitespace-normal">
                                    $
                                </span>
                                <input 
                                    id="inputMontoAprobado"
                                    name="inputMontoAprobado"
                                    type="number"
                                    value={montoAprobado || ""}
                                    placeholder="Ingresa el monto aprobado"
                                    className="disabled:bg-gray-300 ring-1 ring-black focus:ring-2 focus:ring-inset focus:ring-[var(--principal-f)] border-none rounded-lg text-sm min-w-56"
                                    onChange={(e) => setMontoAprobado(e.target.value)}
                                />
                                <span className="font-bold text-start text-lg break-words overflow-hidden text-ellipsis whitespace-normal">
                                    MXN
                                </span>
                            </div>
                            {montoAprobado > solicitud?.modalidad.monto_maximo && (
                                <span className="font-medium text-center text-sm break-words overflow-hidden text-ellipsis whitespace-norma text-red-500">
                                    El monto aprobado excede el monto maximo de la modalidad
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                        <h1>Observación</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2 w-full">
                        <div className="flex flex-col bg-white w-full p-4 my-2 sm:m-6 rounded-2xl space-y-2">
                            <textarea
                                id="inputDescripcion"
                                name="inputDescripcion"
                                type="text"
                                value={observacion || ""}
                                placeholder="Ingresa una observación a la solicitud"
                                className="disabled:bg-gray-300 ring-1 ring-black focus:ring-2 focus:ring-inset focus:ring-[var(--principal-f)] border-none rounded-lg text-sm min-w-56"
                                onChange={(e) => setObservacion(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="uppercase font-black text-center text-lg lg:text-2xl text-[var(--principal-f)] my-2">
                        <h1>Estatus de la solicitud</h1>
                    </div>
                    <div className="flex flex-wrap justify-center p-2 ">
                        <div className="flex flex-col w-full sm:w-80 lg:w-[26rem] rounded-2xl space-y-2">
                            <div className="flex justify-center items-center w-full my-2 mx-2">
                                <select
                                    id="inputDescripcion"
                                    name="inputDescripcion"
                                    value={status || ""}
                                    className={`p-2 uppercase rounded-lg text-3x1 px-8 bg-white font-bold ring-2 ring-gray-600 text-gray-600
                                        ${status === "Rechazado" ? 'text-red-600 ring-red-600' : status === "Aprobado" ? 'text-green-600 ring-green-600' : ''}`}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Rechazado">Rechazado</option>
                                    <option value="Aprobado">Aprobado</option>
                                </select>
                            </div>
                        </div>
                    </div>                            
                </div>
                {/* Contenedor de las acciones*/}
                <div className="flex flex-row items-center w-auto h-auto m-4 p-2 justify-around">
                    <button
                        type="button"
                        className='py-1 px-6 bg-red-300 hover:bg-red-500 text-white text-xl font-semibold rounded-lg focus:outline-none'
                        onClick={() => navigate('/solicitudes')}
                    >
                        Regresar
                    </button>
                    <button
                        type="button"
                        className="py-1 px-6 bg-green-300 hover:bg-green-500 text-white text-lg font-semibold rounded-lg focus:outline-none"
                        onClick={() => setShowModal(true)}
                    >
                        Guardar cambios
                    </button>
                </div>
            </ModalidadInfoContainer>
        </>
    );
}