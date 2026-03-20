import express from "express";
import empleadoRoutes from "./empleado.routes.js";
import anticiposRoutes from "./RealizarAnticipo.routes.js"

const router = express.Router();

router.use("/empleado", empleadoRoutes);

router.use("/anticipos", anticiposRoutes);

export default router;