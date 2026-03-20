import api from "../Services/api";

export const obtenerCodigoLiquidacion = async () => {
  try {
    const response = await api.get(`/anticipos/obtenerCodigoLiquidacion`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener etapas:", error);
  }
};

export const fetchLiquidacionesPendientesJefe = async () => {
  try {
    const response = await api.get(`/anticipos/obtenerLiquidacionesJefe`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener etapas:", error);
  }
};

export const fetchHistorialLiquidacionesDIFA = async (etapaSeleccionada) => {
  try {
    const response = await api.get(`/anticipos/obtenerHistorialLiquidacionesDIFA/${etapaSeleccionada}`);
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
      { observacion, Estado: estado }   
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error;
  }
};

export const cargarLiquidacion = async (formData) => {
  try {
    const response = await api.post("/anticipos/cargarLiquidacion"
      ,formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error al cargar la liquidación:", error);
    throw error;
  }
};

export const fetchLiquidaciones = async () => {
  try {
    const response = await api.get("/anticipos/obtenerTodasLiquidaciones");
    return response.data;
  } catch (error) {
    console.error("Error fetching liquidaciones:", error);
    throw error; 
  }
};

export const fetchHistorialLiquidacionesDIFAByYear = async (year) => {
  try {
    const response = await api.get(`/anticipos/obtenerHistorialLiquidacionesDIFAbyYear/${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
};

export const fetchArchivosLiquidacion = async (numeroLiquidacion) => {
  try {
    const response = await api.get(`/anticipos/obtenerDocumentosLiquidacion/${numeroLiquidacion}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
  
};

export const fetchArchivoBlob = async (codigoArchivo) => {
  try {
    const response = await api.get(`/anticipos/downloadLiquidacion/${codigoArchivo}`, {
    responseType: "blob",
  });
    return response.data; 
  } catch (error) {
    console.error("Error fetching anticipos:", error);
    throw error;
  }
  
};

export const replaceArchivoLiquidacionApi = async (numeroLiquidacion, file) => {
  const form = new FormData();
  form.append("file", file);

  const r = await api.patch(
    `/liquidaciones/reemplazarDocumentoLiquidacion/${numeroLiquidacion}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return r.data;
};

export const fetchLiquidacionesPorEtapa = async (etapaSeleccionada) => {
  try {
    const response = await api.get(`/anticipos/obtenerLiquidacionesEtapas/${etapaSeleccionada}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener liquidaciones por etapa:", error);
    throw error;
  }
};

export const reemplazarArchivoLiquidacion = async (codigoArchivo, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.put(
    `/anticipos/reemplazarArchivoLiquidacion/${codigoArchivo}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};


