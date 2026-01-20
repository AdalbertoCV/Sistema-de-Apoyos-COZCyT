import { useAutenticacion } from "@/components/common/utility/Autenticador";
import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "@/api";

export const LoginRequiredRoute = () => {
  const { token } = useAutenticacion();
  if (token === null) {
    return <Navigate to="/authentication" />;
  } else if (token === undefined) {
    return null;
  }else {
    return <Outlet />;
  }
};

export const IsAdminRequiredRoute = ({ setViewPageLoader }) => {
  const {isAdmin} = useAutenticacion();
  
  if (isAdmin === false) {
    return <Navigate to="/no-autorizado" />;
  } else if (isAdmin === undefined) {
    return null;
  }else {
    return <Outlet />;
  }
};

export const IsSolicitanteRequiredRoute = ({ setViewPageLoader }) => {
  const {isAdmin} = useAutenticacion();
  
  if (isAdmin === true) {
    return <Navigate to="/no-autorizado" />;
  } else if (isAdmin === undefined) {
    return null;
  }else {
    return <Outlet />;
  }
};

export const IsLogged = () => {
  const { token } = useAutenticacion();
  if (token === null) {
    return <Outlet />
  }else{
    return null;
  }
};
