//packageController.ts
import { RouterContext } from "../../deps.ts";
import {
  insertPackage,
  getAllPackages,
  getPackageById
} from "../database/models/package.ts";
import { registerPackageService } from "../services/packageService.ts";
import { updateStatusById } from "../database/models/package.ts";
import { NotificationService } from "../services/notifications/notificationService.ts";
import { MultiNotifier } from "../services/notifications/MultiNotifier.ts";
import { getUserByUsername } from "../auth/models/user.ts";

const notificationService = new NotificationService(new MultiNotifier());
let clients = new Set<any>();

export async function handlePackageEvents(ctx: RouterContext) {
  const target = ctx.request.serverRequest.target;
  if (target === '/api/packages/events') {
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const body = new ReadableStream({
      start(controller) {
        // Guardar el controlador para enviar eventos
        const client = { controller };
        clients.add(client);

        // Eliminar cliente cuando se cierra la conexión
        ctx.request.serverRequest.raw.on('close', () => {
          clients.delete(client);
        });
      }
    });

    ctx.response.body = body;
    ctx.response.headers = headers;
  }
}

// Función para enviar eventos a todos los clientes conectados
export function sendEventToClients(data: any) {
  const eventData = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(eventData));
    } catch (error) {
      console.error('Error enviando evento:', error);
      clients.delete(client);
    }
  }
}

// Modificar la función registerPackage para enviar eventos
export async function registerPackage(ctx: RouterContext) {
  try {
    const body = await ctx.request.body().value;
    const result = await registerPackageService(body);
    
    // Notificar al usuario sobre el nuevo paquete
    const user = await getUserByUsername(body.apartment_number);
    if (user) {
      await notificationService.notifyPackageArrival(user, result.id.toString());
      
      // Enviar evento SSE
      sendEventToClients({
        type: 'new_package',
        package: result,
        residentId: user.id
      });
    }

    ctx.response.status = 201;
    ctx.response.body = result;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: error.message };
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
    let packages;
    const userRole = ctx.state.user?.role;
    const userApartment = ctx.state.user?.username; // El username es el número de apartamento

    if (userRole === "resident") {
      packages = await getPackagesByApartment(userApartment);
    } else {
      packages = await getAllPackages(); // Administradores ven todos los paquetes
    }

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
    if (!id) {
      ctx.response.status = 400;
      ctx.response.body = { 
        error: "ID de paquete inválido",
        type: "ValidationError"
      };
      return;
    }

    const packageData = await getPackageById(id);
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

