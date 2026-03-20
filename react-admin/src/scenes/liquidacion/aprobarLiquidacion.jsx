import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { dataGridSx } from '../form/datagridStyles';
import {
  fetchLiquidacionesPendientesJefe,
  patchLiquidacionAprobada,
  fetchArchivoBlob,
  fetchArchivosLiquidacion
} from "../../Services/liquidacionesService";

const DashboardLiquidaciones = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [liquidaciones, setLiquidaciones] = useState([]);

  // ✅ Archivos / preview (agregado)
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState(""); // objectURL
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  // diálogo aprobación
  const [openDialog, setOpenDialog] = useState(false);
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] = useState(null);
  const [comentario, setComentario] = useState("");
  const [aprobando, setAprobando] = useState(false);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );

  const cargarDatos = async () => {
    try {
      const data = await fetchLiquidacionesPendientesJefe();
      setLiquidaciones(data || []);
    } catch (error) {
      console.error("Error cargando liquidaciones:", error);
      setLiquidaciones([]);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatCurrency = (value) => {
    if (value == null) return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // ✅ Abrir diálogo + cargar archivos y preview (adaptado)
  const handleOpenDialog = async (row) => {
    setLiquidacionSeleccionada(row);
    setComentario("");
    setOpenDialog(true);

    try {
      setCargandoArchivo(true);
      setArchivos([]);
      setArchivoSeleccionado(null);

      // traer lista de archivos
      const resp = await fetchArchivosLiquidacion(row.NumeroLiquidacion);
      const lista = Array.isArray(resp) ? resp : (resp?.data || []);
      setArchivos(Array.isArray(lista) ? lista : []);

      // auto seleccionar el primero y cargar blob
      if (lista?.length) {
        setArchivoSeleccionado(lista[0]);

        if (archivoUrl) URL.revokeObjectURL(archivoUrl);
        setArchivoUrl("");

        const blob = await fetchArchivoBlob(lista[0].CodigoArchivo);
        const url = URL.createObjectURL(blob);
        setArchivoUrl(url);
      } else {
        if (archivoUrl) URL.revokeObjectURL(archivoUrl);
        setArchivoUrl("");
      }
    } catch (e) {
      console.error("Error cargando archivos:", e);
      if (archivoUrl) URL.revokeObjectURL(archivoUrl);
      setArchivoUrl("");
    } finally {
      setCargandoArchivo(false);
    }
  };

  // ✅ Seleccionar archivo del combo y refrescar preview (adaptado)
  const handleSelectArchivo = async (codigoArchivo) => {
    const fileMeta = archivos.find((a) => a.CodigoArchivo === codigoArchivo);
    setArchivoSeleccionado(fileMeta);

    try {
      setCargandoArchivo(true);
      if (archivoUrl) URL.revokeObjectURL(archivoUrl);
      setArchivoUrl("");

      const blob = await fetchArchivoBlob(codigoArchivo);
      const url = URL.createObjectURL(blob);
      setArchivoUrl(url);
    } catch (e) {
      console.error("Error cargando archivo:", e);
    } finally {
      setCargandoArchivo(false);
    }
  };

  // ✅ Cerrar diálogo + limpiar objectURL (adaptado)
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLiquidacionSeleccionada(null);
    setComentario("");

    setArchivos([]);
    setArchivoSeleccionado(null);

    if (archivoUrl) URL.revokeObjectURL(archivoUrl);
    setArchivoUrl("");
  };

  const handleAprobar = async () => {
    if (!liquidacionSeleccionada) return;

    try {
      setAprobando(true);

      await patchLiquidacionAprobada(
        liquidacionSeleccionada.NumeroLiquidacion,
        comentario,
        'ETP_PEN_LIQ_ASISTENTE'
      );

      await cargarDatos();
      handleCloseDialog();
    } catch (error) {
      console.error("Error al aprobar liquidación:", error);
    } finally {
      setAprobando(false);
    }
  };

  const columns = [
    {
      field: "NumeroLiquidacion",
      headerName: "N° Liquidación",
      flex: 1,
      minWidth: 140
    },
    { field: "NumeroAutorizacionAnticipo", headerName: "Nº Anticipo", flex: 1, minWidth: 140},
    { field: "Empleado", headerName: "Empleado", flex: 1.2, minWidth: 160 },
    { field: "Area", headerName: "Área", flex: 1, minWidth: 140 },
    {
      field: "FechaIngreso",
      headerName: "Fecha de Ingreso",
      flex: 0.8,
      minWidth: 130,
    },
    {
      field: "Monto",
      headerName: "Monto Liquidación",
      flex: 0.9,
      minWidth: 150,
      renderCell: (params) => (
        <span>{formatCurrency(params.row?.Monto)}</span>
      ),
    },
    {
      field: "Etapa",
      headerName: "Estado",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.row?.Etapa || "—"}
          size="small"
          color="success"
          variant="outlined"
        />
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 0.8,
      minWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleOpenDialog(params.row)}
        >
          Aprobar
        </Button>
      ),
    },
  ];

  const rows = (liquidaciones || [])
    .filter((r) => r != null)
    .map((r, idx) => ({ id: idx, ...r }));

  return (
    <Box sx={{ width: "100%", typography: "body1", mt: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        centered
      >
        <Tab label="Liquidaciones del Área" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 3 }}>
          Liquidaciones para Aprobar
        </Typography>

        <Box
          sx={{
            height: 500,
            width: "100%",
            mt: 2,
            "& .MuiDataGrid-root": { borderRadius: 2 },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#0b7285",
              color: "#fff",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(11, 114, 133, 0.08)",
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            density="comfortable"
            autoHeight={false}
            sx={dataGridSx}
            slots={{ toolbar: GridToolbar }}
          />
        </Box>
      </TabPanel>

      {/* ✅ Diálogo aprobación + Preview (adaptado) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          Aprobar liquidación {liquidacionSeleccionada?.NumeroLiquidacion || ""}
        </DialogTitle>

        <DialogContent dividers>
          {liquidacionSeleccionada && (
            <Box mb={2}>
              <Typography variant="subtitle2">
                N° Liquidación: {liquidacionSeleccionada.NumeroLiquidacion}
              </Typography>
              <Typography variant="subtitle2">
                Empleado: {liquidacionSeleccionada.Empleado}
              </Typography>
              <Typography variant="subtitle2">
                Área: {liquidacionSeleccionada.Area}
              </Typography>
              <Typography variant="subtitle2">
                Monto: {formatCurrency(liquidacionSeleccionada.Monto)}
              </Typography>
            </Box>
          )}

          {/* Archivos + preview */}
          {cargandoArchivo ? (
            <Typography>Cargando archivo...</Typography>
          ) : archivos.length === 0 ? (
            <Typography>No hay archivos adjuntos.</Typography>
          ) : (
            <>
              {/* Selector */}
              <TextField
                select
                fullWidth
                size="small"
                label="Seleccionar archivo"
                value={archivoSeleccionado?.CodigoArchivo || ""}
                onChange={(e) => handleSelectArchivo(Number(e.target.value))}
                sx={{ mb: 2 }}
              >
                {archivos.map((a) => (
                  <MenuItem key={a.CodigoArchivo} value={a.CodigoArchivo}>
                    {a.Nombre} ({a.ContenidoTipo})
                  </MenuItem>
                ))}
              </TextField>

              {/* Preview */}
              <Box
                sx={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 1,
                  overflow: "hidden",
                  height: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafafa",
                }}
              >
                {!archivoUrl ? (
                  <Typography>No hay archivo para mostrar.</Typography>
                ) : (() => {
                    const mime = (archivoSeleccionado?.ContenidoTipo || "").toLowerCase();

                    if (mime.includes("pdf")) {
                      return (
                        <iframe
                          title="preview-pdf"
                          src={`${archivoUrl}#toolbar=0`}
                          style={{ width: "100%", height: "100%", border: 0 }}
                        />
                      );
                    }

                    if (mime.startsWith("image/")) {
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
                      <Box textAlign="center">
                        <Typography sx={{ mb: 1 }}>
                          Vista previa no disponible para:{" "}
                          <b>{archivoSeleccionado?.ContenidoTipo}</b>
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => window.open(archivoUrl, "_blank")}
                        >
                          Abrir / Descargar
                        </Button>
                      </Box>
                    );
                  })()}
              </Box>
            </>
          )}

          {/* Observaciones */}
          <TextField
            label="Observaciones / Comentarios"
            fullWidth
            multiline
            minRows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={aprobando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAprobar}
            disabled={aprobando || !liquidacionSeleccionada}
          >
            {aprobando ? "Aprobando..." : "Aprobar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLiquidaciones;
