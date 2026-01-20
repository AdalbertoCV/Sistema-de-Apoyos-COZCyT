import ListaModalidades from "@/components/modalidades/ListaModalidades";
import { useState } from "react";
import Modalidad from "@/components/modalidades/SolicitarModalidad";
import { useAutenticacion } from "../common/utility/Autenticador";
import CreateModalidad from "./CrearModalidad";
import EditModalidad from "./EditarModalidad";

export default function Modalidades({ setViewPageLoader }) {
  const [viewModalidades, setViewModalidades] = useState(true);
  const [viewModalidadSolicitar, setViewModalidadSolicitar] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const {isAdmin} = useAutenticacion();
  const [viewModalidadCreate, setViewModalidadCreate] = useState(false)
  const [viewModalidadEdit, setViewModalidadEdit] = useState(false)


  const handleModalidadSolicitar = (id) => {
    setViewModalidades(false);
    setViewModalidadSolicitar(true);
    setSelectedId(id);
  };

  const handleModalidadCreate = () => {
    setViewModalidades(false)
    setViewModalidadCreate(true)
  };

  const handleModalidadEdit = (id) => {
    setSelectedId(id)
    setViewModalidadSolicitar(false);
    setViewModalidadEdit(true)
  }


  return (
    <>
      {viewModalidades && (
        <ListaModalidades
          setViewPageLoader={setViewPageLoader}
          handleModalidadDetail={handleModalidadSolicitar}
          isAdmin = {isAdmin}
          handleModalidadCreate = {handleModalidadCreate}
          handleModalidadEdit={handleModalidadEdit}
        />
      )}
      {viewModalidadSolicitar && selectedId && (
        <Modalidad id={selectedId}/>
      )}
      {viewModalidadCreate && (
        <CreateModalidad
        />
      )}
      {viewModalidadEdit && selectedId && (
        <EditModalidad id={selectedId}/>
      )}
    </>
  );
}
