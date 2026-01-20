import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api';
import MainContainer from "../common/utility/MainContainer";
import '@/App.css';
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

const CrearFormato = () =>{
    const [nombre, setNombre] = useState('');
    const [template, setTemplate] = useState(null);
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setTemplate(e.target.files[0]);
    };

    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        // Validación básica
        if (!nombre || !template) {
            showAlert("Por favor, llena todos los campos.", false);
            return;
        }

        // Validar que el template sea un archivo .docx
        const validExtension = template.name.split('.').pop().toLowerCase();
        if (validExtension !== 'docx') {
            showAlert("Por favor, sube un archivo con formato .docx.", false);
            return;
        }

        // Creación del formData para enviar el archivo y los datos
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('template', template);

        try {
            // Petición POST a la API
            await api.formatos.post(formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/formatos'); 
        } catch (error) {
            showAlert('Hubo un problema al guardar el formato.', false);
        }
    };

    return (
        <SectionContainer title="Nuevo Formato">
            {alertMessage && (
                <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="container">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre:</label>
                    <input
                        type="text"
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <label htmlFor="template">Template:</label>
                    <input
                        type="file"
                        accept=".docx"
                        id="template"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="button-container">
                    <button  
                        className="add-button" 
                        onClick={() => navigate('/formatos')}
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="submit-button">Guardar</button>
                </div>
            </form>
        </SectionContainer>
    );
};

export default CrearFormato;