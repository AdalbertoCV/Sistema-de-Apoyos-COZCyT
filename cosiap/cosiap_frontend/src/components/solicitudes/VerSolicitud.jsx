import { useState, useEffect } from "react";
import api from "../../api";
import MainContainer from "../common/utility/MainContainer";
import { useParams } from "react-router-dom";
import { renderElemento } from "@/components/common/utility/RenderElementView";
import "@/App.css";
import { apiUrl } from "../../api";
import ModalidadInfoContainer from "../common/ui/SectionContainers/MondalidadInfoContainer";

const VisualizarSolicitud = () => {
  const { id } = useParams();
  const [secciones, setSecciones] = useState({});
  const [solicitud, setSolicitud] = useState(null);
  const [modalidad, setModalidad] = useState('');
  const [respuesta, setRespuesta] = useState([]);
  const [convenio, setConvenio] = useState(null);
  const [alertMessage, setAlertMessage] = useState(''); 
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [formato_estandar, setFormatoEstandar]  = useState(null);
  const [userAdmin, setUserAdmin] = useState(false);

  // Obtener datos de la solicitud
  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await api.solicitudes.getById(id);
        setModalidad(response.data.modalidad);
        setConvenio(response.data.convenio);
        setSolicitud(response.data);
        setSecciones(response.data.formulario.secciones || {});

        const respuestasProcesadas = Object.values(response.data.formulario.secciones).flatMap((seccion) =>
          Object.values(seccion.elementos).map((elemento) => ({
            elemento_id: elemento.id,
            seccion_id: seccion.id,
            valor: elemento.respuesta?.valor || "",
            status: elemento.respuesta?.status || "",
            observacion: elemento.respuesta?.observacion || "",
          }))
        );
        setRespuesta(respuestasProcesadas);
      } catch (error) {
        setSecciones({});
      }
    };
    fetchSolicitud();
  }, [id]);

  useEffect(() => {
      const fetchFormato = async () => {
        try{
          const response = await api.solicitudes.convenio.get();
          setFormatoEstandar(response.data.formato_default)
        } catch (error) {
        setFormatoEstandar(null);
      }
      };
      fetchFormato();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const response = await api.usuarios.admin.is_admin();
        setUserAdmin(response.data.user_is_admin)
      }catch (error) {
        setUserAdmin(false);
      }
    };
    fetchUser();
  });

  const showAlert = (message, isSuccess) => {
    setAlertMessage(message);
    setIsSuccess(isSuccess);
    
    setTimeout(() => {
      setAlertMessage('');
    }, 3000);
  };

  const handleDownload = async (formato) => {
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
      link.setAttribute('download', `convenio_formato.docx`);
      
      document.body.appendChild(link);
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      window.URL.revokeObjectURL(url);
    } catch (error) {
    }
  };

  // Control de cambio en el archivo
  const handleImageChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

    // Guardar cambios en el convenio
  const handleSave = async () => {
    if (!selectedFile) {
      showAlert("Debe seleccionar un archivo antes de guardar", false);
      return; // Detener la ejecución si no hay archivo seleccionado
    }

    const formData = new FormData();
    formData.append("convenio", selectedFile);

    try {
      await api.solicitudes.convenio.update(id, formData);
      showAlert("Convenio actualizado exitosamente", true);
      setIsEditing(false); // Bloquear edición tras guardar
      setSelectedFile(null);

      // Actualizar el convenio mostrado
      const updatedSolicitud = await api.solicitudes.getById(id);
      setConvenio(updatedSolicitud.data.convenio);
    } catch (error) {
      showAlert("Error al actualizar el convenio", false);
    }
  };


  // Cancelar edición
  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
  };

  return (
    <ModalidadInfoContainer
      imagen={modalidad.imagen || ""}
      nombre={modalidad.nombre || ""}
      descripcion={modalidad.descripcion || ""}
      monto_maximo={modalidad.monto_maximo || ""}
    >
      {solicitud && (
        <>
        {alertMessage && (
          <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
            {alertMessage}
          </div>
        )}
          <div className="info-container">
            <p><strong>Estatus:</strong> {solicitud.status}</p>
            <p><strong>Monto Solicitado:</strong> {solicitud.monto_solicitado}</p>
            <p><strong>Monto Aprobado:</strong> {solicitud.monto_aprobado}</p>
          </div>

          {solicitud.status === "Aprobado" && (
            <div className="container">
            <div className={`element-card ${!userAdmin && !isEditing ? 'disabled-card' : ''}`}>
                <h3 className="subtitle">Convenio</h3>

                {/* Mostrar el botón de "Descargar Formato" solo si no es admin */}
                {!userAdmin && (
                  <button 
                    className="download-button" 
                    onClick={() => handleDownload(formato_estandar)}
                  >
                    Descargar Formato
                  </button>
                )}
                
                {convenio ? (
                  <>
                    <a
                      className="view-document-button"
                      href={`${apiUrl}${convenio.archivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver Documento
                    </a>
                    <br />
                  </>
                ) : (
                  <p>No se ha subido el convenio.</p>
                )}
              
                <br />
              
                {/* Mostrar los botones de edición solo si no es admin */}
                {!userAdmin && (
                  <div className="actions">
                    {!isEditing ? (
                      <button 
                        className="add-button" 
                        onClick={() => setIsEditing(true)}
                      >
                        Editar
                      </button>
                    ) : (
                      <>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleImageChange} 
                        />
                        <div className="button-container">
                          <button 
                            className="add-button" 
                            onClick={handleCancel}
                          >
                            Cancelar
                          </button>
                          <button 
                            className="submit-button" 
                            onClick={handleSave}
                          >
                            Guardar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="container">
            {Object.values(secciones).map((seccion) => (
              <div key={seccion.id} className="section-card">
                <h3>{seccion.nombre}</h3>
                <div className="elementos-container flex flex-wrap justify-center p-2 ">
                  {Object.values(seccion.elementos).map((elemento) => {
                    const respuestaElement = respuesta.find((item) => item.elemento_id === elemento.id);
                    const status = respuestaElement ? respuestaElement.status : "";
                    const borderColorClass =
                      status === "valido" ? "border-green" : status === "revisando" ? "border-yellow" : status === "invalido" ? "border-red" : "";

                    return (
                      <div key={elemento.id} className={`element-card ${borderColorClass} w-full sm:w-1/3 lg:w-1/4`}>
                        <h4>{elemento.nombre}</h4>
                        {renderElemento(seccion.id, elemento, null, null, respuesta)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ModalidadInfoContainer>
  );
};

export default VisualizarSolicitud;
