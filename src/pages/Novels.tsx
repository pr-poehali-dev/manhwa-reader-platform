import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import NotificationBell from '@/components/NotificationBell';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';

interface Novel {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genres: string[];
  views: number;
  author: string;
  type: string;
}

const MOCK_NOVELS: Novel[] = [
  {
    id: 1,
    title: 'Всемогущий Маг',
    cover: 'https://picsum.photos/seed/novel1/300/400',
    chapters: 450,
    rating: 9.2,
    status: 'ongoing',
    genres: ['Фэнтези', 'Приключения', 'Магия'],
    views: 1234567,
    author: 'Автор 1',
    type: 'Ранобэ'
  },
  {
    id: 2,
    title: 'Возрождение Бессмертного Культиватора',
    cover: 'https://picsum.photos/seed/novel2/300/400',
    chapters: 678,
    rating: 9.5,
    status: 'ongoing',
    genres: ['Сянься', 'Боевые искусства', 'Приключения'],
    views: 2345678,
    author: 'Автор 2',
    type: 'Веб-новелла'
  },
  {
    id: 3,
    title: 'Путь Небесного Демона',
    cover: 'https://picsum.photos/seed/novel3/300/400',
    chapters: 892,
    rating: 9.3,
    status: 'ongoing',
    genres: ['Сянься', 'Боевые искусства', 'Драма'],
    views: 3456789,
    author: 'Автор 3',
    type: 'Веб-новелла'
  },
  {
    id: 4,
    title: 'Второй Шанс Героя',
    cover: 'https://picsum.photos/seed/novel4/300/400',
    chapters: 234,
    rating: 8.9,
    status: 'ongoing',
    genres: ['Фэнтези', 'Романтика', 'Приключения'],
    views: 987654,
    author: 'Автор 4',
    type: 'Ранобэ'
  },
  {
    id: 5,
    title: 'Властелин Теней',
    cover: 'https://picsum.photos/seed/novel5/300/400',
    chapters: 567,
    rating: 9.1,
    status: 'ongoing',
    genres: ['Фэнтези', 'Боевик', 'Магия'],
    views: 1876543,
    author: 'Автор 5',
    type: 'Веб-новелла'
  },
];

export default function Novels() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [contentType, setContentType] = useState<'manhwa' | 'novels'>('novels');
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

  const popularNovels = [...MOCK_NOVELS].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const recentNovels = [...MOCK_NOVELS].slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
                MANHWA READER
              </h1>
              <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={contentType === 'manhwa' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setContentType('manhwa');
                    navigate('/');
                  }}
                  className="text-xs"
                >
                  <Icon name="BookImage" size={14} className="mr-1" />
                  Манхва
                </Button>
                <Button
                  variant={contentType === 'novels' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setContentType('novels')}
                  className="text-xs"
                >
                  <Icon name="BookText" size={14} className="mr-1" />
                  Новеллы
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block w-64">
              <SearchWithAutocomplete placeholder="Поиск новелл..." />
            </div>
            
            <NotificationBell />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t">
          <div className="container px-4 py-2">
            <SearchWithAutocomplete placeholder="Поиск новелл..." />
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 pb-24 lg:pb-8 space-y-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Icon name="TrendingUp" size={32} className="text-primary" />
              Популярные новеллы
            </h2>
            <Button onClick={() => navigate('/novels/catalog')} variant="outline">
              Все новеллы
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {popularNovels.map((novel) => (
              <Card 
                key={novel.id} 
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/novel/${novel.id}`)}
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Badge variant="destructive" className="text-xs font-bold">
                      <Icon name="Star" size={12} className="mr-1" />
                      {novel.rating}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                      {novel.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <Icon name="Eye" size={14} />
                      <span>{novel.views.toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <Icon name="FileText" size={14} />
                      <span>{novel.chapters} гл.</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Icon name="Clock" size={28} className="text-green-500" />
              Недавно обновлённые
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {recentNovels.map((novel) => (
              <Card 
                key={novel.id} 
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => navigate(`/novel/${novel.id}`)}
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                    <Icon name="Sparkles" size={10} className="mr-1" />
                    NEW
                  </Badge>
                </div>
                
                <CardContent className="p-2">
                  <h3 className="font-semibold text-xs line-clamp-2">
                    {novel.title}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">По жанрам</h2>
              <p className="text-sm text-muted-foreground">Найдите новеллы по любимым жанрам</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {['Фэнтези', 'Сянься', 'Романтика', 'Боевые искусства', 'Приключения', 'Магия', 'Драма', 'Комедия', 'Исэкай', 'Психология', 'Школа', 'Детектив'].map((genre) => (
              <Button
                key={genre}
                variant="outline"
                className="justify-start"
                onClick={() => navigate(`/novels/catalog?genre=${genre}`)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </section>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Home" size={20} />
            <span className="text-xs">Главная</span>
          </button>
          
          <button
            onClick={() => navigate('/novels/catalog')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="BookOpen" size={20} />
            <span className="text-xs">Каталог</span>
          </button>
          
          <button
            onClick={() => navigate('/schedule')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Calendar" size={20} />
            <span className="text-xs">Расписание</span>
          </button>
          
          <button
            onClick={() => navigate('/teams')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Users" size={20} />
            <span className="text-xs">Команды</span>
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors"
          >
            <Icon name="Upload" size={20} />
            <span className="text-xs">Загрузить</span>
          </button>
        </div>
      </nav>

      <ScrollToTop />
    </div>
  );
}
