// useColor.js
import { useState, useEffect } from 'react';
import api from '@/api';

const useColor = () => {
    const [colors, setColors] = useState({
        principal: '',
        principal_mf: '',
        principal_f: '',
        principal_c: '',
        principal_mc: '', 
        logo: ''
    });

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const response = await api.estilos.get();
                const fetchedColors = { 
                    principal: response.data.principal,
                    principal_mf: response.data.principal_mf,
                    principal_f: response.data.principal_f,
                    principal_c: response.data.principal_c,
                    principal_mc: response.data.principal_mc,
                    logo: response.data.logo
                };
                setColors(fetchedColors);
            } catch (error) {
            }
        };

        fetchColors();
    }, []);

    return colors;
};

export default useColor;
