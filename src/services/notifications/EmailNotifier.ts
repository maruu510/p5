import { User } from "../../auth/models/user.ts";
import { NotificationStrategy } from "./notification.strategy.interface.ts";
import { NotificationLogger } from "./NotificationLogger.ts";

interface TemplateParams {
  to_name: string;
  subject: string;
  package_id?: string;
  message: string;
  type: string;
  to_email?: string;
}

export class EmailNotifier implements NotificationStrategy {
  private logger: NotificationLogger;
  private readonly PUBLIC_KEY = "CfvZkAoNd3dmanVEl";
  private readonly TEMPLATE_ID = "template_bct2j24";
  private readonly SERVICE_ID = "service_pp";

  constructor() {
    this.logger = new NotificationLogger();
  }

  private async sendEmail(to: string, templateParams: TemplateParams): Promise<void> {
    try {
      console.log("\n=== Simulación de EmailJS ===");
      console.log("Destinatario:", to);
      console.log("Parámetros de plantilla:", JSON.stringify(templateParams, null, 2));
      console.log("===========================\n");

      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: this.SERVICE_ID,
          template_id: this.TEMPLATE_ID,
          user_id: this.PUBLIC_KEY,
          template_params: {
            to_email: to,
            ...templateParams,
          },
        }),
      });

      this.logger.logNotification({
        userId: to,
        type: "email",
        status: "success",
        message: `Email simulado enviado: ${templateParams.subject}`,
        timestamp: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.logNotification({
        userId: to,
        type: "email",
        status: "failed",
        message: `Error al enviar email: ${errorMessage}`,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  public async notifyPackageArrival(user: User, packageId: string): Promise<void> {
    await this.sendEmail(user.email, {
      to_name: user.fullName || "Usuario",
      subject: "Nuevo paquete recibido",
      package_id: packageId,
      message: `Se ha recibido un nuevo paquete con ID: ${packageId} para ti.`,
      type: "arrival",
    });
  }

  public async notifyPickupReminder(user: User, packageId: string): Promise<void> {
    await this.sendEmail(user.email, {
      to_name: user.fullName || "Usuario",
      subject: "Recordatorio de retiro de paquete",
      package_id: packageId,
      message: `Te recordamos que tienes un paquete pendiente de retirar (ID: ${packageId}).`,
      type: "reminder",
    });
  }

  public async notifyCustom(user: User, title: string, message: string): Promise<void> {
    await this.sendEmail(user.email, {
      to_name: user.fullName || "Usuario",
      subject: title,
      message,
      type: "custom",
    });
  }
}