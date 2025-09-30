import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';

interface Manhwa {
  id: number;
  title: string;
  cover: string;
  chapters: number;
  rating: number;
  status: string;
  genre: string[];
  views: number;
  updated_at?: string;
}

const GENRES = [
  'Боевик', 'Романтика', 'Фэнтези', 'Драма', 'Комедия',
  'Приключения', 'Психология', 'Школа', 'Сёнэн', 'Сёдзё',
  'Сэйнэн', 'Повседневность', 'Меха', 'Ужасы', 'Детектив'
];

const TYPE_FILTERS = [
  { label: 'Все', value: 'all' },
  { label: 'Манхва', value: 'manhwa' },
  { label: 'Манга', value: 'manga' },
  { label: 'Маньхуа', value: 'manhua' },
  { label: 'Западный комикс', value: 'comic' },
  { label: 'Рукомикс', value: 'russian' }
];

const STATUS_FILTERS = [
  { label: 'Все', value: 'all' },
  { label: 'Онгоинг', value: 'ongoing' },
  { label: 'Завершён', value: 'completed' },
  { label: 'Заморожен', value: 'frozen' },
  { label: 'Заброшен', value: 'abandoned' }
];

const API_URL = 'https://functions.poehali.dev/4e8cb1b6-88f9-43e5-89db-ab75bfa82345';
const BOOKMARKS_API = 'https://functions.poehali.dev/64b9299a-9048-4727-b686-807ace50e7e1';

const getUserId = () => {
  let userId = localStorage.getItem('manhwa_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('manhwa_user_id', userId);
  }
  return userId;
};

