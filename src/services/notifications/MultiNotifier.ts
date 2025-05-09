import { NotificationStrategy } from "./notification.strategy.interface.ts";
import { User } from "../../auth/models/user.ts";
import { NotificationConfig } from "./NotificationConfig.ts";
import { NotificationLogger } from "./NotificationLogger.ts";
import { EmailNotifier } from "./EmailNotifier.ts";
import { PushNotifier } from "./PushNotifier.ts";

export class MultiNotifier implements NotificationStrategy {
  private strategies: Map<string, NotificationStrategy> = new Map();
  private config: NotificationConfig;
  private logger: NotificationLogger;

  constructor() {
    this.config = NotificationConfig.getInstance();
    this.logger = new NotificationLogger();
    
    // Inicializar estrategias disponibles
    this.strategies.set('email', new EmailNotifier());
    this.strategies.set('push', new PushNotifier());
  }

  public async notifyPackageArrival(user: User, packageId: string): Promise<void> {
    const preferences = this.config.getUserPreferences(user.id.toString());
    const errors: Error[] = [];

    if (preferences.email) {
      try {
        await this.strategies.get('email')?.notifyPackageArrival(user, packageId);
      } catch (error) {
        errors.push(error);
      }
    }

    if (preferences.push) {
      try {
        await this.strategies.get('push')?.notifyPackageArrival(user, packageId);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores en notificaciones: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  public async notifyPickupReminder(user: User, packageId: string): Promise<void> {
    const preferences = this.config.getUserPreferences(user.id.toString());
    const errors: Error[] = [];

    if (preferences.email) {
      try {
        await this.strategies.get('email')?.notifyPickupReminder(user, packageId);
      } catch (error) {
        errors.push(error);
      }
    }

    if (preferences.push) {
      try {
        await this.strategies.get('push')?.notifyPickupReminder(user, packageId);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errores en recordatorios: ${errors.map(e => e.message).join(', ')}`);
    }
  }
}