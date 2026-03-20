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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { dataGridSx } from '../form/datagridStyles';
import {
  fetchHistorialAnticiposByEtapa,
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
      const anticiposData = await fetchHistorialAnticiposByEtapa(
        "ETP_PEN_ANT_JEFE"
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
        'ETP_PEN_ANT_ASISTENTE'
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
    <Box sx={{ width: "100%", typography: "body1", mt: 2 }}>
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        centered
      >
        <Tab label="Anticipos del Área" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 3 }}>
          Anticipos para Aprobar
        </Typography>

        <Box
          sx={{
            height: 500,
            width: "100%",
            mt: 2,
            "& .MuiDataGrid-root": {
              borderRadius: 2,
            },
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
            rows={anticiposFiltrados}
            columns={anticiposColumns}
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

      {/* 🔹 Diálogo para observaciones y aprobación */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Aprobar anticipo</DialogTitle>
        <DialogContent dividers>
          {anticipoSeleccionado && (
            <Box mb={2}>
              <Typography variant="subtitle2">
                N° Autorización: {anticipoSeleccionado.NumeroAutorizacion}
              </Typography>
              <Typography variant="subtitle2">
                Empleado: {anticipoSeleccionado.Empleado}
              </Typography>
              <Typography variant="subtitle2">
                Lugar: {anticipoSeleccionado.LugarAVisitar}
              </Typography>
              <Typography variant="subtitle2">
                Monto: {formatCurrency(anticipoSeleccionado.MontoAnticipo)}
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
            disabled={aprobando}
          >
            {aprobando ? "Aprobando..." : "Aprobar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
