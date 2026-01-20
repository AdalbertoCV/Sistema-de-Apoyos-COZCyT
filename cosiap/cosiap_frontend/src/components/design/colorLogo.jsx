import { useState, useEffect } from "react";
import api from '../../api';
import '@/App.css';
import MainContainer from "../common/utility/MainContainer";

const EditarColorLogo = () => {
    const [principal, setPrincipal] = useState('');
    const [principal_mf, setPrincipal_mf] = useState('');
    const [principal_f, setPrincipal_f] = useState('');
    const [principal_c, setPrincipal_c] = useState('');
    const [principal_mc, setPrincipal_mc] = useState('');
    const [logo, setLogo] = useState(null);
    const [alertMessage, setAlertMessage] = useState(''); 
    const [isSuccess, setIsSuccess] = useState(false);
    const [isConfirmingRedo, setIsConfirmingRedo] = useState(false);


    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await api.estilos.get();
                setPrincipal(response.data.principal);
                setPrincipal_mf(response.data.principal_mf);
                setPrincipal_f(response.data.principal_f);
                setPrincipal_c(response.data.principal_c);
                setPrincipal_mc(response.data.principal_mc);
                
            } catch (error) {
            }
        };

        fetchColors();
    }, []);

    const handleCloseMenu = () => {
        setIsConfirmingRedo(false); 
    };

    const handleRedoConfirm = () => {
        setIsConfirmingRedo(true); 
    };

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setLogo(file);
        } else {
            showAlert("Por favor, selecciona un archivo de imagen válido.", false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('principal', principal);
        formData.append('principal_mf', principal_mf);
        formData.append('principal_f', principal_f);
        formData.append('principal_c', principal_c);
        formData.append('principal_mc', principal_mc);
        formData.append('es_default', true)
        if (logo) {
            formData.append('logo', logo);
        }

        try {
            await api.estilos.update(formData);
            showAlert("Configuración actualizada correctamente.", true);
            window.location.reload();
        } catch (error) {
            showAlert("Hubo un problema al actualizar la configuración.", false);
        }
    };

    const handleReestablecer = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('principal', '#E2746E');
        formData.append('principal_mf', '#781005');
        formData.append('principal_f',  '#BB4433');
        formData.append('principal_c', '#F5ADAB');
        formData.append('principal_mc', '#FCE2E4');
        formData.append('es_default', true)
        try {
            await api.estilos.update(formData);
            showAlert("Configuración restablecida correctamente.", true);
            setIsConfirmingRedo(false)
            window.location.reload();
        } catch (error) {
            showAlert("Hubo un problema al restablecer la configuración.", false);
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
        <MainContainer title="Configuración de Estilo">
        {alertMessage && (
            <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                {alertMessage}
            </div>
        )}
        <div className="section-card">
            <div className="elementos-container">
                <div className="element-card">
                <label className="subtitle">
                    Color Líneas:
                    <input
                        type="color"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                    />
                </label>
                <label className="subtitle">
                    Color Títulos:
                    <input
                        type="color"
                        value={principal_mf}
                        onChange={(e) => setPrincipal_mf(e.target.value)}
                    />
                </label>
                <label className="subtitle">
                    Color acciones:
                    <input
                        type="color"
                        value={principal_f}
                        onChange={(e) => setPrincipal_f(e.target.value)}
                    />
                </label>
                </div>
                <div className="element-card">
                <label className="subtitle">
                    Color tablas:
                    <input
                        type="color"
                        value={principal_c}
                        onChange={(e) => setPrincipal_c(e.target.value)}
                    />
                </label>
                <label className="subtitle">
                    Color Home:
                    <input
                        type="color"
                        value={principal_mc}
                        onChange={(e) => setPrincipal_mc(e.target.value)}
                    />
                </label>
                <label className="subtitle">
                    Logo:
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                    />
                </label>
                </div>
            </div>
            <div className="button-container">
            <button className="add-button" onClick={(e) => handleRedoConfirm(e)}>
                Reestablecer
                <svg xmlns="http://www.w3.org/2000/svg" enableBackground="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><g><path d="M6,13c0-1.65,0.67-3.15,1.76-4.24L6.34,7.34C4.9,8.79,4,10.79,4,13c0,4.08,3.05,7.44,7,7.93v-2.02 C8.17,18.43,6,15.97,6,13z M20,13c0-4.42-3.58-8-8-8c-0.06,0-0.12,0.01-0.18,0.01l1.09-1.09L11.5,2.5L8,6l3.5,3.5l1.41-1.41 l-1.08-1.08C11.89,7.01,11.95,7,12,7c3.31,0,6,2.69,6,6c0,2.97-2.17,5.43-5,5.91v2.02C16.95,20.44,20,17.08,20,13z"/></g></g></svg>
            </button>
            <button className="submit-button" onClick={(e) => handleSubmit(e)}>Guardar cambios</button>
            </div>
            {isConfirmingRedo && (
                <div className="confirm-delete-menu">
                    <p>¿Estás seguro de restablecer los estilos por defecto?</p>
                    <button className="cancel" onClick={handleCloseMenu}>Cancelar</button>
                    <button className="confirm" onClick={(e) => handleReestablecer(e)}>Restablecer</button>
                </div>
            )}
        </div>
        </MainContainer>
    );
};

export default EditarColorLogo;
