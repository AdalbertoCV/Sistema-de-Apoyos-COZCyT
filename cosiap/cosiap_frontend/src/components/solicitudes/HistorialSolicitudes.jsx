import { useState, useEffect } from "react";
import api from '../../api';
import Tabla from "../common/utility/ReusableTable"; // Importa la tabla reutilizable
import MainContainer from "../common/utility/MainContainer";
import '@/App.css';
import { useNavigate} from 'react-router-dom';
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";


// Componente para devolver la lista de las solicitudes de un solicitante
const ListaSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const navigate = useNavigate();

    // Obtenemos las solicitudes del usuario
    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const response = await api.solicitudes.historial.get();
                const solicitudesData = Object.values(response.data) || [];

                // Guardamos las solicitudes
                setSolicitudes(solicitudesData);

                // Creamos un objeto para almacenar los nombres de las modalidades por ID de solicitud
                const modalidadNombres = {};

                // Realizamos las solicitudes a la API para obtener el nombre de cada modalidad
                await Promise.all(solicitudesData.map(async (solicitud) => {
                    const modalidadId = solicitud.modalidad;
                    try {
                        const modalidadResponse = await api.modalidades.getById(modalidadId);
                        // Asignamos el nombre de la modalidad en el objeto usando el ID de la solicitud como clave
                        modalidadNombres[solicitud.id] = modalidadResponse.data.data.nombre;
                    } catch (error) {
                        modalidadNombres[solicitud.id] = 'Desconocido';
                    }
                }));

                // Actualizamos el estado con los nombres de las modalidades, almacenados por ID
                setModalidades(modalidadNombres);

            } catch (error) {
                navigate('/404');
                setSolicitudes([]);
            }
        };

        fetchSolicitudes();
    }, []);


    // Función para aplicar estilos al estado
    const getStatusClass = (status) => {
        switch (status) {
            case 'Aprobado':
                return 'estado-aprobado';
            case 'Rechazado':
                return 'estado-rechazado';
            case 'Pendiente':
                return 'estado-pendiente';
            default:
                return '';
        }
    };

    // Definimos las columnas a mostrar en la tabla
    const columnas = [
        {
            label: "Modalidad",
            render: (fila) => modalidades[fila.id] || 'Cargando...'
        },
        {
            label: "Estatus",
            render: (fila) => (
                <div>
                    <span className={`estado-label ${getStatusClass(fila.status)}`}>
                        {fila.status}
                    </span>
                    {fila.status === "Aprobado" && !fila.convenio && (
                        <p style={{ color: 'red', margin: '5px 0 0' }}>
                            *No se ha subido el convenio*
                        </p>
                    )}
                </div>
            )
        },
        {
            label: "Monto Solicitado",
            render: (fila) => `$${fila.monto_solicitado}`
        },
        {
            label: "Monto Aprobado",
            render: (fila) => `$${fila.monto_aprobado}`
        },
        {
            label: "Fecha",
            render: (fila) => {
                const fecha = new Date(fila.timestamp);
                return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            }
        },
        {
            label: "Acciones",
            render: (fila) => (
                <div>
                    <button className="button-ver" onClick={() => navigate(`/ver-solicitud/${fila.solicitud_n}`)}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-1.65 3.37-5.02 5.5-8.82 5.5S4.83 15.37 3.18 12C4.83 8.63 8.21 6.5 12 6.5m0-2C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5m0-2c-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5 4.5-2.02 4.5-4.5-2.02-4.5-4.5-4.5z"/></svg>
                    </button>
                    {fila.status === 'Pendiente' && (
                        <button className="button-editar" onClick={() => navigate(`/editar-solicitud/${fila.solicitud_n}`)}
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <SectionContainer title="Historial de Solicitudes">
            <div className="w-full">
                <Tabla columnas={columnas} datos={solicitudes} />
            </div>
        </SectionContainer>
    );
};

export default ListaSolicitudes;
