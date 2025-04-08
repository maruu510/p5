import { insertPackage } from "../database/models/package.ts";
import type { Package } from "../database/models/package.ts";

export async function registerPackageService(pkg: Omit<Package, "id">) {
  try {
    const id = await insertPackage(pkg); // Ahora insertPackage retorna el id
    return { id, ...pkg };
  } catch (error) {
    throw new Error(`Error al registrar paquete: ${error.message}`);
  }
}
