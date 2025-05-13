import { User } from "../../auth/models/user.ts";
import { NotificationStrategy } from "./notification.strategy.interface.ts";
import { NotificationLogger } from "./NotificationLogger.ts";

export class PushNotifier implements NotificationStrategy {
  private logger: NotificationLogger;

  constructor() {
    this.logger = new NotificationLogger();
  }

  private async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    
    console.log(`Enviando notificación push a usuario ${userId}`);
    console.log(`Título: ${title}`);
    console.log(`Mensaje: ${message}`);
  }

  public async notifyPackageArrival(user: User, packageId: string): Promise<void> {
    try {
      await this.sendPushNotification(
        user.id.toString(),
        "Nuevo Paquete",
        `Se ha recibido un nuevo paquete para ti (ID: ${packageId})`
      );
      
      this.logger.logNotification({
        userId: user.id.toString(),
        type: 'push',
        status: 'success',
        message: `Notificación push de llegada enviada para el paquete ${packageId}`,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.logNotification({
        userId: user.id.toString(),
        type: 'push',
        status: 'failed',
        message: `Error al enviar notificación push: ${error.message}`,
        timestamp: new Date()
      });
      throw error;
    }
  }

  public async notifyPickupReminder(user: User, packageId: string): Promise<void> {
    try {
      await this.sendPushNotification(
        user.id.toString(),
        "Recordatorio de Paquete",
        `Tienes un paquete pendiente por retirar (ID: ${packageId})`
      );
      
      this.logger.logNotification({
        userId: user.id.toString(),
        type: 'push',
        status: 'success',
        message: `Recordatorio push enviado para el paquete ${packageId}`,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.logNotification({
        userId: user.id.toString(),
        type: 'push',
        status: 'failed',
        message: `Error al enviar recordatorio push: ${error.message}`,
        timestamp: new Date()
      });
      throw error;
    }
  }
}