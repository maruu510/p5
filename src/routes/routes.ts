// src/routes/routes.ts
import { Router } from "../../deps.ts";
import { signup, login } from "../auth/controllers/authController.ts";

const router = new Router();

router
  .post("/api/signup", signup)
  .post("/api/login", login);

export default router;