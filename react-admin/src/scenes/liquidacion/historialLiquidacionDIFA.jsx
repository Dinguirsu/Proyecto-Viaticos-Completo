import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  useTheme,
  Card, 
  CardContent
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchHistorialLiquidacionesDIFAByYear } from "../../Services/liquidacionesService";
import { tokens } from "../../theme";
import { dataGridSx } from '../form/datagridStyles';

const ReporteLiquidacionesAnio = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const currentYear = new Date().getFullYear();

  const [anio, setAnio] = useState(currentYear);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔎 Buscador
  const [search, setSearch] = useState("");

  // Años para el selector (ejemplo: últimos 6 años)
  const years = Array.from({ length: 6 }, (_, idx) => currentYear - idx);

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

  // ✅ Columnas para LIQUIDACIONES
  const columns = [
    {
      field: "NumeroLiquidacion",
      headerName: "N° Liquidación",
      flex: 1,
      minWidth: 140,
    },
    {
      field: "NumeroAutorizacionAnticipo",
      headerName: "N° Anticipo",
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
      flex: 0.9,
      minWidth: 160,
      renderCell: (params) => (
        <span>{formatCurrency(params.row?.Monto)}</span>
      ),
    },
    {
      field: "Etapa",
      headerName: "Estado",
      flex: 0.8,
      minWidth: 160,
    },
  ];

  // 🔹 Reemplaza la lista con datos del año
  const cargarDatos = async (yearToLoad) => {
    try {
      setLoading(true);
      const resp = await fetchHistorialLiquidacionesDIFAByYear(yearToLoad);

      // tu backend a veces devuelve {data: []} o [] directamente
      const data = resp?.data || resp || [];

      const filas = data
        .filter((row) => row != null)
        .map((row, idx) => ({
          id: row.NumeroLiquidacion ?? idx, // mejor id estable
          ...row,
        }));

      setRows(filas);
    } catch (error) {
      console.error("Error cargando reporte de liquidaciones por año:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Al montar el componente, cargar el año actual
  useEffect(() => {
    cargarDatos(currentYear);
  }, []);

  // Cuando cambia el año
  const handleChangeAnio = (event) => {
    const nuevoAnio = Number(event.target.value);
    setAnio(nuevoAnio);
    cargarDatos(nuevoAnio);
  };

  // ✅ Filtrado por buscador (client-side)
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const texto = [
        r.NumeroLiquidacion,
        r.NumeroAutorizacionAnticipo,
        r.Empleado,
        r.Area,
        r.FechaIngreso,
        r.Etapa,
        r.Monto,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(q);
    });
  }, [rows, search]);

  return (
  <Box sx={{ width: "100%", mt: 2 }}>
    {/* Título */}
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ mt: 1, fontWeight: 900, color: "#e5e7eb" }}
      >
        Reporte de Liquidaciones por Año
      </Typography>
      <Typography
        align="center"
        sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.70)" }}
      >
        Filtrá por año y buscá por empleado, área, liquidación, anticipo o estado.
      </Typography>
    </Box>

    {/* Contenedor principal */}
    <Card
      sx={{
        bgcolor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Controles */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 1.5,
          }}
        >
          {/* 🔎 Buscador */}
          <TextField
            label="Buscar (empleado, área, liquidación, anticipo, estado...)"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              minWidth: 320,
              flex: 1,
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
              "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.65)" },
            }}
          />

          {/* 📅 Año */}
          <TextField
            select
            label="Año"
            size="small"
            value={anio}
            onChange={handleChangeAnio}
            sx={{
              minWidth: 140,
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
              "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.65)" },
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
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Tabla */}
        <Box sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            sx={dataGridSx}          // ✅ igual que Anticipos
            loading={loading}
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
            density="comfortable"
            autoHeight={false}
          />
        </Box>
      </CardContent>
    </Card>
  </Box>
);
};

export default ReporteLiquidacionesAnio;
