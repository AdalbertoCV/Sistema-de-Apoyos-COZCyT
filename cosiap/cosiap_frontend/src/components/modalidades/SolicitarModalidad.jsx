import InputMonto from "@/components/common/utility/InputMonto";
import { renderElemento } from "@/components/common/utility/RenderElemento";
import '@/App.css';
import { apiUrl } from "@/api";

/* Validaciones para formularios */
import {
  MontoValidation,
} from "@/components/FormsValidations";

import api from "@/api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import ModalidadInfoContainer from "../common/ui/SectionContainers/MondalidadInfoContainer";

// eslint-disable-next-line react-refresh/only-export-components
export { useNavigate } from "react-router-dom";

const SolicitarModalidad = () => {
  const { id } = useParams();
  const [modalidad, setModalidad] = useState();
  const [montoError, setMontoError] = useState("");
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [secciones, setSecciones]= useState([]);
  const [respuesta, setRespuesta] = useState([]);
  const [alertMessage, setAlertMessage] = useState(''); // Estado para el mensaje de alerta
  const [isSuccess, setIsSuccess] = useState(false);
  const [convocatoria, setConvocatoria] = useState(true);
  const navigate = useNavigate();

  const obtenerModalidad = async () => {
    try {
      const response = await api.modalidades.getById(Number(id));
      setModalidad(response.data.data);
      const modalidadData = response.data.data
      const formResponse = await api.dynamicForms.dynamicForms.getById(modalidadData.dynamic_form);
      const seccionesArray = formResponse.data.data.secciones; 
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
      setSecciones(formattedSections);
    } catch (error) {
      navigate('/404');
      return;
    }
  };

  useEffect(() => {
    const fetchConvocatoria = async () => {
        try {
            const response = await api.convocatoria.get();
            setConvocatoria(response.data.convocatoria_is_open);
            if (response.data.convocatoria_is_open === false){
              navigate('/404');
            }
        } catch (error) {
            setConvocatoria(false);
        }
    };
    fetchConvocatoria();
  }, []);


  useEffect(() => {
    obtenerModalidad();
  }, [id]);


  const showAlert = (message, isSuccess) => {
    setAlertMessage(message);
    setIsSuccess(isSuccess);
    
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
  };


  const handleInputChange = (seccionId, elementoId, valor, otro = "") => {
    setRespuesta((prevRespuestas) => {
      const existingRespuesta = prevRespuestas.find(
        (r) => r.seccion_id === seccionId && r.elemento_id === elementoId
      );

      if (existingRespuesta) {
        return prevRespuestas.map((r) =>
          r.seccion_id === seccionId && r.elemento_id === elementoId
            ? { ...r, valor, otro }
            : r
        );
      } else {
        return [
          ...prevRespuestas,
          { seccion_id: seccionId, elemento_id: elementoId, valor, otro },
        ];
      }
    });
  };


  const handleCheckboxChange = (seccionId, id, e) => {
    const { value, checked } = e.target;
  
    // Obtén las respuestas existentes
    const existingRespuesta = respuesta.find(
      (r) => r.seccion_id === seccionId && r.elemento_id === id
    );
  
    setRespuesta((prevRespuestas) => {
      let newValor;
  
      // Si ya hay una respuesta, actualiza su valor; si no, crea uno nuevo
      if (existingRespuesta) {
        // Si ya hay una respuesta, obtenemos los valores actuales
        const valoresActuales = existingRespuesta.valor ? existingRespuesta.valor.split(",") : [];
  
        // Agregar o quitar el valor según la selección
        if (checked) {
          // Agregar valor si se selecciona
          newValor = valoresActuales.includes(value) ? valoresActuales : [...valoresActuales, value];
        } else {
          // Remover valor si se deselecciona
          newValor = valoresActuales.filter((v) => v !== value);
        }
      } else {
        // Si no existe, comenzamos con un array que contiene el valor actual
        newValor = checked ? [value] : [];
      }
  
      // Unimos los valores en una cadena separada por comas
      const cadenaValores = newValor.join(",");
  
      // Si no existe la respuesta, agrega una nueva al array
      if (!existingRespuesta) {
        return [...prevRespuestas, { seccion_id: seccionId, elemento_id: id, valor: cadenaValores }];
      }
  
      // Si ya existe, actualiza la respuesta existente
      return prevRespuestas.map((r) =>
        r.seccion_id === seccionId && r.elemento_id === id
          ? { ...r, valor: cadenaValores }
          : r
      );
    });
  };
  

  /* Función para mostrar el monto_maximo en formato de pesos MXN */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  /* Validación del monto_maximo */
  const validarMonto = async (monto) => {
    try {
      await MontoValidation.max(
        modalidad.monto_maximo,
        `La cantidad supera el monto máximo (${formatCurrency(modalidad.monto_maximo)})`
      ).validate(monto);
      setMontoError(false); // no hay error
      setMontoError("");
      return true;
    } catch (error) {
      setMontoError(error.message);
      return false;
    }
  };

  const handleMontoChange = async (e) => {
    const monto = e.target.value;
    setMontoSolicitado(monto);
    await validarMonto(monto);
  };

  const handleSubmit = async () => {
  
    // Filtrar los elementos obligatorios y verificar si están contestados
    const elementosObligatoriosSinRespuesta = Object.keys(secciones).flatMap(seccionId => {
        return Object.values(secciones[seccionId].elementos)
            .filter(elemento => elemento.obligatorio)  // Filtrar solo los elementos obligatorios
            .filter(elemento => !respuesta.some(res => res.elemento_id === elemento.id && res.valor))  // Verificar si no hay respuesta
            .map(elemento => elemento.nombre);  // Obtener el nombre de cada elemento que falta
    });

    const isMontoInvalid = !montoSolicitado || montoError;

    // Mostrar error si falta alguna respuesta obligatoria o si el monto es inválido
    if (elementosObligatoriosSinRespuesta.length > 0 || isMontoInvalid) {
        const missingElementsMessage = elementosObligatoriosSinRespuesta.length > 0
            ? `Por favor completa los campos obligatorios: ${elementosObligatoriosSinRespuesta.join(', ')}.`
            : '';
        
        const montoErrorMessage = isMontoInvalid ? 'La cantidad solicitada es inválida o está vacía.' : '';

        showAlert(`${missingElementsMessage} ${montoErrorMessage}`, false);
        return;
    }

    const invalidFiles = respuesta.filter(res => 
      res.valor instanceof File &&
      (!res.valor.name.toLowerCase().endsWith('.pdf') || res.valor.size > 10 * 1024 * 1024) // Validar formato y tamaño
    );
  
    if (invalidFiles.length > 0) {
        showAlert('Por favor, asegúrate de que todos los documentos estén en formato PDF y no pesen más de 10MB.', false);
        return;
    }

    // Crear FormData para enviar en formato multipart/form-data
    const formData = new FormData();
    formData.append('monto_solicitado', montoSolicitado);
    formData.append('modalidad_id', modalidad.id);

    // Agrega las respuestas al FormData
    respuesta.forEach((res, index) => {
        formData.append(`respuestas[${index}][seccion_id]`, res.seccion_id);
        formData.append(`respuestas[${index}][elemento_id]`, res.elemento_id);
        if (res.valor instanceof File) {
            formData.append(`respuestas[${index}][valor_file]`, res.valor);
        } else {
            formData.append(`respuestas[${index}][valor_texto]`, res.valor);
        }
    });


    try {
        const response = await api.solicitudes.solicitar.post(formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 201) {
            showAlert('Solicitud registrada exitosamente.', true);
            setTimeout(() => {
              navigate('/historial'); 
          }, 1000);
        } else {
            const errorMessage = response.data?.detail || 'Error desconocido';
            showAlert(`Error: ${errorMessage}`, false);
        }
    } catch (error) {
        if (error.response.status === 403){
          showAlert('Para registrar una solicitud, por favor complete sus datos en su perfil.', false)
        }
        else{
          const specificErrorMessage = error.response?.data?.messages?.error[0] || error.message || 'Error en la conexión';
          showAlert(`Error: ${specificErrorMessage}`, false)
        }
    }
  };
  

  return (
    (modalidad && convocatoria) && (
      <ModalidadInfoContainer
        imagen={modalidad.imagen || ""}
        nombre={modalidad.nombre || ""}
        descripcion={modalidad.descripcion || ""}
        monto_maximo={modalidad.monto_maximo || ""}
      >
        {/* Alerta */}
        {alertMessage && (
            <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
              {alertMessage}
            </div>
        )}
        <div className="flex flex-col w-full justify-center items-center">

          {/* Renderizar las secciones y elementos */}
          {Object.keys(secciones).map((seccionId) => (
            <div key={seccionId} className="section-card">
              <h3>{secciones[seccionId].nombre}</h3>
              <div className="elementos-container flex flex-wrap justify-center p-2 ">
                {Object.keys(secciones[seccionId].elementos).map((elementoId) => (
                  <div key={elementoId} className="element-card w-full sm:w-1/3 lg:w-1/4">
                    <h4>{secciones[seccionId].elementos[elementoId].nombre}</h4>
                    {renderElemento(secciones[seccionId].id, secciones[seccionId].elementos[elementoId], handleInputChange, handleCheckboxChange)}
                  </div>
                ))}
              </div>
            </div>
          ))}
    
          {/* Card del monto solicitado */}
          <div className="monto-card">
            <h3>Monto solicitado</h3>
            <div className="input-container">
              <InputMonto value={montoSolicitado} onChange={handleMontoChange} />
            </div>
            {montoError && (
              <p className="mt-4 text-[var(--error-f)] font-bold text-center text-xs underline">
                {montoError}
              </p>
            )}
          </div>
    
          {/* Botones de acción */}
          <div className="buttons-container">
            <button className="button" onClick={() => navigate('/modalidades')}>
              Cancelar
            </button>
            <button className="submit-button" onClick={handleSubmit}>
              Enviar Solicitud
            </button>
          </div>
        </div>
      </ModalidadInfoContainer>
    )
  );
};

export default SolicitarModalidad;
