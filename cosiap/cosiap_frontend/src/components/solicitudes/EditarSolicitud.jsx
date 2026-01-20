import { useState, useEffect } from "react";
import api from '../../api';
import MainContainer from "../common/utility/MainContainer";
import { useNavigate, useParams } from 'react-router-dom';
import { renderElemento } from "@/components/common/utility/RenderElementEdit"; 
import '@/App.css';
import { apiUrl } from "../../api";

/* Validaciones para formularios */
import {
    MontoValidation,
  } from "@/components/FormsValidations";
import InputMonto from "@/components/common/utility/InputMonto";


const EditarSolicitud = () => {
  const { id } = useParams();
  const [secciones, setSecciones] = useState({});
  const [solicitud, setSolicitud] = useState(null);
  const [modalidad, setModalidad] = useState('');
  const [respuesta, setRespuesta] = useState([]);
  const [montoSolicitado, setMontoSolicitado] = useState("");
  const [montoError, setMontoError] = useState("");
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(''); // Estado para el mensaje de alerta
  const [isSuccess, setIsSuccess] = useState(false);

  // Obtenemos los datos de la solicitud
  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        const response = await api.solicitudes.getById(id);
        setMontoSolicitado(response.data.monto_solicitado)
        setModalidad(response.data.modalidad)
        setSolicitud(response.data); // Almacena toda la solicitud
        setSecciones(response.data.formulario.secciones || {}); // Secciones del formulario
        // Obtener las respuestas existentes
        const respuestasProcesadas = [];

        // Recorrer todas las secciones
        Object.values(response.data.formulario.secciones).forEach((seccion) => {
            Object.values(seccion.elementos).forEach((elemento) => {
            const respuesta = elemento.respuesta || {}; // Verificar si existe la respuesta

            respuestasProcesadas.push({
                elemento_id: elemento.id,
                seccion_id: seccion.id,
                valor: respuesta.valor || "", // Precargar valor si existe, o dejar vacío
                status: respuesta.status || "",
                observacion: respuesta.observacion || ""
            });
            });
        });


        setRespuesta(respuestasProcesadas);
      } catch (error) {
        setSecciones({});
        setRespuesta([]);
      }
    };
    fetchRespuestas();
  }, [id]);

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

  const showAlert = (message, isSuccess) => {
    setAlertMessage(message);
    setIsSuccess(isSuccess);
    
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
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

  // Renderiza los inputs dinámicos y prellenados
  const renderSecciones = () => {
    return Object.values(secciones).map((seccion) => (
      <div key={seccion.id} className="section-card">
        <h3>{seccion.nombre}</h3>
        <div className="elementos-container">
          {Object.values(seccion.elementos).map((elemento) => {
            // Obtener el estado correspondiente del elemento en respuesta
            const respuestaElement = respuesta.find(item => item.elemento_id === elemento.id);
            const status = respuestaElement ? respuestaElement.status : "";

            // Determinamos el borde del color del card basado en el status
            let borderColorClass = "";
            switch (status) {
              case "valido":
                borderColorClass = "border-green"; // borde verde para válido
                break;
              case "revisando":
                borderColorClass = "border-yellow"; // borde amarillo para revisando
                break;
              case "invalido":
                borderColorClass = "border-red"; // borde rojo para inválido
                break;
              default:
                borderColorClass = ""; // sin borde especial si no hay estado
            }

            return (
              <div key={elemento.id} className={`element-card ${borderColorClass}`}>
                <h4>{elemento.nombre}</h4>
                {renderElemento(seccion.id, elemento, handleInputChange, handleCheckboxChange, respuesta)}
              </div>
            );
          })}
        </div>
      </div>
    )); 
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

    // Crear FormData para enviar en formato multipart/form-data
    const formData = new FormData();
    formData.append('monto_solicitado', montoSolicitado);
    formData.append('modalidad_id', modalidad.id);

    // Agrega las respuestas al FormData
    respuesta.forEach((res, index) => {
      const elemento_tipo = secciones[res.seccion_id].elementos[res.elemento_id].tipo;
    
      // Si el tipo de elemento es "documento"
      if (elemento_tipo === 'documento') {
          // Si el valor es un archivo, agregar como valor_file
          if (res.valor instanceof File) {
              formData.append(`respuestas[${index}][seccion_id]`, res.seccion_id);
              formData.append(`respuestas[${index}][elemento_id]`, res.elemento_id);
              formData.append(`respuestas[${index}][valor_file]`, res.valor);
          }
          // Si el valor es una cadena de texto, no agregar
      } else {
          // Si el tipo de elemento no es "documento", agregar siempre como valor_texto
          formData.append(`respuestas[${index}][seccion_id]`, res.seccion_id);
          formData.append(`respuestas[${index}][elemento_id]`, res.elemento_id);
          formData.append(`respuestas[${index}][valor_texto]`, res.valor);
      }
    });

    try {
        const response = await api.solicitudes.solicitar.update(solicitud.id,formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            showAlert('Solicitud actualizada exitosamente.', true);
            setTimeout(() => {
              navigate('/historial'); 
          }, 1000);
        } else {
            const errorMessage = response.data?.detail || 'Error desconocido';
            showAlert(`Error: ${errorMessage}`, false);
        }
    } catch (error) {
        const specificErrorMessage = error.response?.data?.messages?.error[0] || error.message || 'Error en la conexión';
        showAlert(`Error: ${specificErrorMessage}`, false);
    }

    };

  return (
    <MainContainer>
    {/* Alerta */}
    {alertMessage && (
      <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
        {alertMessage}
      </div>
    )}
    {/* Imagen y descripción de la modalidad */}
      <div className="image-container">
      <img src={`${apiUrl}${modalidad.imagen}`} alt="Modalidad" />
      <div className="image-overlay"></div>
      <div className="image-text-container">
        <h3>Modalidad:</h3>
        <h4>{modalidad.nombre}</h4>
        <p>{modalidad.descripcion}</p>
        <p className="monto">{formatCurrency(modalidad.monto_maximo)}</p>
      </div>
      </div>
      {solicitud && (
        <div>
          <div className="info-container">
            {/* Mostrar campos de solo lectura */}
            <p><strong>Estatus:</strong> {solicitud.status}</p>
            <p><strong>Monto Aprobado:</strong> {solicitud.monto_aprobado}</p>
          </div>
          <div className="container">
            {renderSecciones()}
          </div>
          </div>
      )}

      <div className="container">

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
        </div>
  
        {/* Botones de acción */}
        <div className="buttons-container">
          <button className="button" onClick={() => navigate('/historial')}>
            Cancelar
          </button>
          <button className="submit-button" onClick={() => handleSubmit()} >
            Actualizar
          </button>
        </div>
    </MainContainer>
  );
};

export default EditarSolicitud;
