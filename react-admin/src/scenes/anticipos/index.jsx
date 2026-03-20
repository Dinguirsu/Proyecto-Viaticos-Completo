import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { dataGridSx } from '../form/datagridStyles';
import { useNavigate } from 'react-router-dom';
import { fetchHistorialAnticipos } from '../../Services/anticiposService'
import api from '../../Services/api';

const Dashboard = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [anticipos, setAnticipos] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [etapaSeleccionada, setEtapaSeleccionada] = useState("");
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
        const anticiposData = await fetchHistorialAnticipos();
        setAnticipos(anticiposData || []);

        const respEtapas = await api.get(
            `/anticipos/obtenerEtapas` 
        );

        setAnticipos(anticiposData || []);
        setEtapas(respEtapas.data || []);

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

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
    }
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
        <Tab label="Anticipos del Area" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 3 }}>
          Historial Anticipos del Area
        </Typography>

        {/* 🔹 Filtro por etapa */}
        <Box
          sx={{
            mt: 2,
            mb: 1,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="etapa-select-label">Filtrar por etapa</InputLabel>
            <Select
              labelId="etapa-select-label"
              label="Filtrar por Etapa"
              value={etapaSeleccionada}
              onChange={(e) => setEtapaSeleccionada(e.target.value)}
            >
              <MenuItem value="">
                <em>Todas las etapas</em>
              </MenuItem>
              {etapas.map((etapa) => (
                <MenuItem
                  key={etapa.CodigoEtapa || etapa.Etapa}
                  value={etapa.Etapa}
                >
                  {etapa.Etapa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

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
    </Box>
  );
};

export default Dashboard;
