import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { userStatsService } from '@/services/userStatsService';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserStatsProps {
  userId: number;
}

export default function UserStats({ userId }: UserStatsProps) {
  const [stats, setStats] = useState(userStatsService.getStats(userId));
  const [achievements, setAchievements] = useState(userStatsService.getAchievements(userId));

  useEffect(() => {
    const handleUpdate = () => {
      setStats(userStatsService.getStats(userId));
      setAchievements(userStatsService.getAchievements(userId));
    };

    window.addEventListener('user-stats-updated', handleUpdate);
    return () => window.removeEventListener('user-stats-updated', handleUpdate);
  }, [userId]);

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const achievementProgress = (unlockedAchievements / totalAchievements) * 100;

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч`;
    const days = Math.floor(hours / 24);
    return `${days} дн`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={24} className="text-primary" />
            Статистика активности
          </CardTitle>
          <CardDescription>
            Последняя активность: {formatDistanceToNow(new Date(stats.lastActiveDate), { 
              addSuffix: true, 
              locale: ru 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="BookOpen" size={20} className="text-blue-500" />
                <span className="text-sm text-muted-foreground">Прочитано глав</span>
              </div>
              <p className="text-3xl font-bold text-blue-500">{stats.chaptersRead}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="MessageCircle" size={20} className="text-purple-500" />
                <span className="text-sm text-muted-foreground">Комментариев</span>
              </div>
              <p className="text-3xl font-bold text-purple-500">{stats.commentsCount}</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 rounded-lg p-4 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Heart" size={20} className="text-pink-500" />
                <span className="text-sm text-muted-foreground">Получено лайков</span>
              </div>
              <p className="text-3xl font-bold text-pink-500">{stats.likesReceived}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg p-4 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Flame" size={20} className="text-orange-500" />
                <span className="text-sm text-muted-foreground">Серия дней</span>
              </div>
              <p className="text-3xl font-bold text-orange-500">{stats.readingStreak}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Поставлено лайков</span>
                <Icon name="ThumbsUp" size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold">{stats.likesGiven}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Время чтения</span>
                <Icon name="Clock" size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold">{formatTime(stats.totalReadingTime)}</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Всего манхв</span>
                <Icon name="Library" size={16} className="text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold">{userStatsService.getTotalManhwaRead(userId)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trophy" size={24} className="text-yellow-500" />
                Достижения
              </CardTitle>
              <CardDescription>
                Открыто {unlockedAchievements} из {totalAchievements}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.round(achievementProgress)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={achievementProgress} className="mb-6 h-2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30'
                    : 'bg-muted/30 border-muted opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                      achievement.unlocked
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon name={achievement.icon as any} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{achievement.name}</h4>
                      {achievement.unlocked && (
                        <Icon name="CheckCircle2" size={16} className="text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
