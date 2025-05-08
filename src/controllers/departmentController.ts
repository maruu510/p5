import { RouterContext } from "../../deps.ts";
import { getAllDepartments } from "../database/models/departament.ts";

export async function getDepartments(ctx: RouterContext) {
  try {
    const departments = await getAllDepartments();
    ctx.response.status = 200;
    ctx.response.body = departments;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Error al obtener los departamentos",
      type: "DatabaseError",
    };
  }
}
