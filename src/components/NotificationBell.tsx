import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { notificationService, type Notification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import NotificationSettings from './NotificationSettings';

interface NotificationBellProps {
  userId: number;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const navigate = useNavigate();

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications(userId));
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    
    window.addEventListener('notification-added', handleUpdate);
    window.addEventListener('notification-updated', handleUpdate);

    return () => {
      window.removeEventListener('notification-added', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead(userId);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.manhwaId) {
      navigate(`/manhwa/${notification.manhwaId}/read?chapter=${notification.chapterId}`);
      setOpen(false);
    }
  };

  const deleteNotification = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    notificationService.deleteNotification(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment_reply': return 'MessageCircle';
      case 'like': return 'ThumbsUp';
      case 'mention': return 'AtSign';
      default: return 'Bell';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'comment_reply': return 'text-blue-500';
      case 'like': return 'text-pink-500';
      case 'mention': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 px-1 flex items-center justify-center text-xs font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="notifications" className="gap-2">
              <Icon name="Bell" size={14} />
              Уведомления
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-4 min-w-[16px] px-1 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Icon name="Settings" size={14} />
              Настройки
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="m-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Уведомления</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Прочитать все
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => notificationService.clearAll(userId)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    Очистить
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Icon name="BellOff" size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Нет уведомлений</p>
                <p className="text-sm mt-1">Здесь будут отображаться ответы на ваши комментарии</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b cursor-pointer transition-all hover:bg-accent group ${
                      !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        !notification.read ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon 
                          name={getIcon(notification.type)} 
                          size={20} 
                          className={getIconColor(notification.type)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {notification.fromUser.name}
                          </p>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => deleteNotification(e, notification.id)}
                            >
                              <Icon name="X" size={14} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-primary">{notification.manhwaTitle}</span>
                          <span>•</span>
                          <span>Глава {notification.chapterId}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(notification.createdAt, { 
                              addSuffix: true, 
                              locale: ru 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="m-0">
            <NotificationSettings userId={userId} />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}