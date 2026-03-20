import '../pages/style.css';
import '../scenes/consultas/style.css';
import React, { useState } from 'react';
import {
  fetchEtapas,
  fetchEtapasLiquidacion,
  fetchAllAnticipos,
  fetchAllLiquidaciones,
  fetchAnticiposPorEtapa,
  fetchLiquidacionesPorEtapa,
  fetchAnticiposPorFechas,
  fetchLiquidacionesPorFechas
} from '../api/consultasApi';
import AnticiposTable from '../components/AnticiposTable';
import LiquidacionesTable from '../components/LiquidacionesTable';

const Consultas = () => {
  const [etapas, setEtapas] = useState([]);
  const [selectedEtapa, setSelectedEtapa] = useState("");
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [anticipos, setAnticipos] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [filtroActivo, setFiltroActivo] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("anticipos");

  const handleBuscarAnticipos = async () => {
    try {
      const data = await fetchAllAnticipos();
      setAnticipos(data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No se encontraron anticipos.");
      } else {
        setError("Ocurrió un error al cargar anticipos.");
      }
    }
  };

  const handleBuscarLiquidaciones = async () => {
    try {
      const data = await fetchAllLiquidaciones();
      setLiquidaciones(data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No se encontraron liquidaciones.");
      } else {
        setError("Ocurrió un error al cargar liquidaciones.");
      }
    }
  };

  const handleBuscarEtapas = async (tipo) => {
    try {
      const data = tipo === "anticipos" ? await fetchEtapas() : await fetchEtapasLiquidacion();
      setEtapas(data);
      setShowDropdown(true);
      setFiltroActivo("etapas");
      setTipoFiltro(tipo);
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No se encontraron etapas disponibles.");
      } else {
        setError("Ocurrió un error al cargar etapas.");
      }
    }
  };

  const handleEtapaChange = async (event) => {
    const nuevaEtapa = event.target.value;
    setSelectedEtapa(nuevaEtapa);
    try {
      if (tipoFiltro === "anticipos") {
        const data = await fetchAnticiposPorEtapa(nuevaEtapa);
        setAnticipos(data);
      } else {
        const data = await fetchLiquidacionesPorEtapa(nuevaEtapa);
        setLiquidaciones(data);
      }
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No se encontraron resultados para la etapa seleccionada.");
      } else {
        setError("Ocurrió un error al obtener los datos por etapa.");
      }
    }
  };

  const handleBuscarPorFechas = () => {
    setShowDateInput(true);
    setFiltroActivo("fechas");
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const handleBuscarPorFecha = async () => {
    const { startDate, endDate } = dateRange;
    try {
      if (tipoFiltro === "anticipos") {
        const data = await fetchAnticiposPorFechas(startDate, endDate);
        setAnticipos(data);
      } else {
        const data = await fetchLiquidacionesPorFechas(startDate, endDate);
        setLiquidaciones(data);
      }
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError("No se encontraron resultados para el rango de fechas seleccionado.");
      } else {
        setError("Ocurrió un error al buscar por fechas.");
      }
    }
  };

  return (
    <div className="App">
      <div className="header">CONSULTAS DEL SISTEMA</div>
      <div className="content-container">
        <div className="buttons-container">
          <div className="section">
            <h3>Anticipos</h3>
            <button className="button" onClick={handleBuscarAnticipos}>Todos los Anticipos</button>
            <button className="button" onClick={() => handleBuscarEtapas("anticipos")}>Anticipos por Estado de Aprobación</button>
            <button className="button" onClick={() => { handleBuscarPorFechas(); setTipoFiltro("anticipos"); }}>Anticipos por Rango de Fechas</button>
          </div>
          <div className="section">
            <h3>Liquidaciones</h3>
            <button className="button" onClick={handleBuscarLiquidaciones}>Todas las Liquidaciones</button>
            <button className="button" onClick={() => handleBuscarEtapas("liquidaciones")}>Liquidaciones por Estado de Aprobación</button>
            <button className="button" onClick={() => { handleBuscarPorFechas(); setTipoFiltro("liquidaciones"); }}>Liquidaciones por Rango de Fechas</button>
          </div>
        </div>

        <div className="filters-container">
          {filtroActivo === "etapas" && (
            <div className="dropdown-container">
              <h3>Selecciona una Etapa</h3>
              <select value={selectedEtapa} onChange={handleEtapaChange} className="dropdown-select">
                <option value="" disabled>-- Selecciona una etapa --</option>
                {etapas.map((etapa) => (
                  <option key={etapa.CodigoEtapa} value={etapa.CodigoEtapa}>
                    {etapa.Etapa}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filtroActivo === "fechas" && (
            <div className="date-picker-container">
              <h3>Selecciona un Rango de Fechas</h3>
              <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="date-input" />
              <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="date-input" />
              <button className="button" onClick={handleBuscarPorFecha}>Buscar</button>
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {anticipos.length > 0 && <AnticiposTable anticipos={anticipos} />}
        {liquidaciones.length > 0 && <LiquidacionesTable liquidaciones={liquidaciones} />}
      </div>
    </div>
  );
};

export default Consultas;
