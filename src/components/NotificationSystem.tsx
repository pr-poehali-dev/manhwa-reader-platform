import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'new_chapter' | 'early_access' | 'announcement';
  title: string;
  message: string;
  manhwaId?: number;
  novelId?: number;
  chapterNumber?: number;
  timestamp: Date;
  read: boolean;
  imageUrl?: string;
}

interface NotificationSystemProps {
  userId: string;
}

export default function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem(`notifications_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(`notifications_${userId}`);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.manhwaId && notification.chapterNumber) {
      navigate(`/reader/${notification.manhwaId}`);
    } else if (notification.novelId && notification.chapterNumber) {
      navigate(`/novel-reader/${notification.novelId}/${notification.chapterNumber}`);
    } else if (notification.manhwaId) {
      navigate(`/manhwa/${notification.manhwaId}`);
    } else if (notification.novelId) {
      navigate(`/novel/${notification.novelId}`);
    }
    
    setIsOpen(false);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_chapter':
        return 'BookOpen';
      case 'early_access':
        return 'Crown';
      case 'announcement':
        return 'Megaphone';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'new_chapter':
        return 'text-blue-500';
      case 'early_access':
        return 'text-yellow-500';
      case 'announcement':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="absolute right-0 top-12 z-50 w-96 max-h-[600px] overflow-hidden shadow-lg">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Уведомления</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} непрочитанных
                  </p>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                    >
                      <Icon name="CheckCheck" size={16} className="mr-1" />
                      Все прочитано
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAll}
                    title="Очистить все"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Icon name="Bell" size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Уведомлений пока нет
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Здесь будут появляться новые главы и объявления
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                          <Icon name={getNotificationIcon(notification.type)} size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            
                            {notification.type === 'early_access' && (
                              <Badge variant="secondary" className="text-xs">
                                <Icon name="Crown" size={10} className="mr-1" />
                                Ранний доступ
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function createNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): void {
  const stored = localStorage.getItem(`notifications_${userId}`);
  const existing: Notification[] = stored ? JSON.parse(stored) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    read: false
  };
  
  const updated = [newNotification, ...existing].slice(0, 50);
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
  
  window.dispatchEvent(new Event('storage'));
}
