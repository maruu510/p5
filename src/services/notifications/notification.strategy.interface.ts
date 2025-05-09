import { User } from "../../auth/models/user.ts";

export interface NotificationStrategy {
  notifyPackageArrival(user: User, packageId: string): Promise<void>;
  notifyPickupReminder(user: User, packageId: string): Promise<void>;
}