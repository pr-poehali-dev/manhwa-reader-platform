import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const MOCK_NOVELS: Novel[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Новелла ${i + 1}`,
  cover: `https://picsum.photos/seed/novel${i + 1}/300/400`,
  chapters: Math.floor(Math.random() * 500) + 50,
  rating: parseFloat((Math.random() * 2 + 7).toFixed(1)),
  status: Math.random() > 0.5 ? 'ongoing' : 'completed',
  genres: ['Фэнтези', 'Приключения', 'Магия'].slice(0, Math.floor(Math.random() * 3) + 1),
  views: Math.floor(Math.random() * 2000000) + 100000,
  author: `Автор ${i + 1}`,
  type: Math.random() > 0.5 ? 'Ранобэ' : 'Веб-новелла'
}));

const GENRES = ['Все', 'Фэнтези', 'Сянься', 'Романтика', 'Боевые искусства', 'Приключения', 'Магия', 'Драма', 'Комедия', 'Исэкай', 'Психология', 'Школа', 'Детектив'];

export default function NovelCatalog() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [novels, setNovels] = useState<Novel[]>(MOCK_NOVELS);
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [sortBy, setSortBy] = useState('rating');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const filteredNovels = novels
    .filter(novel => selectedGenre === 'Все' || novel.genres.includes(selectedGenre))
    .filter(novel => filterStatus === 'all' || novel.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'chapters') return b.chapters - a.chapters;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/novels')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-bold text-primary">
              Каталог новелл
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:block w-64">
              <SearchWithAutocomplete placeholder="Поиск новелл..." />
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              localStorage.setItem('theme', newTheme);
              if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            }}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">По рейтингу</SelectItem>
              <SelectItem value="views">По просмотрам</SelectItem>
              <SelectItem value="chapters">По главам</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="ongoing">Выходит</SelectItem>
              <SelectItem value="completed">Завершён</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="BookOpen" size={16} />
            <span>Найдено: {filteredNovels.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredNovels.map((novel) => (
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
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs font-bold">
                    <Icon name="Star" size={10} className="mr-1" />
                    {novel.rating}
                  </Badge>
                </div>
                <Badge 
                  className="absolute top-2 left-2 text-xs"
                  variant={novel.status === 'ongoing' ? 'default' : 'secondary'}
                >
                  {novel.status === 'ongoing' ? 'Выходит' : 'Завершён'}
                </Badge>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
                    {novel.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <Icon name="FileText" size={12} />
                    <span>{novel.chapters} гл.</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredNovels.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Новеллы не найдены. Попробуйте изменить фильтры.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
