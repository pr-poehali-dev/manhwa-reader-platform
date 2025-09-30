import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: 'Первые шаги',
    description: 'Прочитайте первую главу',
    icon: 'BookOpen',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    reward: '+10 XP',
    rarity: 'common'
  },
  {
    id: 2,
    title: 'Заядлый читатель',
    description: 'Прочитайте 100 глав',
    icon: 'BookMarked',
    progress: 65,
    maxProgress: 100,
    unlocked: false,
    reward: '+50 XP',
    rarity: 'rare'
  },
  {
    id: 3,
    title: 'Коллекционер',
    description: 'Добавьте 50 тайтлов в закладки',
    icon: 'Bookmark',
    progress: 23,
    maxProgress: 50,
    unlocked: false,
    reward: '+100 XP',
    rarity: 'epic'
  },
  {
    id: 4,
    title: 'Критик',
    description: 'Оставьте 25 комментариев',
    icon: 'MessageCircle',
    progress: 8,
    maxProgress: 25,
    unlocked: false,
    reward: '+75 XP',
    rarity: 'rare'
  },
  {
    id: 5,
    title: 'Легенда',
    description: 'Прочитайте 1000 глав',
    icon: 'Crown',
    progress: 156,
    maxProgress: 1000,
    unlocked: false,
    reward: '+500 XP',
    rarity: 'legendary'
  },
  {
    id: 6,
    title: 'Ночной читатель',
    description: 'Прочитайте 10 глав после полуночи',
    icon: 'Moon',
    progress: 10,
    maxProgress: 10,
    unlocked: true,
    reward: '+25 XP',
    rarity: 'common'
  },
  {
    id: 7,
    title: 'Марафонец',
    description: 'Прочитайте 50 глав за один день',
    icon: 'Zap',
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    reward: '+150 XP',
    rarity: 'epic'
  },
  {
    id: 8,
    title: 'Ценитель',
    description: 'Поставьте оценку 50 тайтлам',
    icon: 'Star',
    progress: 12,
    maxProgress: 50,
    unlocked: false,
    reward: '+80 XP',
    rarity: 'rare'
  },
];

export default function Achievements() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const navigate = useNavigate();

  const totalXP = MOCK_ACHIEVEMENTS
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + parseInt(a.reward.replace(/[^0-9]/g, '')), 0);

  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;

  const filteredAchievements = MOCK_ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Достижения</h1>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Trophy" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unlockedCount}/{totalCount}</p>
                  <p className="text-sm text-muted-foreground">Разблокировано</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Zap" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalXP} XP</p>
                  <p className="text-sm text-muted-foreground">Всего опыта</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Target" size={24} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round((unlockedCount / totalCount) * 100)}%</p>
                  <p className="text-sm text-muted-foreground">Прогресс</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Все ({totalCount})
          </Button>
          <Button
            variant={filter === 'unlocked' ? 'default' : 'outline'}
            onClick={() => setFilter('unlocked')}
          >
            Разблокированные ({unlockedCount})
          </Button>
          <Button
            variant={filter === 'locked' ? 'default' : 'outline'}
            onClick={() => setFilter('locked')}
          >
            Заблокированные ({totalCount - unlockedCount})
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`${achievement.unlocked ? 'border-primary/50' : 'opacity-75'}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center shrink-0 ${
                    achievement.unlocked ? getRarityColor(achievement.rarity) : 'bg-muted'
                  }`}>
                    <Icon
                      name={achievement.icon as any}
                      size={32}
                      className={achievement.unlocked ? 'text-white' : 'text-muted-foreground'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Icon name="CheckCircle2" size={20} className="text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                    
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Прогресс</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                        {achievement.reward}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {achievement.rarity === 'common' && 'Обычное'}
                        {achievement.rarity === 'rare' && 'Редкое'}
                        {achievement.rarity === 'epic' && 'Эпическое'}
                        {achievement.rarity === 'legendary' && 'Легендарное'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
