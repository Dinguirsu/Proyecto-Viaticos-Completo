// src/App.js
import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import LayoutBase from "./scenes/global/LayoutBase";

import Dashboard from "./scenes/dashboard";
import Team from "./scenes/Team";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import Liquidacion from "./scenes/liquidacion";
import Anticipos from "./scenes/anticipos/index";
import AprobacionAnticipos from "./scenes/anticipos/aprobarAnticipos";
import AprobacionLiquidacion from "./scenes/liquidacion/aprobarLiquidacion";
import AprobacionAnticiposDIFA from "./scenes/anticipos/aprobarAnticiposDIFA";
import HistorialAnticiposDIFA from "./scenes/anticipos/historialAnticiposDIFA";
import AprobacionLiquidacionDIFA from "./scenes/liquidacion/aprobarLiquidacionDIFA";
import HistorialLiquidacionesDIFA from "./scenes/liquidacion/historialLiquidacionDIFA";
import Consultas from "../src/scenes/consultas/index";
import Login from "./login/Login";


import { ColorModelContext, useMode } from "./theme";
import ProtectedRoute from "./Services/ProtectedRoute";

const NoAutorizado = () => (
  <div style={{ textAlign: "center", marginTop: "4rem" }}>
    <h2>Acceso no autorizado</h2>
    <p>No tienes permisos para acceder a esta sección.</p>
  </div>
);

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  // si estás en "/", mostramos solo el login (sin sidebar/topbar)
  const isLoginPage = location.pathname === "/";

  return (
    <ColorModelContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {!isLoginPage && <Sidebar />}

          <main className="content">
            {!isLoginPage && <Topbar />}

            <Routes>
              {/* LOGIN */}
              <Route path="/" element={<Login />} />

              {/* RUTAS PROTEGIDAS GENERALES (cualquier usuario logueado) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <Team />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form"
                element={
                  <ProtectedRoute>
                    <Form />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consultas"
                element={
                  <ProtectedRoute>
                    <Consultas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/liquidacion"
                element={
                  <ProtectedRoute>
                    <Liquidacion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/anticipos"
                element={
                  <ProtectedRoute>
                    <Anticipos />
                  </ProtectedRoute>
                }
              />

              {/* SOLO TipoCargo 2 ó 3 */}
              <Route
                path="/aprobacionanticipos"
                element={
                  <ProtectedRoute allowedTipoCargo={[2, 3]}>
                    <AprobacionAnticipos />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/aprobacionliquidacion"
                element={
                  <ProtectedRoute allowedTipoCargo={[2, 3]}>
                    <AprobacionLiquidacion />
                  </ProtectedRoute>
                }
              />

              {/* SOLO codigoCargo 308 */}
              <Route
                path="/aprobacionanticiposDIFA"
                element={
                  <ProtectedRoute allowedCodigoCargo={[308]}>
                    <AprobacionAnticiposDIFA />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/historialAnticiposDIFA"
                element={
                  <ProtectedRoute allowedCodigoCargo={[308]}>
                    <HistorialAnticiposDIFA />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/aprobacionLiquidacionDIFA"
                element={
                  <ProtectedRoute allowedCodigoCargo={[307]}>
                    <AprobacionLiquidacionDIFA />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/historialLiquidacionDIFA"
                element={
                  <ProtectedRoute allowedCodigoCargo={[307]}>
                    <HistorialLiquidacionesDIFA />
                  </ProtectedRoute>
                }
              />

              {/* No autorizado */}
              <Route path="/no-autorizado" element={<NoAutorizado />} />

              {/* Cualquier ruta desconocida */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModelContext.Provider>
  );
}

export default App;
