import Alert from "@/components/common/ui/Alert";
import DatosBancarios from "./DatosBancarios";
import { useEffect, useState } from "react";
import { useAutenticacion } from "@/components/common/utility/Autenticador";
import api from "@/api";
import Convenio from "./Convenio";

export default function RecepcionApoyo( {setViewPageLoader} ){
    const [datosSolicitante, setDatosSolicitante] = useState([]);
    const [showAlertSuccesful, setShowAlertSuccesful] = useState(false); // Control de mostrar la alerta
    const { uid } = useAutenticacion();

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
            setViewPageLoader(true);
            try {
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

    return(
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
                    <div className="flex-wrap w-[90%] mt-[5%] lg:mt-[2%] lg:w-4/5 justify-center">
                        <DatosBancarios
                            obtenerInformacionSolicitante={obtenerInformacionSolicitante}
                            datosSolicitante={datosSolicitante} 
                            setViewPageLoader={setViewPageLoader}
                            setShowAlertSuccesful={setShowAlertSuccesful}
                        />
                    </div>
                </div>
                <div className="flex justify-center">        
                    <div className="flex-wrap w-[90%] mt-[5%] mb-[5%] lg:mt-[2%] lg:w-1/4 justify-center">
                    <Convenio
                                setViewPageLoader={setViewPageLoader}
                                setShowAlertSuccesful={setShowAlertSuccesful}
                            />
                    </div>
                </div>
            </div>
        </>
    );
}