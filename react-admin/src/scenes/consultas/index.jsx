import '../consultas/style.css';
import axios from "axios";
import { obtenerEtapas } from '../../Services/anticiposService';
import api from '../../Services/api';

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions, 
  Snackbar
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { dataGridSx } from "../../scenes/form/datagridStyles"; // ajusta ruta
import { fetchArchivosLiquidacion, fetchArchivoBlob, reemplazarArchivoLiquidacion } from "../../Services/liquidacionesService";
import { fetchAnticiposPorFechas } from "../../Services/anticiposService"
import { fetchAnticiposTablaConsulta } from "../../Services/anticiposService";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { useRef } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";

const CustomToolbar = () => (
  <GridToolbarContainer sx={{ justifyContent: "flex-end" }}>
    <GridToolbarQuickFilter placeholder="Buscar..." debounceMs={300} />
  </GridToolbarContainer>
);


const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box>{children}</Box>}</div>
);

const Consultas = () => {
  // ====== TUS ESTADOS ======
  const [etapas, setEtapas] = useState([]);
  const [selectedEtapa, setSelectedEtapa] = useState("");
  const [error, setError] = useState(null);

  const [anticipos, setAnticipos] = useState([]);
  const [liquidaciones, setliquidaciones] = useState([]);

  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const [filtroActivo, setFiltroActivo] = useState(""); // "etapas" | "fechas" | ""
  const [tipoFiltroActivo, setTipoFiltroActivo] = useState(""); // "anticipo" | "liquidacion"
  const [tipoFiltro, setTipoFiltro] = useState("anticipos"); // lo tenías, lo dejo

  // ✅ Nuevo: tabs para separar Anticipos/Liquidaciones
  const [tabIndex, setTabIndex] = useState(0); // 0 anticipos, 1 liquidaciones

  const [openPreview, setOpenPreview] = useState(false);
  const [liqSel, setLiqSel] = useState(null);

  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState("");
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const [fileToUpload, setFileToUpload] = useState(null);
  const [modoEditarArchivo, setModoEditarArchivo] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const inputFileReplaceRef = useRef(null);
  const liquidacionAprobada = liqSel?.Etapa === "ETP_LIQ_APROBADO";

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // info | warning | error | success
  });

  const mostrarMensaje = (message, severity = "info") => {
  setSnackbar({
    open: true,
    message,
    severity,
  });
};

  // ====== API FUNCTIONS (TUS MISMAS, SOLO ORGANIZADAS) ======
  const fetchEtapas = async () => {
    try {
      const response = await api.get(`/anticipos/obtenerEtapas`);
      setEtapas(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener etapas:", e);
      setError("No se pudieron cargar las etapas.");
    }
  };

  const fetchEtapasLiquidacion = async () => {
    try {
      const response = await api.get(`/anticipos/obtenerEtapasLiquidacion/`);
      setEtapas(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener etapas:", e);
      setError("No se pudieron cargar las etapas.");
    }
  };

  const fetchAllAnticipos = async () => {
    try {
      const response = await api.get(`/anticipos/obtenerAnticiposByIDEmpleadoConsulta`);
      setAnticipos(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener anticipos:", e);
      setError("No se pudieron cargar los anticipos.");
      setAnticipos([]);
    }
  };

  const fetchAllLiquidaciones = async () => {
    try {
      const response = await api.get(`/anticipos/obtenerAnticipoParaLiquidar`);
      setliquidaciones(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener liquidaciones:", e);
      setError("No se pudieron cargar las liquidaciones.");
      setliquidaciones([]);
    }
  };

  const fetchAnticipos = async (etapaSeleccionada) => {
    try {
      const response = await api.get(
        `/anticipos/obtenerAnticipoEtapas/${etapaSeleccionada}`
      );
      setAnticipos(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener anticipos:", e);
      setError("No se encontraron anticipos para esta etapa.");
      setAnticipos([]);
    }
  };

  const fetchLiquidacionesPorEtapa = async (etapaSeleccionada) => {
    try {
      const response = await api.get(
        `/anticipos/obtenerLiquidacionesEmpleadoXEtapas/${etapaSeleccionada}`
      );
      setliquidaciones(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener liquidaciones por etapa:", e);
      setError("No se encontraron liquidaciones para esta etapa.");
      setliquidaciones([]); // ✅ FIX
    }
  };

  const fetchAnticiposPorFechas = async () => {
    const { startDate, endDate } = dateRange;
    try {
      const response = await api.get(
        `/anticipos/obtenerAnticipoFecha/${startDate}/${endDate}`
      );
      setAnticipos(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener anticipos por fechas:", e);
      setError("No se encontraron anticipos para este rango de fechas.");
      setAnticipos([]);
    }
  };

  const fetchLiquidacionesPorFechas = async () => {
    const { startDate, endDate } = dateRange;
    try {
      const response = await api.get(
        `/anticipos/obtenerLiquidacionesFecha/${startDate}/${endDate}`
      );
      setAnticipos(response.data);
      setError(null);
    } catch (e) {
      console.error("Error al obtener anticipos por fechas:", e);
      setError("No se encontraron anticipos para este rango de fechas.");
      setAnticipos([]);
    }
  };

  // ====== HANDLERS (basado en tu lógica original) ======
  const handleBuscarClick = async () => {
    await fetchEtapas();
    setFiltroActivo("etapas");
    setTipoFiltroActivo("anticipo");
  };

  const handleBuscarClickLiquidacion = async () => {
    await fetchEtapasLiquidacion();
    setFiltroActivo("etapas");
    setTipoFiltroActivo("liquidacion");
  };

  const handleEtapaChange = (event) => {
    const nuevaEtapa = event.target.value;
    setSelectedEtapa(nuevaEtapa);
    fetchAnticipos(nuevaEtapa);
  };

  const handleEtapaChangeLIQ = (event) => {
    const nuevaEtapa = event.target.value;
    setSelectedEtapa(nuevaEtapa);
    fetchLiquidacionesPorEtapa(nuevaEtapa);
  };

  const handleBuscarPorFechasClick = () => {
    setFiltroActivo("fechas");
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // ====== TAB CHANGE: reset filtros y cargar data base ======
  useEffect(() => {
    setError(null);
    setSelectedEtapa("");
    setDateRange({ startDate: "", endDate: "" });
    setFiltroActivo("");

    if (tabIndex === 0) {
      setTipoFiltro("anticipos");
      // opcional: carga inicial
      // fetchAllAnticipos();
    } else {
      setTipoFiltro("liquidaciones");
      // opcional: carga inicial
      // fetchAllLiquidaciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabIndex]);

  // ====== COLUMNAS DATAGRID ======
  const anticiposColumns = useMemo(
    () => [
      { field: "NumeroAutorizacion", headerName: "N° Autorización", flex: 0.5, minWidth: 160 },
      {
        field: "FechaIngreso",
        headerName: "Fecha Ingreso",
        flex: 0.5,
        minWidth: 140,
        valueFormatter: (value) => {
          if (!value) return "";
          return String(value).split("T")[0];
        },
      },
      { field: "Empleado", headerName: "Empleado", flex: 1, minWidth: 220 },
      { field: "Area", headerName: "Área", flex: 1.1, minWidth: 180 },
      { field: "Etapa", headerName: "Etapa", flex: 1, minWidth: 160 },
    ],
    []
  );

  const safeDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().split("T")[0];
  };

const liquidacionesColumns = [
  { field: "NumeroLiquidacion", headerName: "N° Liquidación", flex: 0.5, minWidth: 160 },
  { field: "NumeroAutorizacionAnticipo", headerName: "N° Anticipo", flex: 0.5, minWidth: 180 },
  { field: "Etapa", headerName: "Etapa", flex: 1.4, minWidth: 160 },  
  { field: "Observaciones", headerName: "Observaciones", flex: 1, minWidth: 240 },
  {
    field: "FechaIngreso",
    headerName: "Fecha Ingreso",
    flex: 0.5,
    minWidth: 140,
    valueFormatter: (value) => {
      if (!value) return "";
      return String(value).split("T")[0];
    },
  },
  {
    field: "Monto",
    headerName: "Monto",
    flex: 0.8,
    minWidth: 140,
    renderCell: (params) => {
      const n = Number(params.row?.Monto);
      return Number.isFinite(n) ? `L ${n.toFixed(2)}` : "L 0.00";
    },
  },
  {
    field: "acciones",
    headerName: "Archivo",
    flex: 0.6,
    minWidth: 120,
    sortable: false,
    filterable: false,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => {
      // ✅ opcional: si tu fila trae algo como CantidadArchivos / TieneArchivo / DocsCount
      const maybeCount =
        params.row?.CantidadArchivos ??
        params.row?.DocsCount ??
        params.row?.TotalArchivos ??
        params.row?.Etapa === "ETP_LIQ_APROBADO" ??
        null;

      const disabled = maybeCount === 0; // si no existe, queda habilitado

      return (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Ver / cambiar archivo" arrow>
            <span>
              <IconButton size="small" onClick={() => handleOpenPreview(params.row)} disabled={disabled}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      );
    },
  }
];

const getPreviewKind = (mime = "") => {
  const m = String(mime).toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.startsWith("image/")) return "image";
  return "download";
};

const handleOpenPreview = async (row) => {
  setLiqSel(row);
  setOpenPreview(true);

  try {
    setCargandoArchivo(true);
    setArchivos([]);
    setArchivoSeleccionado(null);

    const resp = await fetchArchivosLiquidacion(row.NumeroLiquidacion);
    const lista = Array.isArray(resp) ? resp : (resp?.data || []);
    setArchivos(lista);

    if (lista?.length) {
      setArchivoSeleccionado(lista[0]);

      if (archivoUrl) URL.revokeObjectURL(archivoUrl);
      const blob = await fetchArchivoBlob(lista[0].CodigoArchivo);
      const url = URL.createObjectURL(blob);
      setArchivoUrl(url);
    } else {
      if (archivoUrl) URL.revokeObjectURL(archivoUrl);
      setArchivoUrl("");
    }
  } catch (e) {
    console.error("Error cargando archivos:", e);
  } finally {
    setCargandoArchivo(false);
  }
};

const handleClosePreview = () => {
  setOpenPreview(false);
  setArchivos([]);
  setArchivoSeleccionado(null);
  setLiqSel(null);

  if (archivoUrl) {
    URL.revokeObjectURL(archivoUrl);
    setArchivoUrl("");
  }
};

const handleSelectArchivo = async (codigoArchivo) => {
  try {
    const archivo = archivos.find(
      (a) => String(a.CodigoArchivo) === String(codigoArchivo)
    );

    setArchivoSeleccionado(archivo || null);

    if (archivoUrl) URL.revokeObjectURL(archivoUrl);

    if (!archivo) {
      setArchivoUrl("");
      return;
    }

    const blob = await fetchArchivoBlob(archivo.CodigoArchivo);
    const url = URL.createObjectURL(blob);
    setArchivoUrl(url);
  } catch (error) {
    console.error("Error seleccionando archivo:", error);
    setArchivoUrl("");
  }
};

  const anticiposRows = useMemo(
    () => (anticipos || []).filter(Boolean).map((r, idx) => ({ id: idx, ...r })),
    [anticipos]
  );

  const liquidacionesRows = useMemo(
    () => (liquidaciones || []).filter(Boolean).map((r, idx) => ({ id: idx, ...r })),
    [liquidaciones]
  );

  const handleClickReplaceArchivo = () => {
      if (liqSel?.Etapa === "ETP_LIQ_APROBADO") {
      mostrarMensaje(
        "No puedes modificar el archivo porque la liquidación ya fue aprobada.",
        "warning"
      );
      return;
    }

    if (!archivoSeleccionado?.CodigoArchivo) {
      mostrarMensaje("Selecciona un archivo primero.", "info");
      return;
    }

    inputFileReplaceRef.current?.click();
    };

  const handleReplaceArchivo = async (event) => {
      if (liqSel?.Etapa === "ETP_LIQ_APROBADO") {
        mostrarMensaje(
          "La liquidación está aprobada, no se permiten cambios.",
          "warning"
        );
        event.target.value = "";
        return;
      }

      const file = event.target.files?.[0];
      if (!file) return;

      try {
        setSubiendoArchivo(true);

        await reemplazarArchivoLiquidacion(
          archivoSeleccionado.CodigoArchivo,
          file
        );

        mostrarMensaje("Archivo reemplazado correctamente.", "success");

        const resp = await fetchArchivosLiquidacion(liqSel.NumeroLiquidacion);
        const lista = Array.isArray(resp) ? resp : (resp?.data || []);
        setArchivos(lista);

        const actualizado = lista.find(
          (a) => String(a.CodigoArchivo) === String(archivoSeleccionado.CodigoArchivo)
        );

        if (actualizado) {
          setArchivoSeleccionado(actualizado);

          if (archivoUrl) URL.revokeObjectURL(archivoUrl);

          const blob = await fetchArchivoBlob(actualizado.CodigoArchivo);
          const url = URL.createObjectURL(blob);
          setArchivoUrl(url);
        }
      } catch (error) {
        console.error("Error reemplazando archivo:", error);
        mostrarMensaje("No puede cambiar el archivo de una liquidacion aprobada", "error");
      } finally {
        setSubiendoArchivo(false);
        event.target.value = "";
      }
    };
  // ====== RENDER ======
  return (
    <Box sx={{ p: 2, color: "#fff" }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Consultas del Sistema
        </Typography>
        <Typography sx={{ opacity: 0.75, mt: 0.5 }}>
          Consultá información con filtros por etapa o fechas.
        </Typography>
      </Box>

      {/* Tabs tipo segmented */}
      <Box
        sx={{
          mb: 2,
          mx: "auto",
          maxWidth: 520,
          p: 0.5,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, v) => setTabIndex(v)}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 1.5,
              color: "rgba(255,255,255,0.75)",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#fff",
              bgcolor: "rgba(11,114,133,0.25)",
            },
          }}
        >
          <Tab label="Anticipos" />
          <Tab label="Liquidaciones" />
        </Tabs>
      </Box>

      {/* Cards: Acciones + Filtros */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <Card
          sx={{
            bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 900, mb: 1, color: "#e5e7eb" }}>
              Acciones rápidas
            </Typography>

            <Stack spacing={1.2}>
              {/* ✅ Todos */}
              <Button
                variant="contained"
                fullWidth
                onClick={tabIndex === 0 ? fetchAllAnticipos : fetchAllLiquidaciones}
                sx={{
                  backgroundColor: "#0b7285",
                  fontWeight: 800,
                  color: "#fff",
                  "&:hover": { backgroundColor: "#0a6374" },
                }}
              >
                {tabIndex === 0 ? "TODOS LOS ANTICIPOS" : "TODAS LAS LIQUIDACIONES"}
              </Button>

              {/* ✅ Por etapa */}
              <Button
                variant="outlined"
                fullWidth
                onClick={tabIndex === 0 ? handleBuscarClick : handleBuscarClickLiquidacion}
                sx={{
                  color: "#e5e7eb",
                  borderColor: "rgba(255,255,255,0.18)",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "#0b7285",
                    color: "#fff",
                  },
                }}
              >
                {tabIndex === 0
                  ? "ANTICIPOS POR ESTADO (ETAPA)"
                  : "LIQUIDACIONES POR ESTADO (ETAPA)"}
              </Button>

              {/* ✅ Por fechas */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setFiltroActivo("fechas");
                  // opcional: para limpiar etapa al cambiar a fechas
                  setSelectedEtapa("");
                }}
                sx={{
                  color: "#e5e7eb",
                  borderColor: "rgba(255,255,255,0.18)",
                  fontWeight: 700,
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "#0b7285",
                    color: "#fff",
                  },
                }}
              >
                {tabIndex === 0
                  ? "ANTICIPOS POR RANGO DE FECHAS"
                  : "LIQUIDACIONES POR RANGO DE FECHAS"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            bgcolor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography sx={{ fontWeight: 900, mb: 1 }}>
              Filtros
            </Typography>

            {filtroActivo === "" && (
              <Typography sx={{ opacity: 0.75 }}>
                Seleccioná “Por Estado” o “Por Fechas” para habilitar filtros.
              </Typography>
            )}

            {filtroActivo === "etapas" && (
              <Stack spacing={1.5}>
                <TextField
                  select
                  size="small"
                  label="Seleccionar etapa"
                  value={selectedEtapa}
                  onChange={tabIndex === 0 ? handleEtapaChange : handleEtapaChangeLIQ}
                >
                  <MenuItem value="" disabled>
                    -- Selecciona una etapa --
                  </MenuItem>
                  {etapas.map((et) => (
                    <MenuItem key={et.CodigoEtapa} value={et.CodigoEtapa}>
                      {et.Etapa}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography sx={{ opacity: 0.7, fontSize: 13 }}>
                  Al seleccionar una etapa se ejecuta la búsqueda automáticamente.
                </Typography>
              </Stack>
            )}

            {filtroActivo === "fechas" && (
              <Stack spacing={1.5}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <TextField
                    size="small"
                    type="date"
                    label="Desde"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    type="date"
                    label="Hasta"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={tabIndex === 0 ? fetchAnticiposPorFechas : fetchLiquidacionesPorFechas}
                  disabled={!dateRange.startDate || !dateRange.endDate}
                >
                  Buscar {tabIndex === 0 ? "Anticipos" : "Liquidaciones"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">{error}</Alert>
        </Box>
      )}

      {/* Resultados */}
      <Card
        sx={{
          bgcolor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontWeight: 900 }}>
              Resultados de {tabIndex === 0 ? "Anticipos" : "Liquidaciones"}
            </Typography>
            <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
              {(tabIndex === 0 ? anticiposRows.length : liquidacionesRows.length)} registros
            </Typography>
          </Box>

          <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.10)" }} />

          <Box sx={{ height: 460, width: "100%" }}>
            <DataGrid
              rows={tabIndex === 0 ? anticiposRows : liquidacionesRows}
              columns={tabIndex === 0 ? anticiposColumns : liquidacionesColumns}
              sx={{
                ...dataGridSx,
                ...(tabIndex === 1
                  ? {
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#364fc7",
                        color: "#fff",
                        fontWeight: "bold",
                        borderBottom: "none",
                      },
                      "& .MuiDataGrid-row:hover": {
                        backgroundColor: "rgba(54, 79, 199, 0.08)",
                      },
                    }
                  : {}),
              }}
              disableRowSelectionOnClick
              density="compact"
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              slots={{ toolbar: CustomToolbar }}
            />

            <Dialog open={openPreview} onClose={handleClosePreview} fullWidth maxWidth="md">
              <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  Archivos de Liquidación {liqSel?.NumeroLiquidacion ?? ""}
                  <Typography sx={{ fontSize: 12, opacity: 0.75, mt: 0.5 }}>
                    {liquidacionAprobada
                      ? "Liquidación aprobada: archivo bloqueado para edición"
                      : "Vista previa y reemplazo de archivo"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Tooltip title={!archivoUrl ? "No hay archivo cargado" : "Abrir en otra pestaña"} arrow>
                    <span>
                      <IconButton
                        onClick={() => archivoUrl && window.open(archivoUrl, "_blank")}
                        disabled={!archivoUrl}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                        }}
                      >
                        <OpenInNewOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip
                    title={
                    liquidacionAprobada
                      ? "No se puede reemplazar el archivo porque la liquidación está aprobada"
                      : !archivoSeleccionado?.CodigoArchivo
                      ? "Seleccione un archivo"
                      : "Cambiar archivo"
                  }
                    arrow
                  >
                    <span>
                      <IconButton
                        onClick={handleClickReplaceArchivo}
                        disabled={!archivoSeleccionado?.CodigoArchivo || subiendoArchivo ||
                        liquidacionAprobada}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </DialogTitle>

              <DialogContent dividers>
                <input
                  ref={inputFileReplaceRef}
                  type="file"
                  hidden
                  accept=".pdf,image/*"
                  onChange={handleReplaceArchivo}
                />

                {cargandoArchivo ? (
                  <Typography>Cargando archivo...</Typography>
                ) : archivos.length === 0 ? (
                  <Typography>No hay archivos adjuntos.</Typography>
                ) : (
                  <>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Seleccionar archivo"
                      value={archivoSeleccionado?.CodigoArchivo ?? ""}
                      onChange={(e) => handleSelectArchivo(e.target.value)}
                      sx={{ mb: 2 }}
                    >
                      {archivos.map((a) => (
                        <MenuItem key={a.CodigoArchivo} value={a.CodigoArchivo}>
                          {a.Nombre} ({a.ContenidoTipo})
                        </MenuItem>
                      ))}
                    </TextField>

                    {subiendoArchivo && (
                      <Typography sx={{ mb: 2 }}>
                        Reemplazando archivo...
                      </Typography>
                    )}

                    <Box
                      sx={{
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 2,
                        overflow: "hidden",
                        height: 460,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0f172a",
                      }}
                    >
                      {!archivoUrl ? (
                        <Typography>No hay archivo para mostrar.</Typography>
                      ) : (() => {
                          const mime = (archivoSeleccionado?.ContenidoTipo || "").toLowerCase();
                          const kind = getPreviewKind(mime);

                          if (kind === "pdf") {
                            return (
                              <iframe
                                title="preview-pdf"
                                src={`${archivoUrl}#toolbar=0`}
                                style={{ width: "100%", height: "100%", border: 0 }}
                              />
                            );
                          }

                          if (kind === "image") {
                            return (
                              <img
                                alt="preview"
                                src={archivoUrl}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            );
                          }

                          return (
                            <Typography>
                              Tipo de archivo no compatible para vista previa.
                            </Typography>
                          );
                        })()}
                    </Box>
                  </>
                )}
              </DialogContent>

              <DialogActions>
                <Button
                  startIcon={<UploadFileOutlinedIcon />}
                  onClick={handleClickReplaceArchivo}
                  disabled={!archivoSeleccionado?.CodigoArchivo || subiendoArchivo ||
                  liquidacionAprobada}
                >
                  Cambiar archivo
                </Button>

                <Snackbar
                  open={snackbar.open}
                  autoHideDuration={4000}
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                  <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                  >
                    {snackbar.message}
                  </Alert>
                </Snackbar>

                <Button onClick={handleClosePreview}>Cerrar</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Consultas;
