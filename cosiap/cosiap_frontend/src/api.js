import axios from "axios";

axios.defaults.withCredentials = true;

export const apiUrl = "http://localhost:8000";


// Configuración de Axios
const ax = axios.create({
  baseURL: apiUrl,
});

// Interceptor de solicitud
ax.interceptors.request.use(
  (config) => {
    // Aquí puedes manipular la configuración de la solicitud antes de enviarla al servidor
    // Por ejemplo, agregar encabezados comunes como token de autenticación
    // config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => {
    // Manejo de errores del interceptor de solicitud
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
ax.interceptors.response.use(
  (response) => {
    // Aquí puedes manipular la respuesta antes de pasarla al código que la llamó
    return response;
  },
  (error) => {
    // Manejo de errores del interceptor de respuesta
    return Promise.reject(error);
  }
);

//Endpoints predefinidos para acceder a la pagina
const api = {
  //Obtener la instancia de axios
  axios: ax, 
  //Enpoints del modulo Usuario
  usuarios: {
    get: () => ax.get('api/usuarios'),
    post: (data) => ax.post('api/usuarios/', data),
    getById: (id) => ax.get(`api/usuarios/${id}`),
    update: (id, data) => ax.put(`api/usuarios/${id}`, data),
    delete: (id) => ax.delete(`api/usuarios/${id}`),

    verificarCorreo: (uidb64, token) => ax.get(`api/usuarios/verificar-correo/${uidb64}/${token}`),
    restablecerPassword: (data) => ax.post(`api/usuarios/restablecer-password/`, data),
    nuevaPassword: (uidb64, token, data) => ax.post(`api/usuarios/nueva-password/${uidb64}/${token}/`, data),

    getId: () => ax.get('api/usuarios/uid/'),
    getIsCompleteData: () => ax.get('api/usuarios/user-complete-data/'),
    
    datos_bancarios: {
      get: () => ax.get('api/usuarios/datos-bancarios'),
      post: (data) => ax.post('api/usuarios/datos-bancarios/', data),
      update: (id, data) => ax.put(`api/usuarios/datos-bancarios/${id}`, data),
      delete: (id) => ax.delete(`api/usuarios/datos-bancarios/${id}`),
    },

    administradores: {
      get: (params) => ax.get('api/usuarios/administradores', params),
      update: (id, data) => ax.put(`api/usuarios/administradores/${id}`, data),
      post: (data) => ax.post('api/usuarios/administradores/', data),
      delete: (id) => ax.delete(`api/usuarios/administradores/${id}`),
    },

    // Endpoints del submodulo token
    token: {
      login: (data) => ax.post('api/usuarios/token/',data),
      refresh: () => ax.post('api/usuarios/token/refresh/'),
      logout: () => ax.get('api/usuarios/logout/')
    },

    admin: {
      is_admin: () => ax.get('api/usuarios/user-is-admin/')
    },
    
    //Endpoints del submodulo solicitantes
    solicitantes: {
      get: (params) => ax.get('api/usuarios/solicitantes',params),
      post: (data) => ax.post('api/usuarios/solicitantes/', data),
      getById: (id) => ax.get(`api/usuarios/solicitantes/${id}`),
      update: (id, data) => ax.put(`api/usuarios/solicitantes/${id}`, data),
    },

    municipios: {
      get: () => ax.get('api/usuarios/municipios'),
    },
    estados: {
      get: () => ax.get('api/usuarios/estados'),
    }
  },
  administracion: {
    //Aun por declarar
  },
  modalidades: {
    get: () => ax.get('api/modalidades'),
    post: (data) => ax.post('api/modalidades/', data),
    getById: (id) => ax.get(`api/modalidades/${id}`),
    update: (id, data) => ax.put(`api/modalidades/${id}/`, data),
    delete: (id) => ax.delete(`api/modalidades/${id}`),
    monto: {
      post: (data) => ax.post('api/modalidades', data),
    }
  },
  notificaciones: {
    // Aun por declarar
  },
  solicitudes: {
    get: () => ax.get('api/solicitudes'),
    post: (data) => ax.post('api/solicitudes/', data),
    getById: (id) => ax.get(`api/solicitudes/${id}`),
    update: (id, data) => ax.put(`api/solicitudes/${id}/`, data),
    delete: (id) => ax.delete(`api/solicitudes/${id}`),
    calificar_documentos: (id, data) => ax.put(`api/solicitudes/calificar/${id}/`, data),
    historial: {
      get: () => ax.get('api/solicitudes/historial'),
      getById: (id) => ax.get(`api/solicitudes/historial/${id}`),
    },
    minuta: {
      update: (id,data) => ax.put(`api/solicitudes/subir-minuta/${id}/`, data)
    },
    convenio: {
      update: (id,data) => ax.put(`api/solicitudes/subir-convenio/${id}/`, data),
      get: () => ax.get('api/solicitudes/subir-convenio/')
    },
    solicitar:{
      post: (data) => ax.post('api/solicitudes/solicitar/', data),
      update: (id,data) => ax.put(`api/solicitudes/solicitar/${id}/`, data)
    },
    reportes:{
      exportar: (params) => ax.get(`api/solicitudes/reportes/exportar`, params)
    },
    
  },
  dynamicTables: {
    get: () => ax.get('api/dynamic-tables'),
    post: (data) => ax.post('api/dynamic-tables/', data),
    getById: (id) => ax.get(`api/dynamic-tables/${id}`),
    update: (id, data) => ax.put(`api/dynamic-tables/${id}/`, data),
    delete: (id) => ax.delete(`api/dynamic-tables/${id}`),
  },
  dynamicForms: {
    opciones: {
      get: () => ax.get('api/formularios/opciones/'),
      post: (data) => ax.post('api/formularios/opciones/', data),
      getById: (id) => ax.get(`api/formularios/opciones/${id}`),
      update: (id, data) => ax.put(`api/formularios/opciones/${id}/`, data),
      delete: (id) => ax.delete(`api/formularios/opciones/${id}`)
    },
    elementos: {
      get: () => ax.get('api/formularios/elementos'),
      post: (data) => ax.post('api/formularios/elementos/', data),
      getById: (id) => ax.get(`api/formularios/elementos/${id}`),
      update: (id, data) => ax.put(`api/formularios/elementos/${id}/`, data),
      delete: (id) => ax.delete(`api/formularios/elementos/${id}`),
      postElementOption: (elementId, optionId) => ax.post(`/api/formularios/elementos/${elementId}/opcion/${optionId}/`),
    },
    secciones: {
      get: () => ax.get('api/formularios/secciones'),
      post: (data) => ax.post('api/formularios/secciones/', data),
      getById: (id) => ax.get(`api/formularios/secciones/${id}`),
      update: (id, data) => ax.put(`api/formularios/secciones/${id}/`, data),
      delete: (id) => ax.delete(`api/formularios/secciones/${id}`),
      postSectionElement: (sectionId, elementId) => ax.post(`/api/formularios/secciones/${sectionId}/elementos/${elementId}`),
    },
    dynamicForms: {
      get: () => ax.get('api/formularios'),
      post: (data) => ax.post('api/formularios/', data),
      getById: (id) => ax.get(`api/formularios/${id}`),
      update: (id, data) => ax.put(`api/formularios/${id}/`, data),
      delete: (id) => ax.delete(`api/formularios/${id}`),
      postFormSection: (formId, sectionId) => ax.post(`/api/formularios/${formId}/secciones/${sectionId}`),
    },
    respuestas: {
      get: () => ax.get('api/formularios/respuestas'),
      post: (data) => ax.post('api/formularios/respuestas/', data),
      getById: (id) => ax.get(`api/formularios/respuestas/${id}`),
    },
  },
  formatos: {
    get: () => ax.get('api/plantillas'),
    post: (data) => ax.post('api/plantillas/', data),
    delete: (id) => ax.delete(`api/plantillas/${id}`),
    download: (id) => ax.get(`api/plantillas/descargar-formato/${id}`, { responseType: 'blob' }),
    getById: (id) => ax.get(`api/plantillas/download/${id}`,{ responseType: 'blob' }),
    getMinuta: () => ax.get('api/plantillas/minuta'),
    updateMinuta: (data) => ax.put('api/plantillas/minuta/',data),
    getConvenio: () => ax.get('api/plantillas/convenio'),
    updateConvenio: (data) => ax.put('api/plantillas/convenio/',data),
    manual: (params) => ax.get('api/plantillas/manual/', params)
  },
  convocatoria: {
    get: () => ax.get('api/administracion/convocatoria/'),
    put: (data) => ax.put('api/administracion/convocatoria/', data)
  },
  estilos: {
    get: ()=> ax.get('api/administracion/estilos/'),
    update: (data)=> ax.put('api/administracion/estilos/', data)
  }
};

// Exportar los endpoints de la API
export default api;