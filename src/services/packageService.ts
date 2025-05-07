import { qrcode } from "../../deps.ts";
import { insertPackage } from "../database/models/package.ts";
import type { Package } from "../database/models/package.ts";
import { ValidationError } from "../errors.ts";

export async function validatePackage(pkg: Package): Promise<void> {
  const requiredFields = ["apartment_number", "sender", "delivery_date", "status"];
  
  for (const field of requiredFields) {
    if (!pkg[field as keyof Package]) {
      throw new ValidationError(`El campo ${field} es obligatorio`);
    }
  }

  if (isNaN(new Date(pkg.delivery_date).getTime())) {
    throw new ValidationError("La fecha de entrega es inválida");
  }

  const validStatuses = ["pendiente", "entregado", "retirado"];
  if (!validStatuses.includes(pkg.status)) {
    throw new ValidationError(`Estado inválido. Use: ${validStatuses.join(", ")}`);
  }
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    if (!data) throw new Error("Datos vacíos para generar QR");
    return await qrcode(data, {
      size: 6,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    });
  } catch (error) {
    console.error("Error al generar QR:", error);
    throw new Error("No se pudo generar el código QR");
  }
}

export async function registerPackageService(pkg: Omit<Package, "id">) {
  await validatePackage(pkg);
  
  const qrContent = JSON.stringify({
    apartment: pkg.apartment_number,
    sender: pkg.sender,
    date: pkg.delivery_date,
    status: pkg.status,
    timestamp: new Date().toISOString()
  });
  
  pkg.qr_code = await generateQRCode(qrContent);
  
  const id = await insertPackage(pkg);
  return { 
    id, 
    ...pkg,
    qr_code: pkg.qr_code // Asegurar que el QR se devuelva
  };
}