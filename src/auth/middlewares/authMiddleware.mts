import type { RouterMiddleware } from "https://deno.land/x/oak@v12.5.0/mod.ts";

export const checkAdminRole: RouterMiddleware<string> = async (ctx, next) => {
  const user = ctx.state.user;
  if (!user || user.role !== "admin") {
    ctx.response.status = 403;
    ctx.response.body = { error: "No autorizado - Admin only" };
    return;
  }
  await next();
};

export const checkResidentRole: RouterMiddleware<string> = async (ctx, next) => {
  const user = ctx.state.user;
  if (!user || user.role !== "resident") {
    ctx.response.status = 403;
    ctx.response.body = { error: "No autorizado - Resident only" };
    return;
  }
  await next();
};
