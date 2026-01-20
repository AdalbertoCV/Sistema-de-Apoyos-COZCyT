import '@/App.css'
import api from '@/api';
import { useEffect, useState } from "react";
import { useAutenticacion } from "@/components/common/utility/Autenticador";
import { useNavigate } from '@/components/modalidades/SolicitarModalidad';

export default function Settings( {settingsRef, selectedNav, setSelectedNav} ){

    const [convocatoria, setConvocatoria] = useState(true);
    const { isAdmin } = useAutenticacion();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConvocatoria = async () => {
            try {
                const response = await api.convocatoria.get();
                setConvocatoria(response.data.convocatoria_is_open);
            } catch (error) {
                setConvocatoria(false);
            }
        };
        fetchConvocatoria();
    }, []);

    const handleConvocatoria = async () => {
      try {
        const nuevaConvocatoria = !convocatoria
        await api.convocatoria.put({'nuevo_estado': nuevaConvocatoria});
        setConvocatoria(nuevaConvocatoria);
      } catch (error) {
        setConvocatoria(false);
      }
    };
    
    return (
        <div ref={settingsRef} className="fixed right-9 lg:right-12 w-[80%] sm:w-[40%] lg:w-72 mt-12 lg:mt-10 z-50">
            <div className="relative space-y-1 px-2 py-3 bg-[#E1E1E1] rounded-3xl shadow-gray-500 shadow-2xl">
                <div className="flex-wrap">
                    <div className="flex justify-center text-[var(--principal-mf)] font-bold">
                        Cambiar navegación
                    </div>
                    <div className="flex mt-2 justify-center space-x-6 flex-row">
                        <a 
                            className={`flex py-1 px-6 rounded-3xl border-2 border-[var(--principal-f)] cursor-pointer
                                ${selectedNav === 'vertical' ? 'bg-[var(--principal-f)] text-white' : ' text-[var(--principal-f)] hover:bg-[var(--principal-f)] hover:text-white'}`
                            }
                            onClick={() => setSelectedNav('vertical')}
                        >
                            Vertical
                        </a>
                        <a 
                            className={`flex py-1 px-6 rounded-3xl border-2 border-[var(--principal-f)]  cursor-pointer
                                ${selectedNav === 'horizontal' ? 'bg-[var(--principal-f)] text-white' : 'text-[var(--principal-f)] hover:bg-[var(--principal-f)] hover:text-white'}`
                            }
                            onClick={() => setSelectedNav('horizontal')}
                        >
                            Horizontal
                        </a>
                    </div>
                    <div className="flex mt-2 justify-center space-x-6 flex-row">
                        {/* Renderiza el switch solo si es administrador */}
                        {isAdmin && (
                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex justify-center text-[var(--principal-mf)] font-bold">
                                    <span>¿Convocatoria Abierta?</span>
                              </div>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  id="toggleConvocatoria"
                                  checked={convocatoria}
                                  onChange={() => handleConvocatoria()}
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          </div>
                        )}
                    </div>
                    {isAdmin && (
                    <div className="flex mt-2 justify-center space-x-6 flex-row">
                        <a 
                            className={`flex py-1 px-6 rounded-3xl border-2 border-[var(--principal-f)]  cursor-pointer
                                ${selectedNav === 'horizontal' ? 'bg-[var(--principal-f)] text-white' : 'text-[var(--principal-f)] hover:bg-[var(--principal-f)] hover:text-white'}`
                            }
                            onClick={() => navigate('/editar-estilo')}
                        >
                            Configuración Estilo
                        </a>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}