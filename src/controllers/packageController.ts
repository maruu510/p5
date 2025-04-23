import { Context, RouterContext } from "../../deps.ts";
import {
  getAllPackages,
  getPackageById,
  updateStatusById
} from "../database/models/package.ts";
import { registerPackageService } from "../services/packageService.ts";

export async function registerPackage(ctx: Context) {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const result = await registerPackageService(body);
    ctx.response.body = result;
    ctx.response.status = 201;
  } catch (error) {
    const err = error as Error;
    ctx.response.status = err.name === "ValidationError" ? 400 : 500;
    ctx.response.body = { 
      error: err.message,
      type: err.name
    };
  }
}

export async function getPackages(ctx: Context) {
  try {
    const packages = await getAllPackages();
    ctx.response.body = packages;
    ctx.response.status = 200;
  } catch (error) {
    const err = error as Error;
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al obtener los paquetes",
      type: "DatabaseError",
      details: err.message
    };
  }
}

export async function getPackage(ctx: RouterContext<"/api/packages/:id">) {
  try {
    const id = ctx.params.id;

    if (!id || isNaN(Number(id))) {
      ctx.response.status = 400;
      ctx.response.body = { 
        error: "ID de paquete inválido",
        type: "ValidationError"
      };
      return;
    }

    const packageData = await getPackageById(Number(id));
    if (!packageData) {
      ctx.response.status = 404;
      ctx.response.body = { 
        error: "Paquete no encontrado",
        type: "NotFoundError"
      };
      return;
    }

    ctx.response.body = packageData;
    ctx.response.status = 200;
  } catch (error) {
    const err = error as Error;
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al obtener el paquete",
      type: "DatabaseError",
      details: err.message
    };
  }
}

export async function updatePackageStatus(ctx: RouterContext<"/api/packages/:id/status">) {
  try {
    const id = Number(ctx.params.id);
    const { status } = await ctx.request.body({ type: "json" }).value;

    if (!["entregado", "retirado"].includes(status)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Estado inválido para actualización" };
      return;
    }

    const pickup_date = status === "retirado" ? new Date() : null;

    const updated = await updateStatusById(id, status, pickup_date);
    if (!updated) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Paquete no encontrado o no es pendiente" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Estado actualizado con éxito" };
  } catch (error) {
    const err = error as Error;
    ctx.response.status = 500;
    ctx.response.body = { error: err.message };
  }
}
