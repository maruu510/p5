import { RouterContext } from "../../deps.ts";
import {
  insertPackage,
  getAllPackages,
  getPackageById
} from "../database/models/package.ts";

// Register new package (keeps Spanish internal names for consistency)
export async function registerPackage(ctx: RouterContext) {
  try {
    const body = await ctx.request.body().value;
    const id = await insertPackage(body);
    ctx.response.body = { id, ...body };
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { error: error.message };
  }
}

// Get all packages
export async function getPackages(ctx: RouterContext) {
  try {
    const packages = await getAllPackages();
    ctx.response.body = packages;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error retrieving packages" };
  }
}

// Get package by ID
export async function getPackage(ctx: RouterContext) {
  try {
    const id = ctx.params.id;
    const packageData = await getPackageById(Number(id)); // Renamed from 'package' to 'packageData'
    if (!packageData) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Package not found" };
      return;
    }
    ctx.response.body = packageData;
    ctx.response.status = 200;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Error retrieving the package" };
  }
}
