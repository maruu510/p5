export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'never';
  }
  
  export class NotificationConfig {
    private static instance: NotificationConfig;
    private preferences: Map<string, NotificationPreferences> = new Map();
  
    private constructor() {}
  
    public static getInstance(): NotificationConfig {
      if (!NotificationConfig.instance) {
        NotificationConfig.instance = new NotificationConfig();
      }
      return NotificationConfig.instance;
    }
  
    public setUserPreferences(userId: string, preferences: NotificationPreferences): void {
      this.preferences.set(userId, preferences);
    }
  
    public getUserPreferences(userId: string): NotificationPreferences {
      return this.preferences.get(userId) || {
        email: true,
        push: true,
        reminderFrequency: 'daily'
      };
    }
  }