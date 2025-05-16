//packageController.ts
import { RouterContext } from "../../deps.ts";
import {
  insertPackage,
  getAllPackages,
  getPackageById,
  getPackagesByApartment
} from "../database/models/package.ts";
import { registerPackageService } from "../services/packageService.ts";
import { updateStatusById } from "../database/models/package.ts";
import { NotificationService } from "../services/notifications/notificationService.ts";
import { MultiNotifier } from "../services/notifications/MultiNotifier.ts";
import { getUserByUsername } from "../auth/models/user.ts";
import { verifyJwt, decodeJwt } from "../auth/controllers/authService.ts";
import * as qrcode from "https://deno.land/x/qrcode/mod.ts";

const notificationService = new NotificationService(new MultiNotifier());
export async function registerPackage(ctx: RouterContext) {
  try {
    const body = await ctx.request.body().value;
    const result = await registerPackageService(body);
    
    // Generar y guardar el código QR
    const qrCode = await generateQRCode(result);
    
    // Crear directorio para QR codes si no existe
    const qrDirectory = './src/public/qr_codes';
    try {
      await Deno.mkdir(qrDirectory, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
    
    // Guardar el QR code con un nombre único
    const qrFileName = `${result.id}_${Date.now()}.png`;
    const qrPath = `${qrDirectory}/${qrFileName}`;
    await Deno.writeFile(qrPath, qrCode);
    
    // Actualizar la referencia en el resultado
    result.qr_code_path = `/qr_codes/${qrFileName}`;
    
    ctx.response.body = result;
    ctx.response.status = 201;
  } catch (error) {
    ctx.response.status = error.name === "ValidationError" ? 400 : 500;
    ctx.response.body = { 
      error: error.message,
      type: error.name
    };
  }
}



export async function updatePackageStatus(ctx: RouterContext) {
  try {
    const id = Number(ctx.params.id);
    const { status } = await ctx.request.body().value;

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

    // Obtener el paquete actualizado para las notificaciones
    const packageData = await getPackageById(id);
    if (packageData && status === "entregado") {
      const user = await getUserByUsername(packageData.apartment_number);
      if (user) {
        await notificationService.notifyPickupReminder(user, id.toString());
      }
    }

    ctx.response.status = 200;
    ctx.response.body = { message: "Estado actualizado con éxito" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
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

async function getPackagesByApartment(apartmentNumber: string): Promise<Package[]> {
  const client = await pool.connect();
  try {
    const result = await client.queryObject<Package>(
      "SELECT * FROM packages WHERE apartment_number = $1 ORDER BY delivery_date DESC",
      [apartmentNumber]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function getResidentPackages(ctx: RouterContext) {
  try {
    // Verificar token y obtener usuario
    const token = ctx.request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "No autorizado" };
      return;
    }

    const isValid = await verifyJwt(token);
    if (!isValid) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Token inválido" };
      return;
    }

    // Obtener email del token
    const payload = await decodeJwt(token);
    const user = await getUserByUsername(payload.username);

    if (!user || user.role !== 'residente') {
      ctx.response.status = 403;
      ctx.response.body = { error: "Acceso denegado" };
      return;
    }

    // Obtener paquetes del residente
    const packages = await getPackagesByApartment(user.apartment_number);
    
    ctx.response.body = {
      pending: packages.filter(p => p.status === 'pendiente').length,
      delivered: packages.filter(p => p.status !== 'pendiente').length,
      packages: packages.slice(0, 5) // Últimos 5 paquetes
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
  }
}

async function generateQRCode(packageData: Package): Promise<string> {
  const qrContent = JSON.stringify({
    id: packageData.id,
    apartment: packageData.apartment_number,
    date: packageData.delivery_date
  });
  
  // Generar el código QR
  return await qrcode.generate(qrContent);
}