export default function Index() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularManhwa, setPopularManhwa] = useState<Manhwa[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Manhwa[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    fetchManhwa();
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(BOOKMARKS_API, {
        headers: {
          'X-User-Id': getUserId()
        }
      });
      const data = await response.json();
      
      if (data.bookmarks) {
        const bookmarkIds = new Set(data.bookmarks.map((b: any) => b.manhwa_id));
        setBookmarks(bookmarkIds);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (manhwaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isBookmarked = bookmarks.has(manhwaId);
    
    try {
      if (isBookmarked) {
        await fetch(`${BOOKMARKS_API}?manhwa_id=${manhwaId}`, {
          method: 'DELETE',
          headers: {
            'X-User-Id': getUserId()
          }
        });
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(manhwaId);
          return newSet;
        });
      } else {
        await fetch(BOOKMARKS_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': getUserId()
          },
          body: JSON.stringify({ manhwa_id: manhwaId })
        });
        setBookmarks(prev => new Set(prev).add(manhwaId));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const fetchManhwa = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.manhwa) {
        const manhwaData = data.manhwa.map((m: any) => ({
          id: m.id,
          title: m.title,
          cover: m.cover_url,
          chapters: m.chapter_count || 0,
          rating: m.rating || 0,
          status: m.status || 'ongoing',
          genre: m.genres || [],
          views: m.views || 0
        }));
        
        const sortedByRating = [...manhwaData].sort((a, b) => b.rating - a.rating);
        const sortedByViews = [...manhwaData].sort((a, b) => b.views - a.views);
        const sortedByDate = [...manhwaData].sort((a, b) => 
          new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
        );
        
        setPopularManhwa(sortedByRating.slice(0, 5));
        setCurrentlyReading(sortedByViews.slice(0, 12));
        setRecentlyUpdated(sortedByDate.slice(0, 8));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching manhwa:', error);
      setLoading(false);
    }
  };

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

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const allManhwa = [...popularManhwa, ...currentlyReading, ...recentlyUpdated];
  const filteredManhwa = allManhwa.filter(m => {
    const matchesSearch = searchQuery ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesGenres = selectedGenres.length > 0 ? selectedGenres.some(g => m.genre.includes(g)) : true;
    const matchesType = selectedType === 'all' ? true : m.status === selectedType;
    const matchesStatus = selectedStatus === 'all' ? true : m.status === selectedStatus;
    return matchesSearch && matchesGenres && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
              MANHWA READER
            </h1>
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/catalog')}
              >
                Каталог
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/schedule')}
              >
                Расписание
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск манхв..."
                className="w-64 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/upload')}
                className="gap-2"
              >
                <Icon name="Upload" size={16} />
                Загрузить
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teams')}
                className="gap-2"
              >
                <Icon name="Users" size={16} />
                Команды
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/schedule')}
                className="gap-2"
              >
                <Icon name="Calendar" size={16} />
                Расписание
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <Icon name="User" size={20} />
            </Button>

            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <Icon name="Settings" size={20} />
            </Button>
          </div>
        </div>

        <div className="md:hidden border-t">
          <div className="container px-4 py-2">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск манхв..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 pb-24 lg:pb-8 space-y-12">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="SlidersHorizontal" size={24} />
              Фильтры
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Скрыть' : 'Показать'}
            </Button>
          </div>
          
          {showFilters && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Жанры</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Тип</h3>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((type) => (
                      <Badge
                        key={type.value}
                        variant={selectedType === type.value ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedType(type.value)}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-2">Статус</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((status) => (
                      <Badge
                        key={status.value}
                        variant={selectedStatus === status.value ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedStatus(status.value)}
                      >
                        {status.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {(selectedGenres.length > 0 || selectedType !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedGenres([]);
                    setSelectedType('all');
                    setSelectedStatus('all');
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          )}
        </section>

        {(searchQuery || selectedGenres.length > 0 || selectedType !== 'all' || selectedStatus !== 'all') ? (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? 'Результаты поиска' : 'Отфильтрованные тайтлы'} ({filteredManhwa.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredManhwa.map((manhwa) => (
                <Card 
                  key={manhwa.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/reader/${manhwa.id}`)}
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={manhwa.cover}
                      alt={manhwa.title}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                        className="h-8 w-8"
                        onClick={(e) => toggleBookmark(manhwa.id, e)}
                      >
                        <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                      </Button>
                      <Badge variant="destructive" className="text-xs font-bold">
                        <Icon name="Star" size={12} className="mr-1" />
                        {manhwa.rating}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">
                      {manhwa.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Icon name="TrendingUp" size={32} className="text-primary" />
                  Популярные тайтлы
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {popularManhwa.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/reader/${manhwa.id}`)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                          className="h-8 w-8"
                          onClick={(e) => toggleBookmark(manhwa.id, e)}
                        >
                          <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                        </Button>
                        <Badge variant="destructive" className="text-xs font-bold">
                          <Icon name="Star" size={12} className="mr-1" />
                          {manhwa.rating}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
                          {manhwa.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Icon name="Eye" size={14} />
                          <span>{manhwa.views.toLocaleString()}</span>
                          <span className="mx-2">•</span>
                          <Icon name="BookText" size={14} />
                          <span>{manhwa.chapters} гл.</span>
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
                {recentlyUpdated.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/reader/${manhwa.id}`)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          size="icon"
                          variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                          className="h-8 w-8"
                          onClick={(e) => toggleBookmark(manhwa.id, e)}
                        >
                          <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                        </Button>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
                        <Icon name="Sparkles" size={10} className="mr-1" />
                        NEW
                      </Badge>
                    </div>
                    
                    <CardContent className="p-2">
                      <h3 className="font-semibold text-xs line-clamp-2">
                        {manhwa.title}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Icon name="Flame" size={28} className="text-orange-500" />
                  Сейчас читают
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {currentlyReading.map((manhwa) => (
                  <Card 
                    key={manhwa.id} 
                    className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={() => navigate(`/reader/${manhwa.id}`)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant={bookmarks.has(manhwa.id) ? 'default' : 'secondary'}
                          className="h-8 w-8"
                          onClick={(e) => toggleBookmark(manhwa.id, e)}
                        >
                          <Icon name={bookmarks.has(manhwa.id) ? 'BookmarkCheck' : 'Bookmark'} size={16} />
                        </Button>
                        <Badge variant="destructive" className="text-xs font-bold">
                          <Icon name="Star" size={12} className="mr-1" />
                          {manhwa.rating}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        size="sm"
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/reader/${manhwa.id}`);
                        }}
                      >
                        <Icon name="BookOpen" size={16} />
                        Читать
                      </Button>
                    </div>
                    
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
                        {manhwa.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {manhwa.genre.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Icon name="BookText" size={14} />
                          <span>{manhwa.chapters} гл.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon name="Eye" size={14} />
                          <span>{manhwa.views}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-card border-t mt-16">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">MANHWA READER</h3>
              <p className="text-sm text-muted-foreground">
                Лучший сервис для чтения манхвы, манги и маньхуа онлайн
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Каталог</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/catalog')}>Все тайтлы</li>
                <li className="hover:text-primary cursor-pointer">Популярное</li>
                <li className="hover:text-primary cursor-pointer">Новинки</li>
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/schedule')}>Расписание</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Сообщество</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/teams')}>Команды переводчиков</li>
                <li className="hover:text-primary cursor-pointer" onClick={() => navigate('/upload')}>Загрузить тайтл</li>
                <li className="hover:text-primary cursor-pointer">Правила</li>
                <li className="hover:text-primary cursor-pointer">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer">Донат</li>
                <li className="hover:text-primary cursor-pointer">Связаться</li>
                <li className="hover:text-primary cursor-pointer">Реклама</li>
                <li className="hover:text-primary cursor-pointer">API</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 MANHWA READER. Все права защищены.</p>
            <div className="flex gap-4">
              <span className="hover:text-primary cursor-pointer">Политика конфиденциальности</span>
              <span className="hover:text-primary cursor-pointer">Пользовательское соглашение</span>
            </div>
          </div>
        </div>
      </footer>
      
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
            onClick={() => navigate('/catalog')}
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