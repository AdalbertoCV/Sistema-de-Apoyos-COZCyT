/* eslint-disable react/jsx-no-comment-textnodes */
// import { useNavigate } from "react-router-dom";
import { ModalidadCard } from "@/components/modalidades/ModalidadCard";
import api from "@/api";
import { useState, useEffect } from "react";
import MainContainer from "@/components/common/utility/MainContainer";
import '@/App.css';
import { useNavigate } from "react-router-dom";
import SectionContainer from "../common/ui/SectionContainers/SectionContainer";

export default function ListaModalidades({
  setViewPageLoader,
  handleModalidadSolicitar,
  isAdmin,
  handleModalidadCreate,
  handleModalidadEdit,
}) {
  const [modalidades, setModalidades] = useState([]);
  const navigate = useNavigate();
  const [convocatoria, setConvocatoria] = useState(true);

  const obtenerModalidades = async () => {
    setViewPageLoader(true);

    try {
      const response = await api.modalidades.get();
      setModalidades(response.data.data);
    } catch (error) {
    }
    setViewPageLoader(false);
  };

  useEffect(() => {
    obtenerModalidades();
  }, []);

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

  return (
    
    <SectionContainer title="Modalidades de Apoyo">
      <div className="flex flex-col w-full justify-center items-center">

        {/* Botón centrado debajo del título */}
        {isAdmin && (
          <div className="flex justify-center my-4">
            <button
              className="submit-button bg-gray-500 text-white border border-gray-600 font-bold text-center uppercase rounded-lg py-2 px-4 flex items-center"
              onClick={() => navigate(`/crear-modalidad/`)}
            >
              {/* Signo de "+" antes del texto */}
              <span className="mr-2 text-xl">+</span>
              Crear Modalidad
            </button>
          </div>
        )}

        {/* Listado de modalidades */}
        <div className="flex flex-wrap justify-center items-center w-full mt-2">
          {modalidades.length > 0 ? (
            modalidades.map((item) => {
              return (
                <ModalidadCard
                  key={item.id}
                  title={item.nombre}
                  description={item.descripcion}
                  monto={item.monto_maximo}
                  image={item.imagen}
                >
                  
                  {/* Botón de Editar o Solicitar basado en las condiciones */}
                  {isAdmin ? (
                    <button
                      className="h-8 w-40 lg:w-48 bg-[var(--principal-c)] text-[var(--principal-mf)] border border-[var(--principal-f)] font-bold text-center uppercase align-middle rounded-lg hover:bg-[var(--principal-mf)] hover:text-white"
                      onClick={() => navigate(`/editar-modalidad/${item.id}`)}
                    >
                      Editar
                    </button>
                  ) : convocatoria ? (
                    <button
                      className="h-8 w-40 lg:w-48 bg-[var(--principal-c)] text-[var(--principal-mf)] border border-[var(--principal-f)] font-bold text-center uppercase align-middle rounded-lg hover:bg-[var(--principal-mf)] hover:text-white"
                      onClick={() => navigate(`/solicitar/${item.id}`)}
                    >
                      Solicitar
                    </button>
                  ) : null}
                    
                </ModalidadCard>
              );
            })
          ) : (
            <p className="text-[var(--gris-8)] text-xl font-bold">
              No hay modalidades disponibles
            </p>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
