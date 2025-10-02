import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { 
  leaderboardService, 
  type LeaderboardEntry, 
  type LeaderboardPeriod, 
  type LeaderboardType 
} from '@/services/leaderboardService';

interface LeaderboardProps {
  currentUserId?: number;
  compact?: boolean;
}

export default function Leaderboard({ currentUserId = 1, compact = false }: LeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [type, setType] = useState<LeaderboardType>('chapters');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [period, type]);

  const loadLeaderboard = () => {
    const data = leaderboardService.getTopUsers(type, period, compact ? 10 : 100);
    setEntries(data);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-amber-500';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-muted to-muted';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <Icon name="TrendingUp" size={14} className="text-green-500" />;
    if (change < 0) return <Icon name="TrendingDown" size={14} className="text-red-500" />;
    return <Icon name="Minus" size={14} className="text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Trophy" size={24} className="text-yellow-500" />
              Рейтинг читателей
            </CardTitle>
            <CardDescription>
              Топ активных пользователей сообщества
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">
              <Icon name="Calendar" size={14} className="mr-2" />
              Неделя
            </TabsTrigger>
            <TabsTrigger value="month">
              <Icon name="CalendarDays" size={14} className="mr-2" />
              Месяц
            </TabsTrigger>
            <TabsTrigger value="allTime">
              <Icon name="Infinity" size={14} className="mr-2" />
              Всё время
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            variant={type === 'chapters' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('chapters')}
            className="gap-1"
          >
            <Icon name="BookOpen" size={14} />
            Главы
          </Button>
          <Button
            variant={type === 'comments' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('comments')}
            className="gap-1"
          >
            <Icon name="MessageCircle" size={14} />
            Комм.
          </Button>
          <Button
            variant={type === 'likes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('likes')}
            className="gap-1"
          >
            <Icon name="Heart" size={14} />
            Лайки
          </Button>
          <Button
            variant={type === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('streak')}
            className="gap-1"
          >
            <Icon name="Flame" size={14} />
            Серия
          </Button>
        </div>

        <div className="space-y-2">
          {entries.slice(0, compact ? 10 : 100).map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isTop3 = entry.rank <= 3;

            return (
              <div
                key={entry.userId}
                className={`rounded-lg border transition-all ${
                  isCurrentUser
                    ? 'bg-primary/10 border-primary/50 shadow-sm'
                    : isTop3
                    ? 'bg-gradient-to-r ' + getRankColor(entry.rank) + ' bg-opacity-10 border-opacity-30'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                      isTop3
                        ? 'bg-gradient-to-br ' + getRankColor(entry.rank) + ' text-white shadow-md'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{entry.avatar}</span>
                      <span className="font-semibold truncate">
                        {entry.username}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Вы
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="BookOpen" size={12} />
                        {entry.chaptersRead}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MessageCircle" size={12} />
                        {entry.commentsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Heart" size={12} />
                        {entry.likesReceived}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Flame" size={12} />
                        {entry.readingStreak}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {entry.score}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {getChangeIcon(entry.change)}
                      <span className={entry.change > 0 ? 'text-green-500' : entry.change < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                        {Math.abs(entry.change)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!compact && entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-3 opacity-30" />
            <p>Нет данных для отображения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
