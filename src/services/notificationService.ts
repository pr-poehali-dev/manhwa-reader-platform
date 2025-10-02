export interface Notification {
  id: number;
  userId: number;
  type: 'comment_reply' | 'like' | 'mention';
  fromUser: {
    id: number;
    name: string;
  };
  commentId: number;
  manhwaId: number;
  chapterId: number;
  manhwaTitle: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const STORAGE_KEY = 'manhwa_notifications';

class NotificationService {
  private notifications: Notification[] = [];

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      this.notifications = parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt)
      }));
    }
  }

  private saveNotifications(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
  }

  createNotification(data: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const notification: Notification = {
      ...data,
      id: Date.now(),
      read: false,
      createdAt: new Date()
    };

    this.notifications.unshift(notification);
    this.saveNotifications();
    
    window.dispatchEvent(new CustomEvent('notification-added'));
    
    return notification;
  }

  getNotifications(userId: number): Notification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getUnreadCount(userId: number): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  }

  markAllAsRead(userId: number): void {
    let updated = false;
    this.notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
      }
    });
    
    if (updated) {
      this.saveNotifications();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    }
  }

  deleteNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
    window.dispatchEvent(new CustomEvent('notification-updated'));
  }

  clearAll(userId: number): void {
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    this.saveNotifications();
    window.dispatchEvent(new CustomEvent('notification-updated'));
  }
}

export const notificationService = new NotificationService();
