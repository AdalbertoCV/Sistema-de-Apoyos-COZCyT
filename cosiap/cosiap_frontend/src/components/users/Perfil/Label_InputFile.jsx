import PropTypes from 'prop-types';
import { useState, useEffect } from 'react'; // Importamos useRef para manejar el campo de archivo
import { FormInput } from "@/components/common/base/FormInput";
import { apiUrl } from '@/api';

export default function Label_InputFile({urlFile, label, id, name, type, placeholder, className, register, errors, onChange, isDisabled, message }) {
    const [selectedFile, setSelectedFile] = useState(null); // Estado para almacenar el archivo seleccionado
    
    const handleFileChange = (e) => {
        const file = e.target.files[0]; // Capturamos el archivo seleccionado
        // Si no hay archivo seleccionado, restablecemos el estado
        if (file.type === 'application/pdf') {
            // Verificamos que el archivo sea de tipo PDF
            setSelectedFile(file); // Almacenamos el archivo si es PDF
            
        } else {
            setSelectedFile(null); // Si no es PDF, lo descartamos
        }

        if (onChange) {
            onChange(e); // Llamamos al onChange pasado como parametro si está definido
        }
    };

    useEffect(() => {
        setSelectedFile(null)
    }, [isDisabled]); //Cada vez que cambia la variable isDisabled

    return (
        <div className="flex flex-col space-y-2 select-none w-full">
            <label className="font-semibold text-sm ">{label}</label>
            <FormInput 
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                className={`disabled:bg-gray-300 bg-white rounded-md text-sm border-0
                    file:bg-[var(--principal-f)] file:mr-3 file:border-1 file:text-sm file:border-[var(--principal-mf)] 
                    file:text-white file:rounded-l-[7px] file:py-[2px] file:px-3 ${className}`}
                register={register}
                onChange={handleFileChange} // Usamos handleFileChange para manejar el archivo seleccionado
                isDisabled={isDisabled}
                errors={errors}
            />

            {/* Aquí mostramos el área de vista previa si hay un archivo seleccionado */}
            {selectedFile && !isDisabled && ( //Cuando hay un archivo seleccionado y esta habilitado el campo
                <div className="mt-2 p-2 border border-gray-300 rounded-md bg-gray-300 w-full h-[320px]">                
                    <embed src={URL.createObjectURL(selectedFile)} type="application/pdf" width="100%" height="300px" />
                </div>
            )}
            
            {urlFile && (
                <div className="mb-4">
                    <a href={apiUrl + urlFile} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        Ver archivo actual
                    </a>
                </div>
            )}
        </div>
    );
}

Label_InputFile.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    register: PropTypes.func.isRequired,
    message: PropTypes.string,
    errors: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.string
    ])
};
