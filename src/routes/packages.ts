import { Router } from "../../deps.ts";
import {
  registerPackage,
  getPackages,
  getPackage,
  updatePackageStatus
} from "../controllers/packageController.ts";
import { login } from "../controllers/authController.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

const router = new Router();

router
  .get("/api/packages", getPackages) // Ruta pública sin token (SCRUM-181)
  .get("/api/packages/:id", getPackage)
  .post("/api/packages", authMiddleware, registerPackage)
  .put("/api/packages/:id/status", authMiddleware, updatePackageStatus)
  .post("/login", login);

export default router;
