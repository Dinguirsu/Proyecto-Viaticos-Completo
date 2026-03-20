import api from "./api";

export const obtenerEtapas = async () => {
  try {
    const response = await api.get(`/anticipos/obtenerEtapas/`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener etapas:", error);
  }
};

export const fetchAnticipos = async () => {
  try {
    const response = await api.get("/anticipos/obtenerAnticiposByIDEmpleado");
    return response.data;
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
};

export const fetchAnticiposTablaConsulta = async () => {
  try {
    const response = await api.get("/anticipos/obtenerAnticiposByIDEmpleadoConsulta");
    return response.data;
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
};

export const fetchHistorialAnticipos = async () => {
  try {
    const response = await api.get("/anticipos/obtenerHistorialAnticipos");
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error; 
  }
};

export const fetchHistorialAnticiposByEtapa = async (etapaSeleccionada) => {
  try {
    const response = await api.get(`/anticipos/obtenerHistorialAnticiposbyEtapa/${etapaSeleccionada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error;
  }
};

export const fetchHistorialAnticiposDIFA = async (etapaSeleccionada) => {
  try {
    const response = await api.get(`/anticipos/obtenerHistorialAnticiposDIFA/${etapaSeleccionada}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error;
  }
};

export const fetchHistorialAnticiposDIFAByYear = async (year) => {
  try {
    const response = await api.get(`/anticipos/obtenerHistorialAnticiposDIFAbyYear/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
};

export const patchAnticipoAprobado = async (numeroAutorizacion, observacion, estado) => {
  try {
    const response = await api.patch(`/anticipos/modificarEstadoAnticipo/${numeroAutorizacion}`, { Estado: estado , observacion: observacion || ""});
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error; 
  }
};

export const patchLiquidacionAprobada = async (NumeroLiquidacion, observacion, estado) => {
  try {
    const response = await api.patch(
      `/anticipos/modificarEstadoLiquidacion/${NumeroLiquidacion}`,
      { observacion, Estado: estado }   // 👈 en el body
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error;
  }
};
