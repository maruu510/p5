import { User } from "../../auth/models/user.ts";
import { NotificationStrategy } from "./notification.strategy.interface.ts";
import { NotificationLogger } from "./NotificationLogger.ts";

export class EmailNotifier implements NotificationStrategy {
  private logger: NotificationLogger;
  private readonly PUBLIC_KEY = "TU_PUBLIC_KEY"; // Reemplazar con tu clave pública de EmailJS
  private readonly TEMPLATE_ID = "TU_TEMPLATE_ID"; // Reemplazar con tu ID de plantilla
  private readonly SERVICE_ID = "TU_SERVICE_ID"; // Reemplazar con tu ID de servicio

  constructor() {
    this.logger = new NotificationLogger();
  }

  private async sendEmail(to: string, templateParams: any): Promise<void> {
    try {
      // Simulación de EmailJS para pruebas
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
        type: 'email',
        status: 'success',
        message: `Email simulado enviado: ${templateParams.subject}`,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.logNotification({
        userId: to,
        type: 'email',
        status: 'failed',
        message: `Error al enviar email: ${error.message}`,
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async notifyPackageArrival(user: User, packageId: string): Promise<void> {
    await this.sendEmail(user.email, {
      to_name: user.name,
      subject: "Nuevo paquete recibido",
      package_id: packageId,
      message: `Se ha recibido un nuevo paquete con ID: ${packageId} para ti.`,
      type: "arrival"
    });
  }

  public async notifyPickupReminder(user: User, packageId: string): Promise<void> {
    await this.sendEmail(user.email, {
      to_name: user.name,
      subject: "Recordatorio de retiro de paquete",
      package_id: packageId,
      message: `Te recordamos que tienes un paquete pendiente de retirar (ID: ${packageId}).`,
      type: "reminder"
    });
  }
}