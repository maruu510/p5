import { Router } from "../../deps.ts";
import {
  registrarPaquete,
  obtenerPaquetes,
  obtenerPaquete
} from "../controllers/paqueteController.ts";

const router = new Router();

router
  .get("/api/paquetes", obtenerPaquetes)
  .get("/api/paquetes/:id", obtenerPaquete)
  .post("/api/paquetes", registrarPaquete);

export default router;