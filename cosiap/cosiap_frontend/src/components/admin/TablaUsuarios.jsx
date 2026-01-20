import { useState, useEffect, useRef } from "react";
import api from '../../api';
import Tabla from "../common/utility/ReusableTable";
import MainContainer from "../common/utility/MainContainer";
import '@/App.css';
import { useNavigate } from "react-router-dom";
import SearchInput from '@/components/common/utility/SearchInput';
import UserIcon from "@/components/common/utility/UserIcon";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

const ListaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editRow, setEditRow] = useState(null);
    const [registerChange, setRegisterChange] = useState({});
    const inputRefs = useRef({});
    const tableContainerRef = useRef(null); // Referencia al contenedor con scroll
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); // Para abrir el menú contextual
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // Estado para controlar la confirmación de eliminación
    const [showCard, setShowCard] = useState(false);
    const [curpActual, setCurpActual] = useState('');
    const [nombreActual, setNombreActual] = useState('');
    const [emailActual, setEmailActual] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await api.usuarios.solicitantes.get();
                setUsuarios(response.data.data);
            } catch (error) {
                setUsuarios([]);
            }
        };
        fetchUsuarios();
    }, []);

    const handleSingleClick = (e, fila) => {
        e.preventDefault();
        setSelectedRow(fila.id); // Muestra el menú para el registro seleccionado
    };

    const handleCloseMenu = () => {
        setSelectedRow(null);
        setIsConfirmingDelete(false); // Cierra el menú de confirmación
    };

    const handleEditRow = (id) => {
        setEditRow(id);
        handleCloseMenu();
    };

    const handleNavigateToHistorial = (id) => {
        navigate(`/historial-solicitante/${id}`);
    };

    const handleDeleteConfirm = (id) => {
        setIsConfirmingDelete(id); // Abre el menú de confirmación
    };

    const handleDelete = async (id) => {
        try {
            await api.usuarios.delete(id);
            const response = await api.usuarios.solicitantes.get();
            setUsuarios(response.data.data);
            showAlert("Usuario eliminado con éxito", true);
        } catch (error) {
            showAlert("Error al eliminar el usuario", false);
        }
        handleCloseMenu(); // Cierra el menú después de eliminar
    };

    const handleCloseInfo = () => {
        setShowCard(false)
        setCurpActual(null)
        setNombreActual(null)
        setEmailActual(null)
    };

    const handleClickIcon = (curp, nombre, email) => {
        setShowCard(true)
        setCurpActual(curp)
        setNombreActual(nombre)
        setEmailActual(email)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableContainerRef.current?.contains(event.target)) {
                return; // Ignorar el clic si es en el scroll
            }

            const isOutside = !Object.values(inputRefs.current).some((input) =>
                input?.contains(event.target)
            );

            if (isOutside && editRow !== null) {
                handleUpdate(editRow);
                setEditRow(null);
                setRegisterChange({});
            }
            handleCloseMenu();
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [editRow, registerChange]);

    const handleChange = (e, rowId, key) => {
        const value = e.target.value;

        setRegisterChange((prev) => ({
            ...prev,
            [rowId]: { 
                ...prev[rowId],
                [key]: value === '' ? '' : value // Permitir valores vacíos
            },
        }));
    };

    const columnas = [
        {
            label: "", 
            render: (fila) => (
                <UserIcon nombre={fila.nombre + " " + fila.ap_paterno + " " + fila.ap_materno} curp={fila.curp} email={fila.email} onClick={handleClickIcon} />
            ),
        },
        { label: "CURP", render: (fila) => renderCell(fila, "curp") },
        { label: "Nombre", render: (fila) => renderCell(fila, "nombre") },
        { label: "Apellido Paterno", render: (fila) => renderCell(fila, "ap_paterno") },
        { label: "Apellido Materno", render: (fila) => renderCell(fila, "ap_materno") },
        { label: "RFC", render: (fila) => renderCell(fila, "RFC") },
        { label: "E-mail", render: (fila) => renderCell(fila, "email") },
    ];

    const renderCell = (fila, key) => {
        const isEditing = editRow === fila.id;
        return (
            <div
                onContextMenu={(e) => handleSingleClick(e, fila)}
                onDoubleClick={() => handleEditRow(fila.id)} 
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}  
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={registerChange[fila.id]?.[key] !== undefined ? registerChange[fila.id][key] : fila[key]}
                        onChange={(e) => handleChange(e, fila.id, key)}
                        ref={(el) => (inputRefs.current[fila.id + key] = el)}
                        style={{
                            fontSize: "14px",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            height: "1.6em",
                            lineHeight: "1",
                            border: "1px solid #d3d3d3",
                            display: "inline-block",
                            width: "auto",
                            maxWidth: "100px",
                        }}
                        autoFocus
                    />
                ) : (
                    <span>{fila[key]}</span>
                )}
            </div>
        );
    };

    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
            setAlertMessage('');
        }, 3000);
    };

    const handleInputChange = (e) => setSearchQuery(e.target.value);

    const handleSearch = async () => {
        try {
            const response = await api.usuarios.solicitantes.get({
                params: { search_query: searchQuery, model_name: "Solicitante", columns: "__all__" },
            });
            setUsuarios(response.data.data);
        } catch (error) {
        }
    };

    const handleUpdate = async (id) => {
        try {
            await api.usuarios.solicitantes.update(id, registerChange[id]);
            const response = await api.usuarios.solicitantes.get();
            setUsuarios(response.data.data);
        } catch (error) {
            const errorData = error.response.data;
            for (const key in errorData) {
                if (errorData.hasOwnProperty(key)) {
                    showAlert(errorData[key], false);
                }
            }
        }
    };

    return (
        <SectionContainer title="Usuarios Solicitantes">
            {alertMessage && (
                <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                </div>
            )}
            <div className="flex flex-col w-full">

                <div className="button-container">
                    <SearchInput onSearch={handleSearch} onChange={handleInputChange} />
                    <button
                        onClick={() => navigate('/administradores')}
                        className="button-users"
                    >
                        Administradores
                    </button>
                </div>
                <div className="table-container" ref={tableContainerRef}>
                    <Tabla columnas={columnas} datos={usuarios} />
                    {selectedRow && !isConfirmingDelete && (
                        <div className="context-menu">
                            <button onClick={() => handleNavigateToHistorial(selectedRow)}>
                                Ver historial de solicitudes
                            </button>
                            <button onClick={() => handleDeleteConfirm(selectedRow)}>
                                Eliminar Usuario
                            </button>
                        </div>
                    )}
                    {isConfirmingDelete && (
                        <div className="confirm-delete-menu">
                            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
                            <button className="cancel" onClick={handleCloseMenu}>Cancelar</button>
                            <button className="confirm" onClick={() => handleDelete(selectedRow)}>Eliminar</button>
                        </div>
                    )}
                </div>
                {showCard && (
                    <div className="user-card">
                        <h3>Detalles del Usuario</h3>
                        <p><strong>CURP:</strong> {curpActual}</p>
                        <p><strong>Nombre:</strong> {nombreActual}</p>
                        <p><strong>Email:</strong> {emailActual}</p>
                        <button onClick={handleCloseInfo}>Cerrar</button>
                    </div>
                )}
            </div>
        </SectionContainer>
    );
};

export default ListaUsuarios;
