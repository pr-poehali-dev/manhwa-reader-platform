import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { leaderboardService } from '@/services/leaderboardService';
import { BadgeService } from '@/services/BadgeService';
import { userStatsService } from '@/services/userStatsService';
import BadgeCard from '@/components/BadgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaderboardPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const navigate = useNavigate();

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

  const currentUserRank = leaderboardService.getUserRank(1, 'chapters', 'week');
  const totalUsers = 15;
  
  const userStats = userStatsService.getStats(1);
  const userBadges = BadgeService.getUserBadges({
    chapters: userStats.chaptersRead,
    comments: userStats.commentsCount,
    likes: userStats.likesReceived,
    streak: userStats.readingStreak,
    rankWeek: currentUserRank,
    rankMonth: leaderboardService.getUserRank(1, 'chapters', 'month'),
    rankAll: leaderboardService.getUserRank(1, 'chapters', 'allTime')
  });
  
  const allBadges = BadgeService.getAvailableBadges();
  const lockedBadges = allBadges.filter(badge => 
    !userBadges.find(ub => ub.id === badge.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/95 shadow-lg shadow-primary/5">
        <div className="container flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Рейтинг читателей
              </h1>
              <p className="text-sm text-muted-foreground">Лучшие участники сообщества</p>
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
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-2xl">
                  👑
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ваше место</p>
                  <p className="text-3xl font-bold text-yellow-500">#{currentUserRank}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Icon name="Users" size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Всего участников</p>
                  <p className="text-3xl font-bold text-blue-500">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Icon name="TrendingUp" size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Изменение</p>
                  <p className="text-3xl font-bold text-purple-500">+3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border-yellow-500/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg">
                  👑
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
                  1 место
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-1">Александр</h3>
              <p className="text-sm text-muted-foreground mb-3">Абсолютный чемпион</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="BookOpen" size={14} className="text-yellow-600" />
                  <span className="font-semibold text-yellow-600">250</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="MessageCircle" size={14} className="text-yellow-600" />
                  <span className="font-semibold text-yellow-600">120</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-400/5 to-gray-500/5 border-gray-400/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-2xl shadow-lg">
                  🥈
                </div>
                <Badge variant="outline" className="text-gray-600 border-gray-400/50">
                  2 место
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-1">Мария</h3>
              <p className="text-sm text-muted-foreground mb-3">Серебряный призёр</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="BookOpen" size={14} className="text-gray-600" />
                  <span className="font-semibold text-gray-600">235</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="MessageCircle" size={14} className="text-gray-600" />
                  <span className="font-semibold text-gray-600">105</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600/5 to-orange-700/5 border-orange-600/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-2xl shadow-lg">
                  🥉
                </div>
                <Badge variant="outline" className="text-orange-700 border-orange-600/50">
                  3 место
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-1">Дмитрий</h3>
              <p className="text-sm text-muted-foreground mb-3">Бронзовый призёр</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Icon name="BookOpen" size={14} className="text-orange-700" />
                  <span className="font-semibold text-orange-700">220</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="MessageCircle" size={14} className="text-orange-700" />
                  <span className="font-semibold text-orange-700">98</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Leaderboard currentUserId={1} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" size={24} className="text-primary" />
              Награды и достижения
            </CardTitle>
            <CardDescription>
              Коллекция значков и наград за активность
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      rankWeek: currentUserRank,
                      rankMonth: leaderboardService.getUserRank(1, 'chapters', 'month'),
                      rankAll: leaderboardService.getUserRank(1, 'chapters', 'allTime')
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
      </main>
    </div>
  );
}