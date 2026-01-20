import {
  useEffect,
  useLayoutEffect,
  useContext,
  createContext,  
  useState,
  useRef,
} from "react";
import api from '@/api'
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";

const ContextoAut = createContext(undefined);

export const useAutenticacion = () => {
  const contextoAut = useContext(ContextoAut);
  if (!contextoAut) {
    throw new Error(
      "useAutenticacion se tiene que usar dentro de un componente autenticador"
    );
  }

  return contextoAut;
};

export const Autenticador = ({ setViewPageLoader, children }) => {  
  const [token, setToken] = useState();
  const [isAdmin, setIsAdmin] = useState();
  const [uid, setUid] = useState();
  const interceptadoresRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {    
    const buscarUsuario = async () => {      
      try {
        const response = await api.usuarios.token.refresh();        
        setToken(response.data.access);
        // IMPORTANTE: Primero se deben configurar los interceptores antes que determinar si es admin
        configurarInterceptors(response.data.access);
        const responseAd = await api.usuarios.admin.is_admin();
        setIsAdmin(responseAd.data.user_is_admin);
        //Extraemos el id
        const responseUid = await api.usuarios.getId();
        setUid(responseUid.data.user_id);
      } catch {
        setToken(null);
        setIsAdmin(false);
        setUid(undefined);
      }
    }

    buscarUsuario();
  }, []);

  const configurarInterceptors = (token) => {
    // Si ya existen interceptores, primero eliminarlos
    if (interceptadoresRef.current.requestInterceptor) {
      api.axios.interceptors.request.eject(interceptadoresRef.current.requestInterceptor);
    }
    if (interceptadoresRef.current.responseInterceptor) {
      api.axios.interceptors.response.eject(interceptadoresRef.current.responseInterceptor);
    }

    if (token) {
      const requestInterceptor = api.axios.interceptors.request.use((config) => {      
        config.headers.Authorization = !config.__retry && token ? `Bearer ${token}` : config.headers.Authorization;
        return config;
      });

      const responseInterceptor = api.axios.interceptors.response.use(
        (response) => response, async (error) => {
          const requestOriginal = error.config;
          
          if (error.response.status === 403 && error.response.data.message === 'Unauthorized') {
            try {
              const response = await api.usuarios.token.refresh();
              setToken(response.data.access);
              requestOriginal.headers.Authorization = `Bearer ${response.data.access}`;
              requestOriginal.__retry = true;
              const responseAd = await api.usuarios.admin.is_admin();
              setIsAdmin(responseAd.data.user_is_admin);
              //Extraemos el id
              const responseUid = await api.usuarios.getId();
              setUid(responseUid.data.user_id);
              return api(requestOriginal);
            } catch {
              setToken(null);
              setIsAdmin(undefined);
              setUid(undefined);
            }
          }

          return Promise.reject(error);
        },
      );

      // Guardar los identificadores de interceptores
      interceptadoresRef.current.requestInterceptor = requestInterceptor;
      interceptadoresRef.current.responseInterceptor = responseInterceptor;
    }
  };

  useLayoutEffect(() => {
    if (token) {
      configurarInterceptors(token);
    }
  }, [token]);

  const cerrarSesion = async () => {
    setViewPageLoader(true);
    try {
      const response = await api.usuarios.token.logout();
      // Eliminar los interceptores configurados para el token actual
      configurarInterceptors(token);
      // Limpiar el estado de autenticación
      setToken(null);
      setIsAdmin(undefined);
      setUid(undefined);
      navigate('/authentication');
    } catch (error) {
    }
    setViewPageLoader(false);
  };

  return (    
    <ContextoAut.Provider value={{ token, setToken, isAdmin, setIsAdmin, cerrarSesion, configurarInterceptors, uid, setUid }}>          
      {children}
    </ContextoAut.Provider>
  );
};

Autenticador.propTypes = {
  setViewPageLoader: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
