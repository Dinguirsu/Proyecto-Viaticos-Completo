import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TextField, Typography, Box } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import { red } from '@mui/material/colors';
import api from "../../Services/api";

export const NombreEmpleadoComponent = ({onEmpleadoChange}) => {
  const [Empleado, setNombreEmpleado] = useState('');

  useEffect(() => {
    const fetchNombreEmpleado = async () => {
      try {
        const response = await api.get(`/anticipos/NombreEmpleado/`);
        setNombreEmpleado(response.data.Empleado);
        onEmpleadoChange(response.data);
      } catch (error) {
        console.error('Error fetching the employee name:', error);
      }
    };

    fetchNombreEmpleado();
  }, []);
  return ([]);
};

export const obtenerAnticipos = ({NumeroAutorizacion}) => {
  try {
    const response = api.get(`/anticipos/obtenerLiquidacionesByAnticipo/${NumeroAutorizacion}`);
    return (response.data);
  } catch (error) {
    console.error('Error fetching the employee name:', error);
  }
};

export const AreaEmpleadoComponent = ({onAreaChange}) => {
    const [Area, setAreaEmpleado] = useState('');
    const usuario = 'admin'; // El parámetro que quieres pasar
  
    useEffect(() => {
      const fetchAreaEmpleado = async () => {
        try {
          const response = await api.get(`/anticipos/AreaEmpleado`);
          setAreaEmpleado(response.data.Area);
          onAreaChange(response.data.Area);
        } catch (error) {
          console.error('Error fetching the employee area name:', error);
        }
      };
  
      fetchAreaEmpleado();
    }, []);
    return ([]);
  };

export const TipoEmpleadoComponent = ({onTipoEmpleado}) => {
  const [Tipo, setTipoEmpleado] = useState([]);
  const usuarioId = 100; // El parámetro que quieres pasar

  useEffect(() => {
    const fetchTipoEmpleado = async () => {
      try {
        const response = await api.get(`/anticipos/TipoEmpleado`);
        setTipoEmpleado(response.data.TipoCargo);
        onTipoEmpleado(response.data.CodigoTipoCargo)
      } catch (error) {
        console.error('Error fetching the type employee name:', error);
      }
    };

    fetchTipoEmpleado();
  }, []);
  return (
      <TextField
        hidden
        fullWidth
        variant="filled"
        type="text"
        label="Tipo Empleado"
        value={Tipo}
        name="tipo_empleado"
        sx={{ gridColumn: "span 2" }}
        InputLabelProps={{
          shrink: true
        }}
      />
  );
};

export const SelectContinentes = ({ onCountryChange, onLugar, onMunicipioChange, getMoneda, reset }) => {
  const [continentes, setContinentes] = useState([]);
  const [selectedContinente, setSelectedContinente] = useState(null);
  const [isPaisDisabled, setIsPaisDisabled] = useState(true);

  useEffect(() => {
    const fetchContinente = async () => {
      try {
        const response = await api.get(`/anticipos/continentes`);
        // Asegura array
        setContinentes(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching the Continent name:", error);
        setContinentes([]);
      }
    };
    fetchContinente();
  }, []);

  useEffect(() => {
    if (reset) {
      setSelectedContinente(null);
      setIsPaisDisabled(true);
    }
  }, [reset]);

  const handleContinenteChange = (event, newValue) => {
    setSelectedContinente(newValue || null);
    setIsPaisDisabled(!newValue);

    // (Opcional) si querés limpiar lugar/moneda cuando se borra continente:
    // if (!newValue) {
    //   onCountryChange?.(null);
    //   onLugar?.("");
    // }
  };

  return (
    <div>
      <Autocomplete
        value={selectedContinente}
        options={continentes}
        isOptionEqualToValue={(opt, val) => opt?.CodigoContinente === val?.CodigoContinente}
        getOptionLabel={(option) => option?.NombreContinente ?? ""}
        onChange={handleContinenteChange}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="filled"
            label="Seleccione un Continente"
            name="continente"
          />
        )}
      />

      {selectedContinente && (
        <CountrySelector
          continente={selectedContinente}
          onCountryChange={onCountryChange}
          onLugar={onLugar}
          onMunicipioChange={onMunicipioChange}   // ✅
          disabled={isPaisDisabled}
          getMoneda={getMoneda}
          reset={reset}
        />
      )}
    </div>
  );
};

