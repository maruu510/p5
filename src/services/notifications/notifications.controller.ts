import { EmailNotifier } from "./EmailNotifier.ts";
import { getUserByUsername } from "../../auth/models/user.ts"; 
const emailNotifier = new EmailNotifier();

export const sendNotificationHandler = async (ctx: any) => {
  try {
    const { residentId, title, message } = await ctx.request.body({ type: "json" }).value;

    const user = await getUserByUsername(residentId); 
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    await emailNotifier.notifyCustom(user, title, message);

    ctx.response.status = 200;
    ctx.response.body = { success: true, message: "Notificación enviada" };
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Error interno del servidor" };
  }
};