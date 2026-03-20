import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useSelector } from "react-redux";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const perfil = useSelector((state) => state.empleado.perfil);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  const user = useSelector((state) => state.auth.user);

  // Soportar tanto nombres con mayúscula como minúscula por si el token cambió
  const tipoCargo = user?.tipoEmpleado;
  const codigoCargo = user?.codigoCargo;
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    perfil?.perfil?.Empleado || "Usuario",
  )}&background=1e40af&color=fff`;

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
            <Box textAlign="center" p={1} mt={1}>
                <Typography
                  variant="h1"
                  color={colors.grey[100]}
                  fontWeight="bold"
                >
                  {perfil?.perfil?.Empleado?.toUpperCase()}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="center">
                <img
                  src={avatarUrl}
                  alt="avatar"
                  style={{ borderRadius: "50%", width: 100, height: 100 }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {/* Aquí podrías mostrar user.Nombre si lo tienes */}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* Siempre visible */}
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>

            {/* Realizar anticipo (cualquier empleado) */}
            <Item
              title="Realizar Anticipo"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* Consultas para usuarios */}
            <Item
              title="Consultas para Usuarios"
              to="/consultas"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* Historial y aprobación de anticipos: TipoCargo 2,3,4 */}
            {(tipoCargo === 2 || tipoCargo === 3 || tipoCargo === 4) && (
            <Item
              title="Historial Anticipos"
              to="/anticipos"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            )}

            {(tipoCargo === 2 || tipoCargo === 3) && (
              <Item
                title="Aprobacion Anticipos"
                to="/aprobacionanticipos"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {(tipoCargo === 2 || tipoCargo === 3) && (
              <Item
                title="Aprobacion Liquidacion"
                to="/aprobacionLiquidacion"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {codigoCargo === 308 && (
              <Item
                title="Aprobacion Anticipos DIFA"
                to="/aprobacionanticiposDIFA"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {codigoCargo === 308 && (
              <Item
                title="Reporte Anticipos por Año"
                to="/historialAnticiposDIFA"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {codigoCargo === 307 && (
              <Item
                title="Aprobacion Liquidaciones DIFA"
                to="/aprobacionLiquidacionDIFA"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            {codigoCargo === 307 && (
              <Item
                title="Historial Liquidaciones DIFA"
                to="/historialLiquidacionDIFA"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
