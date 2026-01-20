import { useState, useEffect } from "react";
import api from '../../api';
import MainContainer from "../common/utility/MainContainer";
import '@/App.css';
import { useNavigate } from "react-router-dom";
import Tabla from "../common/utility/ReusableTable";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

const ListaFormatos = () => {
    const [formatos, setFormatos] = useState([]);
    const [formatoConvenio, setFormatoConvenio] = useState(null);
    const [formatoMinuta, setFormatoMinuta] = useState(null);
    const [isAddingConvenio, setIsAddingConvenio] = useState(false);
    const [isAddingMinuta, setIsAddingMinuta] = useState(false);
    const [selectedFileConvenio, setSelectedFileConvenio] = useState(null);
    const [selectedFileMinuta, setSelectedFileMinuta] = useState(null);
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchFormatos = async () => {
            try {
                const response = await api.formatos.get();
                const filteredFormatos = response.data.filter(
                    (formato) =>
                        formato.nombre !== "formato_convenio_default" &&
                        formato.nombre !== "formato_minuta_default"
                );
                setFormatos(filteredFormatos);
            } catch (error) {
                setFormatos([]);
            }
        };
        fetchFormatos();
    }, []);

    useEffect(() => {
        const fetchFormatoConvenio = async () => {
            try {
                const response = await api.formatos.getConvenio();
                setFormatoConvenio(response.data.formato)
            } catch (error) {
                setFormatoConvenio([]);
            }
        };
        fetchFormatoConvenio();
    }, []);


    useEffect(() => {
        const fetchFormatoMinuta = async () => {
            try {
                const response = await api.formatos.getMinuta();
                setFormatoMinuta(response.data.formato)
            } catch (error) {
                setFormatoMinuta([]);
            }
        };
        fetchFormatoMinuta();
    }, []);

    // Definimos las columnas a mostrar en la tabla
    const columnas = [
        {
            label: "Nombre formato",
            render: (fila) => fila.nombre
        },
        {
            label: "Acciones",
            render: (fila) => (
                <div className="table-button-container">
                    <button className="add-button" onClick={() => {handleDownload(fila.id)}}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5 L17,11z"/></g></svg>
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteConfirm(fila.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                    </button>
                </div>
            )
        }
    ];

    const handleCloseMenu = () => {
        setIsConfirmingDelete(false); 
    };

    const handleDeleteConfirm = (id) => {
        setIsConfirmingDelete(id);
        setSelectedRow(id);
    };

    const handleDelete = async (id) => {
        const response = await api.formatos.delete(id);
        if (response.status === 204){
            showAlert('Formato eliminado exitosamente', true);
        }
        const formatos = await api.formatos.get();
        const filteredFormatos = formatos.data.filter(
            (formato) =>
                formato.nombre !== "formato_convenio_default" &&
                formato.nombre !== "formato_minuta_default"
        );
        setFormatos(filteredFormatos);
        setSelectedRow(null);
        handleCloseMenu();
    };

    const handleSaveConvenio = async () =>{

        const formData = new FormData();
        formData.append("nombre", "formato_convenio_default");
        formData.append("template", selectedFileConvenio);
      
        try {
            await api.formatos.updateConvenio(formData);
      
            // Actualizar el convenio mostrado
            const response = await api.formatos.getConvenio();
            setFormatoConvenio(response.data.formato);
            setIsAddingConvenio(false)
            setSelectedFileConvenio(null)
            showAlert("Formato para convenios actualizado exitosamente.", true)
        } catch (error) {
        }
    };

    const handleSaveMinuta = async () =>{
        const formData = new FormData();
        formData.append("nombre", "formato_minuta_default");
        formData.append("template", selectedFileMinuta);
      
        try {
            await api.formatos.updateMinuta(formData);
      
            // Actualizar la minuta mostrada
            const response = await api.formatos.getMinuta();
            setFormatoMinuta(response.data.formato);
            setIsAddingMinuta(false)
            setSelectedFileMinuta(null)
            showAlert("Formato para minutas actualizado exitosamente.", true)
        } catch (error) {
        }
    };

    const handleConvenioChange = (e) => {
        setIsAddingConvenio(true)
        setSelectedFileConvenio(e.target.files[0]);
    };

    const handleMinutaChange = (e) => {
        setIsAddingMinuta(true)
        setSelectedFileMinuta(e.target.files[0]);
    };

    const handleDownload = async (id) => {
        try {
            const response = await api.formatos.download(id, { responseType: 'blob' });
            
            const contentType = response.headers['content-type'];
            if (contentType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                throw new Error('Tipo de archivo inesperado');
            }
            
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `formato.docx`);
            
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
        }
    };

    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
    };
    
    
    return (
        <SectionContainer title="Formatos">
            {alertMessage && (
                <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                </div>
            )}
            <div className="flex flex-col w-full justify-center items-center">

                <div className="section-card">
                    <h3>Formatos predeterminados</h3>
                    <div className="elementos-container flex items-center justify-center">
                        <div className="element-card">
                            <h4>Formato Convenios</h4>
                            {formatoConvenio ? (
                                <button 
                                    className="download-button" 
                                    onClick={() => handleDownload(formatoConvenio.id)}
                                >
                                    Descargar Formato
                                </button>
                            ) : (
                                <p>No hay formato disponible</p>
                            )}
                            <input 
                                type="file" 
                                accept=".docx" 
                                onChange={handleConvenioChange} 
                            />
                            {isAddingConvenio ? (
                                <div className="button-container">
                                    <button 
                                        className="submit-button" 
                                        onClick={handleSaveConvenio}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            ) : null}
                        </div>
                        <div className="element-card">
                            <h4>Formato Minutas</h4>
                            {formatoMinuta ? (
                                <button 
                                    className="download-button" 
                                    onClick={() => handleDownload(formatoMinuta.id)}
                                >
                                    Descargar Formato
                                </button>
                            ) : (
                                <p>No hay formato disponible</p>
                            )}
                            <input 
                                type="file" 
                                accept=".docx" 
                                onChange={handleMinutaChange} 
                            />
                            {isAddingMinuta ? (
                                <div className="button-container">
                                    <button 
                                        className="submit-button" 
                                        onClick={handleSaveMinuta}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="section-card">
                    <h3 className="subtitle"> Formatos Registrados</h3>
                    <div className="flex justify-center my-4">
                        <button
                        className="submit-button bg-gray-500 text-white border border-gray-600 font-bold text-center uppercase rounded-lg py-2 px-4 flex items-center"
                        onClick={() => navigate('/crear-formato')}
                        >
                        <span className="mr-2 text-xl">+</span>
                        Crear Formato
                        </button>
                    </div>
                    <div>
                        <Tabla columnas={columnas} datos={formatos} />
                        {isConfirmingDelete && (
                            <div className="confirm-delete-menu">
                                <p>¿Estás seguro de que deseas eliminar este formato?</p>
                                <button className="cancel" onClick={handleCloseMenu}>Cancelar</button>
                                <button className="confirm" onClick={() => handleDelete(selectedRow)}>Eliminar</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SectionContainer>
    );
};

export default ListaFormatos;