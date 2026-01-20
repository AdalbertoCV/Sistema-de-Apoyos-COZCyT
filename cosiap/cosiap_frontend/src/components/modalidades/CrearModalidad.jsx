/* eslint-disable react/jsx-key */
import { useState, useEffect } from "react";
import api from '../../api';
import '@/App.css';
import MainContainer from "../common/utility/MainContainer";
import { useNavigate } from 'react-router-dom';
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

// componente para la creación de una modalidad
// incluyendo la estructura de su formulario dinámico
const CreateModalidad = () => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [montoMaximo, setMontoMaximo] = useState(0);
    const [mostrar, setMostrar] = useState(true);
    const [archivado, setArchivado] = useState(false);
    const [imagen, setImagen] = useState(null);
    const [formName, setFormName] = useState('');
    const [sections, setSections] = useState([]);
    const [formatos, setFormatos] = useState([]); 
    const navigate = useNavigate();
    // hooks para el manejo de las alertas
    const [alertMessage, setAlertMessage] = useState(''); // Estado para el mensaje de alerta
    const [isSuccess, setIsSuccess] = useState(false);

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


    // manejamos los cambios de estado de las imagenes.
    const handleImageChange = (e) => {
        setImagen(e.target.files[0]);
    };

    // agregar una seccion a el form
    const addSection = () => {
        setSections([...sections, {name:'', elements:[]}]);
    };

    // actualizar el nombre de una sección
    const updateSectionName = (index, name) => {
        const newSections = [...sections];
        newSections[index].name = name;
        setSections(newSections);
    };

    // Eliminar una sección del formulario
    const removeSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    // Añadir un elemento a una sección
    const addElementToSection = (sectionIndex) => {
        const newElement = {name:'', type:'texto_corto', options:[]};
        const newSections = [...sections];
        newSections[sectionIndex].elements.push(newElement);
        setSections(newSections);
    };

    // actualizar un elemento
    const updateElement = (sectionIndex, elementIndex, key, value) => {
      const newSections = [...sections];
      if (key === 'orden') {
        newSections[sectionIndex].elements[elementIndex][key] = Number(value); // Convertir a número
      } else {
        newSections[sectionIndex].elements[elementIndex][key] = value;
      }
      setSections(newSections);
    };

    // Eliminar un elemento de una sección.
    const removeElementFromSection = (sectionIndex, elementIndex) => {
        const newSections = [...sections];
        newSections[sectionIndex].elements = newSections[sectionIndex].elements.filter((_, i) => i !== elementIndex);
        setSections(newSections);
    };

    // Agregar una opción a un elemento
    const addOptionToElement = (sectionIndex, elementIndex) => {
      const newOption = { name: '', orden: 0 };
      const newSections = [...sections];
      newSections[sectionIndex].elements[elementIndex].options.push(newOption);
      setSections(newSections);
    };


    // actualizar una opción
    const updateOption = (sectionIndex, elementIndex, optionIndex, key, value) => {
      const newSections = [...sections];
      if (key === 'orden') {
        newSections[sectionIndex].elements[elementIndex].options[optionIndex][key] = Number(value); // Convertir a número
      } else {
        newSections[sectionIndex].elements[elementIndex].options[optionIndex][key] = value;
      }
      setSections(newSections);
    };

    // Elminar una opción de un elemento
    const removeOptionFromElement = (sectionIndex, elementIndex, optionIndex) => {
        const newSections = [...sections];
        newSections[sectionIndex].elements[elementIndex].options = newSections[sectionIndex].elements[elementIndex].options.filter((_, i) => i !== optionIndex);
        setSections(newSections);
    };

    // metodo para mostrar una alerta
    const showAlert = (message, isSuccess) => {
        setAlertMessage(message);
        setIsSuccess(isSuccess);
        
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
      };


    // manejar el orden de las peticiones creando un flujo correcto.
    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            // 1. Creamos el fomrulario dinámico
            const formResponse = await api.dynamicForms.dynamicForms.post({nombre: formName});
            const FormId = formResponse.data.data.id; // Verifica que el ID se obtenga correctamente

            // 2. Creamos las secciones del formulario
            const sectionPromises = sections.map(section =>
                api.dynamicForms.secciones.post({nombre: section.name})
            );
            const sectionResponses = await Promise.all(sectionPromises);
            const sectionIds = sectionResponses.map(res => res.data.data.id);

            // 3. Asociamos las secciones con el formulario creado
            const formSectionsPromises = sectionIds.map((sectionId) =>
              api.dynamicForms.dynamicForms.postFormSection(FormId, sectionId)
            );
            await Promise.all(formSectionsPromises);

            // 4. Creamos los elementos y los asociamos a las secciones
            for (const [sectionIndex, section] of sections.entries()){
                const elementPromises = section.elements.map(element =>
                    api.dynamicForms.elementos.post({nombre: element.name, tipo: element.type, obligatorio:element.obligatorio, formato: element.formato})
                );
                const elementosResponses = await Promise.all(elementPromises);
                const elementIds = elementosResponses.map(res => res.data.data.id);

                const elementAssociationPromises = elementIds.map((elementId) =>
                  api.dynamicForms.secciones.postSectionElement(sectionIds[sectionIndex], elementId)
                )
                await Promise.all(elementAssociationPromises);

                // 5. Creamos las opciones para los elementos que lo requieran
                for (const [elementIndex, element] of section.elements.entries()) {
                    if (element.type === 'opcion_multiple' || element.type === 'desplegable' || element.type === 'casillas') {
                      const optionPromises = element.options.map(option =>
                        api.dynamicForms.opciones.post({ nombre: option.name })
                      );
                      const optionResponses = await Promise.all(optionPromises);
                      const optionIds = optionResponses.map(res => res.data.data.id);
          
                      const elementOptionPromises = optionIds.map((optionId) =>
                        api.dynamicForms.elementos.postElementOption(elementIds[elementIndex], optionId)
                      );
                      await Promise.all(elementOptionPromises);
                    }
                }
            }
            // 6. Creamos la modalidad y le asociamos el form
            const formData = new FormData();
            formData.append('nombre', nombre);
            formData.append('descripcion', descripcion)
            formData.append('monto_maximo', montoMaximo);
            formData.append('mostrar', mostrar);
            formData.append('archivado', archivado);
            if (imagen){
                formData.append('imagen', imagen);
            }
            formData.append('dynamic_form', FormId);
            await api.modalidades.post(formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (e) {
                showAlert('Modalidad creada correctamente.', true)
                setTimeout(() => {
                    navigate('/modalidades'); 
                }, 1000);
            }
        } catch (error){
            const errorMessage = 'Error al crear la modalidad, por favor complete o revise los datos.'
            showAlert(`Error: ${errorMessage}`, false);
        }
    };
    return(
        <SectionContainer title="Nueva Modalidad">
        <form onSubmit={handleSubmit} className="create-modalidad-form w-full">
        {/* Alerta */}
        {alertMessage && (
            <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
              {alertMessage}
            </div>
        )}
        {/* Card blanco para el formulario */}
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
                <label>Nombre del Formulario:</label>
                <div className="form-row">
                <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ingrese el nombre del formulario"
                    required
                />
                <button
                    type="button"
                    onClick={addSection}
                    className="add-button"
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
            </div>
        </div>
    
        {/* Creación de secciones */}
        
        {sections.map((section, sectionIndex) => (
        <div className="card">
            <div className="section" key={sectionIndex}>
            <h3 className="card-header-section">Sección {sectionIndex + 1}</h3>
                <div className="form-group">
                    <label>Nombre:</label>
                    <div className="form-row">
                    <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                        placeholder="Nombre de la sección"
                        required
                    />
    
                    <button
                        type="button"
                        onClick={() => addElementToSection(sectionIndex)}
                        className="add-button"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
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
                        onClick={() => removeSection(sectionIndex)}
                        className="delete-button"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                        Sección
                    </button>
                    </div>
                </div>
    
                {section.elements.map((element, elementIndex) => (
                <div className="card">
                    <div className="element" key={elementIndex}>
                    <h4 className="card-header-element">Elemento {elementIndex + 1}</h4>
                        <div className="form-group">
                            <label>Nombre del Elemento:</label>
                            <div className="form-row">
                            <input
                                type="text"
                                value={element.name}
                                onChange={(e) =>
                                    updateElement(sectionIndex, elementIndex, 'name', e.target.value)
                                }
                                placeholder="Nombre del elemento"
                                required
                            />
                            {/* Opciones si el tipo es seleccionable */}
                            {['opcion_multiple', 'desplegable', 'casillas'].includes(element.type) && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => addOptionToElement(sectionIndex, elementIndex)}
                                        className="add-button"
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
                            {/* Botón para eliminar elemento */}
                            <button
                                type="button"
                                onClick={() => removeElementFromSection(sectionIndex, elementIndex)}
                                className="delete-button"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                Elemento
                            </button>

                            </div>
                        </div>
    
                        <div className="form-group">
                            <label>Tipo de Elemento:</label>
                            <select
                                value={element.type}
                                onChange={(e) => updateElement(sectionIndex, elementIndex, 'type', e.target.value)}
                            >
                                <option value="texto_corto">Texto Corto</option>
                                <option value="texto_parrafo">Texto Párrafo</option>
                                <option value="documento">Documento</option>
                                <option value="opcion_multiple">Opción Múltiple</option>
                                <option value="desplegable">Desplegable</option>
                                <option value="casillas">Casillas</option>
                                <option value="fecha">Fecha</option>
                                <option value="hora">Hora</option>
                                <option value="numerico">Numérico</option>
                            </select>
                        </div>
                        
                        {element.type === 'documento' && (
                            <div className="form-group">
                                <label>Formato:</label>
                                <select
                                    value={element.formato}
                                    onChange={(e) => updateElement(sectionIndex, elementIndex, 'formato', e.target.value)}
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
                        <div className="form-group">
                            <label>¿Es obligatorio?</label>
                            <input
                                type="checkbox"
                                checked={element.obligatorio} // Esto controla el estado del radio
                                style={{ transform: 'scale(1)', marginLeft: '5px' }}
                                onChange={(e) => updateElement(sectionIndex, elementIndex, 'obligatorio', e.target.checked)}
                            />
                        </div>
                        {['opcion_multiple', 'desplegable', 'casillas'].includes(element.type) && (
                        <>  
                            {element.options.map((option, optionIndex) => (
                            <div className="card">
                                <h5 className="card-header-option">Nueva opción:</h5>
                                <div className="option" key={optionIndex}>
                                    <div className="form-group">
                                        <label>Nombre de la Opción:</label>
                                        <div className="form-row">
                                        <input
                                            type="text"
                                            value={option.name}
                                            onChange={(e) =>
                                                updateOption(sectionIndex, elementIndex, optionIndex, 'name', e.target.value)
                                            }
                                            placeholder="Nombre de la opción"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeOptionFromElement(sectionIndex, elementIndex, optionIndex)}
                                            className="delete-button"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e8eaed"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                                            Opción
                                        </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))}
                            
                        </>
                    )}
                    </div>
                    
                </div>
                
                ))}
            </div>
            
        </div>
        
        ))}
        
        
    
        <div className="button-container justify-around pb-2">

            <button  onClick={() => navigate('/modalidades')} className="add-button">
                Cancelar
            </button>

            <button
                type="submit"
                className="submit-button"
            >
                Crear Modalidad
            </button>
        </div>
    </form>
    </SectionContainer>
    );
};

export default CreateModalidad;