// src/routes/routes.ts
import { Router } from "../../deps.ts";
import { signup, login, getResidentProfile, updateResidentProfile } from "../auth/controllers/authController.ts";
import { getResidentPackages } from "../controllers/packageController.ts";

const router = new Router();

router
  .post("/api/signup", signup)
  .post("/api/login", login)
  // Rutas para residentes
  .get("/api/resident/packages", getResidentPackages)
  // Rutas para perfil de residente
  .get("/api/resident/profile", getResidentProfile)
  .put("/api/resident/profile", updateResidentProfile);

export default router;