import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  type: 'chapter' | 'comment' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  manhwaId?: number;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'chapter',
    title: 'Solo Leveling',
    message: 'Вышла новая глава 180',
    time: '5 минут назад',
    read: false,
    manhwaId: 1
  },
  {
    id: 2,
    type: 'chapter',
    title: 'The Beginning After The End',
    message: 'Вышла новая глава 156',
    time: '1 час назад',
    read: false,
    manhwaId: 2
  },
  {
    id: 3,
    type: 'comment',
    title: 'Новый комментарий',
    message: 'Кто-то ответил на ваш комментарий',
    time: '3 часа назад',
    read: true,
    manhwaId: 1
  },
  {
    id: 4,
    type: 'system',
    title: 'Системное уведомление',
    message: 'Добро пожаловать на MANHWA READER!',
    time: '1 день назад',
    read: true
  },
];

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.manhwaId) {
      navigate(`/manhwa/${notification.manhwaId}`);
      setOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'chapter': return 'BookOpen';
      case 'comment': return 'MessageCircle';
      case 'system': return 'Bell';
      default: return 'Bell';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Уведомления</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Прочитать все
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="BellOff" size={48} className="mx-auto mb-2 opacity-50" />
                <p>Нет уведомлений</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer transition-colors hover:bg-accent ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon name={getIcon(notification.type)} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm truncate">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
