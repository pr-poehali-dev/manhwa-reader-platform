import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  rating: number;
  genres: string[];
  reason: string;
  similarity: number;
}

const MOCK_RECOMMENDATIONS = {
  basedOnReading: [
    {
      id: 6,
      title: 'Tomb Raider King',
      cover: 'https://picsum.photos/seed/trk/300/400',
      rating: 8.7,
      genres: ['Боевик', 'Фэнтези', 'Приключения'],
      reason: 'Похоже на Solo Leveling',
      similarity: 95
    },
    {
      id: 7,
      title: 'The Legendary Mechanic',
      cover: 'https://picsum.photos/seed/tlm/300/400',
      rating: 9.0,
      genres: ['Фэнтези', 'Боевик', 'Научная фантастика'],
      reason: 'Вам понравился жанр Боевик',
      similarity: 92
    },
    {
      id: 8,
      title: 'Overgeared',
      cover: 'https://picsum.photos/seed/og/300/400',
      rating: 8.8,
      genres: ['Боевик', 'Фэнтези', 'Игры'],
      reason: 'Популярно среди читателей Solo Leveling',
      similarity: 90
    },
  ],
  trending: [
    {
      id: 9,
      title: 'Return of the Mount Hua Sect',
      cover: 'https://picsum.photos/seed/rmhs/300/400',
      rating: 9.3,
      genres: ['Боевик', 'Исторический', 'Боевые искусства'],
      reason: 'Сейчас в тренде',
      similarity: 88
    },
    {
      id: 10,
      title: 'Nano Machine',
      cover: 'https://picsum.photos/seed/nm/300/400',
      rating: 9.1,
      genres: ['Боевик', 'Научная фантастика', 'Боевые искусства'],
      reason: 'Топ этого месяца',
      similarity: 87
    },
  ],
  similarGenres: [
    {
      id: 11,
      title: 'The Tutorial is Too Hard',
      cover: 'https://picsum.photos/seed/ttith/300/400',
      rating: 8.9,
      genres: ['Боевик', 'Фэнтези', 'Психология'],
      reason: 'Любителям жанра Фэнтези',
      similarity: 85
    },
    {
      id: 12,
      title: 'SSS-Class Suicide Hunter',
      cover: 'https://picsum.photos/seed/scssh/300/400',
      rating: 9.2,
      genres: ['Боевик', 'Фэнтези', 'Драма'],
      reason: 'Схожие жанры с вашими любимыми',
      similarity: 83
    },
  ],
  newReleases: [
    {
      id: 13,
      title: 'Infinite Mage',
      cover: 'https://picsum.photos/seed/im/300/400',
      rating: 8.6,
      genres: ['Фэнтези', 'Магия', 'Приключения'],
      reason: 'Новинка этой недели',
      similarity: 80
    },
    {
      id: 14,
      title: 'Regression Instruction Manual',
      cover: 'https://picsum.photos/seed/rim/300/400',
      rating: 8.8,
      genres: ['Фэнтези', 'Боевик', 'Психология'],
      reason: 'Только что вышло',
      similarity: 78
    },
  ]
};

export default function Recommendations() {
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
    } else {
      document.documentElement.classList.add('dark');
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

  const ManhwaCard = ({ manhwa }: { manhwa: Manhwa }) => (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
      onClick={() => navigate(`/manhwa/${manhwa.id}`)}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={manhwa.cover}
          alt={manhwa.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge variant="destructive" className="text-xs font-bold">
            <Icon name="Star" size={12} className="mr-1" />
            {manhwa.rating}
          </Badge>
          <Badge className="text-xs bg-green-600">
            {manhwa.similarity}% совпадение
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
            {manhwa.title}
          </h3>
          <p className="text-xs text-white/80 mb-2">
            <Icon name="Sparkles" size={12} className="inline mr-1" />
            {manhwa.reason}
          </p>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-1">
          {manhwa.genres.slice(0, 2).map(genre => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Рекомендации для вас</h1>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-7xl">
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Icon name="Sparkles" size={32} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Персональные рекомендации</h2>
                <p className="text-muted-foreground">
                  Мы подобрали тайтлы на основе вашей истории чтения, оценок и предпочтений. 
                  Чем больше вы читаете, тем точнее становятся рекомендации!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="reading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="reading">
              <Icon name="BookOpen" size={16} className="mr-2" />
              На основе чтения
            </TabsTrigger>
            <TabsTrigger value="trending">
              <Icon name="TrendingUp" size={16} className="mr-2" />
              В тренде
            </TabsTrigger>
            <TabsTrigger value="genres">
              <Icon name="Tag" size={16} className="mr-2" />
              Похожие жанры
            </TabsTrigger>
            <TabsTrigger value="new">
              <Icon name="Zap" size={16} className="mr-2" />
              Новинки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Специально для вас</h3>
                <p className="text-sm text-muted-foreground">
                  На основе Solo Leveling, Tower of God и других прочитанных тайтлов
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {MOCK_RECOMMENDATIONS.basedOnReading.map(manhwa => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Сейчас популярно</h3>
                <p className="text-sm text-muted-foreground">
                  Самые обсуждаемые тайтлы этого месяца
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {MOCK_RECOMMENDATIONS.trending.map(manhwa => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="genres" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Похожие по жанрам</h3>
                <p className="text-sm text-muted-foreground">
                  Тайтлы из ваших любимых жанров: Боевик, Фэнтези
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {MOCK_RECOMMENDATIONS.similarGenres.map(manhwa => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Свежие релизы</h3>
                <p className="text-sm text-muted-foreground">
                  Новые тайтлы, которые могут вам понравиться
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {MOCK_RECOMMENDATIONS.newReleases.map(manhwa => (
                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
