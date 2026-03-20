import express from 'express'
import productRoutes from './routes/RealizarAnticipo.routes.js'
import login from './routes/auth.routes.js'
import routes from "./routes/index.js"
import { verificarToken } from "./Middleware/auth.middleware.js";
import cors from "cors";
import morgan from "morgan";
import multer from 'multer';

const app = express()

app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/auth", login);

// 👇 Rutas protegidas (requieren token válido)
app.use("/api", verificarToken, routes);


export default app