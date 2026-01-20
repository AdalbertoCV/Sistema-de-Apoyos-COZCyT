import '@/App.css';
import api from "@/api";

export const renderElemento = (seccionId, elemento, handleInputChange, handleCheckboxChange) => {
  const { tipo, opciones, id, nombre, formato, obligatorio } = elemento;

  const handleChange = (e) => {
    const valor = e.target.value;
    handleInputChange(seccionId, id, valor); 
  };

  const handleDownload = async (elemento, formato) => {
    try {
      const response = await api.formatos.getById(formato, {
        responseType: 'blob',
      });
  
      const contentType = response.headers['content-type'];
  
      if (contentType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        throw new Error('Tipo de archivo inesperado');
      }
  
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${elemento.nombre}_formato.docx`);
      
      document.body.appendChild(link);
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      window.URL.revokeObjectURL(url);
    } catch (error) {
    }
  };
  
  const renderInput = (inputElement, obligatorio) => (
    <>
      {inputElement}
      {obligatorio && <small className="required-text">*obligatorio</small>}
    </>
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
        />,
        obligatorio
      );
    case "opcion_multiple":
    case "desplegable":
      return renderInput(
        <select onChange={handleChange} key={id} name={nombre} required={obligatorio} className="select-class">
          <option value="">
            Seleccione...
          </option>
          {Object.keys(opciones).map((opcionId) => (
            <option key={opcionId} value={opciones[opcionId].nombre}>
              {opciones[opcionId].nombre}
            </option>
          ))}
        </select>,
        obligatorio
      );
    case "casillas":
      return renderInput(
        <div key={id} className="checkbox-group">
          {Object.keys(opciones).map((opcionId) => (
            <label key={opcionId} className="checkbox-label">
              <input
                type="checkbox"
                name={nombre}
                value={opciones[opcionId].nombre}
                onChange={(e) => handleCheckboxChange(seccionId, id, e)}
                required={obligatorio}
              />
              {opciones[opcionId].nombre}
            </label>
          ))}
        </div>,
        obligatorio
      );
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
          {formato && (
            <button
              className="download-button"
              onClick={() => handleDownload(elemento, formato)}
            >
              Descargar Formato
            </button>
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
