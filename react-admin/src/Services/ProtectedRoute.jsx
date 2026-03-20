// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  allowedTipoCargo = [],
  allowedCodigoCargo = [],
}) => {
  const { user } = useSelector((state) => state.auth);

  // Si no hay usuario → al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Estos nombres son los que vimos en tu consola
  const tipoCargo = user.tipoEmpleado;
  const codigoCargo = user.codigoCargo;

  let autorizado = false;

  // Validar por tipoCargo
  if (allowedTipoCargo.length > 0) {
    if (allowedTipoCargo.includes(tipoCargo)) {
      autorizado = true;
    }
  }

  // Validar por codigoCargo
  if (allowedCodigoCargo.length > 0) {
    if (allowedCodigoCargo.includes(codigoCargo)) {
      autorizado = true;
    }
  }

  if (
    (allowedTipoCargo.length > 0 || allowedCodigoCargo.length > 0) &&
    !autorizado
  ) {
    console.log("⛔ Acceso denegado por roles");
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

export default ProtectedRoute;
