export interface NotificationSettings {
  userId: number;
  enabled: boolean;
  types: {
    comment_reply: boolean;
    like: boolean;
    mention: boolean;
  };
  sound: boolean;
  desktop: boolean;
}

const STORAGE_KEY = 'manhwa_notification_settings';

class NotificationSettingsService {
  private settings: Map<number, NotificationSettings> = new Map();

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.settings = new Map(Object.entries(parsed).map(([key, value]) => [Number(key), value as NotificationSettings]));
    }
  }

  private saveSettings(): void {
    const obj = Object.fromEntries(this.settings.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    window.dispatchEvent(new CustomEvent('notification-settings-updated'));
  }

  getSettings(userId: number): NotificationSettings {
    if (!this.settings.has(userId)) {
      this.settings.set(userId, {
        userId,
        enabled: true,
        types: {
          comment_reply: true,
          like: true,
          mention: true
        },
        sound: false,
        desktop: false
      });
      this.saveSettings();
    }
    return this.settings.get(userId)!;
  }

  updateSettings(userId: number, updates: Partial<NotificationSettings>): void {
    const current = this.getSettings(userId);
    const updated = { ...current, ...updates };
    this.settings.set(userId, updated);
    this.saveSettings();
  }

  toggleType(userId: number, type: keyof NotificationSettings['types']): void {
    const settings = this.getSettings(userId);
    settings.types[type] = !settings.types[type];
    this.settings.set(userId, settings);
    this.saveSettings();
  }

  toggleEnabled(userId: number): void {
    const settings = this.getSettings(userId);
    settings.enabled = !settings.enabled;
    this.settings.set(userId, settings);
    this.saveSettings();
  }

  toggleSound(userId: number): void {
    const settings = this.getSettings(userId);
    settings.sound = !settings.sound;
    this.settings.set(userId, settings);
    this.saveSettings();
  }

  toggleDesktop(userId: number): void {
    const settings = this.getSettings(userId);
    settings.desktop = !settings.desktop;
    this.settings.set(userId, settings);
    this.saveSettings();
  }

  isTypeEnabled(userId: number, type: keyof NotificationSettings['types']): boolean {
    const settings = this.getSettings(userId);
    return settings.enabled && settings.types[type];
  }
}

export const notificationSettingsService = new NotificationSettingsService();
