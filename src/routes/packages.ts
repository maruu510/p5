//packages.ts
import { Router } from "../../deps.ts";
import {
  registerPackage,
  getPackages,
  getPackage,
  updatePackageStatus,
  handlePackageEvents // Añadir esta importación
} from "../controllers/packageController.ts";

const router = new Router();

router
  .get("/api/packages", getPackages)
  .get("/api/packages/:id", getPackage)
  .post("/api/packages", registerPackage)
  .put("/api/packages/:id/status", updatePackageStatus)
  .get('/api/packages/events', handlePackageEvents); // Cambiar a encadenamiento de método

export default router;