import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button, 
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { fetchAnticipos } from '../../Services/anticiposService'
import { fetchLiquidaciones } from '../../Services/liquidacionesService'
import { dataGridSx } from '../form/datagridStyles';
import {
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";

const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [anticipos, setAnticipos] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const navigate = useNavigate();
  const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLiquidacion, setSelectedLiquidacion] = useState(null);

  const handleOpenDialog = (liquidacion) => {
    setSelectedLiquidacion(liquidacion);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLiquidacion(null);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const anticiposData = await fetchAnticipos();
        setAnticipos(anticiposData || []);

        const liquidacionesData = await fetchLiquidaciones();
        setLiquidaciones(liquidacionesData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const handleLiquidar = (anticipo) => {
    navigate('/liquidacion', { state: { anticipo } });
  };

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

  const anticiposColumns = [
    { field: "NumeroAutorizacion", headerName: "N° Autorización", flex: 1, minWidth: 140 },
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
      field: "actions",
      headerName: "Acciones",
      flex: 0.7,
      minWidth: 130,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleLiquidar(params.row)}
        >
          Liquidar
        </Button>
      ),
    },
  ];

  // Liquidaciones
  const liquidacionesColumns = [
    { field: "NumeroLiquidacion", headerName: "N° Liquidación", flex: 1, minWidth: 140 },
    { field: "Empleado", headerName: "Empleado", flex: 1.2, minWidth: 160 },
    { field: "Area", headerName: "Área", flex: 1, minWidth: 140 },
    {
      field: "FechaIngreso",
      headerName: "Fecha de Liquidación",
      flex: 0.8,
      minWidth: 150,
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
      field: "Monto",
      headerName: "Monto Liquidación",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <span>{formatCurrency(params.row?.Monto)}</span>
      ),
    },
  ];

  const CustomToolbar = () => (
  <GridToolbarContainer sx={{ p: 1, justifyContent: "flex-end" }}>
    <GridToolbarQuickFilter
      placeholder="Buscar..."
      debounceMs={300}
      sx={{
        width: 260,
        "& .MuiInputBase-root": {
          height: 34,
          fontSize: 13,
          borderRadius: 1,
          bgcolor: "rgba(255,255,255,0.06)",
        },
      }}
    />
  </GridToolbarContainer>
);


  return (
  <Box sx={{ width: "100%", typography: "body1", mt: 2 }}>
  {/* ✅ Barra de pestañas bien definida */}
  <Box
  sx={{
    mb: 1.5,
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
    TabIndicatorProps={{ style: { display: "none" } }} // sin indicador (más limpio)
    sx={{
      minHeight: 36,
      "& .MuiTab-root": {
        minHeight: 36,
        textTransform: "none",
        fontWeight: 700,
        borderRadius: 1.5,
        px: 2,
        py: 0.5,
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

  {/* ---- el resto igual ---- */}
  <TabPanel value={tabIndex} index={0}>
    <Typography variant="h6" align="center" sx={{ mt: 0.5, mb: 1 }}>
      Anticipos Listos Para Liquidar
    </Typography>

    <Box sx={{ height: 500, width: "100%", mt: 2 }}>
      <DataGrid
        rows={(anticipos || [])
          .filter((row) => row != null)
          .map((row, idx) => ({ id: idx, ...row }))}
        columns={anticiposColumns}
        sx={dataGridSx}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        disableRowSelectionOnClick
        density="comfortable"
        slots={{ toolbar: CustomToolbar }}
      />
    </Box>
  </TabPanel>

  <TabPanel value={tabIndex} index={1}>
    <Typography variant="h6" align="center" sx={{ mt: 0.5, mb: 1 }}>
      Liquidaciones 
    </Typography>

    <Box sx={{ height: 420, width: "100%", mt: 2 }}>
      <DataGrid
        rows={(liquidaciones || [])
          .filter((row) => row != null)
          .map((row, idx) => ({ id: idx, ...row }))}
        columns={liquidacionesColumns}
        sx={{
          ...dataGridSx,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#364fc7",
            color: "#fff",
            fontWeight: "bold",
            borderBottom: "none",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(54, 79, 199, 0.08)",
          },
        }}
        pageSizeOptions={[5, 10, 20]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5, page: 0 } },
        }}
        disableRowSelectionOnClick
        density="comfortable"
        slots={{ toolbar: CustomToolbar }}
      />
    </Box>
  </TabPanel>
</Box>

);

};

export default Dashboard;
