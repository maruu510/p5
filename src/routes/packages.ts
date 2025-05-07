import { Router } from "../../deps.ts";
import {
  registerPackage,
  getPackages,
  getPackage,
  updatePackageStatus
} from "../controllers/packageController.ts";
import { verifyJwt } from "../auth/controllers/authService.ts";

const router = new Router();

// Middleware de autenticación
router.use(async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token no proporcionado" };
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token || !(await verifyJwt(token))) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Token inválido o expirado" };
    return;
  }

  await next();
});

// Rutas protegidas
router
  .get("/api/packages", getPackages)
  .get("/api/packages/:id", getPackage)
  .post("/api/packages", registerPackage)
  .put("/api/packages/:id/status", updatePackageStatus);

export { router };