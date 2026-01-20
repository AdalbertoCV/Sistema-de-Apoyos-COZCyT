import { useEffect, useRef, useState } from "react";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";
import Button from "./Button";
import api from "@/api";
import MenuColumnas from "./MenuColumnas";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import MenuFiltros from "./MenuFiltros";
import Alert from "../common/ui/Alert";
import MenuReportes from "./MenuReportes";
import ModalConfirmation from "../common/ui/Modals/ModalConfirmation";
import { useNavigate } from "react-router-dom";

export default function Solicitudes( {setViewPageLoader} ){
    
    const [solicitudes, setSolicitudes] = useState([]);
    const [columnas, setColumnas] = useState({});
    const [columnasOcultas, setColumnasOcultas] = useState([]);
    const [filtros, setFiltros] = useState([]);
    const [solicitudesOriginales, setSolicitudesOriginales] = useState([]);
    const [filtrosAplicados, setFiltrosAplicados] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [reporteAplicado, setReporteAplicado] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    //Estados para la edición de campos
    const [editingField, setEditingField] = useState(null); 
    const [editingValue, setEditingValue] = useState("");

    //Los campos en las que se podran editar de manera fija
    const AvailablesFieldsToEdit = [
        'status', 'monto_aprobado', 'observacion'
    ];

    //Estados para alertas
    const [showAlertSuccesful, setShowAlertSuccesful] = useState(false);
    const [showAlertError, setShowAlertError] = useState(false);
    //Variable para el mensaje de la alerta
    const [alertMessage, setAlertMessage] = useState('');

    //Vistas de columnas y filtros
    const [viewMenuColumnas, setViewMenuColumnas] = useState(false)
    const [viewMenuFiltros, setViewMenuFiltros] = useState(false)
    const [viewMenuReportes, setViewMenuReportes] = useState(false);
    const [enableSectionReportes, setEnableSectionReportes] = useState(false);

    //Ref para ventanas y botones de los filtros y columnas
    const menuColumnasRef = useRef(null);
    const buttonMenuColumnasRef = useRef(null);
    const menuFiltrosRef = useRef(null);
    const buttonMenuFiltrosRef = useRef(null);
    const menuReportesRef = useRef(null);
    const buttonMenuReportesRef = useRef(null);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    //Estado para lanzar el submenu de cada solicitud
    const [selectedSolicitudId, setSelectedSolicitudId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    
    //Ref para detectar clicks derechos fuera de las solicitudes
    const solicitudRef = useRef(null);
    const menuOpcionesRef = useRef(null);

    function Regimen (value) {
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

    // Función para manejar la búsqueda
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };


    const obtenerSolicitudes = async () => {
        try {
            setViewPageLoader(true)

            //Obtenemos las solicitudes
            const response = await api.solicitudes.get();
            setSolicitudes(response.data.data);
            setSolicitudesOriginales(response.data.data);
            setColumnas(response.data.available_columns);
            setFiltros(response.data.available_filters);
        } catch (error) {
        }finally{
            setViewPageLoader(false)
        }
    };

    const obtenerReportes = async () => {
        try {
            setViewPageLoader(true)
            //Obtenemos los reportes
            const response = await api.dynamicTables.get();
            setReportes(response.data);
        } catch (error) {
        }finally{
            setViewPageLoader(false)
        }
    };

    // Efecto para manejar los clics fuera de los menús y notificaciones
    useEffect(() => {
        function handleClickOutside(event) {
            // Cierra el menú de las columnas si se hace clic fuera de él y de su botón de toggle
            if (menuColumnasRef.current && !menuColumnasRef.current.contains(event.target) &&
            buttonMenuColumnasRef.current && !buttonMenuColumnasRef.current.contains(event.target)){
                setViewMenuColumnas(false);
            }
            // Cierra el menú de los filtros si se hace clic fuera de él y de su botón de toggle
            if (menuFiltrosRef.current && !menuFiltrosRef.current.contains(event.target) &&
            buttonMenuFiltrosRef.current && !buttonMenuFiltrosRef.current.contains(event.target)){
                setViewMenuFiltros(false);
            }
            // Cierra el menú de los reportes si se hace clic fuera de él y de su botón de toggle
            if (menuReportesRef.current && !menuReportesRef.current.contains(event.target) &&
            buttonMenuReportesRef.current && !buttonMenuReportesRef.current.contains(event.target)){
                setViewMenuReportes(false);
            }

            //Declaramos nulo selectedSolicitudId si no se hace click dentro del menu de opciones o de las solicitudes
            if (solicitudRef.current && !solicitudRef.current.contains(event.target) &&
            menuOpcionesRef.current && !menuOpcionesRef.current.contains(event.target)){
                setSelectedSolicitudId(null);
            }
        }

        // Añade el event listener para detectar clics fuera de los elementos
        document.addEventListener("mousedown", handleClickOutside);

        // Remueve el event listener cuando el componente se desmonte
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    //Cada renderizacion del componente, se obtendran las solicitudes y los reportes
    useEffect(() => {
        obtenerSolicitudes()
        obtenerReportes()
    }, [])

    const sortSolicitudes = (key) => {
        let direction = 'ascending';

        // Cambiar a descendente si ya está en ascendente
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        // Si ya está en descendente, quitamos el sort y restauramos el orden original
        else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            setSortConfig({ key: null, direction: null });
            setSolicitudes([...solicitudesOriginales]); // Restaurar a la lista original
            return;
        }

        const sortedSolicitudes = [...solicitudes].sort((a, b) => {
            const aValue = typeof a[key] === 'number' ? a[key] : a[key].toString().toLowerCase();
            const bValue = typeof b[key] === 'number' ? b[key] : b[key].toString().toLowerCase();

            if (aValue < bValue) {
                return direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        setSolicitudes(sortedSolicitudes);
        setSortConfig({ key, direction });
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const updatedColumnOrder = Array.from(Object.keys(columnas));
        const [movedColumn] = updatedColumnOrder.splice(source.index, 1);
        updatedColumnOrder.splice(destination.index, 0, movedColumn);

        const reorderedColumns = {};
        updatedColumnOrder.forEach((columnKey) => {
            reorderedColumns[columnKey] = columnas[columnKey];
        });

        // Reordenar las solicitudes según el nuevo orden de las columnas
        const reorderedSolicitudes = solicitudes.map((solicitud) => {
            const reorderedSolicitud = {};
            updatedColumnOrder.forEach((columnKey) => {
                reorderedSolicitud[columnKey] = solicitud[columnKey];
            });
            return reorderedSolicitud;
        });

        setColumnas(reorderedColumns);
        setSolicitudes(reorderedSolicitudes);
    };

    // Función que retorna los estilos según el campo y el valor
    const getEstiloCampo = (key, value) => {
        switch (key) {
            case 'status':
                return (
                    <span
                        className={`bg-gradient-to-b px-3 py-1 rounded-xl font-semibold ${
                            value === 'Aprobado'
                                ? 'from-[var(--exito-c)] to-[var(--exito-f)]'
                                : value === 'Rechazado'
                                ? 'from-[var(--error-c)] to-[var(--error-f)]'
                                : 'from-[var(--informacion-c)] to-[var(--informacion-f)]'
                        } font-bold`}
                    >
                        {value}
                    </span>
                );
            case 'solicitante__sexo':
                return (
                    value === 'M' ? 'Masculino' : value === 'O' ? 'Otro' : "Femenino"
                );
            
            case 'modalidad__nombre':
                return (
                    <span className="font-semibold">
                        {value}
                    </span>
                );
            
            case 'monto_solicitado':
                return (
                    <span className="text-right">
                        ${value.toLocaleString('es-MX', {
                            minimumFractionDigits: 2, // Número mínimo de decimales
                            maximumFractionDigits: 2, // Número máximo de decimales
                        })}
                    </span>
                );
            case 'monto_aprobado':
                return (
                    <span className="text-right underline">
                        ${value.toLocaleString('es-MX', {
                            minimumFractionDigits: 2, // Número mínimo de decimales
                            maximumFractionDigits: 2, // Número máximo de decimales
                        })}
                    </span>
                );
            case 'modalidad__monto_maximo':
                return (
                    <span className="text-right">
                        ${value.toLocaleString('es-MX', {
                            minimumFractionDigits: 2, // Número mínimo de decimales
                            maximumFractionDigits: 2, // Número máximo de decimales
                        })}
                    </span>
                );
            case 'timestamp':
                const fecha = new Date(value);
                return (
                    <span>
                        {fecha.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </span>
                );
            case 'solicitante__datos_bancarios__regimen':
                return Regimen(value)
            
            case 'observacion':
                return (
                    <span className="underline">
                        {value}
                    </span>
                );

            default:
                return value;
        }
    }
    
    
    //Funcion para filtrar las solicitudes en base a los filtros y la cadena de busqueda
    const filtrarSolicitudes = () => {
        // Clonamos las solicitudes originales para no mutarlas
        let solicitudesFiltradas = [...solicitudesOriginales];
        let nuevosFiltrosAplicados = [];
        

        // Iteramos sobre cada filtro disponible
        filtros.forEach(filtro => {
            const { campo, lookups, html_type } = filtro;
            // Filtramos solo si el campo tiene valores en lookups
            if (html_type === "numberInput") {
                if (lookups.gte !== null && lookups.lte !== null) {
                    solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => {
                        return (solicitud[campo] >= lookups.gte) && (solicitud[campo] <= lookups.lte);
                    });
                    // Agregar a la lista de filtros aplicados
                    nuevosFiltrosAplicados.push({ filtro });
                }
            } else if (html_type === "dateInput") {
                if (lookups.gte !== null && lookups.lte !== null) {
                    solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => {
                        // Convertimos los valores de la solicitud y los filtros a Date
                        const fechaSolicitud = new Date(solicitud[campo]);
                        const fechaGte = new Date(lookups.gte);
                        const fechaLte = new Date(lookups.lte);
                
                        // Truncamos la parte de la hora para gte (solo fecha) y ajustamos lte al final del día
                        const fechaSolicitudSinHora = new Date(fechaSolicitud.getFullYear(), fechaSolicitud.getMonth(), fechaSolicitud.getDate());
                        const fechaGteSinHora = new Date(fechaGte.getFullYear(), fechaGte.getMonth(), fechaGte.getDate());
                        
                        // Límite superior se ajusta para incluir todo el día (hasta las 23:59:59)
                        const fechaLteFinDia = new Date(fechaLte.getFullYear(), fechaLte.getMonth(), fechaLte.getDate(), 23, 59, 59);
                        
                        // Comparación de fechas con gte y lte
                        return (fechaSolicitudSinHora >= fechaGteSinHora) && (fechaSolicitudSinHora <= fechaLteFinDia);
                    });
                    // Agregar a la lista de filtros aplicados
                    nuevosFiltrosAplicados.push({ filtro });
                }                                          
            } else if (html_type === "textInput") {
                if (lookups.icontains) {
                    solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => {
                        if (campo === "solicitante__nombre"){//Al haber unido el nombre y apellidos en la columna de solicitante
                            return (solicitud[campo]+ " " + solicitud["solicitante__ap_paterno"] + " " + (solicitud["solicitante__ap_materno"] || "")).toLowerCase().includes(lookups.icontains.toLowerCase())
                        }else{
                            return solicitud[campo].toLowerCase().includes(lookups.icontains.toLowerCase())
                        }
                    });
                    // Agregar a la lista de filtros aplicados
                    nuevosFiltrosAplicados.push({ filtro });
                }
                if (lookups.iexact) {
                    solicitudesFiltradas = solicitudesFiltradas.filter(solicitud =>
                        lookups.iexact.includes(solicitud[campo])
                    );
                    // Agregar a la lista de filtros aplicados
                    nuevosFiltrosAplicados.push({ filtro });
                }
            }
        });
        // Aplicamos el término de búsqueda a todos los campos de cada solicitud
        if (searchTerm !== '' && searchTerm !==null) {
            solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => {  
                return (
                    // Verificar si el término de búsqueda coincide en cualquier campo
                    Object.values(solicitud).some(value =>
                        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                    ) ||
                    // Verificar coincidencia específica en la columna "Solicitante"
                    (solicitud.solicitante__nombre+ " " + solicitud.solicitante__ap_paterno+ " " + (solicitud.solicitante__ap_materno || ""))?.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }
    
        setSolicitudes(solicitudesFiltradas);  // Actualizamos las solicitudes filtradas
        setFiltrosAplicados(nuevosFiltrosAplicados); // Actualizamos los filtros aplicados
    };

    const deleteFilter = (campo) => {
        const updatedFiltros = filtros.map((filter) => {
            if (filter.campo === campo) {
                if ((filter.html_type === "numberInput") || (filter.html_type === "dateInput")) {
                    //Declaramos gte del filter como nulo igual que lte
                    filter.lookups.gte = null;
                    filter.lookups.lte = null;
                    
                } else if (filter.html_type === "textInput") {
                    if (filter.lookups.icontains){
                        filter.lookups.icontains = null;
                    }
                    if (filter.lookups.iexact){
                        filter.lookups.iexact = null;
                    }
                }
            }
            return filter;
        });
        setFiltros(updatedFiltros);
    };

    // Función para manejar el doble clic en una celda
    const handleDoubleClick = (id_solicitud, key, value) => {
        setEditingField({ id_solicitud, key, value }); // Almacena el id y el nombre del campo en edición
        setEditingValue(value); // Establece el valor actual del campo en edición
    };

    const handleResetEditing = () => {
        setEditingField(null); // Reinicia el campo en edición
        setEditingValue(""); // Reinicia el valor del campo en edición
    }

    // Función para manejar el cambio en el input editable
    const handleChange = (e) => {
        setEditingValue(e.target.value); // Actualiza el valor en el input
    };

    const inputEditingField = (key) => {
        switch (key) {
            case 'status':
                const choices = filtros.filter((filtro) => filtro.campo === 'status')[0].choices;
                return (
                    <select
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleResetEditing}
                        autoFocus
                        className="focus:ring-2 focus:ring-[var(--principal-f)] rounded-xl px-2 min-w-36 min-h-7 text-sm"
                        
                    >
                        {choices.map((choice, index) => (
                            <option
                            key={index}
                            value={choice.value}
                            className="font-semibold"
                            >
                            {choice.label}
                            </option>
                        ))}
                    </select>
                );
            case 'monto_aprobado':
                return (
                    <input
                    type="number"
                    value={editingValue}
                    onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleResetEditing}
                        autoFocus
                        className="focus:ring-2 focus:ring-[var(--principal-f)] rounded-xl px-2 max-w-36 max-h-7 text-sm"
                    />
                );
            
            case 'observacion':
                return (
                    <input
                    type="text"
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleResetEditing}
                        autoFocus
                        className="focus:ring-2 focus:ring-[var(--principal-f)] rounded-xl px-2 max-w-36 max-h-7 text-sm"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleResetEditing}
                        autoFocus
                        className="focus:ring-2 focus:ring-[var(--principal-f)] rounded-xl px-2 max-w-36 max-h-7 text-sm"
                        />
                    );

                }
    }

    //Cada que el arreglo de filtros cambie, se aplicaran los filtros
    //Añadi que tambien dependiera de las solicitudes originales para que se actualice de inmediato cuando se edita un campo y hay filtros aplicados
    useEffect(() => {
        filtrarSolicitudes()
    }, [solicitudesOriginales, searchTerm,filtros])
    
    // Evento de teclado para guardar cambios al presionar Enter
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (editingValue !== editingField.value) { // Si el valor original es diferente al cambiado
                saveEdit(); //Guardamos
            }
        }
    };
    
    // Función para manejar el evento de blur o Enter para guardar cambios
    const saveEdit = async () => {
        // 
        try {
            setViewPageLoader(true);
            //Creamos un diccionario y agregamos como llave el valor editingField.key y como valor editingValue
            const data = {
                [editingField.key]: editingValue
            };
            const response = await api.solicitudes.update(editingField.id_solicitud, {'field_updates': data})

            // Cambiamos en el arreglo de solicitudes, el registro
            ChangeSolicitud(editingField.id_solicitud, editingField.key, editingValue)

            //Filtramos las solicitudes si es que hay filtros aplicados
            filtrarSolicitudes()

            setAlertMessage('¡Los cambios han sido guardados de manera correcta!');
            //Mostramos alerta de exito
            setShowAlertSuccesful(true);
            
            // Resetea el estado de edición
            setEditingField(null);
            setEditingValue("");
        } catch (error) {
            setAlertMessage('¡Ha ocurrido un error al guardar los cambios! Vuelve a intentarlo');
            setShowAlertError(true);
        } finally {
            setViewPageLoader(false);
        }
    };

    // Variable para cambiar el registro de una solicitud en ambos arreglos
    const ChangeSolicitud = (id_solicitud, campo, newValue) => {
        // Actualiza el arreglo de solicitudes
        setSolicitudes((prevSolicitudes) =>
            prevSolicitudes.map((solicitud) => {
                if (solicitud.id === id_solicitud) {
                    return { ...solicitud, [campo]: newValue };
                }
                return solicitud;
            })
        );

        // Actualiza el arreglo de solicitudesOriginales
        setSolicitudesOriginales((prevSolicitudesOriginales) =>
            prevSolicitudesOriginales.map((solicitud) => {
                if (solicitud.id === id_solicitud) {
                    return { ...solicitud, [campo]: newValue };
                }
                return solicitud;
            })
        );
    };

    //Variable para crear un reporte
    const handleCrearReporte = async (nombre) => {
        try {
            setViewPageLoader(true)
            //formamos el data con los filtros, nombre, columnas etc
            const data = {
                nombre: nombre,
                model_name: 'Solicitud',
                columns: columnas,
                exclude_columns: columnasOcultas,
                search_query: searchTerm,
                filters: filtros,
            }
            
            //enviamos el data a la api para la creacion del reporte
            const response = await api.dynamicTables.post(data);
            //Cerramos la seccion de reporter
            setEnableSectionReportes(false);
            //Obtenemos de nuevo los reportes
            obtenerReportes()
            setAlertMessage('¡Creación de reporte exitosa!');
            setShowAlertSuccesful(true)
        } catch (error) {
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true)
        }finally{
            setViewPageLoader(false);
        }
    };

    //Variable para crear un reporte
    const handleActualizarReporte = async (id, nombre) => {
        try {
            setViewPageLoader(true)
            //formamos el data con los filtros, nombre, columnas etc
            const data = {
                nombre: nombre,
                model_name: 'Solicitud',
                columns: columnas,
                exclude_columns: columnasOcultas,
                search_query: searchTerm,
                filters: filtros,
            }
            
            //enviamos el data a la api para la actualización del reporte
            const response = await api.dynamicTables.update(id, data);
            //Cerramos la seccion de reporter
            setEnableSectionReportes(false);
            //Obtenemos de nuevo los reportes
            obtenerReportes()
            //Definimos el mensaje de la alerta
            setAlertMessage('Actualización de reporte exitosa!');
            setShowAlertSuccesful(true)
        } catch (error) {
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true)
        }finally{
            setViewPageLoader(false);
        }
    };

    //Variable para crear un reporte
    const handleBorrarReporte = async (id) => {
        try {
            setViewPageLoader(true)
            //hacemos la petición a la api para la eliminación del reporte
            const response = await api.dynamicTables.delete(id);
            //Cerramos la seccion de reporter
            setEnableSectionReportes(false);
            //Obtenemos de nuevo los reportes
            obtenerReportes()
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Eliminacion de reporte exitosa!');
            setShowAlertSuccesful(true)
        } catch (error) {
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true)
        }finally{
            setViewPageLoader(false);
        }
    };

    // Función para descargar y guardar el archivo ZIP
    const downloadZipReport = (response) => {
        try {
            // Extraer el tipo de contenido desde los headers
            const contentType = response.headers['content-type'];

            // Crear un Blob con el tipo de contenido de la respuesta y convertir `response.data`
            const blob = new Blob([response.data], { type: contentType });
            
            // Crear una URL para el Blob y enlazarla para descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'reporte.zip'); // Nombre del archivo descargado

            // Agregar el enlace al DOM, hacer clic y luego eliminarlo
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Revocar la URL para liberar memoria
            window.URL.revokeObjectURL(url);

        } catch (error) {
        }
    };

    // Función para exportar un reporte específico
    const handleExportarReporte = async (id) => {
        try {
            setViewPageLoader(true);

            // Llamada a la API para exportar el reporte
            const response = await api.solicitudes.reportes.exportar({
                responseType: 'blob',  // Asegura recibir datos binarios
                params: {
                    reporte_id: id // Aquí se pasan los parámetros de la API
                },
            });

            // Llama a la función de descarga del ZIP
            downloadZipReport(response);

            // Actualiza el estado de la UI
            setEnableSectionReportes(false);
            obtenerReportes();
            setAlertMessage('Exportación de reporte exitosa!');
            setShowAlertSuccesful(true);

        } catch (error) {
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true);

        } finally {
            setViewPageLoader(false);
        }
    };

    useEffect((() => {
        if(reporteAplicado !== null){//Comprobamos que si se seteo un reporte
            //Establecemos las columnas del reporte
            setColumnas(reporteAplicado.columns);
            //Las excluidas
            setColumnasOcultas(reporteAplicado.exclude_columns);
            //Los filtros
            setFiltros(reporteAplicado.filters);
            //Aplicamos los filtros
            filtrarSolicitudes();
            //Establecemos la cadena de busqueda
            setSearchTerm(reporteAplicado.search_query);
            //Habilitamos la seccion de reportes
            setEnableSectionReportes(true);
        }
    }),[reporteAplicado])

    const handleRightClick = (e, id) => {
        e.preventDefault(); // Bloquea el menú contextual del navegador
        setSelectedSolicitudId(id);
        setMenuPosition({ x: e.pageX, y: e.pageY });

        // Declaramos las dimensiones que tiene el menu
        const menuWidth = 48; // Ancho estimado del menú en píxeles
        const menuHeight = 32; // Alto estimado del menú en píxeles

        // Determinar posición inicial en base al clic
        let x = e.pageX;
        let y = e.pageY;

        if (window.innerWidth <= 768) {
            // Pantallas pequeñas: centra el menú horizontalmente
            x = (window.innerWidth - menuWidth) / 2;
        } else {
            // Ajuste para no desbordar a la derecha en pantallas grandes
            if (x + menuWidth > window.innerWidth) {
                x = window.innerWidth - menuWidth;
            }
        }

        // Ajuste para no desbordar hacia abajo
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight;
        }

        // Establecer la posición final del menú
        setMenuPosition({ x, y });
    };

    const handleEliminarSolicitud = async (id_solicitud) => {
        try {
            setViewPageLoader(true)
            //hacemos la petición a la api para la eliminación del reporte
            const response = await api.solicitudes.delete(id_solicitud);
            //Reestablecemos el estado del id solicitud seleccionada
            setSelectedSolicitudId(null);
            //Eliminamos de los arreglos correspondientes la solicitud
            setSolicitudes(solicitudes.filter((solicitud) => solicitud.id !== id_solicitud));
            setSolicitudesOriginales(solicitudes.filter((solicitud) => solicitud.id !== id_solicitud));
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Eliminacion de solicitud exitosa!');
            setShowAlertSuccesful(true)
        } catch (error) {
            //Definimos el mensaje de la alerta
            setAlertMessage('¡Ha ocurrido un error inesperado! Vuelve a intentarlo');
            setShowAlertError(true)
        }finally{
            setViewPageLoader(false);
        }
    };
    

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
            
            <>
                {viewMenuColumnas && (
                    <MenuColumnas columnas={columnas} columnasOcultas={columnasOcultas} setColumnasOcultas={setColumnasOcultas} menuRef={menuColumnasRef} />
                )}
                {viewMenuFiltros && (
                    <MenuFiltros filtros={filtros} setFiltros={setFiltros} columnasOcultas={columnasOcultas} menuRef={menuFiltrosRef} solicitudes={solicitudesOriginales}/>
                )}
                {viewMenuReportes && (
                    <MenuReportes reportes={reportes} reporteAplicado={reporteAplicado} setReporteAplicado={setReporteAplicado} enableSectionReportes={enableSectionReportes} setEnableSectionReportes={setEnableSectionReportes} menuRef={menuReportesRef} setViewMenu={setViewMenuReportes}/>
                )}
                
                <SectionContainer title="Solicitudes">
                    <div className="flex flex-col w-full">
                        <div className="flex justify-around m-4 mx-6 space-x-2">
                            <div className="grow w-1/6">
                                <span className="material-symbols-outlined absolute z-10 leading-snug font-extrabold text-center text-gray-600 bg-transparent rounded text-lg items-center justify-center w-8 pl-3 py-2">
                                    search
                                </span>
                                <input 
                                    type="text" 
                                    id="search" 
                                    placeholder="Search" 
                                    className="relative z-0 border-0 px-3 py-2 font-semibold placeholder-gray-600 bg-white rounded-full text-base shadow-lg focus:ring-2 focus:ring-[var(--principal-f)] w-full pl-10"
                                    onChange={handleSearch}
                                    value={searchTerm}
                                />
                            </div>
                            <Button nameIcon="summarize" text="Reportes" onClick={() => setViewMenuReportes(!viewMenuReportes)} buttonRef={buttonMenuReportesRef}/>
                            <Button nameIcon="tune" text="Filtros" onClick={() => setViewMenuFiltros(!viewMenuFiltros)} buttonRef={buttonMenuFiltrosRef}/>
                            <Button nameIcon="splitscreen_right" text="Columnas" onClick={() => setViewMenuColumnas(!viewMenuColumnas)} buttonRef={buttonMenuColumnasRef}/>
                        </div>
                        {enableSectionReportes && (
                            <SectionReportes reporteAplicado={reporteAplicado} setReporteAplicado={setReporteAplicado} enableSection={enableSectionReportes} setEnableSection = {setEnableSectionReportes} handleCrearReporte={handleCrearReporte} handleActualizarReporte={handleActualizarReporte} handleBorrarReporte={handleBorrarReporte} handleExportarReporte={handleExportarReporte}/>
                        )}
                        <ShowFilters filtrosAplicados={filtrosAplicados} setFiltrosAplicados={setFiltrosAplicados} deleteFilter={deleteFilter} />
                        <div className="flex w-full justify-center pb-3 sm:pb-4">
                            <div className="overflow-x-auto max-w-[97%] rounded-md">
                                <table className="w-full mb-6">
                                    <thead className="my-60">
                                        <DragDropContext onDragEnd={handleDragEnd}>
                                            <Droppable droppableId="columns" direction="horizontal">
                                                {(provided) => (
                                                    <tr
                                                        className="text-center text-black text-sm uppercase"
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        {Object.entries(columnas).map(([key, value], index) => (
                                                            (!columnasOcultas.includes(key) && !['solicitante__ap_materno','solicitante__ap_paterno'].includes(key)) && (
                                                                <Draggable key={key} draggableId={key} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <th
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`bg-[var(--principal-c)] min-w-48 font-semibold py-4 transition-colors duration-300 ${
                                                                                snapshot.isDragging ? 'ring-4 ring-[var(--principal-mf)] rounded-lg' : 'bg-[var(--principal-c)]'
                                                                            }`}
                                                                        >
                                                                            <div className="flex justify-center items-center space-x-3">
                                                                                <span>
                                                                                    {key === 'modalidad__nombre' ? "Modalidad" : key === 'solicitante__nombre' ? "Solicitante" : key === 'timestamp' ? "Fecha" : value}
                                                                                </span>
                                                                                
                                                                                <span 
                                                                                    className="material-symbols-outlined cursor-pointer"
                                                                                    onClick={() => sortSolicitudes(key)}  // Ordenar al hacer clic
                                                                                >
                                                                                    {sortConfig.key === key ? (
                                                                                        sortConfig.direction === 'ascending' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
                                                                                    ) : (
                                                                                        'unfold_more'
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </th>
                                                                    )}
                                                                </Draggable>
                                                            )
                                                        ))}
                                                        {provided.placeholder}
                                                    </tr>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </thead>
                                    <tbody>
                                        {solicitudes.map((solicitud, index) => (
                                            <tr key={index} className="text-sm" ref={solicitudRef}>
                                                {Object.entries(solicitud).map(([key, value], i) => (
                                                    (!columnasOcultas.includes(key) && !['solicitante__ap_materno','solicitante__ap_paterno'].includes(key)) && (
                                                        <td 
                                                            key={i} 
                                                            className={`text-center font-normal px-4 py-4 border-b-2 border-[var(--principal)] max-w-48 text-wrap cursor-pointer ${selectedSolicitudId === solicitud.id ? 'bg-gray-300 ' : 'bg-[#E3E3E3] '}`}
                                                            onContextMenu={(e) => handleRightClick(e, solicitud.id)}
                                                            onDoubleClick={AvailablesFieldsToEdit.includes(key) ? () => handleDoubleClick(solicitud.id, key, value) : null} //Le agregamos la funcion, solamente a los compos que se pueden editar
                                                        >
                                                            {editingField && editingField.id_solicitud === solicitud.id && editingField.key === key ? (
                                                                inputEditingField(key)
                                                            ) : (
                                                                key === 'solicitante__nombre' ? (getEstiloCampo(key, value+" "+solicitud.solicitante__ap_paterno+ " "+(solicitud.solicitante__ap_materno || ""))) : (getEstiloCampo(key, value))
                                                            )}
                                                        </td>
                                                    )
                                                ))}
                                            </tr>
                                        ))}
                                        {/* Menu contextual para una solicitud seleccionada */}
                                        {selectedSolicitudId && (
                                            <MenuOpcionesSolicitud selectedSolicitudId={selectedSolicitudId} menuPosition={menuPosition} handleEliminarSolicitud={handleEliminarSolicitud}/>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Menu contextual para una solicitud seleccionada */}
                            {selectedSolicitudId && (
                                <MenuOpcionesSolicitud selectedSolicitudId={selectedSolicitudId} menuPosition={menuPosition} handleEliminarSolicitud={handleEliminarSolicitud} menuRef={menuOpcionesRef}/>
                            )}
                        </div>
                    </div>
                </SectionContainer>
            </>
            
        </>
    );
}

