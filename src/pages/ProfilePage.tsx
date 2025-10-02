import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeService } from '@/services/BadgeService';
import { userStatsService } from '@/services/userStatsService';
import { leaderboardService } from '@/services/leaderboardService';
import BadgeCard from '@/components/BadgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export default function ProfilePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const navigate = useNavigate();
  const currentUserId = 1;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const userStats = userStatsService.getStats(currentUserId);
  const rankWeek = leaderboardService.getUserRank(currentUserId, 'chapters', 'week');
  const rankMonth = leaderboardService.getUserRank(currentUserId, 'chapters', 'month');
  const rankAll = leaderboardService.getUserRank(currentUserId, 'chapters', 'allTime');

  const userBadges = BadgeService.getUserBadges({
    chapters: userStats.chaptersRead,
    comments: userStats.commentsCount,
    likes: userStats.likesReceived,
    streak: userStats.readingStreak,
    rankWeek,
    rankMonth,
    rankAll
  });

  const allBadges = BadgeService.getAvailableBadges();
  const lockedBadges = allBadges.filter(badge => 
    !userBadges.find(ub => ub.id === badge.id)
  );

  const totalBadges = allBadges.length;
  const badgeProgress = (userBadges.length / totalBadges) * 100;

  const topBadge = userBadges.length > 0 
    ? userBadges.sort((a, b) => {
        const rarityOrder = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      })[0]
    : null;

  const rarityLabels = {
    common: 'Обычный',
    rare: 'Редкий',
    epic: 'Эпический',
    legendary: 'Легендарный',
    mythic: 'Мифический'
  };

  const badgesByRarity = {
    mythic: userBadges.filter(b => b.rarity === 'mythic').length,
    legendary: userBadges.filter(b => b.rarity === 'legendary').length,
    epic: userBadges.filter(b => b.rarity === 'epic').length,
    rare: userBadges.filter(b => b.rarity === 'rare').length,
    common: userBadges.filter(b => b.rarity === 'common').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/95 shadow-lg shadow-primary/5">
        <div className="container flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Мой профиль
              </h1>
              <p className="text-sm text-muted-foreground">Статистика и достижения</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Александр Иванов</h2>
                    <p className="text-muted-foreground">@alex_reader</p>
                    {topBadge && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl">{topBadge.icon}</span>
                        <span className="text-sm font-medium text-primary">{topBadge.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настройки
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <Icon name="BookOpen" size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{userStats.chaptersRead}</p>
                  <p className="text-xs text-muted-foreground">Глав прочитано</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/5">
                  <Icon name="MessageCircle" size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{userStats.commentsCount}</p>
                  <p className="text-xs text-muted-foreground">Комментариев</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-pink-500/5">
                  <Icon name="Heart" size={24} className="mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold">{userStats.likesReceived}</p>
                  <p className="text-xs text-muted-foreground">Лайков получено</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-orange-500/5">
                  <Icon name="Flame" size={24} className="mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{userStats.readingStreak}</p>
                  <p className="text-xs text-muted-foreground">Дней подряд</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Trophy" size={20} />
                Рейтинги
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <span className="text-sm font-medium">За неделю</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">#{rankWeek}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📆</span>
                  <span className="text-sm font-medium">За месяц</span>
                </div>
                <span className="text-lg font-bold text-blue-600">#{rankMonth}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm font-medium">Всё время</span>
                </div>
                <span className="text-lg font-bold text-purple-600">#{rankAll}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" size={24} className="text-primary" />
              Коллекция наград
            </CardTitle>
            <CardDescription>
              Собрано {userBadges.length} из {totalBadges} наград ({badgeProgress.toFixed(0)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Прогресс коллекции</span>
                <span className="text-sm text-muted-foreground">{userBadges.length}/{totalBadges}</span>
              </div>
              <Progress value={badgeProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-5 gap-4 mb-6">
              {Object.entries(badgesByRarity).map(([rarity, count]) => (
                <div key={rarity} className="text-center p-3 rounded-lg border border-border/50">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{rarityLabels[rarity as keyof typeof rarityLabels]}</p>
                </div>
              ))}
            </div>

            <Tabs defaultValue="unlocked" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="unlocked" className="gap-2">
                  <Icon name="CheckCircle2" size={16} />
                  Получено ({userBadges.length})
                </TabsTrigger>
                <TabsTrigger value="locked" className="gap-2">
                  <Icon name="Lock" size={16} />
                  Заблокировано ({lockedBadges.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="unlocked">
                {userBadges.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userBadges.map(badge => (
                      <BadgeCard 
                        key={badge.id} 
                        badge={badge}
                        unlocked={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Award" size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium mb-2">Пока нет наград</p>
                    <p className="text-sm">Продолжайте читать и участвовать в жизни сообщества!</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="locked">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {lockedBadges.map(badge => {
                    const progress = BadgeService.getBadgeProgress(badge, {
                      chapters: userStats.chaptersRead,
                      comments: userStats.commentsCount,
                      likes: userStats.likesReceived,
                      streak: userStats.readingStreak,
                      rankWeek,
                      rankMonth,
                      rankAll
                    });
                    
                    return (
                      <BadgeCard 
                        key={badge.id} 
                        badge={badge}
                        progress={progress}
                        unlocked={false}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Activity" size={24} className="text-primary" />
              Активность
            </CardTitle>
            <CardDescription>
              История активности за последнее время
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="BookOpen" size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Прочитана глава 142</p>
                  <p className="text-sm text-muted-foreground">Всемогущий маг • 2 часа назад</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Icon name="MessageCircle" size={20} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Оставлен комментарий</p>
                  <p className="text-sm text-muted-foreground">Мастер клинка • 5 часов назад</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Icon name="Award" size={20} className="text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Получена награда "Энтузиаст"</p>
                  <p className="text-sm text-muted-foreground">Прочитано 100 глав • вчера</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
