import { Router } from "express";
import { getContinent, getCountry, getDepto, getMunicipio, getTransport, getNumPlaca, getNameEmployee, getWorkAreaEmployee, getTypeEmployee, getCodigoEtapa, postAnticiposEncabezado, getTotalAnticipos, getCambioDolar, postAnticiposDetalleMision, getCodigoZonaViaticoHN, getMontoViaticoLempiras, getMontoViaticoDolares, getCodigoZonaViatico, getAnticiposByIDEmpleado, getLiquidacionesByAnticipo, getNumeroLiquidacion, postLiquidacion, getEtapas, getAnticiposXEtapa, getAnticiposXFechas, getAnticiposParaLiquidar, getLiquidacionesXFechas, getEtapasLiquidacion, getLiquidacionXEtapa, getLiquidacionesByIDEmpleado, getHistorialAnticipos, getHistorialAnticiposByEtapa, updateAprobarAnticipo, getHistorialAnticiposDIFAByYear, updateAprobarLiquidacion, getLiquidacionesPendientes, getHistorialAnticiposDIFA, getHistorialLiquidacionesDIFA, getHistorialLiquidacionesDIFAByYear, getArchivosLiquidacion, downloadArchivoLiquidacion, getArchivoLiquidacionByCodigo, getAnticiposByIDEmpleadoConsultas, putReemplazarArchivoLiquidacion, getLiquidacionEmpleadoXEtapa } from '../controllers/RealizarAnticipo.controllers.js'
import sql from "mssql";
import multer from 'multer';
import express from 'express';
import { loginMembershipController } from "../controllers/auth.controller.js";

const router = Router();

//const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.get('/continentes', getContinent);

router.get('/pais/:CodigoContinente', getCountry);

router.get('/departamentos', getDepto);

router.get('/municipio/:Departamento', getMunicipio);

router.get('/transporte', getTransport);

router.get('/placa', getNumPlaca);

router.get('/NombreEmpleado', getNameEmployee);

router.get('/AreaEmpleado', getWorkAreaEmployee);

router.get('/TipoEmpleado', getTypeEmployee);

router.post('/ingresoFormulario', postAnticiposEncabezado);

router.post('/ingresoFormularioDetalle', postAnticiposDetalleMision);

router.get('/totalAnticipos', getTotalAnticipos);

router.get('/obtenerEtapa/:Anticipo', getCodigoEtapa);

router.get('/obtenerCambioDolar', getCambioDolar);

router.get('/obtenerCodigoZonaViaticoHN/:NombreMunicipio', getCodigoZonaViaticoHN);

router.get('/obtenerCodigoZonaViatico/:NombrePais', getCodigoZonaViatico);

router.get('/obtenerMontoViaticoLempiras', getMontoViaticoLempiras);

router.get('/obtenerMontoViaticoDolares', getMontoViaticoDolares);

router.get('/obtenerAnticiposByIDEmpleado', getAnticiposByIDEmpleado);

router.get('/obtenerAnticiposByIDEmpleadoConsulta', getAnticiposByIDEmpleadoConsultas);

router.get('/obtenerLiquidacionesByAnticipo', getLiquidacionesByAnticipo);

router.get('/obtenerCodigoLiquidacion', getNumeroLiquidacion);

router.post('/cargarLiquidacion', upload.single('file'), (req, res, next) => {
    next();
}, postLiquidacion);

router.get('/obtenerEtapas', getEtapas);

router.get('/obtenerEtapasLiquidacion/', getEtapasLiquidacion);

router.get('/obtenerAnticipoEtapas/:CodigoEtapa', getAnticiposXEtapa);

router.get('/obtenerAnticipoFecha/:FechaInicio/:FechaFinal', getAnticiposXFechas);

router.get('/obtenerAnticipoParaLiquidar', getAnticiposParaLiquidar);

router.get('/obtenerTodasLiquidaciones', getLiquidacionesByIDEmpleado);

router.get('/obtenerLiquidacionesFecha/:FechaInicio/:FechaFinal', getLiquidacionesXFechas);

router.get('/obtenerLiquidacionesEtapas/:CodigoEtapa', getLiquidacionXEtapa);

router.get('/obtenerLiquidacionesEmpleadoXEtapas/:CodigoEtapa', getLiquidacionEmpleadoXEtapa);

router.get('/obtenerHistorialAnticipos', getHistorialAnticipos);

router.get('/obtenerHistorialAnticiposbyEtapa/:CodigoEtapa', getHistorialAnticiposByEtapa);

router.get('/obtenerHistorialAnticiposDIFA/:CodigoEtapa', getHistorialAnticiposDIFA);

router.get('/obtenerHistorialAnticiposDIFAbyYear/:Year', getHistorialAnticiposDIFAByYear);

router.get('/obtenerLiquidacionesJefe', getLiquidacionesPendientes);

router.patch('/modificarEstadoAnticipo/:numeroAutorizacion', updateAprobarAnticipo);

router.patch('/modificarEstadoLiquidacion/:NumeroLiquidacion', updateAprobarLiquidacion);

router.post('/login-membership', loginMembershipController);

router.get('/obtenerHistorialLiquidacionesDIFA/:CodigoEtapa', getHistorialLiquidacionesDIFA);

router.get('/obtenerHistorialLiquidacionesDIFAbyYear/:Year', getHistorialLiquidacionesDIFAByYear);

router.get('/obtenerDocumentosLiquidacion/:numeroLiquidacion', getArchivosLiquidacion);

router.get('/downloadLiquidacion/:codigoArchivo', getArchivoLiquidacionByCodigo);

router.put(
  '/reemplazarArchivoLiquidacion/:codigoArchivo',
  upload.single('file'),
  (req, res, next) => {
    next();
  },
  putReemplazarArchivoLiquidacion
);

export default router