const MenuOpcionesSolicitud = ( {selectedSolicitudId, menuPosition, handleEliminarSolicitud, menuRef} ) => {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleDelete = () => {
        setShowModal(false);
        handleEliminarSolicitud(selectedSolicitudId);
    };

    return (
        <div ref={menuRef}>
            {showModal && (
                <ModalConfirmation 
                    nameIcon="warning"
                    title="¿Estás seguro de que deseas eliminar esta solicitud?"
                    description="Se eliminara de manera definitiva del sistema"
                >
                    <button
                        type="button"
                        className='py-1 px-8 bg-[var(--gris-3)] hover:bg-[var(--gris-6)] text-dark hover:text-white font-semibold rounded-lg focus:outline-none'
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className='py-1 px-8 bg-red-300 hover:bg-red-500 text-white font-semibold rounded-lg focus:outline-none'
                        onClick={handleDelete}
                    >
                        Eliminar
                    </button>
                </ModalConfirmation>
            )}
            <div
                ref={menuRef}
                className={`absolute flex flex-col w-48 h-auto bg-white rounded-2xl shadow-gray-500 shadow-2xl ring-2 ring-black z-10
                    `}
                style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
            >
                <div 
                    className="flex py-2 px-2 items-center space-x-2 cursor-pointer select-none hover:bg-gray-200 rounded-t-2xl"
                    onClick={() => navigate(`detalles-solicitud/${selectedSolicitudId}`)}
                >
                    <span className="material-symbols-outlined">
                        visibility
                    </span>
                    <span className="font-semibold">
                        Ver vista detallada
                    </span>
                </div>
                <div 
                    className="flex py-2 px-2 items-center space-x-2 cursor-pointer select-none hover:bg-gray-200 rounded-b-2xl"
                    onClick={() => setShowModal(true)}
                >
                    <span className="material-symbols-outlined">
                        delete
                    </span>
                    <span className="font-semibold">
                        Eliminar solicitud
                    </span>
                </div>
            </div>
        </div>
    );
};

