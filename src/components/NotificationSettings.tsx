import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { notificationSettingsService } from '@/services/notificationSettingsService';

interface NotificationSettingsProps {
  userId: number;
}

export default function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState(notificationSettingsService.getSettings(userId));

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(notificationSettingsService.getSettings(userId));
    };

    window.addEventListener('notification-settings-updated', handleUpdate);
    return () => window.removeEventListener('notification-settings-updated', handleUpdate);
  }, [userId]);

  const toggleType = (type: keyof typeof settings.types) => {
    notificationSettingsService.toggleType(userId, type);
  };

  const toggleEnabled = () => {
    notificationSettingsService.toggleEnabled(userId);
  };

  const toggleSound = () => {
    notificationSettingsService.toggleSound(userId);
  };

  const toggleDesktop = () => {
    notificationSettingsService.toggleDesktop(userId);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Icon name="Settings" size={20} className="text-primary" />
          <CardTitle className="text-base">Настройки уведомлений</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Настройте, какие уведомления вы хотите получать
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled" className="text-sm font-medium">
              Все уведомления
            </Label>
            <p className="text-xs text-muted-foreground">
              Включить или выключить все уведомления
            </p>
          </div>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={toggleEnabled}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Типы уведомлений</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon name="MessageCircle" size={16} className="text-blue-500" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="comment_reply" className="text-sm">
                  Ответы на комментарии
                </Label>
                <p className="text-xs text-muted-foreground">
                  Когда кто-то отвечает на ваш комментарий
                </p>
              </div>
            </div>
            <Switch
              id="comment_reply"
              checked={settings.types.comment_reply}
              onCheckedChange={() => toggleType('comment_reply')}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Icon name="ThumbsUp" size={16} className="text-pink-500" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="like" className="text-sm">
                  Лайки
                </Label>
                <p className="text-xs text-muted-foreground">
                  Когда кто-то лайкает ваш комментарий
                </p>
              </div>
            </div>
            <Switch
              id="like"
              checked={settings.types.like}
              onCheckedChange={() => toggleType('like')}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Icon name="AtSign" size={16} className="text-purple-500" />
              </div>
              <div className="space-y-0.5">
                <Label htmlFor="mention" className="text-sm">
                  Упоминания
                </Label>
                <p className="text-xs text-muted-foreground">
                  Когда кто-то упоминает вас в комментарии
                </p>
              </div>
            </div>
            <Switch
              id="mention"
              checked={settings.types.mention}
              onCheckedChange={() => toggleType('mention')}
              disabled={!settings.enabled}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Дополнительно</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Volume2" size={16} className="text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="sound" className="text-sm">
                  Звук
                </Label>
                <p className="text-xs text-muted-foreground">
                  Воспроизводить звук при новых уведомлениях
                </p>
              </div>
            </div>
            <Switch
              id="sound"
              checked={settings.sound}
              onCheckedChange={toggleSound}
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Monitor" size={16} className="text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="desktop" className="text-sm">
                  Десктоп уведомления
                </Label>
                <p className="text-xs text-muted-foreground">
                  Показывать уведомления на рабочем столе
                </p>
              </div>
            </div>
            <Switch
              id="desktop"
              checked={settings.desktop}
              onCheckedChange={toggleDesktop}
              disabled={!settings.enabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
