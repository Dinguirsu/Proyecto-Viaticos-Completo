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
  Card, 
  CardContent
} from "@mui/material";
import { dataGridSx } from '../form/datagridStyles';
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  fetchHistorialAnticiposDIFA,
  patchAnticipoAprobado,
} from "../../Services/anticiposService";

const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [anticipos, setAnticipos] = useState([]);
  const [etapaSeleccionada, setEtapaSeleccionada] = useState("");

  // Estado para el diálogo de aprobación
  const [openDialog, setOpenDialog] = useState(false);
  const [anticipoSeleccionado, setAnticipoSeleccionado] = useState(null);
  const [comentario, setComentario] = useState("");
  const [aprobando, setAprobando] = useState(false);

  const TabPanel = ({ children, value, index }) => {
    return (
      <div hidden={value !== index}>
        {value === index && <Box p={3}>{children}</Box>}
      </div>
    );
  };

  const cargarDatos = async () => {
    try {
      const anticiposData = await fetchHistorialAnticiposDIFA(
        "ETP_PEN_ANT_ASISTENTE"
      );
      setAnticipos(anticiposData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
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

  const handleOpenDialog = (row) => {
    setAnticipoSeleccionado(row);
    setComentario("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAnticipoSeleccionado(null);
    setComentario("");
  };

  const handleAprobar = async () => {
    if (!anticipoSeleccionado) return;

    try {
      setAprobando(true);
      await patchAnticipoAprobado(
        anticipoSeleccionado.NumeroAutorizacion,
        comentario,
        'ETP_ANT_APROBADO'
      );

      // Recargar lista de anticipos pendientes del jefe
      await cargarDatos();

      handleCloseDialog();
    } catch (error) {
      console.error("Error al aprobar anticipo:", error);
      // aquí podrías mostrar un snackbar/toast
    } finally {
      setAprobando(false);
    }
  };

  const anticiposColumns = [
    {
      field: "NumeroAutorizacion",
      headerName: "N° Autorización",
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
      field: "LugarAVisitar",
      headerName: "Lugar a Visitar",
      flex: 1.2,
      minWidth: 160,
    },
    {
      field: "MontoAnticipo",
      headerName: "Monto Anticipo",
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => (
        <span>{formatCurrency(params.row?.MontoAnticipo)}</span>
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
    // 🔹 Nueva columna de acciones
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

  const anticiposFiltrados = anticipos
    ?.filter((row) => row != null)
    .filter((row) =>
      etapaSeleccionada ? row.Etapa === etapaSeleccionada : true
    )
    .map((row, idx) => ({ id: idx, ...row }));

  return (
  <Box sx={{ width: "100%", mt: 2 }}>
    {/* Tabs en contenedor oscuro */}
    <Card
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>

        <TabPanel value={tabIndex} index={0}>
          {/* Títulos */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 900, color: "#e5e7eb" }}
            >
              Anticipos para Aprobar
            </Typography>
            <Typography
              align="center"
              sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.70)" }}
            >
              Revisa los anticipos pendientes y agrega observaciones antes de aprobar.
            </Typography>
          </Box>

          {/* Tabla */}
          <Box sx={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={anticiposFiltrados}
              columns={anticiposColumns}
              sx={dataGridSx} // ✅ estilo global oscuro
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

    {/* 🔹 Diálogo para observaciones y aprobación (dark) */}
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="sm"
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
        Aprobar anticipo
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.10)" }}>
        {anticipoSeleccionado && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              <b>N° Autorización:</b> {anticipoSeleccionado.NumeroAutorizacion}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              <b>Empleado:</b> {anticipoSeleccionado.Empleado}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              <b>Lugar:</b> {anticipoSeleccionado.LugarAVisitar}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.9 }}>
              <b>Monto:</b> {formatCurrency(anticipoSeleccionado.MontoAnticipo)}
            </Typography>
          </Box>
        )}

        <TextField
          label="Observaciones / Comentarios"
          fullWidth
          multiline
          minRows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          sx={{
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
          sx={{
            color: "#e5e7eb",
            borderColor: "rgba(255,255,255,0.18)",
          }}
          variant="outlined"
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleAprobar}
          disabled={aprobando}
          sx={{
            backgroundColor: "#0b7285",
            fontWeight: 800,
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

export default Dashboard;