const ShowFilters = ({filtrosAplicados, setFiltrosAplicados, deleteFilter}) => {
    function RegimenAbreviado (value) {
        switch (value) {
            case "1":
                return "RSC"
            case "2":
                return "SSIAS"
            case "3":
                return "RAEP"
            case "4":
                return "RIF"
            case "5":
                return "EB"
            case "6":
                return "RAEIPT"
            case "7":
                return "RA"
            case "8":
                return "I"
            case "9":
                return "OP"
            case "10":
                return "D"
            case "11":
                return "DI"
            case "12":
                return "SOF"
            default:
                return value;
        }
    }

    const texto = (campo, html_type, lookups) => {
        if (html_type === "numberInput") {
           return `${lookups.gte} - ${lookups.lte}`     
        } else if (html_type === "dateInput") {
           return `${lookups.gte} - ${lookups.lte}`                                       
        } else if (html_type === "textInput") {
            if (lookups.icontains) {
                return lookups.icontains;
            }
            if (lookups.iexact) {
                return (
                    // Ponemos los valores que se encuentran dentro de lookups.icontaines en una sola cadena, separados por , 
                    lookups.iexact.map((value, index) => {
                        return RegimenAbreviado(value) + (index < lookups.iexact.length - 1 ? ", " : "")
                    }).join("")
                );
            }
        }
        return "";
    }

    // Función que elimina el filtro al hacer clic en el icono "close"
    const handleRemoveFilter = (campo, indexToRemove) => {
        deleteFilter(campo);
        setFiltrosAplicados((prevFiltros) =>
            prevFiltros.filter((_, index) => index !== indexToRemove)
        );
    };

    return (
        <>
        {filtrosAplicados.length  > 0 && (
            <div className="flex flex-wrap space-x-10 py-4 justify-center items-center text-white mx-8">
                {filtrosAplicados.map((object, key) => (
                    <div key={key} className="flex justify-around space-x-5 rounded-xl bg-gradient-to-t from-[var(--informacion-f)] via-[var(--informacion)] to-[var(--informacion-c)]  ring-2 ring-[var(--informacion-f)] py-1 px-4 mb-4">
                        <div className="flex text-clip space-x-2">
                            <span className="underline font-semibold">
                                {object.filtro.campo === 'modalidad__nombre' ? "Modalidad" : object.filtro.campo === 'solicitante__nombre' ? "Solicitante" : object.filtro.campo === 'timestamp' ? "Fecha" : object.filtro.label}: 
                            </span>
                            
                            <span className="font-semibold">
                                {`${texto(object.filtro.campo, object.filtro.html_type, object.filtro.lookups)}`}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span
                                className="material-symbols-outlined cursor-pointer"
                                onClick={() => handleRemoveFilter(object.filtro.campo, key)}
                            >
                                close
                            </span>
                        </div>
                    </div>

                ))}
            </div>
        )}
        </>
    );
}

