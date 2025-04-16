import { RouterContext } from "../../deps.ts";
import {
  insertPackage,
  getAllPackages,
  getPackageById
} from "../database/models/package.ts";
import { registerPackageService } from "../services/packageService.ts";

export async function registerPackage(ctx: RouterContext) {
  try {
    const body = await ctx.request.body().value;
    const result = await registerPackageService(body);
    ctx.response.body = result;
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.status = error.name === "ValidationError" ? 400 : 500;
    ctx.response.body = { 
      error: error.message,
      type: error.name // Para identificar el tipo en el frontend
    };
  }
}

export async function getPackages(ctx: RouterContext) {
  try {
    const packages = await getAllPackages();
    ctx.response.body = packages;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al obtener los paquetes",
      type: "DatabaseError"
    };
  }
}

export async function getPackage(ctx: RouterContext) {
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
    ctx.response.status = 500;
    ctx.response.body = { 
      error: "Error al obtener el paquete",
      type: "DatabaseError"
    };
  }
}