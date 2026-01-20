import api from '@/api';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

const DescargarManual = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const redireccion = async () => {
            await handleDownload(); // Esperar a que se complete la descarga antes de navegar
            navigate('/inicio');
        };
        redireccion();
    }, []); // Array de dependencias vacío para que `useEffect` se ejecute solo una vez

    const handleDownload = async () => {
        try{
            const response = await api.formatos.manual( {
                responseType: 'blob', 
            });
            // Crear un objeto URL para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Manual.pdf'); 
            document.body.appendChild(link);
            link.click();

            // Limpiar el objeto URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
        catch (error){
        }

    };

    return null; // Este componente no renderiza nada en la UI
};

export default DescargarManual;
