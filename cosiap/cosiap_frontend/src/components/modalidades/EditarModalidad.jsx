import { useState, useEffect } from "react";
import api from '../../api';
import '@/App.css';
import MainContainer from "../common/utility/MainContainer";
import { useNavigate, useParams } from 'react-router-dom';
import { apiUrl } from "../../api";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

const EditModalidad = () => {
    const { id } = useParams();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [montoMaximo, setMontoMaximo] = useState(0);
    const [mostrar, setMostrar] = useState(true);
    const [archivado, setArchivado] = useState(false);
    const [imagen_anterior, setImagenAnterior] = useState(null)
    const [imagen, setImagen] = useState(null);
    const [sections, setSections] = useState([]);
    const navigate = useNavigate();
    const [formId, setFormId] = useState(null)
    const [formName, setFormName] = useState('');
    const [formatos, setFormatos] = useState([]);
    // creamos hooks para manejar las nuevas agregaciones de secciones, elementos y opciones.
    const [newSectionName, setNewSectionName] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newElementName, setNewElementName] = useState('');
    const [newElementType, setNewElementType] = useState('');
    const [newElementFormat, setNewElementFormat] = useState(null);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [isAddingElement, setIsAddingElement] = useState(false);
    const [newOptionName, setNewOptionName] = useState('');
    const [newElemetObligatorio, setNewElementObligatorio] = useState(false);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isAddingOption, setIsAddingOption] = useState(false);
    // hooks para el manejo de las alertas
    const [alertMessage, setAlertMessage] = useState(''); // Estado para el mensaje de alerta
    const [isSuccess, setIsSuccess] = useState(false);



    useEffect(() => {
        const fetchModalidad = async () => {
            try {
                const response = await api.modalidades.getById(id);
                const modalidadData = response.data || [];
                setNombre(modalidadData.data.nombre);
                setDescripcion(modalidadData.data.descripcion);
                setMontoMaximo(modalidadData.data.monto_maximo);
                setMostrar(modalidadData.data.mostrar);
                setImagenAnterior(modalidadData.data.imagen);
                setArchivado(modalidadData.data.archivado);
                setFormId(modalidadData.data.dynamic_form)
                // Cargamos las secciones del formulario dinámico
                const formResponse = await api.dynamicForms.dynamicForms.getById(modalidadData.data.dynamic_form);
            
                setFormName(formResponse.data.data.nombre)
                // Transformamos los datos
                const seccionesArray = formResponse.data.data.secciones;

                // Creamos un objeto que contendrá las secciones, elementos y opciones
                const formattedSections = {};

                Object.keys(seccionesArray).forEach(sectionKey => {
                    const section = seccionesArray[sectionKey];
                    formattedSections[section.id] = {
                        ...section,
                        elementos: {}
                    };
                
                    // Anidamos los elementos en su respectiva sección
                    Object.keys(section.elementos).forEach(elementKey => {
                        const element = section.elementos[elementKey];
                        formattedSections[section.id].elementos[element.id] = {
                            ...element,
                            opciones: {}  
                        };
                    
                        // Si el elemento tiene opciones, anidamos las opciones
                        if (element.opciones) {
                            Object.keys(element.opciones).forEach(optionKey => {
                                const option = element.opciones[optionKey];
                                formattedSections[section.id].elementos[element.id].opciones[option.id] = option;
                            });
                        }
                    });
                });

                // Actualizamos el estado con las secciones formateadas
                setSections(formattedSections);


            } catch (error) {
                navigate('/404');
                return;
            }
        };

        fetchModalidad();
    }, [id]);

    // Obtener los formatos disponibles al cargar el componente
    useEffect(() => {
        const fetchFormatos = async () => {
            try {
                const response = await api.formatos.get();
                setFormatos(response.data || []); // Asegúrate de que `data` sea un array
            } catch (error) {
                setFormatos([]); 
            }
        };
        fetchFormatos();
      }, []);

    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    // Agregamos una nueva sección
    const handleAddSection = async () => {
        try {
            if (!newSectionName) {
                showAlert('Por favor, ingrese un nombre para la nueva sección.', false);
                return;
            }
    
            const response = await api.dynamicForms.secciones.post({ nombre: newSectionName });
            await api.dynamicForms.dynamicForms.postFormSection(formId, response.data.data.id);
    
            // Actualizamos el estado de las secciones
            setSections(prevSections => ({
                ...prevSections,
                [response.data.data.id]: { 
                    ...response.data.data, 
                    elementos: {} // Inicializamos los elementos como objeto vacío
                }
            }));
    
            // Limpiar el input y ocultar el campo
            setNewSectionName('');
            setIsAddingSection(false);
    
            showAlert('Sección agregada exitosamente.', true);
        } catch (error) {
            showAlert('Ocurrió un error al agregar la sección.', false);
        }
    };
    


    // Agregamos un nuevo elemento a la sección
    const handleAddElement = async (sectionId) => {
        try {
            if (!newElementName) {
                showAlert('Por favor, ingrese un nombre para el nuevo elemento.', false);
                return;
            }
    
            const elementType = newElementType || 'texto_corto';
            const response = await api.dynamicForms.elementos.post({
                nombre: newElementName,
                tipo: elementType,
                obligatorio: newElemetObligatorio,
                formato: newElementFormat,
            });
    
            await api.dynamicForms.secciones.postSectionElement(sectionId, response.data.data.id);
    
            // Actualizamos el estado agregando el nuevo elemento en la sección correspondiente
            setSections(prevSections => ({
                ...prevSections,
                [sectionId]: {
                    ...prevSections[sectionId],
                    elementos: {
                        ...prevSections[sectionId].elementos,
                        [response.data.data.id]: { ...response.data.data, opciones: {} }
                    }
                }
            }));
    
            // Limpiar el input y ocultar el campo
            setNewElementName('');
            setSelectedSectionId(null);
            setIsAddingElement(false);
    
            showAlert('Elemento agregado exitosamente.', true);
        } catch (error) {
            showAlert('Ocurrió un error al agregar el elemento.', false);
        }
    };
    

    // Agregamos una nueva opción a un elemento
    const handleAddOption = async (sectionId, elementId) => {
        try {
            if (!newOptionName) {
                showAlert('Por favor, ingrese un nombre para la nueva opción.', false);
                return;
            }
    
            const response = await api.dynamicForms.opciones.post({ nombre: newOptionName });
            await api.dynamicForms.elementos.postElementOption(elementId, response.data.data.id);
    
            // Actualizamos el estado validando la existencia del elemento
            setSections(prevSections => {
                const updatedSections = { ...prevSections };
                const section = updatedSections[sectionId];
    
                if (!section) {
                    showAlert('Sección no encontrada.', false);
                    return prevSections;
                }
    
                const element = section.elementos[elementId];
    
                if (!element) {
                    showAlert('Elemento no encontrado.', false);
                    return prevSections;
                }
    
                // Actualizamos las opciones del elemento
                element.opciones = {
                    ...element.opciones,
                    [response.data.data.id]: response.data.data,
                };
    
                return updatedSections;
            });
    
            // Limpiar el input y ocultar el campo
            setNewOptionName('');
            setSelectedElementId(null);
            setIsAddingOption(false);
    
            showAlert('Opción agregada exitosamente.', true);
        } catch (error) {
            showAlert('Ocurrió un error al agregar la opción.', false);
        }
    };
    
    


    // manejamos la eliminacion de una seccion existente en el formulario
    const removeSectionFromAPI = async (sectionId) => {
        try{
            await api.dynamicForms.secciones.delete(sectionId);
            setSections(prevSections => {
                const updatedSections = { ...prevSections };
                delete updatedSections[sectionId]; // Eliminar la sección del objeto
    
                return updatedSections;
            });
            showAlert('Sección eliminada.', true);
        } catch (error){
            alert('Ocurrió un error al eliminar la sección.');
        }
    }

    // manejamos el caso de la eliminacion de un elemento de una sección
    const removeElementFromSectionAPI = async (sectionId, elementId) => {
        try {
            await api.dynamicForms.elementos.delete(elementId);
    
            // Actualizamos el estado de las secciones eliminando el elemento correspondiente
            setSections(prevSections => {
                const updatedSections = { ...prevSections };
                const elements = { ...updatedSections[sectionId].elementos };
    
                // Eliminar el elemento específico
                delete elements[elementId];
    
                // Asignamos el nuevo conjunto de elementos a la sección
                updatedSections[sectionId].elementos = elements;
    
                return updatedSections;
            });
    
            showAlert('Elemento eliminado.', true);
        } catch (error) {
            alert('Ocurrió un error al eliminar el elemento.');
        }
    };
    

    // manejamos la eliminacion de una opcion de un elemento
    const removeOptionFromElementAPI = async (sectionId, elementId, optionId) => {
        try {
            // Llamar al método delete de la API para eliminar la opción del elemento
            await api.dynamicForms.opciones.delete(optionId);
    
            // Actualizar el estado de las secciones para eliminar la opción del front
            setSections(prevSections => {
                const updatedSections = { ...prevSections };
    
                // Verificar que la sección y el elemento existen
                const section = updatedSections[sectionId];
                if (!section) {
                    return prevSections;
                }
    
                const element = section.elementos[elementId];
                if (!element) {
                    return prevSections;
                }
    
                // Eliminar la opción específica del objeto opciones
                const updatedOptions = { ...element.opciones };
                delete updatedOptions[optionId];
    
                // Actualizar las opciones en el elemento
                element.opciones = updatedOptions;
    
                return updatedSections;
            });
    
            showAlert('Opción eliminada.', true);
        } catch (error) {
            alert('Ocurrió un error al eliminar la opción.');
        }
    };
    

    // actualizar un elemento
    const updateElement = (sectionId, elementId, field, value) => {
        setSections(prevSections => {
            const updatedSections = { ...prevSections }; 
    
            if (updatedSections[sectionId] && updatedSections[sectionId].elementos[elementId]) {
                // Actualizamos el campo específico del elemento
                updatedSections[sectionId].elementos[elementId][field] = value;
            }
    
            return updatedSections;
        });
    };

    // Actualizamos el nombre de una sección
    const handleUpdateSectionName = (sectionId, newName) => {
        setSections(prevSections => {
            const updatedSections = { ...prevSections };
    
            if (updatedSections[sectionId]) {
                updatedSections[sectionId].nombre = newName; 
            }
    
            return updatedSections;
        });
    };
    
    // actualizamos el nombre de un elemento
    const handleUpdateElementName = (sectionId, elementId, newName) => {
        setSections(prevSections => {
            const updatedSections = { ...prevSections };
    
            if (updatedSections[sectionId] && updatedSections[sectionId].elementos[elementId]) {
                updatedSections[sectionId].elementos[elementId].nombre = newName; 
            }
    
            return updatedSections;
        });
    };
    
    const handleUpdateOptionName = (sectionId, elementId, optionId, newName) => {
        setSections(prevSections => {
            const updatedSections = { ...prevSections };
    
            // Verificamos si la sección y el elemento existen
            if (updatedSections[sectionId] && updatedSections[sectionId].elementos[elementId]) {
                // Verificamos si 'opciones' es un array; si no, lo convertimos en uno
                let opciones = updatedSections[sectionId].elementos[elementId].opciones;
    
                // Si 'opciones' no es un array, lo convertimos en uno usando Object.values o creamos uno vacío
                if (!Array.isArray(opciones)) {
                    opciones = Object.values(opciones || {});
                    updatedSections[sectionId].elementos[elementId].opciones = opciones; // Actualizamos el objeto
                }
    
                // Encontramos la opción a actualizar
                const optionToUpdate = opciones.find(opt => opt.id === optionId);
    
                if (optionToUpdate) {
                    optionToUpdate.nombre = newName; // Actualizamos el nombre
                }
            }
    
            return updatedSections;
        });
    };

    // metodo para mostrar una alerta
    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
      };


    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault(); 
        }
    
        try {
    
            // Asegurarse de que formId no sea undefined
            if (!formId) {
                return;
            }
    
            // Convertir el objeto sections en un array si no lo es
            const sectionsArray = Array.isArray(sections) ? sections : Object.values(sections);
            
            // Asegurarse de que las secciones existan
            if (!sectionsArray || !Array.isArray(sectionsArray)) {
                return;
            }
    
            // Editamos el formulario dinámico
            await api.dynamicForms.dynamicForms.update(formId, { nombre: formName });
    
            // Asegurarse de que cada sección tenga un ID antes de hacer la actualización
            const sectionPromises = sectionsArray.map(section => {
                if (!section.id) {
                    return;
                }
    
                return api.dynamicForms.secciones.update(section.id, { nombre: section.nombre });
            });
    
            // Esperamos a que todas las secciones se actualicen
            await Promise.all(sectionPromises);
    
            // Editamos los elementos y sus opciones
            for (const section of sectionsArray) {
                // Convertir elementos en array si no lo son
                const elementsArray = Array.isArray(section.elementos) ? section.elementos : Object.values(section.elementos);
    
                // Asegurarse de que section.elements no sea undefined o no sea un array
                if (!elementsArray || !Array.isArray(elementsArray)) {
                    continue; // Saltar esta sección si no tiene elementos
                }
    
                const elementPromises = elementsArray.map(element => {
                    if (!element.id) {
                        return;
                    }
    
                    return api.dynamicForms.elementos.update(element.id, {
                        nombre: element.nombre,
                        tipo: element.tipo,
                        obligatorio:element.obligatorio,
                        formato: element.formato
                    });
                });
    
                // Esperamos a que se actualicen los elementos de la sección actual
                await Promise.all(elementPromises);
    
                // Editamos las opciones de cada elemento
                for (const element of elementsArray) {
                    // Convertir opciones en array si no lo son
                    const optionsArray = Array.isArray(element.opciones) ? element.opciones : Object.values(element.opciones);
                    
                    // Asegurarse de que element.options no sea undefined o no sea un array
                    if (!optionsArray || !Array.isArray(optionsArray)) {
                        continue; // Saltar este elemento si no tiene opciones
                    }
    
                    const optionPromises = optionsArray.map(option => {
                        if (!option.id) {
                            return;
                        }
    
                        return api.dynamicForms.opciones.update(option.id, {
                            nombre: option.nombre
                        });
                    });
    
                    // Esperamos a que todas las opciones del elemento actual se actualicen
                    await Promise.all(optionPromises);
                }
            }
    
            // Actualizamos los datos de la modalidad
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('descripcion', descripcion);
            formData.append('monto_maximo', montoMaximo);
            formData.append('mostrar', mostrar);
            formData.append('archivado', archivado);
            if (imagen) {
                formData.append('imagen', imagen);
            }
            await api.modalidades.update(id, formData);
            if (e) {
                showAlert('Modalidad actualizada correctamente', true)
                setTimeout(() => {
                    navigate('/modalidades'); 
                }, 1000);
            }
            
        } catch (error) {
            const errorMessage = 'Error al actualizar la modalidad, por favor complete o revise los datos.'
            showAlert(`Error: ${errorMessage}`, false);
        }
    };
    

    return (
        <SectionContainer title="Editar Modalidad">
            <form onSubmit={handleSubmit} className="create-modalidad-form w-full">
            {/* Alerta */}
                {alertMessage && (
                    <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
                    {alertMessage}
                    </div>
                    )}
                <div className="white-card">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre:</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ingrese el nombre"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Descripción:</label>
                            <textarea
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ingrese la descripción"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Imagen:</label>
                            <img
                                src={`${apiUrl}${imagen_anterior}`} 
                                alt="Imagen previa"
                                className="preview-image"
                            />
                            <input
                                type="file"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Monto Máximo:</label>
                            <input
                                type="number"
                                value={montoMaximo}
                                onChange={(e) => setMontoMaximo(e.target.value)}
                                placeholder="Ingrese el monto máximo"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mostrar:</label>
                            <input
                                type="checkbox"
                                checked={mostrar}
                                onChange={() => setMostrar(!mostrar)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Archivado:</label>
                            <input
                                type="checkbox"
                                checked={archivado}
                                onChange={() => setArchivado(!archivado)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                    <label>Nombre del formulario:</label>
                        <div className="form-row">
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                            />
                            <button
                                type="button"
                                className="add-button"
                                onClick={() => setIsAddingSection(true)}
                            >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                height="24px" 
                                viewBox="0 0 24 24" 
                                width="24px" 
                                fill="#e8eaed"
                            >
                                <path d="M0 0h24v24H0V0z" fill="none"/>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                             Sección
                            </button>
                        </div>
                        
                         {/* Input para agregar nueva sección */}
                             {isAddingSection && (
                            <div className="card">
                                <label>Nombre de la sección:</label>
                                 <div className="form-group">
                                     <input 
                                         type="text"
                                         value={newSectionName}
                                         onChange={(e) => setNewSectionName(e.target.value)}
                                         placeholder="Nombre de la nueva sección"
                                     />
                                     <div className="button-container">
                                     <button className="submit-button"
                                         type="button"
                                         onClick={handleAddSection}
                                     >
                                         Guardar
                                     </button>
                                     </div>
                                 </div>
                            </div>
                             )}
                    </div>
    
                    {/* Secciones del formulario */}
                    {Object.values(sections).map((section,sectionIndex) => (
                        <div key={section.id} className="card">
                            <div className="form-group">
                            <h4 className="card-header-section">Sección {sectionIndex + 1}</h4>
                            <label>Nombre de la sección:</label>
                            <div className="form-row">
                                <input
                                    type="text"
                                    value={section.nombre}
                                    onChange={(e) => handleUpdateSectionName(section.id, e.target.value)}
                                    placeholder="Nombre de la sección"
                                />
    
                                <button
                                    type="button"
                                    className="add-button"
                                    onClick={() => {
                                        setSelectedSectionId(section.id);
                                        setIsAddingElement(true);
                                    }}
                                >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    height="24px" 
                                    viewBox="0 0 24 24" 
                                    width="24px" 
                                    fill="#e8eaed"
                                >
                                    <path d="M0 0h24v24H0V0z" fill="none"/>
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                                </svg>
                                    Elemento
                                </button>

                                <button
                                    type="button"
                                    className="delete-button"
                                    onClick={() => removeSectionFromAPI(section.id)}
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                Sección
                                </button>
                            </div>
                            {isAddingElement && selectedSectionId === section.id && (
                                    <div className="card">
                                    <label>Nombre del elemento:</label>
                                        <input
                                            type="text"
                                            value={newElementName}
                                            onChange={(e) => setNewElementName(e.target.value)}
                                            placeholder="Nombre del nuevo elemento"
                                        />
                                        <label>Tipo:</label>
                                        <select
                                            value={newElementType}
                                            onChange={(e) => setNewElementType(e.target.value)}
                                        >
                                            <option value=" " disabled>Seleccione tipo</option>
                                            <option value="texto_corto">Texto Corto</option>
                                            <option value="texto_parrafo">Texto Párrafo</option>
                                            <option value="numerico">Numérico</option>
                                            <option value="hora">Hora</option>
                                            <option value="fecha">Fecha</option>
                                            <option value="opcion_multiple">Opción Múltiple</option>
                                            <option value="casillas">Casillas</option>
                                            <option value="desplegable">Desplegable</option>
                                            <option value="documento">Documento</option>
                                        </select>
                                        <div className="form-group">
                                            <label>¿Es obligatorio?</label>
                                            <input
                                                type="checkbox"
                                                checked={newElemetObligatorio} // Esto controla el estado del radio
                                                style={{ transform: 'scale(1)', marginLeft: '5px' }}
                                                onChange={(e) => setNewElementObligatorio(e.target.checked)}
                                            />
                                        </div>
                                        {newElementType === 'documento' && (
                                        <div className="form-group">
                                            <label>Formato:</label>
                                            <select
                                                value={newElementFormat}
                                                onChange={(e) => setNewElementFormat(e.target.value)}
                                            >
                                                <option value="">Selecciona un formato</option>
                                                {formatos.map((formato) => (
                                                    <option key={formato.id} value={formato.id}>
                                                        {formato.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        )}
                                        <button className="submit-button"
                                            type="button"
                                            onClick={() => handleAddElement(section.id)}
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                )}
                            </div>
                            {Object.values(section.elementos).map((element, elementIndex) => (
                                    <div key={element.id} className="card">
                                        <h4 className="card-header-element">Elemento {elementIndex + 1}</h4>
                                        <div className="form-row">
                                        <div className="form-group">
                                        <label>Nombre del elemento:</label>
                                        <label>
                                            <input
                                                type="text"
                                                value={element.nombre}
                                                onChange={(e) => handleUpdateElementName(section.id, element.id, e.target.value)}
                                                placeholder="Nombre del elemento"
                                            />
                                            
                                        </label>
                                        </div>
                                        
                                        {['opcion_multiple', 'desplegable', 'casillas'].includes(element.tipo) && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="add-button"
                                                    onClick={() => {
                                                        setSelectedElementId(element.id);
                                                        setIsAddingOption(true);
                                                    }}
                                                >
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    height="24px" 
                                                    viewBox="0 0 24 24" 
                                                    width="24px" 
                                                    fill="#e8eaed"
                                                >
                                                    <path d="M0 0h24v24H0V0z" fill="none"/>
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                                                </svg>
                                                    Opción
                                                </button>
                                                
                                            </>
                                        )}
                                        <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() => removeElementFromSectionAPI(section.id, element.id)}
                                            >
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                            Elemento
                                        </button>
                                        </div>
                                
                                        <div className="form-group">
                                        <label>Tipo:</label>
                                        <select
                                            value={element.tipo}
                                            onChange={(e) => updateElement(section.id, element.id, 'tipo', e.target.value)}
                                            required={element.obligatorio}
                                        >
                                            <option value=" " disabled>Seleccione tipo</option>
                                            <option value="texto_corto">Texto Corto</option>
                                            <option value="texto_parrafo">Texto Párrafo</option>
                                            <option value="numerico">Numérico</option>
                                            <option value="hora">Hora</option>
                                            <option value="fecha">Fecha</option>
                                            <option value="opcion_multiple">Opción Múltiple</option>
                                            <option value="casillas">Casillas</option>
                                            <option value="desplegable">Desplegable</option>
                                            <option value="documento">Documento</option>
                                        </select>
                                        <div className="form-group">
                                            <label>¿Es obligatorio?</label>
                                            <input
                                                type="checkbox"
                                                checked={element.obligatorio} 
                                                style={{ transform: 'scale(1)', marginLeft: '5px' }}
                                                onChange={(e) => updateElement(section.id, element.id, 'obligatorio', e.target.checked)}
                                            />
                                        </div>
                                        {isAddingOption && selectedElementId === element.id && (
                                         <div className="card">
                                         <label>Nombre de la opción:</label>
                                             <div className="form-group">
                                                 <input
                                                     type="text"
                                                     value={newOptionName}
                                                     onChange={(e) => setNewOptionName(e.target.value)}
                                                     placeholder="Nombre de la nueva opción"
                                                 />
                                                 <button
                                                     className="submit-button"
                                                     type="button"
                                                     onClick={() => handleAddOption(section.id, element.id)}
                                                 >
                                                     Guardar
                                                 </button>
                                             </div>
                                         </div>
                                        )}
                                        </div>
                                        {element.tipo === 'documento' && (
                                        <div className="form-group">
                                            <label>Formato:</label>
                                            <select
                                                value={element.formato}
                                                onChange={(e) => updateElement(section.id, element.id, 'formato', e.target.value)}
                                            >
                                                <option value="">Selecciona un formato</option>
                                                {formatos.map((formato) => (
                                                    <option key={formato.id} value={formato.id}>
                                                        {formato.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        )}
                                        
                                        {/* Opciones del elemento (si existen) */}
                                        {element.opciones && Object.values(element.opciones).map((option, optionIndex) => (
                                            <div key={option.id} className="card">
                                                <h4 className="card-header-option">Opción {optionIndex +1}</h4>
                                                <label>
                                                <div className="form-group">
                                                <label>Nombre de la opción:</label>
                                                <div className="form-row">
                                                
                                                    <input
                                                        type="text"
                                                        value={option.nombre}
                                                        onChange={(e) => handleUpdateOptionName(section.id, element.id, option.id, e.target.value)}
                                                        placeholder="Nombre de la opción"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => removeOptionFromElementAPI(section.id, element.id, option.id)}
                                                    >
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                                    Opción
                                                    </button>
                                                </div>
                                                </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                    ))}
                </div>
                <div className="button-container">
                    <button  onClick={() => navigate('/modalidades')} className="add-button">
                        Cancelar
                    </button>
                    <button type="submit" className="submit-button">
                        Actualizar Modalidad
                    </button>
                </div>
            </form>
        </SectionContainer>
    );    
};

export default EditModalidad;