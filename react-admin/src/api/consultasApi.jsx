import axios from "axios";
import api from "../Services/api"
const BASE_URL = "http://localhost:3000/api";
const USUARIO_ADMIN = "ADMIN";
const USUARIO_LIQUIDACIONES = "martha.dubon";

export const fetchEtapas = async () => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerEtapas/`);
  return data;
};

export const fetchEtapasLiquidacion = async () => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerEtapasLiquidacion/`);
  return data;
};

export const fetchAllAnticipos = async () => {
  const usuarioId = 615; // cambia si quieres
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerAnticiposByIDEmpleado`);
  return data;
};

export const fetchAllLiquidaciones = async () => {
  const sistemaUsuario = "eduardo.rosales"; // cambia si quieres
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerTodasLiquidaciones`);
  return data;
};

export const fetchAnticiposPorEtapa = async (etapaSeleccionada) => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerAnticipoEtapas/${etapaSeleccionada}`);
  return data;
};

export const fetchLiquidacionesPorEtapa = async (etapaSeleccionada) => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerLiquidacionesEtapas/${etapaSeleccionada}`);
  return data;
};

export const fetchAnticiposPorFechas = async (startDate, endDate) => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerAnticipoFecha/${startDate}/${endDate}`);
  return data;
};

export const fetchLiquidacionesPorFechas = async (startDate, endDate) => {
  const { data } = await api.get(`${BASE_URL}/anticipos/obtenerLiquidacionesFecha/${startDate}/${endDate}`);
  return data;
};