export const CountrySelector = ({ continente, disabled, onCountryChange, onLugar, onMunicipioChange, getMoneda, reset }) => {
  const [paises, setPaises] = useState([]);
  const [selectedPais, setSelectedPais] = useState(null);
  const [isDeptoDisabled, setIsDeptoDisabled] = useState(true);

  useEffect(() => {
    const fetchPaises = async () => {
      if (!continente?.CodigoContinente) {
        setPaises([]);
        setSelectedPais(null);
        setIsDeptoDisabled(true);
        return;
      }

      try {
        const response = await api.get(`/anticipos/pais/${continente.CodigoContinente}`);
        setPaises(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching the countries:", error);
        setPaises([]);
      }
    };

    fetchPaises();
  }, [continente?.CodigoContinente]);

  useEffect(() => {
    if (reset) {
      setSelectedPais(null);
      setIsDeptoDisabled(true);
    }
  }, [reset]);

  const handleChange = (event, newValue) => {
    // si limpian el autocomplete
    if (!newValue) {
      setSelectedPais(null);
      setIsDeptoDisabled(true);
      onCountryChange?.(null);
      onLugar?.("");
      // (Opcional) moneda por defecto
      // getMoneda?.("2");
      return;
    }

    setSelectedPais(newValue);
    onCountryChange?.(newValue);

    const isHN = newValue.CodigoPais === "HN";
    setIsDeptoDisabled(!isHN);

    // moneda: 1 = HN, 2 = extranjero (según tu lógica)
    getMoneda?.(isHN ? "1" : "2");
    onLugar?.(newValue.NombrePais ?? "");
  };

  return (
    <div>
      <br />
      <Autocomplete
        value={selectedPais}
        disabled={disabled}
        onChange={handleChange}
        options={paises}
        isOptionEqualToValue={(opt, val) => opt?.CodigoPais === val?.CodigoPais}
        getOptionLabel={(option) => option?.NombrePais ?? ""}
        renderInput={(params) => (
          <TextField {...params} fullWidth variant="filled" label="Seleccione un País" name="pais_destino" />
        )}
      />

      {selectedPais?.CodigoPais === "HN" && (
        <Box gridTemplateColumns="repeat(2, minmax(0, 1fr))" sx={{ gridColumn: "span 2" }}>
          <DeptoSelector
            disabled={isDeptoDisabled}
            pais={selectedPais}
            onLugar={onLugar}
            onMunicipioChange={onMunicipioChange}  // ✅
            reset={reset}
          />
        </Box>
      )}
    </div>
  );
};

export const DeptoSelector = ({ pais, disabled, onLugar, onMunicipioChange, reset }) => {
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepto, setSelectedDepto] = useState(null);
  const [isMuniDisabled, setIsMuniDisabled] = useState(true);

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const isHN = pais?.CodigoPais === "HN";
      if (!isHN) {
        setDepartamentos([]);
        setSelectedDepto(null);
        setIsMuniDisabled(true);
        return;
      }

      try {
        const response = await api.get(`/anticipos/departamentos`);
        setDepartamentos(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching departamentos:", error);
        setDepartamentos([]);
      }
    };

    fetchDepartamentos();
  }, [pais?.CodigoPais]);

  useEffect(() => {
    if (reset) {
      setSelectedDepto(null);
      setIsMuniDisabled(true);
    }
  }, [reset]);

  const handleChange = (event, newValue) => {
  // Siempre que cambia depto, limpiar municipio
  onMunicipioChange?.(null);

  // Si limpiaron la selección:
  if (!newValue) {
    setSelectedDepto(null);
    setIsMuniDisabled(true);
    onLugar?.(""); // opcional: limpiar texto
    return;
  }

  // Selección válida
  setSelectedDepto(newValue);
  setIsMuniDisabled(false);
  onLugar?.(newValue.Nombre ?? "");
};


  return (
    <div>
      <br />
      <Autocomplete
        value={selectedDepto}
        disabled={disabled}
        onChange={handleChange}
        options={departamentos}
        isOptionEqualToValue={(opt, val) => opt?.IDDept === val?.IDDept}
        getOptionLabel={(option) => option?.Nombre ?? ""}
        renderInput={(params) => (
          <TextField {...params} fullWidth variant="filled" label="Seleccione un Departamento" name="departamento" />
        )}
      />

      {selectedDepto && (
        <MuniSelector
          depto={selectedDepto}
          onLugar={onLugar}
          onMunicipioChange={onMunicipioChange}  // ✅
          reset={reset}
        />
      )}
    </div>
  );
};

