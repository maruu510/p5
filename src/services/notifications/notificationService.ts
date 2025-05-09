import { NotificationStrategy } from "./notification.strategy.interface.ts";
import { User } from "../../auth/models/user.ts";

export class NotificationService {
  private strategy: NotificationStrategy;

  constructor(strategy: NotificationStrategy) {
    this.strategy = strategy;
  }

  public async notifyPackageArrival(user: User, packageId: string): Promise<void> {
    await this.strategy.notifyPackageArrival(user, packageId);
  }

  public async notifyPickupReminder(user: User, packageId: string): Promise<void> {
    await this.strategy.notifyPickupReminder(user, packageId);
  }

  public setStrategy(strategy: NotificationStrategy): void {
    this.strategy = strategy;
  }
}