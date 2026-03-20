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
  MenuItem,
  Card, 
  CardContent
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  fetchHistorialLiquidacionesDIFA,
  patchLiquidacionAprobada,
  fetchArchivoBlob,
  fetchArchivosLiquidacion
} from "../../Services/liquidacionesService";
import { dataGridSx } from '../form/datagridStyles';
import DocumentoViewer from "./ViewerArchivo"

const DashboardLiquidaciones = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState(""); // objectURL
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ Liquidaciones
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [etapaSeleccionada, setEtapaSeleccionada] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);
  // diálogo aprobación
  const [openDialog, setOpenDialog] = useState(false);
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] = useState(null);
  const [comentario, setComentario] = useState("");
  const [aprobando, setAprobando] = useState(false);
  const getPreviewKind = (mime = "") => {
    const m = mime.toLowerCase();
    if (m.includes("pdf")) return "pdf";
    if (m.startsWith("image/")) return "image";
    return "download";
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  };

  const cargarDatos = async () => {
    try {
      const liquidacionesData = await fetchHistorialLiquidacionesDIFA(
        "ETP_PEN_LIQ_ASISTENTE" 
      );
      setLiquidaciones(liquidacionesData || []);
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

  const handleOpenDialog = async (row) => {
    setLiquidacionSeleccionada(row);
    setComentario("");
    setOpenDialog(true);

    try {
      setCargandoArchivo(true);
      setArchivos([]);
      setArchivoSeleccionado(null);

      const resp = await fetchArchivosLiquidacion(row.NumeroLiquidacion);
      const lista = Array.isArray(resp) ? resp : (resp?.data || []);
      setArchivos(Array.isArray(lista) ? lista : []);
      console.log(archivos);

      // auto seleccionar el primero y cargar blob
      if (lista?.length) {
        setArchivoSeleccionado(lista[0]);
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLiquidacionSeleccionada(null);
    setComentario("");
    setArchivos([]);
    setArchivoSeleccionado(null);

    if (archivoUrl) URL.revokeObjectURL(archivoUrl);
    setArchivoUrl("");
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAprobar = async () => {
    if (!liquidacionSeleccionada) return;

    try {
      setAprobando(true);
      await patchLiquidacionAprobada(
        liquidacionSeleccionada.NumeroLiquidacion,
        comentario,
        'ETP_LIQ_APROBADO'
      );

      await cargarDatos();
      handleClose();
    } catch (error) {
      console.error("Error al aprobar liquidación:", error);
    } finally {
      setAprobando(false);
    }
  };

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



  // ✅ Columnas de liquidaciones (si cambian los campos, ajustas aquí)
  const liquidacionesColumns = [
    {
      field: "NumeroLiquidacion",
      headerName: "N° Liquidación",
      flex: 1,
      minWidth: 140,
    },
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
      flex: 0.8,
      minWidth: 140,
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

  const liquidacionesFiltradas = liquidaciones
    ?.filter((row) => row != null)
    .filter((row) =>
      etapaSeleccionada ? row.Etapa === etapaSeleccionada : true
    )
    .map((row, idx) => ({ id: idx, ...row }));

  return (
  <Box sx={{ width: "100%", mt: 2 }}>
    {/* Contenedor principal estilo dashboard */}
    <Card
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>        
        <TabPanel value={tabIndex} index={0}>
          {/* Título */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 900, color: "#e5e7eb" }}
            >
              Liquidaciones para Aprobar
            </Typography>
            <Typography
              align="center"
              sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.70)" }}
            >
              Revisá los documentos adjuntos y agregá observaciones antes de aprobar.
            </Typography>
          </Box>

          {/* Tabla */}
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={liquidacionesFiltradas}
              columns={liquidacionesColumns}
              sx={dataGridSx} // ✅ mismo estilo global oscuro
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
              disableRowSelectionOnClick
              density="comfortable"
              slots={{ toolbar: GridToolbar }}
            />
          </Box>
        </TabPanel>
      </CardContent>
    </Card>

    {/* ✅ Dialog oscuro con previsualizador */}
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#0f172a",
          color: "#e5e7eb",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900 }}>
        Aprobar liquidación {liquidacionSeleccionada?.NumeroLiquidacion || ""}
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.10)" }}>
        {cargandoArchivo ? (
          <Typography>Cargando archivo...</Typography>
        ) : archivos.length === 0 ? (
          <Typography>No hay archivos adjuntos.</Typography>
        ) : (
          <>
            {/* Selector archivo */}
            <TextField
              select
              fullWidth
              size="small"
              label="Seleccionar archivo"
              value={archivoSeleccionado?.CodigoArchivo ?? ""}
              onChange={(e) => handleSelectArchivo(e.target.value)} // ✅ sin Number()
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
                "& .MuiInputBase-root": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: "#e5e7eb",
                  borderRadius: 2,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.12)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.20)",
                },
              }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: "#0f172a",
                      color: "#e5e7eb",
                      border: "1px solid rgba(255,255,255,0.10)",
                    },
                  },
                },
              }}
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
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 2,
                overflow: "hidden",
                height: 460,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0b1220",
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
                        sx={{
                          backgroundColor: "#0b7285",
                          fontWeight: 800,
                          "&:hover": { backgroundColor: "#0a6374" },
                        }}
                        onClick={() => window.open(archivoUrl, "_blank")}
                      >
                        Abrir
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
          sx={{
            mt: 2,
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.75)" },
            "& .MuiInputBase-root": {
              bgcolor: "rgba(255,255,255,0.06)",
              color: "#e5e7eb",
              borderRadius: 2,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.12)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.20)",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleCloseDialog}
          disabled={aprobando}
          variant="outlined"
          sx={{
            color: "#e5e7eb",
            borderColor: "rgba(255,255,255,0.18)",
            "&:hover": { borderColor: "rgba(255,255,255,0.30)" },
          }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleAprobar}
          disabled={aprobando || !liquidacionSeleccionada}
          sx={{
            backgroundColor: "#0b7285",
            fontWeight: 900,
            "&:hover": { backgroundColor: "#0a6374" },
          }}
        >
          {aprobando ? "Aprobando..." : "Aprobar"}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};

export default DashboardLiquidaciones;