export const MuniSelector = ({ depto, onLugar, onMunicipioChange, reset, disabled }) => {
  const [municipios, setMunicipios] = useState([]);
  const [selectedMuni, setSelectedMuni] = useState(null);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!depto?.IDDept) {
        setMunicipios([]);
        setSelectedMuni(null);
        return;
      }

      try {
        const response = await api.get(`/anticipos/municipio/${depto.IDDept}`);
        setMunicipios(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching municipios:", error);
        setMunicipios([]);
      }
    };

    fetchMunicipios();
  }, [depto?.IDDept]);

  useEffect(() => {
    if (reset) {
      setSelectedMuni(null);
      onMunicipioChange?.(null);
      onLugar?.("");
    }
  }, [reset]);

  const handleChange = (event, newValue) => {
    setSelectedMuni(newValue || null);

    if (!newValue) {
      onMunicipioChange?.(null);
      onLugar?.("");
      return;
    }

    onMunicipioChange?.(newValue);         // {IDMunicipio, Nombre}
    onLugar?.(newValue.Nombre ?? "");
  };

  return (
    <div>
      <br />
      <Autocomplete
        value={selectedMuni}
        onChange={handleChange}
        disabled={disabled}
        options={municipios}
        isOptionEqualToValue={(opt, val) => opt?.IDMunicipio === val?.IDMunicipio}
        getOptionLabel={(option) => option?.Nombre ?? ""}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="filled"
            label="Seleccione un Municipio"
            name="municipio"
          />
        )}
      />
    </div>
  );
};


export const TransporteComponent = ({onSelectTransport, onSelectRegitro}) => {
  const [Transporte, setTransporte] = useState([]);
  const [selectedTransporte, setSelectedTransporte] = useState(null);

  useEffect(() => {
    const fetchTransporte = async () => {
      try {
        const response = await api.get(`/anticipos/transporte`);
        setTransporte(response.data);
      } catch (error) {
        console.error('Error fetching the type transport:', error);
      }
    };

    fetchTransporte();
  }, []);

  const handleChange = (event, newValue) => {
    setSelectedTransporte(newValue);
    onSelectTransport(newValue);
  };
  return (
    <div>
      <Autocomplete
        options={Transporte}
        getOptionLabel={(option) => option.DescripcionTransporte}
        onChange={handleChange}
        renderInput={(params) => 
          <TextField
            {...params}  
            fullWidth       
            variant="filled"
            type="text"
            label="Seleccione el Medio de Transporte"
            name="transporte"
          />
        }
      />
      {selectedTransporte && selectedTransporte.IDTransporte === 1  && (
        <PlacaVehiculoComponent
          onSelectRegitro={onSelectRegitro}
        />
      )}
    </div>
  );
};

export const PlacaVehiculoComponent = ({onSelectRegitro}) => {
  const [Placa, setPlacaVehiculo] = useState([]);
  const [Registro, setRegistroVehiculo] = useState('');

  useEffect(() => {
    const fetchPlacaVehiculo = async () => {
      try {
        const response = await api.get(`/anticipos/placa`);
        setPlacaVehiculo(response.data);
      } catch (error) {
        console.error('Error fetching the type placa:', error);
      }
    };

    fetchPlacaVehiculo();
  }, []);

  const handleChange = (event, newValue) => {
    setRegistroVehiculo(newValue);
    if (onSelectRegitro) {
      onSelectRegitro(newValue);
    }
  };
  return (
    <div>
      <br></br>
      <Autocomplete
        onChange={handleChange}
        options={Placa}
        getOptionLabel={(option) => option.NoPlaca}
        renderInput={(params) => 
        <TextField
          {...params}  
          fullWidth       
          variant="filled"
          type="text"
          label="Seleccione Nº de Placa"
          name="Numero_Placa"
        />}
      />
    </div>
  );
};

