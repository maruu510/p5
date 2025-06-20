// === NotificationLogger.ts ===
export interface NotificationLog {
  userId: string;
  type: 'email' | 'push';
  status: 'success' | 'failed';
  message: string;
  timestamp: Date;
}

export class NotificationLogger {
  private logs: NotificationLog[] = [];

  public logNotification(log: NotificationLog): void {
    this.logs.push(log);
    console.log(`Notificación registrada: ${JSON.stringify(log)}`);
  }

  public getLogsForUser(userId: string): NotificationLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  public getRecentLogs(hours: number = 24): NotificationLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }
}
