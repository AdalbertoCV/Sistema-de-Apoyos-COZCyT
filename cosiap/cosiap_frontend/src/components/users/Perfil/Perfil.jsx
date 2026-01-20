import InformacionPersonal from "@/components/users/Perfil/InformacionPersonal";
import Direccion from "@/components/users/Perfil/Direccion";
import InformacionIdentificacion from "@/components/users/Perfil/InformacionIdentificacion";
import Alert from "@/components/common/ui/Alert";
import api from "@/api";
import { useAutenticacion } from "@/components/common/utility/Autenticador";
import { useEffect, useState } from "react";
import DatosBancarios from "./DatosBancarios";

export default function Perfil( {setViewPageLoader} ){
    const { uid } = useAutenticacion();
    const [datosSolicitante, setDatosSolicitante] = useState([]);
    const [showAlertSuccesful, setShowAlertSuccesful] = useState(false); // Control de mostrar la alerta
    
    const crearSolicitante = async () => {
        try {
            const response = await api.usuarios.solicitantes.post();
            //Tratamos de obtener el solicitante con el id
            const responseObtain = await api.usuarios.solicitantes.getById(uid);
            //Declaramos los datos del solicitante
            setDatosSolicitante(responseObtain.data);
        } catch (error) {
        }
    };

    const obtenerInformacionSolicitante = async () =>{
        if (uid){
            try {
                setViewPageLoader(true);
                //Tratamos de obtener el solicitante con el id
                const responseObtain = await api.usuarios.solicitantes.getById(uid);
                //Declaramos los datos del solicitante
                setDatosSolicitante(responseObtain.data);
            } catch (error) { // Si da error significa que es su primera vez ingresando
                crearSolicitante()
            }finally{
                setViewPageLoader(false);
            }
        }
    };
    useEffect(() => {
        obtenerInformacionSolicitante();
    },[uid]);

    return (
        <>
            <Alert
                message="¡Cambios guardados exitosamente!"
                type="success" // success
                duration={5000} // Duración de 5 segundos
                isVisible={showAlertSuccesful}
                setIsVisible={setShowAlertSuccesful}
            />
            <div className="h-full w-full">
                <div className="flex justify-center">
                    <div className="flex-wrap w-[90%]  lg:w-4/5  justify-center">
                        <div className="flex-wrap justi space-y-[5%] lg:space-y-[2%] w-full ">
                            <InformacionPersonal 
                                datosSolicitante={datosSolicitante}
                                obtenerInformacionSolicitante={obtenerInformacionSolicitante}
                                setViewPageLoader={setViewPageLoader}
                                setShowAlertSuccesful={setShowAlertSuccesful}
                            />
                            <Direccion
                                datosSolicitante={datosSolicitante} 
                                obtenerInformacionSolicitante={obtenerInformacionSolicitante}
                                setViewPageLoader={setViewPageLoader}
                                setShowAlertSuccesful={setShowAlertSuccesful}
                            />
                            <InformacionIdentificacion
                                datosSolicitante={datosSolicitante}
                                obtenerInformacionSolicitante={obtenerInformacionSolicitante}
                                setViewPageLoader={setViewPageLoader}
                                setShowAlertSuccesful={setShowAlertSuccesful}
                            />
                            <DatosBancarios
                                obtenerInformacionSolicitante={obtenerInformacionSolicitante}
                                datosSolicitante={datosSolicitante} 
                                setViewPageLoader={setViewPageLoader}
                                setShowAlertSuccesful={setShowAlertSuccesful}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
