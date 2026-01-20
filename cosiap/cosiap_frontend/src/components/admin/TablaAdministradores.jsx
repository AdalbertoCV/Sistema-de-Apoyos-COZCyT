import { useState, useEffect, useRef } from "react";
import api from '../../api';
import Tabla from "../common/utility/ReusableTable";
import MainContainer from "../common/utility/MainContainer";
import { useNavigate } from "react-router-dom";
import '@/App.css';
import UserIcon from "@/components/common/utility/UserIcon";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

const ListaAdmins = () =>{
    const [admins, setAdmins] = useState([]);
    const [editRow, setEditRow] = useState(null);
    const [registerChange, setRegisterChange] = useState({});
    const inputRefs = useRef({});
    const tableContainerRef = useRef(null); 
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null); 
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); 
    const [showCard, setShowCard] = useState(false);
    const [curpActual, setCurpActual] = useState('');
    const [nombreActual, setNombreActual] = useState('');
    const [emailActual, setEmailActual] = useState('');
    const navigate = useNavigate();



    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const response = await api.usuarios.administradores.get();
                setAdmins(response.data);
            } catch (error) {
                setAdmins([]);
            }
        };
        fetchAdmins();
    }, []);

    const handleSingleClick = (e,fila) => {
        e.preventDefault();
        setSelectedRow(fila.pk);
    };

    const handleCloseMenu = () => {
        setSelectedRow(null);
        setIsConfirmingDelete(false); 
    };

    const handleEditRow = (id) => {
        setEditRow(id);
        handleCloseMenu();
    };

    const handleDeleteConfirm = (id) => {
        setIsConfirmingDelete(id); // Abre el menú de confirmación
    };

    const handleDelete = async (id) => {
        try {
            await api.usuarios.delete(id);
            const response = await api.usuarios.administradores.get();
            setAdmins(response.data);
            showAlert("Usuario eliminado con éxito", true);
        } catch (error) {
            showAlert("Error al eliminar el usuario", false);
        }
        handleCloseMenu(); 
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
                return;
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
            render: (fila) => <UserIcon nombre={fila.nombre} curp={fila.curp} email={fila.email} onClick={handleClickIcon} />, 
          },
        { label: "CURP", render: (fila) => renderCell(fila, "curp") },
        { label: "Nombre", render: (fila) => renderCell(fila, "nombre") },
        { label: "E-mail", render: (fila) => renderCell(fila, "email") },
    ];

    const renderCell = (fila, key) => {
        const isEditing = editRow === fila.pk;
        return (
            <div
                onContextMenu={(e) => handleSingleClick(e, fila)}
                onDoubleClick={() => handleEditRow(fila.pk)} 
                style={{ cursor: "pointer", display: "flex", alignItems: "center" }}  
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={registerChange[fila.pk]?.[key] !== undefined ? registerChange[fila.pk][key] : fila[key]}
                        onChange={(e) => handleChange(e, fila.pk, key)}
                        ref={(el) => (inputRefs.current[fila.pk + key] = el)}
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

    const handleUpdate = async (id) => {
        try {
            await api.usuarios.administradores.update(id, registerChange[id])
            const response = await api.usuarios.administradores.get();
            setAdmins(response.data);
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
        <SectionContainer title="Usuarios Administradores">
            {alertMessage && (
                <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                </div>
            )}
            <div className="flex flex-col w-full">

                <div className="button-container">
                <button className="add-button"
                onClick={() => navigate('/nuevo-administrador')}
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                Administrador
                </button>
                <button
                    onClick={() => navigate('/usuarios')}
                    className="button-users"
                >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 13.75c-2.34 0-7 1.17-7 3.5V19h14v-1.75c0-2.33-4.66-3.5-7-3.5zM4.34 17c.84-.58 2.87-1.25 4.66-1.25s3.82.67 4.66 1.25H4.34zM9 12c1.93 0 3.5-1.57 3.5-3.5S10.93 5 9 5 5.5 6.57 5.5 8.5 7.07 12 9 12zm0-5c.83 0 1.5.67 1.5 1.5S9.83 10 9 10s-1.5-.67-1.5-1.5S8.17 7 9 7zm7.04 6.81c1.16.84 1.96 1.96 1.96 3.44V19h4v-1.75c0-2.02-3.5-3.17-5.96-3.44zM15 12c1.93 0 3.5-1.57 3.5-3.5S16.93 5 15 5c-.54 0-1.04.13-1.5.35.63.89 1 1.98 1 3.15s-.37 2.26-1 3.15c.46.22.96.35 1.5.35z"/></svg>
                Solicitantes
                </button>
                </div>
                <div className="table-container" ref={tableContainerRef}>
                    <Tabla columnas={columnas} datos={admins}  />
                    {selectedRow && !isConfirmingDelete && (
                        <div className="context-menu">
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
                    {/* Tarjeta emergente */}
                    {showCard && (
                    <div className="user-card">
                        <button className="close-btn" onClick={handleCloseInfo}>X</button>
                        <h3>Información del Usuario</h3>
                        <p><strong>Nombre:</strong> {nombreActual}</p>
                        <p><strong>CURP:</strong> {curpActual}</p>
                        <p><strong>Email:</strong> {emailActual}</p>
                    </div>
                    )}
                </div>
            </div>
        </SectionContainer>
    );
};

export default ListaAdmins;