// routes.ts
import { Router, RouterContext } from "../../deps.ts";
import { signup, login } from "../auth/controllers/authController.ts";

const router = new Router();

// Middleware para verificar rol Admin
const checkAdminRole = async (
  ctx: RouterContext<string>, // Puedes especificar path exacto si quieres, ej: RouterContext<"/admin-dashboard">
  next: () => Promise<unknown>,
) => {
  // Suponiendo que ctx.state.user contiene el usuario autenticado
  const user = ctx.state.user;
  if (!user || user.role !== "admin") {
    ctx.response.status = 403;
    ctx.response.body = { error: "Acceso denegado" };
    return;
  }
  await next();
};

// Middleware para verificar rol Residente
const checkResidentRole = async (
  ctx: RouterContext<string>,
  next: () => Promise<unknown>,
) => {
  const user = ctx.state.user;
  if (!user || user.role !== "residente") {
    ctx.response.status = 403;
    ctx.response.body = { error: "Acceso denegado" };
    return;
  }
  await next();
};

// Handler para Dashboard Admin
const handleAdminDashboard = async (ctx: RouterContext<string>) => {
  await ctx.send({
    root: `${Deno.cwd()}/src/views/admin`,
    path: "dashboard.html",
  });
};

// Handler para Dashboard Residente
const handleResidentDashboard = async (ctx: RouterContext<string>) => {
  await ctx.send({
    root: `${Deno.cwd()}/src/views/resident`,
    path: "dashboard.html",
  });
};

router
  .post("/api/signup", signup)
  .post("/api/login", login)
  .get("/admin-dashboard", checkAdminRole, handleAdminDashboard)
  .get("/resident-dashboard", checkResidentRole, handleResidentDashboard);

export default router;
