import '@/App.css';
import { apiUrl } from '@/api';

export const renderElemento = (seccionId, elemento, handleInputChange, handleCheckboxChange, respuestas) => {
  const { tipo, opciones, id, nombre, obligatorio } = elemento;

  // Buscar si ya existe una respuesta para este elemento
  const respuestaElemento = respuestas.find(
    (r) => r.seccion_id === seccionId && r.elemento_id === id
  );
  
  // Determinar el valor prellenado
  const valorPrellenado = respuestaElemento ? respuestaElemento.valor : "";
  const status = respuestaElemento ? respuestaElemento.status : "";
  const observacion = respuestaElemento ? respuestaElemento.observacion : "";

  let estado = "";
  switch (status) {
    case "valido":
      estado = "Aprobado" // borde verde para válido
      break;
    case "revisando":
      estado = "En revisión"
      break;
    case "invalido":
      estado = "Documento Incorrecto"
      break;
  }

  
  const renderInput = (inputElement, obligatorio) => (
    <div className={`element-container`}>
      {inputElement}
      {obligatorio && <small className="required-text">*obligatorio</small>}
      <br></br>
      {status && (
        <small> 
        Estatus: {estado}
        </small>
      )}
      <br></br>
      {observacion && (
        <small>
        Retroalimentación: {observacion}
        </small>
      )}
    </div>
  );

  switch (tipo) {
    case "texto_corto":
      return renderInput(
        <p>{valorPrellenado}</p>
          
      );
    case "texto_parrafo":
      return renderInput(
        <p>{valorPrellenado}</p>
      );
    case "numerico":
      return renderInput(
        <p>{valorPrellenado}</p>
      );
    case "opcion_multiple":
    case "desplegable":
      return renderInput(
        <p>{valorPrellenado}</p>
      );
      case "casillas": {
        // Convertimos la cadena de valores prellenados en un array
        const valoresSeleccionados = valorPrellenado.split(',');
  
        return renderInput(
          <div key={id} className="checkbox-group">
            {Object.keys(opciones).map((opcionId) => {
              const opcionNombre = opciones[opcionId].nombre;
              const isChecked = valoresSeleccionados.includes(opcionNombre); // Verificar si la opción está seleccionada
              
              return (
                <label key={opcionId} className="checkbox-label">
                  <input
                    type="checkbox"
                    name={nombre}
                    value={opcionNombre}
                    checked={isChecked} // Establecer si está seleccionado
                    onChange={(e) => handleCheckboxChange(seccionId, id, e)}
                    required={obligatorio}
                  />
                  {opcionNombre}
                </label>
              );
            })}
          </div>,
          obligatorio
        );
      }
    case "documento":
      return renderInput(
        <div key={id}>
          {valorPrellenado && (
            <a
              href={`${apiUrl}${valorPrellenado}`}
              target="_blank" 
              rel="noopener noreferrer"  
              className="view-document-button"
            >
              Ver documento
            </a>
         )}
        </div>,
        obligatorio
      );
    case "fecha":
      return renderInput(
        <p>{valorPrellenado}</p>
      );
    case "hora":
      return renderInput(
        <p>{valorPrellenado}</p>
      );
    case "separador":
      return <hr key={id} className="separator-class" />;
    default:
      return null;
  }
};