export const GetTotalAnticipos = ({onGetDatos, onGetEstado}) => {
  const [Anticipos, setTotalAnticipos] = useState('');
  const [Estado, setEstado] = useState('');

  useEffect(() => {
    const fetchTotalAnticipos = async () => {
      try {
        const response = await api.get(`/anticipos/totalAnticipos`);
        setTotalAnticipos(response.data[0].total);
        const totalAnticipos = response.data[0].total;
        onGetDatos(response.data[0].total + 1);
        await enviarTotalAlBackend(totalAnticipos);
      } catch (error) {
        console.error('Error fetching the employee name:', error);
      }
    };

    const enviarTotalAlBackend = async (total) => {
      try {
        const response = await api.get(`/anticipos/obtenerEtapa/${total}`)
        setEstado(response.data[0].CodigoEtapa);
        onGetEstado(response.data[0].Etapa);
      } catch (error) {
        console.error('Error enviando el total al backend:', error);
      }
    };

    fetchTotalAnticipos();
  }, []);

  return (
    <Box gridTemplateColumns="repeat(4, minmax(0, 1fr))" sx={{ width: '13%', gridColumn: "span 2" }}>
      <Typography variant="body1">Autorizacion de Anticipo No. :</Typography>
        <Typography variant="subtitle1" sx={{ bgcolor: '#333', padding: '8px', borderRadius: '4px' }}>
          {Anticipos + 1}
      </Typography>
      
        <Typography hidden variant="subtitle1" sx={{ bgcolor: '#333', padding: '8px', borderRadius: '4px' }}>
          {Estado}
      </Typography>
    </Box>
  );
};

export const postAnticiposGastoViaje = async (data) => {
  try {
    const response = await api.post('/anticipos/ingresoFormulario', data);
    return response.data;
  } catch (error) {
    console.error('Error posting anticipos detalle mision:', error);
    throw error;
  }
};

export const postAnticiposDetalleMision = async (data) => {
  try {
    const response = await api.post('/anticipos/ingresoFormularioDetalle', data);
    return response.data;
  } catch (error) {
    console.error('Error posting anticipos detalle mision:', error);
    throw error;
  }
};

export const TipoCambioComponent = ({getCambio}) => {
  const [Cambio, setTipoCambio] = useState('');

  useEffect(() => {
    const fetchCambioDivisa = async () => {
      try {
        const response = await api.get(`/anticipos/obtenerCambioDolar`);
        const cotizacion = response.data[0].CotizacionDolarVenta; // Valor por defecto si es undefined
        setTipoCambio(cotizacion);
        getCambio(cotizacion);
      } catch (error) {
        console.error('Error fetching divisa:', error);
      }
    };

    fetchCambioDivisa();
  }, []);
  return ([]);
};

export const GetCodigoZonaViaticoHN = async (NombreMunicipio) => {
  try {
    if (!NombreMunicipio || typeof NombreMunicipio !== "string") return null;

    const response = await api.get(`/anticipos/obtenerCodigoZonaViaticoHN/${encodeURIComponent(NombreMunicipio)}`);
    return response?.data?.[0]?.CodigoZonaViaticos ?? null;
  } catch (error) {
    console.error("Error fetching Codigo:", error);
    return null;
  }
};


export const GetCodigoZonaViatico = async (NombrePais) => {
  try {
    if (!NombrePais || typeof NombrePais !== "string") return null;

    const response = await api.get(`/anticipos/obtenerCodigoZonaViatico/${encodeURIComponent(NombrePais)}`);
    return response?.data?.[0]?.CodigoZona ?? null;
  } catch (error) {
    console.error("Error fetching Codigo:", error);
    return null;
  }
};


export const GetMontoViaticoLempiras = async (data) => {
  try {
    if (!data || typeof data !== "object") return null;
    const response = await api.get(`/anticipos/obtenerMontoViaticoLempiras`, { params: data });
    return response?.data?.[0]?.Monto ?? null;
  } catch (error) {
    console.error("Error fetching viatico lempiras:", error);
    return null;
  }
};


export const GetMontoViaticoDolares = async (data) => {
  try {
    const response = await api.get('/anticipos/obtenerMontoViaticoDolares', {
      params: data
    });
    return response.data[0].Monto
  } catch (error) {
    console.error('Error fetching divisa:', error);
  }
};