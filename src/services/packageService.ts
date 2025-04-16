import { insertPackage } from "../database/models/package.ts";
import type { Package } from "../database/models/package.ts";
import { ValidationError } from "../errors.ts";

export async function validatePackage(pkg: Package): Promise<void> {
  // 1. Campos obligatorios
  const requiredFields = ["apartment_number", "sender", "delivery_date", "status"];
  for (const field of requiredFields) {
    if (!pkg[field]) {
      throw new ValidationError(`El campo ${field} es obligatorio`);
    }
  }

  // 2. Formato de fecha
  if (isNaN(new Date(pkg.delivery_date).getTime())) {
    throw new ValidationError("La fecha de entrega es inválida");
  }

  // 3. Validar estado permitido
  const validStatuses = ["pendiente", "entregado", "retirado"];
  if (!validStatuses.includes(pkg.status)) {
    throw new ValidationError(`Estado inválido. Use: ${validStatuses.join(", ")}`);
  }
}

export async function registerPackageService(pkg: Omit<Package, "id">) {
  try {
    await validatePackage(pkg);
    const id = await insertPackage(pkg);
    return { id, ...pkg };
  } catch (error) {
    throw error; 
  }
}