function SectionReportes( {reporteAplicado, setReporteAplicado, enableSection, setEnableSection, handleCrearReporte, handleActualizarReporte, handleBorrarReporte, handleExportarReporte} ){
    const [name, setName] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect((() => {
        setName(reporteAplicado ? reporteAplicado.nombre : "");
    }),[reporteAplicado])

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleCreate = () => {
        if (name===""){
            alert("Debes ingresar un nombre para el reporte");
        }else{
            handleCrearReporte(name);
        }
    };

    const handleCancel = () => {
        setReporteAplicado(null)
        setEnableSection(false);
    };

    const handleDelete = () => {
        handleBorrarReporte(reporteAplicado.id);
        setEnableSection(false);
        setReporteAplicado(null)
    };
    
    // Si se ha declarado un reporte aplicado, significa que se selecciono un reporte de reportes existente
    // Si no se ha declarado un reporte aplicado, significa que se selecciono la creación de uno nuevo
    return (
        <>
            {showModal && (
                <ModalConfirmation 
                    nameIcon="warning"
                    title="¿Estás seguro de que deseas eliminar esta configuración de reporte?"
                    description="Se eliminara de manera definitiva del sistema"
                >
                    <button
                        type="button"
                        className='py-1 px-8 bg-[var(--gris-3)] hover:bg-[var(--gris-6)] text-dark hover:text-white font-semibold rounded-lg focus:outline-none'
                        onClick={() => setShowModal(false)}
                    >
                        Cancelar
                    </button>

                    <button
                        className='py-1 px-8 bg-red-300 hover:bg-red-500 text-white font-semibold rounded-lg focus:outline-none'
                        onClick={handleDelete}
                    >
                        Eliminar
                    </button>
                </ModalConfirmation>
            )}
            <div className="flex m-4 mx-6 space-x-2 justify-center">
                <div className="flex lg:w-[60%] justify-center">
                    <span className="font-bold uppercase text-2xl">
                        {reporteAplicado === null ? "Crear reporte" : "Modificar reporte"}
                    </span>
                </div>
                <div
                    className="cursor-pointer select-none flex justify-center items-center space-x-2 hover:text-red-600" 
                    title="Cancelar"
                    onClick={handleCancel}
                >
                    <span className="material-symbols-outlined text-3xl">
                        close
                    </span>
                </div>
            </div>
            <div className="flex m-4 mx-6 space-x-2 justify-center">
                <div className="flex lg:w-2/5">
                    <input 
                        type="text" 
                        id="nombre_reporte"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="Nombre de la reporte" 
                        className="z-0 border-0 px-3 py-2 font-medium bg-white rounded-lg text-base ring-1 ring-[var(--principal-f)] focus:ring-2 focus:ring-[var(--principal-f)] w-full"
                    />
                </div>
                <div className="flex  items-end space-x-2">
                    {reporteAplicado === null ? (
                        <>
                            <div 
                                className="cursor-pointer select-none flex justify-center items-center space-x-2 text-gray-200 bg-green-400 rounded-2xl p-2 border-2 border-green-600 hover:bg-green-600"
                                onClick={handleCreate}
                            >
                                <span className="material-symbols-outlined">
                                    save
                                </span>
                                <span className="font-semibold text-sm hidden lg:block">
                                    Guardar
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div 
                                className="cursor-pointer select-none flex justify-center items-center space-x-2 text-gray-200 bg-green-400 rounded-2xl p-2 border-2 border-green-600 hover:bg-green-600"
                                onClick={() => handleActualizarReporte(reporteAplicado.id, name)}
                            >
                                <span className="material-symbols-outlined">
                                    system_update_alt
                                </span>
                                <span className="font-semibold text-sm hidden lg:block">
                                    Actualizar
                                </span>
                            </div>
                            <div
                                className="cursor-pointer select-none flex justify-center items-center space-x-2 text-gray-200 bg-red-400 rounded-2xl p-2 border-2 border-red-600 hover:bg-red-600" 
                                title="Haz click aqui para eliminar la reporte" 
                                onClick={() => setShowModal(true)}
                            >
                                <span className="material-symbols-outlined">
                                    delete
                                </span>
                            </div>
                            <Button nameIcon="download" text="Exportar" onClick={() => handleExportarReporte(reporteAplicado.id)}/>
                            
                        </>
                    )}
                </div>
            </div>
        </>
    );
}