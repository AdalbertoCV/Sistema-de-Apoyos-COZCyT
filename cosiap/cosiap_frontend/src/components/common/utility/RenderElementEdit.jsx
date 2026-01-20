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

  // Determinamos el borde del color del card basado en el status
  let estado = "";
  switch (status) {
    case "valido":
      estado = "Aprobado" 
      break;
    case "revisando":
      estado = "En revisión"
      break;
    case "invalido":

      estado = "Documento Incorrecto"
      break;
  }

  const handleChange = (e) => {
    const valor = e.target.value;
    handleInputChange(seccionId, id, valor); 
  };
  
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
        <input
          key={id}
          type="text"
          name={nombre}
          placeholder={nombre}
          required={obligatorio}
          className="input-class"
          onChange={handleChange}
          value={valorPrellenado}
        />,
        obligatorio
      );
    case "texto_parrafo":
      return renderInput(
        <textarea
          key={id}
          name={nombre}
          placeholder={nombre}
          required={obligatorio}
          className="textarea-class"
          onChange={handleChange}
          value={valorPrellenado}

        />,
        obligatorio
      );
    case "numerico":
      return renderInput(
        <input
          key={id}
          type="number"
          name={nombre}
          placeholder={nombre}
          required={obligatorio}
          className="input-class"
          onChange={handleChange}
          value={valorPrellenado}

        />,
        obligatorio
      );
    case "opcion_multiple":
    case "desplegable":
      return renderInput(
        <select onChange={handleChange} key={id} name={nombre} required={obligatorio} value={valorPrellenado} className="select-class">
          {Object.keys(opciones).map((opcionId) => (
            <option key={opcionId} value={opciones[opcionId].nombre}>
              {opciones[opcionId].nombre}
            </option>
          ))}
        </select>,
        obligatorio
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
          <input
            type="file"
            name={nombre}
            required={obligatorio}
            accept=".pdf"
            className="file-input-class"
            onChange={(e) => handleInputChange(seccionId, id, e.target.files[0])}
          />
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
        <input
          key={id}
          type="date"
          name={nombre}
          value={valorPrellenado}
          required={obligatorio}
          className="date-input-class"
          onChange={handleChange}
        />,
        obligatorio
      );
    case "hora":
      return renderInput(
        <input
          key={id}
          type="time"
          name={nombre}
          value={valorPrellenado}
          required={obligatorio}
          className="time-input-class"
          onChange={handleChange}
        />,
        obligatorio
      );
    case "separador":
      return <hr key={id} className="separator-class" />;
    default:
      return null;
  }
};
